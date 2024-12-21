#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from "node:fs/promises";
import path from 'node:path';
import { findDirWithPkgJson, buildI18NMap } from "./library.js";

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
        const fontClass = `\`wh40k-${objectName}\``
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
    const subdirsList = subObjects
        .filter(x => x.isDirectory())
        .map(x => x.name);
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
            const linesString2 = `
${'#'.repeat(level)} ${subdirInTitle}

${subdirsList.map(x => `+ [${x}](./${x}/README)`).join("\n")}

            `+ linesString;
            await fsp.appendFile(path.join(subdir, "README.md"), linesString2);
        }
    }
}

const visitMetaJsons2 = async (subdir, level) => {
    const subObjects = await fsp.readdir(subdir, { withFileTypes: true });
    const subdirsList = [];
    const blocks = [];
    const subblocksList = [];
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const [subblocks, subsubdirsList] = await visitMetaJsons2(path.join(subdir, subObject.name), level + 1);
            subblocksList.push(...subblocks);
            const subDirRemoveSrc = subdir
                .replaceAll("./src\\", "./")
                .replaceAll("./src", "./")
                .replaceAll("src\\", "./")
                .replaceAll("src/", "./")
                ;
            console.log(subdir, subDirRemoveSrc, subObject.name)
            subdirsList.push(`${(" ").repeat(level * 2 - 2)}+ [${subObject.name}](${path.join(subDirRemoveSrc, subObject.name).replaceAll("\\", "/")}/README)\n`);
            subdirsList.push(...subsubdirsList);
        } else if (subObject.isFile() && subObject.name === "meta.json") {
            console.log(subdir);
            const linesString = await metaToReadme(subdir, path.join(subdir, subObject.name));
            const subdirInTitle = subdir
                .replaceAll("\\", "/")
                .replaceAll("/", "-")
                .replace("src-svgs-", "")
                .trim();
            const linesString2 = (`\n${'#'.repeat(level)} ${subdirInTitle}\n` + linesString)
                .replaceAll("./src\\", "./")
                .replaceAll("./src", "./")
                ;
            blocks.push(linesString2);
        }
    }
    blocks.push(...subblocksList);
    return [blocks, subdirsList];
}

await visitMetaJsons1("./src/svgs", 3);

const [result1, result2] = await visitMetaJsons2("./src/svgs", 1);
await fsp.appendFile(path.join(dir, "src", "index.md"), `\n\n## 下面是子目录链接\n\n`);
await fsp.appendFile(path.join(dir, "src", "index.md"), result2);
await fsp.appendFile(path.join(dir, "src", "index.md"), result1);
