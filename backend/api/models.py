from django.db import models
from django.contrib.postgres.fields import ArrayField


class User(models.Model):
    """Drivers, Operators"""
    name = models.CharField(max_length=255, verbose_name="Full Name")
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Phone")
    license_c = models.BooleanField(default=False, verbose_name="Category C License")
    license_ce = models.BooleanField(default=False, verbose_name="Category C+E License")
    license_adr = models.BooleanField(default=False, verbose_name="ADR Certification")
    forklift_certified = models.BooleanField(default=False, verbose_name="Forklift Certification")
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    
    # Current assignment and location
    current_vehicle = models.ForeignKey('Vehicle', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_driver', verbose_name="Current Vehicle")
    current_country = models.CharField(max_length=100, null=True, blank=True, verbose_name="Current Country")
    current_city = models.CharField(max_length=100, null=True, blank=True, verbose_name="Current City")

    class Meta:
        db_table = 'users'
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    """Vehicles"""
    TYPE_CHOICES = [
        ('refrigerated', 'Refrigerated'),
        ('box', 'Box'),
        ('cargo', 'Cargo'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('in_transit', 'In Transit'),
        ('maintenance', 'Maintenance'),
    ]

    registration_no = models.CharField(max_length=20, unique=True, verbose_name="Registration Number")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Vehicle Type")
    capacity_weight = models.FloatField(verbose_name="Max Load Capacity (kg)")
    capacity_volume = models.FloatField(verbose_name="Max Volume Capacity (m³)")
    has_forklift = models.BooleanField(default=False, verbose_name="Has Forklift")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', verbose_name="Status")
    current_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driven_vehicle', verbose_name="Current Driver")

    class Meta:
        db_table = 'vehicles'
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'

    def __str__(self):
        return f"{self.registration_no} ({self.type})"


class Route(models.Model):
    """Routes"""
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    origin = models.CharField(max_length=255, verbose_name="Origin")
    destination = models.CharField(max_length=255, verbose_name="Destination")
    distance_km = models.FloatField(verbose_name="Distance (km)")
    estimated_time = models.DurationField(verbose_name="Estimated Time")
    holiday_blocked = models.BooleanField(default=False, verbose_name="Holiday Blocked")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned', verbose_name="Status")

    class Meta:
        db_table = 'routes'
        verbose_name = 'Route'
        verbose_name_plural = 'Routes'

    def __str__(self):
        return f"{self.origin} → {self.destination}"


class Cargo(models.Model):
    """Cargo Items"""
    name = models.CharField(max_length=255, verbose_name="Cargo Name")
    length = models.FloatField(default=1, verbose_name="Length (cm)")
    width = models.FloatField(default=1, verbose_name="Width (cm)")
    height = models.FloatField(default=1, verbose_name="Height (cm)")
    weight = models.FloatField(verbose_name="Weight (kg)")
    requires_cold = models.BooleanField(default=False, verbose_name="Requires Refrigeration")
    requires_box = models.BooleanField(default=False, verbose_name="Requires Box")
    requires_crate = models.BooleanField(default=False, verbose_name="Requires Crate")
    forklift_needed = models.BooleanField(default=False, verbose_name="Forklift Needed")
    license_c_required = models.BooleanField(default=False, verbose_name="Category C License Required")
    license_ce_required = models.BooleanField(default=False, verbose_name="Category C+E License Required")
    license_adr_required = models.BooleanField(default=False, verbose_name="ADR Certification Required")
    special_training = ArrayField(models.CharField(max_length=100), blank=True, default=list, verbose_name="Special Training Required")

    class Meta:
        db_table = 'cargos'
        verbose_name = 'Cargo'
        verbose_name_plural = 'Cargo Items'

    def __str__(self):
        return self.name


class Order(models.Model):
    """Orders"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('assigned', 'Assigned'),
        ('in_transit', 'In Transit'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True, verbose_name="Client")
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE, related_name='orders', verbose_name="Cargo")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='orders', verbose_name="Route")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="Assigned Vehicle")
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_orders', verbose_name="Assigned Driver")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Status")
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name="Creation Date")
    planned_date = models.DateField(verbose_name="Planned Departure Date")
    actual_end_date = models.DateTimeField(null=True, blank=True, verbose_name="Actual End Date")
    
    # Location fields
    origin = models.CharField(max_length=255, verbose_name="Origin", help_text="Starting location")
    destination = models.CharField(max_length=255, verbose_name="Destination", help_text="Destination location")
    
    # Additional fields from form
    cargo_type = models.CharField(max_length=255, verbose_name="Cargo Type", help_text="e.g. Pallets, Boxes, Chemicals")
    weight = models.FloatField(verbose_name="Weight (kg)", help_text="Order weight (kg)")
    temperature = models.CharField(max_length=100, verbose_name="Temperature (°C)", help_text="e.g. -18 to -20 or 'Ambient'")
    special_requirements = models.TextField(null=True, blank=True, verbose_name="Special Requirements", help_text="e.g. ADR, Forklift, Tarpaulin")
    loading_date = models.DateField(verbose_name="Loading Date")
    unloading_date = models.DateField(verbose_name="Unloading Date")
    
    # Financial fields
    cost = models.FloatField(null=True, blank=True, verbose_name="Cost", help_text="Total cost of the order")
    revenue = models.FloatField(null=True, blank=True, verbose_name="Revenue", help_text="Total revenue from the order")
    profit = models.FloatField(null=True, blank=True, verbose_name="Profit", help_text="Profit (revenue - cost)")

    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-creation_date']

    def __str__(self):
        return f"Order #{self.id} - {self.cargo.name}"


class Tracker(models.Model):
    """Trip Tracking"""
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='tracker', verbose_name="Vehicle")
    current_location = models.CharField(max_length=255, verbose_name="Current Location")
    distance_to_dest_km = models.FloatField(verbose_name="Remaining Distance (km)")
    estimated_arrival = models.DateTimeField(verbose_name="Estimated Arrival Time")
    tracking_points = models.JSONField(default=dict, verbose_name="Location History")

    class Meta:
        db_table = 'tracker'
        verbose_name = 'Tracker'
        verbose_name_plural = 'Trackers'

    def __str__(self):
        return f"Tracking {self.vehicle.registration_no}"


class Holiday(models.Model):
    """Holiday Calendar with Transport Restrictions"""
    date = models.DateField(verbose_name="Holiday Date")
    country = models.CharField(max_length=2, verbose_name="Country Code")
    description = models.CharField(max_length=255, verbose_name="Description")
    license_c_allowed = models.IntegerField(choices=[(0, 'Restricted'), (1, 'Allowed')], default=0, verbose_name="Category C Allowed")
    license_ce_allowed = models.IntegerField(choices=[(0, 'Restricted'), (1, 'Allowed')], default=0, verbose_name="Category C+E Allowed")
    license_adr_allowed = models.IntegerField(choices=[(0, 'Restricted'), (1, 'Allowed')], default=0, verbose_name="ADR Allowed")

    class Meta:
        db_table = 'holidays'
        verbose_name = 'Holiday'
        verbose_name_plural = 'Holidays'
        unique_together = ['date', 'country']
        ordering = ['date']

    def __str__(self):
        return f"{self.date} - {self.country} - {self.description}"


class TransportLaw(models.Model):
    """Transport Law Regulations by Country"""
    country = models.CharField(max_length=100, unique=True, verbose_name="Country")
    
    # Weight restrictions
    max_weight_ton = models.FloatField(null=True, blank=True, verbose_name="Max Weight (Ton)")
    max_weight_special_case = models.CharField(max_length=255, null=True, blank=True, verbose_name="Max Weight Special Case")
    max_weight_special_value = models.FloatField(null=True, blank=True, verbose_name="Max Weight Special Value")
    
    # Length restrictions
    max_length_m = models.FloatField(null=True, blank=True, verbose_name="Max Length (m)")
    max_length_special_case = models.CharField(max_length=255, null=True, blank=True, verbose_name="Max Length Special Case")
    max_length_special_value = models.FloatField(null=True, blank=True, verbose_name="Max Length Special Value")
    
    # Width and Height
    max_width_m = models.FloatField(null=True, blank=True, verbose_name="Max Width (m)")
    max_height_m = models.FloatField(null=True, blank=True, verbose_name="Max Height (m)")
    oversize_permit_required = models.BooleanField(default=False, verbose_name="Oversize Permit Required")
    
    # Rest and accommodation
    rest_45h_in_cabin_allowed = models.BooleanField(default=False, verbose_name="Rest 45h In Cabin Allowed")
    rest_45h_special_note = models.TextField(null=True, blank=True, verbose_name="Rest 45h Special Note")
    min_hotel_standard = models.CharField(max_length=255, null=True, blank=True, verbose_name="Min Hotel Standard")
    hotel_invoice_required = models.BooleanField(default=False, verbose_name="Hotel Invoice Required")
    
    # Weekend and seasonal bans
    weekend_driving_ban = models.BooleanField(default=False, verbose_name="Weekend Driving Ban")
    ban_details = models.TextField(null=True, blank=True, verbose_name="Ban Details")
    ban_vehicle_type_restriction = models.CharField(max_length=255, null=True, blank=True, verbose_name="Ban Vehicle Type Restriction")
    ban_season_summer = models.BooleanField(default=False, verbose_name="Ban Season Summer")
    ban_summer_months = models.CharField(max_length=255, null=True, blank=True, verbose_name="Ban Summer Months")
    
    # Emission zones
    emission_zone_lez = models.BooleanField(default=False, verbose_name="Emission Zone LEZ")
    emission_zone_cities = models.TextField(null=True, blank=True, verbose_name="Emission Zone Cities")
    min_euro_class = models.CharField(max_length=50, null=True, blank=True, verbose_name="Min Euro Class")
    min_euro_class_restriction = models.CharField(max_length=255, null=True, blank=True, verbose_name="Min Euro Class Restriction")
    lez_details = models.TextField(null=True, blank=True, verbose_name="LEZ Details")
    
    # Toll system
    toll_system = models.CharField(max_length=255, null=True, blank=True, verbose_name="Toll System")
    toll_system_box_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Toll System Box Name")
    toll_payment_method = models.TextField(null=True, blank=True, verbose_name="Toll Payment Method")
    toll_payment_special_notes = models.TextField(null=True, blank=True, verbose_name="Toll Payment Special Notes")
    
    # Tachograph
    tachograph_type_required = models.CharField(max_length=255, null=True, blank=True, verbose_name="Tachograph Type Required")
    tachograph_mandatory_from_year = models.IntegerField(null=True, blank=True, verbose_name="Tachograph Mandatory From Year")
    
    # Driver CPC
    driver_cpc_required = models.BooleanField(default=False, verbose_name="Driver CPC Required")
    driver_cpc_hours = models.IntegerField(null=True, blank=True, verbose_name="Driver CPC Hours")
    driver_cpc_renewal_years = models.IntegerField(null=True, blank=True, verbose_name="Driver CPC Renewal Years")
    
    # A1 Certificate
    a1_certificate_required = models.BooleanField(default=False, verbose_name="A1 Certificate Required")
    a1_certificate_notes = models.TextField(null=True, blank=True, verbose_name="A1 Certificate Notes")
    a1_issuing_authority = models.CharField(max_length=255, null=True, blank=True, verbose_name="A1 Issuing Authority")
    
    # Required documents
    required_documents = models.TextField(null=True, blank=True, verbose_name="Required Documents")
    
    # Cabotage
    cabotage_max_operations = models.IntegerField(null=True, blank=True, verbose_name="Cabotage Max Operations")
    cabotage_days_limit = models.IntegerField(null=True, blank=True, verbose_name="Cabotage Days Limit")
    cabotage_cooling_period_days = models.IntegerField(null=True, blank=True, verbose_name="Cabotage Cooling Period Days")
    
    # Cross border reporting
    cross_border_reporting = models.BooleanField(default=False, verbose_name="Cross Border Reporting")
    cross_border_system = models.CharField(max_length=255, null=True, blank=True, verbose_name="Cross Border System")
    
    # Load securing
    load_securing_standard = models.CharField(max_length=255, null=True, blank=True, verbose_name="Load Securing Standard")
    
    # ADR
    adr_certificate_required = models.BooleanField(default=False, verbose_name="ADR Certificate Required")
    adr_renewal_years = models.IntegerField(null=True, blank=True, verbose_name="ADR Renewal Years")
    adr_tunnel_restrictions_categories = models.CharField(max_length=255, null=True, blank=True, verbose_name="ADR Tunnel Restrictions Categories")
    
    # Insurance
    vehicle_insurance_liability = models.CharField(max_length=255, null=True, blank=True, verbose_name="Vehicle Insurance Liability")
    cargo_insurance_mandatory = models.BooleanField(default=False, verbose_name="Cargo Insurance Mandatory")
    cargo_insurance_special_note = models.TextField(null=True, blank=True, verbose_name="Cargo Insurance Special Note")
    
    # Winter tires
    winter_tires_required = models.BooleanField(default=False, verbose_name="Winter Tires Required")
    winter_tires_period_start = models.CharField(max_length=50, null=True, blank=True, verbose_name="Winter Tires Period Start")
    winter_tires_period_end = models.CharField(max_length=50, null=True, blank=True, verbose_name="Winter Tires Period End")
    winter_tires_min_tread_mm = models.FloatField(null=True, blank=True, verbose_name="Winter Tires Min Tread (mm)")
    winter_tires_special_type = models.CharField(max_length=255, null=True, blank=True, verbose_name="Winter Tires Special Type")
    winter_tires_special_value_mm = models.FloatField(null=True, blank=True, verbose_name="Winter Tires Special Value (mm)")
    snow_chains_required = models.BooleanField(default=False, verbose_name="Snow Chains Required")
    
    # Speed limits
    speed_limit_urban_kmh = models.IntegerField(null=True, blank=True, verbose_name="Speed Limit Urban (km/h)")
    speed_limit_urban_special_time = models.CharField(max_length=255, null=True, blank=True, verbose_name="Speed Limit Urban Special Time")
    speed_limit_urban_special_value = models.FloatField(null=True, blank=True, verbose_name="Speed Limit Urban Special Value")
    speed_limit_rural_kmh = models.IntegerField(null=True, blank=True, verbose_name="Speed Limit Rural (km/h)")
    speed_limit_rural_vehicle_type = models.CharField(max_length=255, null=True, blank=True, verbose_name="Speed Limit Rural Vehicle Type")
    speed_limit_rural_special_value = models.FloatField(null=True, blank=True, verbose_name="Speed Limit Rural Special Value")
    speed_limit_expressway_kmh = models.IntegerField(null=True, blank=True, verbose_name="Speed Limit Expressway (km/h)")
    speed_limit_expressway_special_type = models.CharField(max_length=255, null=True, blank=True, verbose_name="Speed Limit Expressway Special Type")
    speed_limit_expressway_special_value = models.FloatField(null=True, blank=True, verbose_name="Speed Limit Expressway Special Value")
    speed_limit_highway_kmh = models.IntegerField(null=True, blank=True, verbose_name="Speed Limit Highway (km/h)")
    speed_limit_highway_special_type = models.CharField(max_length=255, null=True, blank=True, verbose_name="Speed Limit Highway Special Type")
    speed_limit_highway_special_value = models.FloatField(null=True, blank=True, verbose_name="Speed Limit Highway Special Value")
    
    # Alcohol limit
    alcohol_limit_commercial_g_l = models.FloatField(null=True, blank=True, verbose_name="Alcohol Limit Commercial (g/L)")
    alcohol_limit_special_type = models.CharField(max_length=255, null=True, blank=True, verbose_name="Alcohol Limit Special Type")
    alcohol_limit_special_value = models.FloatField(null=True, blank=True, verbose_name="Alcohol Limit Special Value")
    
    # Overtaking and parking
    overtaking_ban_exists = models.BooleanField(default=False, verbose_name="Overtaking Ban Exists")
    overtaking_ban_details = models.TextField(null=True, blank=True, verbose_name="Overtaking Ban Details")
    parking_shortage_issue = models.BooleanField(default=False, verbose_name="Parking Shortage Issue")
    parking_shortage_level = models.CharField(max_length=255, null=True, blank=True, verbose_name="Parking Shortage Level")
    
    # Equipment
    equipment_item_1 = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Item 1")
    equipment_item_2 = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Item 2")
    equipment_item_3 = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Item 3")
    equipment_item_4 = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Item 4")
    equipment_item_5 = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Item 5")
    equipment_special_item = models.CharField(max_length=255, null=True, blank=True, verbose_name="Equipment Special Item")
    equipment_special_quantity = models.FloatField(null=True, blank=True, verbose_name="Equipment Special Quantity")
    
    # Penalties
    penalty_min_value = models.FloatField(null=True, blank=True, verbose_name="Penalty Min Value")
    penalty_min_currency = models.CharField(max_length=10, null=True, blank=True, verbose_name="Penalty Min Currency")
    penalty_max_value = models.FloatField(null=True, blank=True, verbose_name="Penalty Max Value")
    penalty_max_currency = models.CharField(max_length=10, null=True, blank=True, verbose_name="Penalty Max Currency")
    
    # Posting declaration
    posting_declaration_required = models.BooleanField(default=False, verbose_name="Posting Declaration Required")
    posting_declaration_portal = models.CharField(max_length=255, null=True, blank=True, verbose_name="Posting Declaration Portal")
    posting_declaration_extra_notes = models.TextField(null=True, blank=True, verbose_name="Posting Declaration Extra Notes")
    
    # Additional notes and references
    notes = models.TextField(null=True, blank=True, verbose_name="Notes")
    law_reference_url = models.URLField(null=True, blank=True, verbose_name="Law Reference URL")
    
    class Meta:
        db_table = 'transport_laws'
        verbose_name = 'Transport Law'
        verbose_name_plural = 'Transport Laws'
        ordering = ['country']
    
    def __str__(self):
        return self.country