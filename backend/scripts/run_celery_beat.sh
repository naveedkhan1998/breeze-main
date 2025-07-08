#!/bin/bash
set -e

echo "Starting Celery Beat Scheduler..."

# Create necessary directories
mkdir -p /var/run/celery
mkdir -p /var/log/celery

# Remove existing beat PID file
rm -f /var/run/celery/beat.pid

# Start Celery Beat scheduler
echo "Starting Celery Beat with ERROR logging..."
celery -A main beat \
    --pidfile=/var/run/celery/beat.pid \
    --loglevel=ERROR
