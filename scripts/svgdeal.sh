#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.jpg; do
        if [[ "${i}" == "./*.jpg" ]]; then
            continue;
        fi
        echo ${i}
        convert \
            ${i} \
            -background black \
            -alpha remove \
            -alpha off \
            -sharpen 0x1 \
            -threshold 50% \
            -negate \
            ${i}.pnm
        potrace \
            ${i}.pnm \
            --svg \
            --opttolerance 0 \
            --turnpolicy black \
            --turdsize 2 \
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
