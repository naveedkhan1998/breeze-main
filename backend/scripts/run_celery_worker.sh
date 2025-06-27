#!/bin/bash
set -e

echo "Starting Celery Worker with auto-restart..."

# Create necessary directories
mkdir -p /var/run/celery
mkdir -p /var/log/celery

# Remove existing Celery PID files to prevent conflicts
rm -f /var/run/celery/w1.pid
rm -f /var/run/celery/w2.pid
rm -f /var/run/celery/w3.pid
rm -f /var/run/celery/beat.pid

# Purge all existing tasks from the Celery queues
echo "Purging existing Celery tasks..."
celery -A config purge --force || true

# Start Celery worker with watchmedo for auto-restart
echo "Starting Celery worker with watchmedo auto-restart..."
watchmedo auto-restart \
    --directory=/app \
    --pattern=*.py \
    --recursive \
    -- celery -A config worker -l error
