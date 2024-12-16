#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from 'node:fs/promises';
import path from 'node:path';
import { findDirWithPkgJson, buildI18NMap, listSvgFiles } from './library.js';
import svgtofont from 'svgtofont';
import process, { exit } from "node:process";
const svgs = await listSvgFiles("./src/svgs");
const dir = findDirWithPkgJson(".");

await fsp.mkdir('./dist', { recursive: true });
await fsp.mkdir('./dist/meta', { recursive: true });
await fsp.rm('./dist/svgs', { recursive: true, force: true });
await fsp.rm('./dist/i18n', { recursive: true, force: true });

const tempPath = await fsp.mkdtemp(`./dist/temp${Date.now()}`)
const tempPath1 = path.join(process.cwd(), tempPath);
const svgPaths = await Promise.all(svgs.map(async (svg) => {
    const newPath = path.join(tempPath1, path.basename(svg));
    await fsp.copyFile(svg, newPath);
    return newPath;
}));
console.log(svgs.length);
console.log(svgPaths.length);
if (svgs.length !== svgPaths.length) {
    console.error("Error: some svg files are SAME NAME!");
    exit(1);
}
const config = {
    src: tempPath1, // svg path
    dist: path.resolve(process.cwd(), 'dist'), // output path
    fontName: 'warhammer40k',
    classNamePrefix: "wh40k",
    css: true, // Create CSS files.
    startUnicode: 0x6789, // you already knew that
    svgicons2svgfont: {
        fontHeight: 1000,
        normalize: true
    },
    log: true,
    logger: (msg) => { console.log(msg); }
}
await svgtofont({
    ...config
})
console.log(`font files done`)

await fsp.rename(tempPath1, './dist/svgs', { recursive: true, });

console.log(`svgs copy done`)

const zhCNMap = (await buildI18NMap(`${dir}/i18n`)).get('zh-cn');
const visitMetaJsons = async (subdir) => {
    const subObjects = await fsp.readdir(subdir, { withFileTypes: true });
    const objects = [];
    const subResults = [];
    for (const subObject of subObjects) {
        if (subObject.isDirectory()) {
            const result = await visitMetaJsons(path.join(subdir, subObject.name));
            subResults.push(...result);
        } else if (subObject.isFile() && subObject.name === "meta.json") {
            const fileContent = await fsp.readFile(path.join(subdir, subObject.name));
            const json = JSON.parse(fileContent);
            for (const element of json) {
                if (element?.name === undefined) {
                    continue;
                }
                const fileName = element.name;
                const cnName = element.cn ?? "";
                const keywords = element.keywords;
                //console.log(keywords);
                const cnkeywords = keywords.map(x => zhCNMap.get(x));
                const objectName = fileName?.replace(".svg", "") ?? "";
                const fontClass = `wh40k-${objectName}`
                objects.push({
                    "name": fileName,
                    "cn": cnName,
                    "keywords": keywords,
                    "cnKeywords": cnkeywords,
                    "fontclass": fontClass
                })
            }
        }
    }
    objects.push(...subResults);
    return objects;
}

const meteJson = (await visitMetaJsons("./src/svgs"))
    .sort((a, b) => { a["name"].localeCompare(b["name"]) });

await fsp.writeFile("./dist/meta/meta.json", JSON.stringify(meteJson, null, 4));
await fsp.cp("./i18n", "./dist/i18n", { recursive: true, force: true });

console.log(`metadatas copy done`)
