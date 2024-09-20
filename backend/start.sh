#!/bin/sh
# Run collectstatic and wait_for_db in the background
python3 manage.py collectstatic --noinput &
python3 manage.py wait_for_db &

# Wait for background jobs to finish
wait

# Run migrations and create an admin user
#python3 manage.py makemigrations
python3 manage.py migrate --noinput --skip-checks
python3 manage.py initadmin
rm /var/run/celery/w1.pid
rm /var/run/celery/w2.pid
rm /var/run/celery/w3.pid
rm /var/run/celery/beat.pid
celery multi restart w1 w2 w3 -A main --pidfile=/var/run/celery/%n.pid --logfile=/var/log/celery/%n.log --loglevel=INFO --time-limit=300
celery -A main beat --pidfile=/var/run/celery/beat.pid --logfile=/var/log/celery/beat.log --loglevel=INFO --detach
python3 manage.py runserver 0.0.0.0:8000
#gunicorn main.wsgi:application --bind 0.0.0.0:5000 -w 1
# echo "STARTING GUNICORN SERVER..."
# gunicorn main.wsgi:application -t 1800 --bind :8000
