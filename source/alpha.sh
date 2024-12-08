#!/usr/bin/env bash
set -euox pipefail
# SPDX-License-Identifier: AGPL-3.0-or-later

main() {
    for avif in $(pwd)/source/**/*.avif; do
        if [[ -f "${avif}" ]]; then
            convert ${avif} \
                -alpha extract \
                -negate \
                "${avif}.pnm"
            convert ${avif} \
                -alpha extract \
                -negate \
                "${avif}.png"
            potrace \
                "${avif}.pnm" \
                --svg \
                -o "${avif}.svg"
        fi
    done
    rename "s/avif\.svg/\.svg/" $(pwd)/source/**/*.svg
    for avif in $(pwd)/source/*.avif; do
        if [[ -f "${avif}" ]]; then
            convert ${avif} \
                -alpha extract \
                -negate \
                "${avif}.pnm"
            convert ${avif} \
                -alpha extract \
                -negate \
                "${avif}.png"
            potrace \
                "${avif}.pnm" \
                --svg \
                -o "${avif}.svg"
        fi
    done
    rename "s/\.avif\.svg/\.svg/" $(pwd)/source/*.svg
}
main
