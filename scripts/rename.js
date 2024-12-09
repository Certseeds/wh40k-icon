#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';
import fsp from 'node:fs/promises';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findDirWithPkgJson, findSvgFiles } from "./library.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname);
const targetDir = findDirWithPkgJson(startDir) ?? "./../";
const svgs = await findSvgFiles(targetDir + "/src/new");

console.log(svgs);

const regex = /\[([\s\S]+)\]/g;
const target = [];
const filesMap = new Map();
for (const svg of svgs) {
    const matches = svg.match(regex);
    const originText = matches ? matches[0] : '';
    const keywords = originText
        ?.replace("[", "")
        ?.replace("]", "")
        ?.split(",")
        ?.map((group) => group.trim())
        ?? [];

    const fileName_pre = svg
        .replace(originText, "")
        .replace(".svg", "")
        .trim()
        .replaceAll(" ","-")
        .toLowerCase()
        ;

    const fileName = (() => {
        if (filesMap.has(fileName_pre)) {
            const times = filesMap.get(fileName_pre);
            filesMap.set(fileName_pre, times + 1);
            return `${fileName_pre}-${times + 1}.svg`;
        } else {
            filesMap.set(fileName_pre, 1);
            return `${fileName_pre}.svg`;
        }
    })();

    console.log(fileName, keywords);
    target.push({ fileName, keywords });
}
const content = JSON.stringify(target, null, 4);

const targetName = targetDir + "/meta.json";
console.log(targetName)
if (!fs.existsSync(targetName)) {
    await fsp.appendFile(targetName, content, 'utf8');
} else {
    await fsp.writeFile(targetName, content, 'utf8');
}
