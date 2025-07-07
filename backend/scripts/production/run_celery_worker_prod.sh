#!/bin/sh

# Set the maximum memory limit to 500 MB
#ulimit -v $((512 * 1024))

echo "STARTING HTTP SERVER..."
python3 http_server.py & # Run HTTP server in background

echo "STARTING CELERY WORKER WITH MEMORY LIMIT..."
celery -A main worker --loglevel=DEBUG --time-limit=0 --concurrency=1
#celery multi start w1 w2 -A main --loglevel=INFO
