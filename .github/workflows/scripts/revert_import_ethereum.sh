#!/bin/bash

replace_paths() {
    file="${1}"
    sed -i "s/@subql\/common-flare/@subql\/common-concordium/g" ${file}
    sed -i "s/@subql\/types-flare/@subql\/types-concordium/g" ${file}
}

for file in packages/**/*.ts;
do
    if [ -f "${file}" ]; then
        replace_paths $file
    fi
done

for file in packages/**/package.json;
do
    if [ -f "${file}" ]; then
        replace_paths $file
    fi
done