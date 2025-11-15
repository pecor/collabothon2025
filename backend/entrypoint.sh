#!/bin/bash

# Exit on error
set -e

# For OpenShift: Skip waiting for db if using external database
# Database should already be running and accessible
echo "Checking PostgreSQL connection..."
if pg_isready -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-postgres} -t 5; then
    echo "PostgreSQL is ready!"
else
    echo "Warning: Could not connect to PostgreSQL immediately, but continuing..."
    echo "Database migrations may fail if database is not accessible"
fi

echo "Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
        username=username,
        email=os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com'),
        password=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
    )
    print(f'Superuser created: username={username}')
else:
    print('Superuser already exists')
END

echo "Importing fixtures if database is empty..."
python manage.py import_fixtures

echo "Starting server..."
exec "$@"
