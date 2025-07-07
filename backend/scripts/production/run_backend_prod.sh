#!/bin/sh

python3 manage.py wait_for_db &

wait

python3 manage.py migrate --noinput --skip-checks
python3 manage.py initadmin

echo "STARTING GUNICORN SERVER..."
gunicorn main.wsgi:application -t 1800 --bind :8000
