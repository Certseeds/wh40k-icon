#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'
import process from 'node:process'

const dir = resolve(process.argv[2] || '.')

function* walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) { yield* walk(full); continue }
        if (entry.isFile() && extname(entry.name) === '.svg') yield full
    }
}

const files = [...walk(dir)]
const fmt = resolve(import.meta.dirname, 'xml-format.js')

for (const file of files) {
    const result = spawn(process.execPath, [fmt, file], { stdio: 'inherit' })
    await new Promise(resolve => result.on('exit', resolve))
}

process.stdout.write(`done, ${files.length} files\n`)
