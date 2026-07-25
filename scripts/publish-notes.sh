#!/bin/sh

set -eu

if [ "$(git branch --show-current)" != "main" ]; then
  echo "Refusing to publish: matt4tch.github.io is not on main." >&2
  exit 1
fi

if [ -z "$(git status --porcelain -- "$@")" ]; then
  echo "Course notes are already up to date."
  exit 0
fi

git commit --only -m "docs: update course notes" -- "$@"
git push origin main
