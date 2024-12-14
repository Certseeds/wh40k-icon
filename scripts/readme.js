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
        if (element?.name === undefined) {
            continue;
        }
        const fileName = element.name;
        const objectName = fileName?.replace(".svg", "") ?? "";
        const absoultePath = path.join(prefix, fileName);
        const image = `![${objectName}](./${absoultePath})`;
        const cnName = element?.cn ?? "";
        const keywords = element.keywords;
        //console.log(keywords);
        const cnkeywords = keywords.map(x => zhCNMap.get(x));
        const fontClass = `\`wh40-${objectName}\``
        const line = `|${image}|${cnName}|${keywords}|${cnkeywords}|${fontClass}|`;
        lines.push(line);
    }
    lines.push('');
    const linesString = lines.join("\n");
    //console.log(linesString);
    return linesString;
}
const visitMetaJsons1 = async (subdir, level) => {
    const subObjects = await fsp.readdir(subdir, { withFileTypes: true });
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            await visitMetaJsons1(path.join(subdir, subObject.name), level + 1);
        } else if (subObject.isFile() && subObject.name === "meta.json") {
            const linesString = await metaToReadme(".", path.join(subdir, subObject.name));
            const subdirInTitle = subdir
                .replaceAll("\\", "/")
                .replaceAll("/", "-")
                .replace("src-svgs-", "")
                .trim();
            const linesString2 = `\n${'#'.repeat(level)} ${subdirInTitle}\n` + linesString;
            await fsp.appendFile(path.join(subdir, "README.md"), linesString2);
        }
    }
}

const visitMetaJsons2 = async (subdir, level) => {
    const subObjects = await fsp.readdir(subdir, { withFileTypes: true });
    const blocks = [];
    const subblocksList = [];
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const subblocks = await visitMetaJsons2(path.join(subdir, subObject.name), level + 1);
            subblocksList.push(...subblocks);
        } else if (subObject.isFile() && subObject.name === "meta.json") {
            console.log(subdir);
            const linesString = await metaToReadme(subdir, path.join(subdir, subObject.name));
            const subdirInTitle = subdir
                .replaceAll("\\", "/")
                .replaceAll("/", "-")
                .replace("src-svgs-", "")
                .trim();
            const linesString2 = (`\n${'#'.repeat(level)} ${subdirInTitle}\n` + linesString)
                .replaceAll("./src\\", "./");
            blocks.push(linesString2);
        }
    }
    blocks.push(...subblocksList);
    return blocks;
}

// TODO, 在README中提供子目录清单, 并构建gh-pages
await visitMetaJsons1("./src/svgs", 3);

const result = await visitMetaJsons2("./src/svgs", 1);
await fsp.appendFile(path.join(dir, "src", "index.md"), result);
