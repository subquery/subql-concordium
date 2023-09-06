#!/bin/bash

set -e

replace_paths() {
    file="${1}"
    sed -i "s/@subql\/common-concordium/@subql\/common-flare/g" ${file}
    sed -i "s/@subql\/types-concordium/@subql\/types-flare/g" ${file}
    sed -i "s/@subql\/node-concordium/@subql\/node-flare/g" ${file}
    sed -i "s/subql-node-concordium/subql-node-flare/g" ${file}
}

for file in $(find ./packages -name '*.ts' -or -name 'package.json');
do
    if [ -f "${file}" ]; then
        replace_paths $file
    else
        echo "WARNING: ${file} not found"
    fi
done
