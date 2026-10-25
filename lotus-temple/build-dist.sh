#!/usr/bin/env bash
# Builds dist/: a standalone copy of the page for any web server. lotus-altar.html is written as an Artifact body,
# so this wraps it in the document the Artifact host would add (doctype, UTF-8, mobile viewport, no body margin).
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir dist
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<style>body{margin:0}</style>\n</head>\n<body>\n'
  cat lotus-altar.html
  printf '\n</body>\n</html>\n'
} > dist/index.html
cp lotus-altar.css lotus-altar.js temple-floors.js statue-sculpt.js four-face-top.js dist/
if [ -f guanyin.glb ]; then cp guanyin.glb dist/; fi
echo "Built $(pwd)/dist"
