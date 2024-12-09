#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from 'node:fs/promises';
import path from 'node:path';
import { listSvgFiles } from './library.js';
import svgtofont from 'svgtofont';
import process from "node:process";
const svgs = await listSvgFiles("./src/svgs");
console.log(svgs.slice(0, 10));
let _tempPath = './temp/temp';

await fsp.mkdir('./dist', { recursive: true })
    .then(() => {
        return fsp.mkdir("./temp", { recursive: true })
    }).then(() => {
        return fsp.mkdtemp(`./temp/${Date.now()}`)
    }).then((tempPath) => {
        _tempPath = path.join(process.cwd(), tempPath);
        return Promise.all(svgs.map(async (svg) => {
            const newPath = path.join(_tempPath, path.basename(svg));
            await fsp.copyFile(svg, newPath);
            return newPath;
        }))
    }).then((svgPaths) => {
        console.log(svgPaths.length);
        const config = {
            src: _tempPath, // svg path
            dist: path.resolve(process.cwd(), 'dist'), // output path
            fontName: 'warhammer40k',
            classNamePrefix: "wh40k",
            css: true, // Create CSS files.
            startUnicode: 0x5678, // unicode start number
            svgicons2svgfont: {
                fontHeight: 1000,
                normalize: true
            },
            log: true,
            logger: (msg) => { console.log(msg); }
        }
        return svgtofont({
            ...config
        })
    }).then(() => {
        console.log(`remove ${_tempPath}`)
        return fsp.rm(_tempPath, {
            recursive: true,
            force: true,
            maxRetries: 10,
            retryDelay: 1000,
        });
    });

