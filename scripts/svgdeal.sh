#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.avif; do
        if [[ "${i}" == "./*.avif" ]]; then
            continue;
        fi
        echo ${i}
        convert \
            ${i} \
            -background white \
            -alpha remove \
            -alpha off \
            ${i}.pnm
        potrace \
            ${i}.pnm \
            --svg \
            --opttolerance 1 \
            -o ${i}.svg
    done
    for file in ./*.svg; do
        echo ${file}
        inkscape \
            --file="${file}" \
            --export-plain-svg \
            --export-filename="${file}"
    done
}
main
