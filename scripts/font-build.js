#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from 'node:fs/promises';
import path from 'node:path';
import { listSvgFiles } from './library.js';
import webfont from 'webfont';
//const webfont = require('webfont').default

const svgs = await listSvgFiles("./src");
console.log(svgs)

const config = {
    files: svgs,
    fontName: 'warhammer40k',
    baseClass: 'wh40k',
    classPrefix: 'wh40k-',
    fontHeight: 128,
    normalize: true,
    formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
    glyphTransformFn: obj => {
        return obj
    }
}
await fsp.mkdir('./dist', { recursive: true })

webfont.default({
    ...config,
    template: path.join('./src/scss.hbs')
}).then(async (result) => {
    await fsp.writeFile(`dist/${result.config.fontName}.scss`, result.template)
})

webfont.default({
    ...config,
    template: path.join('./src/css.hbs')
}).then(async (result) => {
    await fsp.writeFile(`dist/${result.config.fontName}.css`, result.template)
    await fsp.writeFile(`dist/${result.config.fontName}.svg`, result.svg)
    await fsp.writeFile(`dist/${result.config.fontName}.ttf`, new Buffer.from(result.ttf))
    await fsp.writeFile(`dist/${result.config.fontName}.eot`, new Buffer.from(result.eot))
    await fsp.writeFile(`dist/${result.config.fontName}.woff`, new Buffer.from(result.woff))
    await fsp.writeFile(`dist/${result.config.fontName}.woff2`, new Buffer.from(result.woff2))
});


