#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.png; do
        if [[ "${i}" == "./*.png" ]]; then
            continue
        fi
        echo ${i}
        convert \
            ${i} \
            -background white \
            -alpha remove \
            -alpha off \
            -colorspace Gray \
            ${i}.pnm.avif
        convert ${i}.pnm.avif \
            -colorspace Gray \
            ./${i}.pnm
        potrace \
            ${i}.pnm \
            --svg \
            --opttolerance 0.2 \
            --turnpolicy white \
            --turdsize 5 \
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
