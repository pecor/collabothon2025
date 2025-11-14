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
    current_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_vehicle', verbose_name="Current Driver")

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
    dimensions = models.CharField(max_length=100, verbose_name="Dimensions (W*H*D)")
    weight = models.FloatField(verbose_name="Weight (kg)")
    volume = models.FloatField(verbose_name="Volume (m³)")
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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name="Client")
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE, related_name='orders', verbose_name="Cargo")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='orders', verbose_name="Route")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="Assigned Vehicle")
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_orders', verbose_name="Assigned Driver")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Status")
    creation_date = models.DateTimeField(auto_now_add=True, verbose_name="Creation Date")
    planned_date = models.DateField(verbose_name="Planned Departure Date")
    actual_end_date = models.DateTimeField(null=True, blank=True, verbose_name="Actual End Date")

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