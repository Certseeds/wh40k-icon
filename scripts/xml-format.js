#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import htmlLs from 'vscode-html-languageservice'
const { getLanguageService, TextDocument } = htmlLs

const languageService = getLanguageService({
    useDefaultDataProvider: true,
})

const formatOptions = {
    tabSize: 4,
    insertSpaces: true,
    endWithNewline: true
}

function applyEdits(text, edits) {
    let out = text
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

const document = TextDocument.create('file:///input.svg', 'svg', 1, input)
const edits = languageService.format(document, undefined, formatOptions)

const output = Array.isArray(edits) ? applyEdits(input, edits) : input
if (filePath) {
    writeFileSync(filePath, output, 'utf8')
    console.log(`formatted: ${filePath}`)
} else {
    process.stdout.write(output)
}
