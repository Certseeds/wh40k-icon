#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import { exec, execSync } from 'node:child_process';
import fsp from 'node:fs/promises';

const main = async () => {
    console.log(execSync('inkscape --version').toString());
    console.log(execSync('xmllint --version').toString());

    const svgFiles = await fsp.readdir(process.cwd());
    const svgFilesFiltered = svgFiles.filter(file => file.endsWith('.svg'));

    for (const file of svgFilesFiltered) {
        console.log(file);

        await exec(`inkscape --file="${file}" --export-plain-svg --export-filename="${file}"`);

        await exec(`xmllint --format "${file}" -o "${file}"`);

        const newName = file
            .replace(/\[([\s\S]+)\]/g, '')
            .replace('.svg', '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            ;
        const newName_2 = `${newName}.svg`;

        await fsp.rename(file, newName_2);
    }
};

main();
