#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from "node:fs/promises";
import path from 'node:path';
import { findDirWithPkgJson, findSvgFiles, getSvgFilesFromREADME } from "./library.js";
const buildI18NMap = async (i18ndir) => {
    const jsonFiles = await fsp.readdir(i18ndir);
    const languageMap = new Map();
    for (const file of jsonFiles) {
        if (file.endsWith(".json")) {
            const wordsMap = new Map();
            const fileprefix = file.replace(".json", "");
            const fileContent = await fsp.readFile(path.join(i18ndir, file));
            const json = JSON.parse(fileContent);
            const keywords = json["keywords"];
            for (const key in keywords) {
                for (const key2 in keywords[key]) {
                    wordsMap.set(key2, keywords[key][key2]);
                }
            }
            languageMap.set(fileprefix, wordsMap);
        }
    }
    return languageMap;
}
const dir = findDirWithPkgJson(".");
console.log(dir);
const zhCNMap = (await buildI18NMap(`${dir}/i18n`)).get('zh-cn');

const metaToReadme = async (prefix, jsonFile) => {
    const fileContent = await fsp.readFile(jsonFile);
    const json = JSON.parse(fileContent);
    const fstLine = `|name|中文名|keywords|中文关键字|fontclass|`;
    const sndLine = `|:-:|:-:|:-:|:-:|:-:|`;
    const lines = ['', fstLine, sndLine];
    for (const element of json) {
        const fileName = element.name;
        const objectName = fileName?.replace(".svg", "") ?? "";
        const image = `![${objectName}](./${prefix}/${fileName})`;
        const cnName = element?.cn ?? "";
        const keywords = element.keywords;
        console.log(keywords);
        const cnkeywords = keywords.map(x => zhCNMap.get(x));
        const fontClass = `\`wh40-${objectName}\``
        const line = `|${image}|${cnName}|${keywords}|${cnkeywords}|${fontClass}|`;
        lines.push(line);
    }
    const linesString = lines.join("\n");
    console.log(linesString);
    return linesString;
}

const visitMetaJsons = async (dir, level) => {
    const subObjects = await fsp.readdir(dir, { withFileTypes: true });
    const objects = [];
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const files = await visitMetaJsons(path.join(dir, subObject.name), level + 1);
            for (const file of files) {
                objects.push(file);
            }
        } else if (subObject.isFile() && subObject.name === "meta.json") {
            const linesString = await metaToReadme(".", path.join(dir, subObject.name),);
            const linesString2 = `\n${'#'.repeat(level)} ${dir}\n` + linesString;
            await fsp.appendFile(path.join(dir, "README.md"), linesString2);
            const svgName = subObject.name;
            objects.push(path.join(dir, svgName));
        }
    }
    return objects;
}

// TODO, 在README中提供子目录清单, 并构建gh-pages

const resutl = await visitMetaJsons("./src/svgs/chaos", 3);

console.log(resutl);
