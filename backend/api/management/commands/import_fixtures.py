import csv
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import User, Vehicle, Route, Cargo, Order, Holiday
from datetime import timedelta


class Command(BaseCommand):
    help = 'Import fixture data from CSV files'

    def handle(self, *args, **kwargs):
        fixtures_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'fixtures')
        
        # Check if database is empty
        if User.objects.exists() or Vehicle.objects.exists():
            self.stdout.write(self.style.WARNING('Database is not empty. Skipping import.'))
            return

        self.stdout.write(self.style.SUCCESS('Starting fixture import...'))

        try:
            with transaction.atomic():
                # Import Users
                self.import_users(fixtures_dir)
                
                # Import Vehicles
                self.import_vehicles(fixtures_dir)
                
                # Import Routes
                self.import_routes(fixtures_dir)
                
                # Import Cargos
                self.import_cargos(fixtures_dir)
                
                # Import Orders
                self.import_orders(fixtures_dir)
                
                # Import Holidays
                self.import_holidays(fixtures_dir)

            self.stdout.write(self.style.SUCCESS('Successfully imported all fixtures!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing fixtures: {str(e)}'))

    def import_users(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'users.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                User.objects.create(
                    name=row['name'],
                    email=row['email'],
                    phone=row['phone'],
                    license_c=row['license_c'].lower() == 'true',
                    license_ce=row['license_ce'].lower() == 'true',
                    license_adr=row['license_adr'].lower() == 'true',
                    forklift_certified=row['forklift_certified'].lower() == 'true',
                    is_active=row['is_active'].lower() == 'true',
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {User.objects.count()} users'))

    def import_vehicles(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'vehicles.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Vehicle.objects.create(
                    registration_no=row['registration_no'],
                    type=row['type'],
                    capacity_weight=float(row['capacity_weight']),
                    capacity_volume=float(row['capacity_volume']),
                    has_forklift=row['has_forklift'].lower() == 'true',
                    status=row['status'],
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Vehicle.objects.count()} vehicles'))

    def import_routes(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'routes.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse time in HH:MM:SS format
                time_parts = row['estimated_time'].split(':')
                hours = int(time_parts[0])
                minutes = int(time_parts[1])
                seconds = int(time_parts[2])
                
                Route.objects.create(
                    origin=row['origin'],
                    destination=row['destination'],
                    distance_km=float(row['distance_km']),
                    estimated_time=timedelta(hours=hours, minutes=minutes, seconds=seconds),
                    holiday_blocked=row['holiday_blocked'].lower() == 'true',
                    status=row['status'],
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Route.objects.count()} routes'))

    def import_cargos(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'cargos.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse special_training JSON array
                special_training = []
                training_str = row['special_training'].strip()
                if training_str and training_str != '[]':
                    # Simple parsing of ["item1","item2"]
                    training_str = training_str.strip('[]')
                    if training_str:
                        special_training = [item.strip(' "') for item in training_str.split(',')]
                
                Cargo.objects.create(
                    name=row['name'],
                    length=float(row['length']),
                    width=float(row['width']),
                    height=float(row['height']),
                    weight=float(row['weight']),
                    requires_cold=row['requires_cold'].lower() == 'true',
                    requires_box=row['requires_box'].lower() == 'true',
                    requires_crate=row['requires_crate'].lower() == 'true',
                    forklift_needed=row['forklift_needed'].lower() == 'true',
                    license_c_required=row['license_c_required'].lower() == 'true',
                    license_ce_required=row['license_ce_required'].lower() == 'true',
                    license_adr_required=row['license_adr_required'].lower() == 'true',
                    special_training=special_training,
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Cargo.objects.count()} cargos'))

    def import_orders(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'orders.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Order.objects.create(
                    user_id=int(row['user_id']),
                    cargo_id=int(row['cargo_id']),
                    route_id=int(row['route_id']),
                    planned_date=row['planned_date'],
                    status=row['status'],
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Order.objects.count()} orders'))

    def import_holidays(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'holidays.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Holiday.objects.create(
                    date=row['date'],
                    country=row['country'],
                    description=row['description'],
                    license_c_allowed=int(row['license_c_allowed']),
                    license_ce_allowed=int(row['license_ce_allowed']),
                    license_adr_allowed=int(row['license_adr_allowed']),
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Holiday.objects.count()} holidays'))
