#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const findDirWithPkgJson = (startDir) => {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}

const findSvgFiles = async (dir) => {
    const subObjects = await fsp.readdir(dir, { withFileTypes: true });
    fs.readdirSync
    const objects = new Set();
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const files = await findSvgFiles(path.join(dir, subObject.name));
            for (const file of files) {
                objects.add(file);
            }
        } else if (subObject.isFile() && subObject.name.endsWith(".svg")) {
            const svgName = subObject.name.split("/").pop();
            if (objects.has(svgName)) {
                console.error(`重复的svg文件: ${svgName}`);
            } else {
                objects.add(svgName);
            }
        }
    }
    console.log(dir, objects.size)
    return objects;
}
const listSvgFiles = async (dir) => {
    const subObjects = await fsp.readdir(dir, { withFileTypes: true });
    const objects = [];
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const files = await listSvgFiles(path.join(dir, subObject.name));
            for (const file of files) {
                objects.push(file);
            }
        } else if (subObject.isFile() &&  subObject.name.endsWith(".svg")) {
            const svgName = subObject.name;
            objects.push(path.join(dir, svgName));
        }
    }
    return objects;
}

const getSvgFilesFromREADME = async (file) => {
    const data = await fsp.readFile(file, 'utf8');
    const reg = /([^\/]+\.svg)/g;
    const files = new Set();
    let count = 1;
    for (let match; (match = reg.exec(data)) !== null; count += 1) {
        const originalText = match[0];
        if (files.has(originalText)) {
            console.error(`README中重复的svg文件: ${originalText}`);
        } else {
            files.add(originalText);
        }
    }
    return files;
}

export {
    findDirWithPkgJson,
    findSvgFiles,
    listSvgFiles,
    getSvgFilesFromREADME
}
