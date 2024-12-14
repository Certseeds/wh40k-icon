#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import { exec, execSync } from 'node:child_process';
import fsp from 'node:fs/promises';

const main = async () => {
    console.log(execSync('inkscape --version').toString());
    console.log(execSync('xmllint --version').toString());

    const svgFiles = await fsp.readdir(process.cwd());
    const svgFilesFiltered = svgFiles.filter(file => file.endsWith('.svg'));

    const filesMap = new Map();
    const renameMap = new Map();
    for (const file of svgFilesFiltered) {

        await exec(`inkscape --file="${file}" --export-plain-svg --export-filename="${file}"`);

        await exec(`xmllint --format "${file}" -o "${file}"`);

        const newName = file
            .replace(/\[([\s\S]+)\]/g, '')
            .replace('.svg', '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            ;
        const fileName = (() => {
            if (filesMap.has(newName)) {
                const times = filesMap.get(newName);
                filesMap.set(newName, times + 1);
                return `${newName}-${times + 1}.svg`;
            } else {
                filesMap.set(newName, 1);
                return `${newName}.svg`;
            }
        })();
        console.log(file, fileName);
        renameMap.set(file, fileName);
    }
    for (const [oldName, newName] of renameMap) {
        await fsp.rename(oldName, newName);
    }
};

main();
