#/bin/bash
set -e

git rm -rf docs
rm -rf docs
cp -a dist docs
git add docs

echo "git commit してください。"