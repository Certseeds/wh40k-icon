#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.png; do
        if [[ "${i}" == "./*.png" ]]; then
            continue;
        fi
        echo ${i}
        convert \
            ${i} \
            -channel R \
            -separate \
            -blur 0.5x0.5 \
            -level 20%,90% \
            -threshold 35% \
            -negate \
            -morphology close disk:2 \
            -morphology open disk:1 \
            -background white \
            -alpha remove \
            ${i}.pnm
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
