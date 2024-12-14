#!/usr/bin/env bash
set -euox pipefail
main() {
    inkscape --version
    xmllint --version
    for i in ./*.svg; do
        echo ${i}
        inkscape \
            --file="${i}" \
            --export-plain-svg \
            --export-filename="${i}"
        xmllint \
            --format "${i}" \
            -o "${i}"
    done
}
main
