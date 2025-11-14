
from django.contrib import admin
from .models import User, Vehicle, Route, Cargo, Order, Tracker, Holiday

admin.site.register(User)
admin.site.register(Vehicle)
admin.site.register(Route)
admin.site.register(Cargo)
admin.site.register(Order)
admin.site.register(Tracker)
admin.site.register(Holiday)
