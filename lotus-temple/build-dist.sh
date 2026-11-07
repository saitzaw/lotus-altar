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
# temple-floors.js and lotus-altar.js are each one script cut into small topic files under src/<name>/; joining them in
# file-name order rebuilds the script. The pieces in the middle of a closure aren't valid on their own, the joined file is.
for js in temple-floors lotus-altar; do LC_ALL=C cat src/$js/*.js > dist/$js.js; done
if command -v node >/dev/null; then for js in dist/*.js; do node --check "$js"; done; fi
cp lotus-altar.css statue-sculpt.js four-face-top.js dist/
if [ -f guanyin.glb ]; then cp guanyin.glb dist/; fi
echo "Built $(pwd)/dist"
