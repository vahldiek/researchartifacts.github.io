#!/bin/bash
# Start a local Jekyll development server using Docker.
# Usage: ./serve.sh [--baseurl /path]
#
# Examples:
#   ./serve.sh                                # Serve at http://localhost:4000/
#   ./serve.sh --baseurl /researchartifacts.github.io  # Mimic project-page deploy

set -e

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${JEKYLL_PORT:-4000}"
BASEURL=""

while [ $# -gt 0 ]; do
    case "$1" in
        --baseurl) BASEURL="$2"; shift 2 ;;
        --port)    PORT="$2";    shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

JEKYLL_ARGS="--host 0.0.0.0 --port $PORT --livereload"
if [ -n "$BASEURL" ]; then
    JEKYLL_ARGS="$JEKYLL_ARGS --baseurl $BASEURL"
    echo "Serving with baseurl: $BASEURL"
fi

echo "Starting Jekyll at http://localhost:${PORT}${BASEURL}/"
echo "Press Ctrl+C to stop."

docker run --rm \
    -v "$SITE_DIR:/srv/jekyll:Z" \
    -p "${PORT}:${PORT}" \
    -p 35729:35729 \
    -e JEKYLL_ENV=development \
    jekyll/jekyll:4 \
    jekyll serve $JEKYLL_ARGS
