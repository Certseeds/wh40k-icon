#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findDirWithPkgJson, findSvgFiles, getSvgFilesFromREADME } from "./library.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname);
const targetDir = findDirWithPkgJson(startDir) ?? "./../";
const svgs = await findSvgFiles(targetDir + "/src");

const svgsFromREADME = await getSvgFilesFromREADME(path.join(targetDir, "README.md"));

// 找到 svgs 中存在但不在 svgsFromREADME 中的元素
const svgsNotInREADME = [...svgs].filter(svg => !svgsFromREADME.has(svg));

for(const svg of svgsNotInREADME) {
    console.log(`${svg}`);
}
