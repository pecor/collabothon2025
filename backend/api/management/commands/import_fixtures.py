import csv
import os
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import User, Vehicle, Route, Cargo, Order, Holiday, Tracker, TransportLaw
from datetime import timedelta, datetime, timezone as dt_timezone


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
                
                # Import Trackers
                self.import_trackers(fixtures_dir)
                
                # Import Transport Laws
                self.import_transport_laws(fixtures_dir)

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
                # Handle empty user_id (for new orders without assigned client)
                user_id = row['user_id'].strip() if row['user_id'] and row['user_id'].strip() else None
                
                # Handle optional new fields
                def get_field_value(field_name):
                    """Get field value or None if empty"""
                    value = row.get(field_name, '').strip()
                    return value if value else None
                
                def get_float_value(field_name):
                    """Get float value or None if empty"""
                    value = get_field_value(field_name)
                    return float(value) if value else None
                
                def get_date_value(field_name):
                    """Get date value or None if empty"""
                    value = get_field_value(field_name)
                    return value if value else None
                
                Order.objects.create(
                    user_id=int(user_id) if user_id else None,
                    cargo_id=int(row['cargo_id']),
                    route_id=int(row['route_id']),
                    planned_date=row['planned_date'],
                    status=row['status'],
                    cargo_type=get_field_value('cargo_type'),
                    weight=get_float_value('weight'),
                    temperature=get_field_value('temperature'),
                    special_requirements=get_field_value('special_requirements'),
                    loading_date=get_date_value('loading_date'),
                    unloading_date=get_date_value('unloading_date'),
                    cost=get_float_value('cost'),
                    revenue=get_float_value('revenue'),
                    profit=get_float_value('profit'),
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

    def import_trackers(self, fixtures_dir):
        file_path = os.path.join(fixtures_dir, 'trackers.csv')
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse datetime and set timezone
                naive_dt = datetime.strptime(row['estimated_arrival'], '%Y-%m-%d %H:%M:%S')
                estimated_arrival = timezone.make_aware(naive_dt, timezone=dt_timezone.utc)
                
                Tracker.objects.create(
                    vehicle_id=int(row['vehicle_id']),
                    current_location=row['current_location'],
                    distance_to_dest_km=float(row['distance_to_dest_km']),
                    estimated_arrival=estimated_arrival,
                    tracking_points={},
                )
        self.stdout.write(self.style.SUCCESS(f'Imported {Tracker.objects.count()} trackers'))
    
    def import_transport_laws(self, fixtures_dir):
        """Import transport laws from CSV"""
        file_path = os.path.join(fixtures_dir, 'truck_transport_law.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(f'Transport law CSV not found at {file_path}'))
            return
        
        def parse_bool(value):
            """Parse Yes/No or True/False to boolean"""
            if not value or value.strip() == '':
                return False
            return value.strip().lower() in ['yes', 'true', '1']
        
        def parse_float(value):
            """Parse float value, return None if empty"""
            if not value or value.strip() == '':
                return None
            try:
                return float(value)
            except (ValueError, TypeError):
                return None
        
        def parse_int(value):
            """Parse int value, return None if empty"""
            if not value or value.strip() == '':
                return None
            try:
                return int(value)
            except (ValueError, TypeError):
                return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                TransportLaw.objects.update_or_create(
                    country=row['Country'],
                    defaults={
                        'max_weight_ton': parse_float(row.get('Max_Weight_Ton')),
                        'max_weight_special_case': row.get('Max_Weight_Special_Case') or None,
                        'max_weight_special_value': parse_float(row.get('Max_Weight_Special_Value')),
                        'max_length_m': parse_float(row.get('Max_Length_M')),
                        'max_length_special_case': row.get('Max_Length_Special_Case') or None,
                        'max_length_special_value': parse_float(row.get('Max_Length_Special_Value')),
                        'max_width_m': parse_float(row.get('Max_Width_M')),
                        'max_height_m': parse_float(row.get('Max_Height_M')),
                        'oversize_permit_required': parse_bool(row.get('Oversize_Permit_Required')),
                        'rest_45h_in_cabin_allowed': parse_bool(row.get('Rest_45h_In_Cabin_Allowed')),
                        'rest_45h_special_note': row.get('Rest_45h_Special_Note') or None,
                        'min_hotel_standard': row.get('Min_Hotel_Standard') or None,
                        'hotel_invoice_required': parse_bool(row.get('Hotel_Invoice_Required')),
                        'weekend_driving_ban': parse_bool(row.get('Weekend_Driving_Ban')),
                        'ban_details': row.get('Ban_Details') or None,
                        'ban_vehicle_type_restriction': row.get('Ban_Vehicle_Type_Restriction') or None,
                        'ban_season_summer': parse_bool(row.get('Ban_Season_Summer')),
                        'ban_summer_months': row.get('Ban_Summer_Months') or None,
                        'emission_zone_lez': parse_bool(row.get('Emission_Zone_LEZ')),
                        'emission_zone_cities': row.get('Emission_Zone_Cities') or None,
                        'min_euro_class': row.get('Min_Euro_Class') or None,
                        'min_euro_class_restriction': row.get('Min_Euro_Class_Restriction') or None,
                        'lez_details': row.get('LEZ_Details') or None,
                        'toll_system': row.get('Toll_System') or None,
                        'toll_system_box_name': row.get('Toll_System_Box_Name') or None,
                        'toll_payment_method': row.get('Toll_Payment_Method') or None,
                        'toll_payment_special_notes': row.get('Toll_Payment_Special_Notes') or None,
                        'tachograph_type_required': row.get('Tachograph_Type_Required') or None,
                        'tachograph_mandatory_from_year': parse_int(row.get('Tachograph_Mandatory_From_Year')),
                        'driver_cpc_required': parse_bool(row.get('Driver_CPC_Required')),
                        'driver_cpc_hours': parse_int(row.get('Driver_CPC_Hours')),
                        'driver_cpc_renewal_years': parse_int(row.get('Driver_CPC_Renewal_Years')),
                        'a1_certificate_required': parse_bool(row.get('A1_Certificate_Required')),
                        'a1_certificate_notes': row.get('A1_Certificate_Notes') or None,
                        'a1_issuing_authority': row.get('A1_Issuing_Authority') or None,
                        'required_documents': row.get('Required_Documents') or None,
                        'cabotage_max_operations': parse_int(row.get('Cabotage_Max_Operations')),
                        'cabotage_days_limit': parse_int(row.get('Cabotage_Days_Limit')),
                        'cabotage_cooling_period_days': parse_int(row.get('Cabotage_Cooling_Period_Days')),
                        'cross_border_reporting': parse_bool(row.get('Cross_Border_Reporting')),
                        'cross_border_system': row.get('Cross_Border_System') or None,
                        'load_securing_standard': row.get('Load_Securing_Standard') or None,
                        'adr_certificate_required': parse_bool(row.get('ADR_Certificate_Required')),
                        'adr_renewal_years': parse_int(row.get('ADR_Renewal_Years')),
                        'adr_tunnel_restrictions_categories': row.get('ADR_Tunnel_Restrictions_Categories') or None,
                        'vehicle_insurance_liability': row.get('Vehicle_Insurance_Liability') or None,
                        'cargo_insurance_mandatory': parse_bool(row.get('Cargo_Insurance_Mandatory')),
                        'cargo_insurance_special_note': row.get('Cargo_Insurance_Special_Note') or None,
                        'winter_tires_required': parse_bool(row.get('Winter_Tires_Required')),
                        'winter_tires_period_start': row.get('Winter_Tires_Period_Start') or None,
                        'winter_tires_period_end': row.get('Winter_Tires_Period_End') or None,
                        'winter_tires_min_tread_mm': parse_float(row.get('Winter_Tires_Min_Tread_MM')),
                        'winter_tires_special_type': row.get('Winter_Tires_Special_Type') or None,
                        'winter_tires_special_value_mm': parse_float(row.get('Winter_Tires_Special_Value_MM')),
                        'snow_chains_required': parse_bool(row.get('Snow_Chains_Required')),
                        'speed_limit_urban_kmh': parse_int(row.get('Speed_Limit_Urban_KMH')),
                        'speed_limit_urban_special_time': row.get('Speed_Limit_Urban_Special_Time') or None,
                        'speed_limit_urban_special_value': parse_float(row.get('Speed_Limit_Urban_Special_Value')),
                        'speed_limit_rural_kmh': parse_int(row.get('Speed_Limit_Rural_KMH')),
                        'speed_limit_rural_vehicle_type': row.get('Speed_Limit_Rural_Vehicle_Type') or None,
                        'speed_limit_rural_special_value': parse_float(row.get('Speed_Limit_Rural_Special_Value')),
                        'speed_limit_expressway_kmh': parse_int(row.get('Speed_Limit_Expressway_KMH')),
                        'speed_limit_expressway_special_type': row.get('Speed_Limit_Expressway_Special_Type') or None,
                        'speed_limit_expressway_special_value': parse_float(row.get('Speed_Limit_Expressway_Special_Value')),
                        'speed_limit_highway_kmh': parse_int(row.get('Speed_Limit_Highway_KMH')),
                        'speed_limit_highway_special_type': row.get('Speed_Limit_Highway_Special_Type') or None,
                        'speed_limit_highway_special_value': parse_float(row.get('Speed_Limit_Highway_Special_Value')),
                        'alcohol_limit_commercial_g_l': parse_float(row.get('Alcohol_Limit_Commercial_G_L')),
                        'alcohol_limit_special_type': row.get('Alcohol_Limit_Special_Type') or None,
                        'alcohol_limit_special_value': parse_float(row.get('Alcohol_Limit_Special_Value')),
                        'overtaking_ban_exists': parse_bool(row.get('Overtaking_Ban_Exists')),
                        'overtaking_ban_details': row.get('Overtaking_Ban_Details') or None,
                        'parking_shortage_issue': parse_bool(row.get('Parking_Shortage_Issue')),
                        'parking_shortage_level': row.get('Parking_Shortage_Level') or None,
                        'equipment_item_1': row.get('Equipment_Item_1') or None,
                        'equipment_item_2': row.get('Equipment_Item_2') or None,
                        'equipment_item_3': row.get('Equipment_Item_3') or None,
                        'equipment_item_4': row.get('Equipment_Item_4') or None,
                        'equipment_item_5': row.get('Equipment_Item_5') or None,
                        'equipment_special_item': row.get('Equipment_Special_Item') or None,
                        'equipment_special_quantity': parse_float(row.get('Equipment_Special_Quantity')),
                        'penalty_min_value': parse_float(row.get('Penalty_Min_Value')),
                        'penalty_min_currency': row.get('Penalty_Min_Currency') or None,
                        'penalty_max_value': parse_float(row.get('Penalty_Max_Value')),
                        'penalty_max_currency': row.get('Penalty_Max_Currency') or None,
                        'posting_declaration_required': parse_bool(row.get('Posting_Declaration_Required')),
                        'posting_declaration_portal': row.get('Posting_Declaration_Portal') or None,
                        'posting_declaration_extra_notes': row.get('Posting_Declaration_Extra_Notes') or None,
                        'notes': row.get('Notes') or None,
                        'law_reference_url': row.get('Law_Reference_URL') or None,
                    }
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Imported {count} transport law records'))