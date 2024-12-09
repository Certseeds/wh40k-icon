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
        local newName1=$(echo "${i}" | sed 's/\[[^]]*\]//g')
        local newName2=$(echo "${newName1}" | sed 's/\.svg//')
        local newName3=$(echo "${newName2}" | sed 's/\s*$//')
        local newName4=$(echo "${newName3}" | tr '[:upper:]' '[:lower:]')
        local newName5=$(echo "${newName4}" | tr ' ' '-')
        mv "${i}" "${i}.2"
        mv "${i}.2" "${newName5}.svg"
        # TODO, remove xml line
    done
}
main
