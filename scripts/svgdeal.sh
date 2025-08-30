#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.avif; do
        if [[ "${i}" == "./*.avif" ]]; then
            continue
        fi
        echo ${i}
        convert \
            ${i} \
            -level 0%,99% \
            -background white \
            -alpha remove \
            ${i}.pnm.png
        convert ${i}.pnm.png \
            -colorspace Gray \
            ./${i}.pnm
        potrace \
            ${i}.pnm \
            --svg \
            --opttolerance 0.1 \
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
