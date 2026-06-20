#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import { spawn } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { homedir } from 'node:os'
import process from 'node:process'

const EXT_DIR = (() => {
    const base = resolve(homedir(), '.vscode', 'extensions')
    for (const name of readdirSync(base)) {
        if (name.startsWith('redhat.vscode-xml')) return resolve(base, name)
    }
    throw new Error('redhat.vscode-xml extension not found in ~/.vscode/extensions')
})()

const BINARY_NAME = {
    win32: 'lemminx-win32.exe',
    linux: 'lemminx-linux-x86_64',
}[process.platform]
const BINARY_PATH = resolve(EXT_DIR, 'server', BINARY_NAME)

function loadXmlSettings() {
    const pkg = JSON.parse(readFileSync(resolve(EXT_DIR, 'package.json'), 'utf8'))
    const props = pkg.contributes?.configuration?.properties ?? {}
    const settings = {}
    for (const [key, val] of Object.entries(props)) {
        if (!key.startsWith('xml.') || val.default === undefined) continue
        // 'xml.format.splitAttributesIndentSize' -> ['format', 'splitAttributesIndentSize']
        const parts = key.slice(4).split('.')
        let node = settings
        for (let i = 0; i < parts.length - 1; i++) {
            node[parts[i]] ??= {}
            node = node[parts[i]]
        }
        node[parts.at(-1)] = val.default
    }
    return settings
}

const xmlSettings = loadXmlSettings()
// VS Code overrides splitAttributesIndentSize with editor.tabSize (default 4)
xmlSettings.format.splitAttributesIndentSize = 4
xmlSettings.format.maxLineWidth = 120

class LspClient {
    #proc
    #pending = new Map()
    #nextId = 1
    #buffer = Buffer.alloc(0)

    constructor(binPath) {
        this.#proc = spawn(binPath, [], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env },
        })
        this.#proc.stderr.on('data', d => process.stderr.write(d))
        this.#proc.on('error', e => { throw e })

        // accumulate stdout chunks, parse frames
        this.#proc.stdout.on('data', chunk => {
            this.#buffer = Buffer.concat([this.#buffer, chunk])
            this.#parseFrames()
        })
    }

    #parseFrames() {
        while (this.#buffer.length > 0) {
            const headerEnd = this.#buffer.indexOf('\r\n\r\n')
            if (headerEnd === -1) return

            const header = this.#buffer.toString('utf8', 0, headerEnd)
            const lenMatch = header.match(/Content-Length: (\d+)/i)
            if (!lenMatch) {
                // skip malformed data
                this.#buffer = this.#buffer.subarray(headerEnd + 4)
                continue
            }

            const bodyLen = parseInt(lenMatch[1], 10)
            const bodyStart = headerEnd + 4
            if (this.#buffer.length < bodyStart + bodyLen) return // need more data

            const body = this.#buffer.toString('utf8', bodyStart, bodyStart + bodyLen)
            this.#buffer = this.#buffer.subarray(bodyStart + bodyLen)

            try {
                const msg = JSON.parse(body)
                if (msg.id !== undefined && this.#pending.has(msg.id)) {
                    this.#pending.get(msg.id)(msg)
                }
            } catch { /* ignore parse errors */ }
        }
    }

    #write(msg) {
        const body = JSON.stringify(msg)
        this.#proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`)
    }

    #call(method, params) {
        const id = this.#nextId++
        return new Promise((resolve, reject) => {
            this.#pending.set(id, resolve)
            const timer = setTimeout(() => {
                this.#pending.delete(id)
                reject(new Error(`LSP timeout: ${method}`))
            }, 15000)
            const orig = resolve
            this.#pending.set(id, result => {
                clearTimeout(timer)
                orig(result)
            })
            this.#write({ jsonrpc: '2.0', id, method, params })
        })
    }

    notify(method, params) {
        this.#write({ jsonrpc: '2.0', method, params })
    }

    async initialize(workspaceUri = null) {
        const result = await this.#call('initialize', {
            processId: process.pid,
            rootUri: workspaceUri,
            capabilities: {
                textDocument: {
                    formatting: { dynamicRegistration: false },
                },
            },
            initializationOptions: {
                settings: xmlSettings,
            },
        })
        this.notify('initialized', {})
        return result
    }

    async formatDocument(uri, text) {
        this.notify('textDocument/didOpen', {
            textDocument: { uri, languageId: 'xml', version: 1, text },
        })

        const msg = await this.#call('textDocument/formatting', {
            textDocument: { uri },
            options: {
                tabSize: 4,
                insertSpaces: true,
                trimTrailingWhitespace: true,
                insertFinalNewline: true,
                trimFinalNewlines: true,
            },
        })

        return msg.result
    }

    close() {
        this.notify('exit')
        this.#proc.stdin.end()
    }
}

function applyEdits(text, edits) {
    let out = text
    // reverse order preserves offsets
    for (const edit of edits.reverse()) {
        const start = offsetAt(text, edit.range.start)
        const end = offsetAt(text, edit.range.end)
        out = out.slice(0, start) + edit.newText + out.slice(end)
    }
    return out
}

function offsetAt(text, pos) {
    let offset = 0
    for (let i = 0; i < pos.line; i++) {
        const nl = text.indexOf('\n', offset)
        if (nl === -1) return offset + pos.character
        offset = nl + 1
    }
    return offset + pos.character
}

// --- CLI ---
const args = process.argv.slice(2)
let input, filePath
if (args.length > 0) {
    filePath = resolve(args[0])
    input = readFileSync(filePath, 'utf8')
} else {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    input = Buffer.concat(chunks).toString('utf8')
}

const client = new LspClient(BINARY_PATH)
await client.initialize()
const edits = await client.formatDocument('file:///input.xml', input)
client.close()

const output = Array.isArray(edits) ? applyEdits(input, edits) : input
if (filePath) {
    writeFileSync(filePath, output, 'utf8')
    console.log(`formatted: ${filePath}`)
} else {
    process.stdout.write(output)
}
