# #RedHatCollabothonChallange
AlfaGuys
Kacper Kleczaj
Mateusz Jędrzejczak
Filip Pecyna

## TruckAI Backend (Django REST) – Technical README

Purpose: AI-assisted transport operations — order intake, route calculation, legal checks, assignment, and profitability.

Stack: Django 4.x, Django REST Framework, drf-spectacular (OpenAPI), PostgreSQL, googlemaps (routes), deployed on OpenShift.

### Architecture

- Backend service in `backend/` with the API app in `backend/api/`
- REST endpoints in `api/views.py` using `ModelViewSet` plus custom `@action`s
- Serialization in `api/serializers.py`
- Domain models in `api/models.py`
- AI helpers:
  - `api/ai_matching.py`: driver scoring and ranking
  - `api/ai_extraction.py`: extracting structured order data from emails
- Fixtures and seed: `api/management/commands/import_fixtures.py`
- API docs (OpenAPI/Swagger): `/api/schema/swagger-ui/`

### Data Model

- `User` (Driver/Operator)
  - Availability/location: `is_active`, `current_country`, `current_city`
  - Licenses/certs: `license_c`, `license_ce`, `license_adr`, `forklift_certified`
  - Assigned asset: `current_vehicle` (FK → `Vehicle`)
- `Vehicle`
  - Type/capacity: `type` (`refrigerated|box|cargo`), `capacity_weight`, `capacity_volume`, `has_forklift`
  - Assignments: `current_driver` (FK → `User`)
  - Status: `available|in_transit|maintenance`
- `Route`
  - `origin`, `destination`, `distance_km`, `estimated_time`, `holiday_blocked`, `status`
- `Cargo`
  - Physical: `length|width|height|weight`
  - Requirements: `requires_cold|requires_box|forklift_needed|license_*_required`
- `Order`
  - Relations: `user` (client), `cargo`, `route`, optional `vehicle`, `driver`
  - Lifecycle: `status` (`new|assigned|in_transit|completed|cancelled`)
  - Dates: `creation_date`, `planned_date`, `loading_date`, `unloading_date`
  - Route shadow fields: `origin`, `destination`
  - Commercials: `cost`, `revenue`, `profit` (persisted)
- `Tracker` (vehicle live-tracking placeholder)
- `Holiday`, `TransportLaw` (constraints data)

### AI Components

#### Driver Matching (`api/ai_matching.py`)

Input: `Order` + compatible `User` queryset.

Output: ranked scoring list with reasons and optional distance score.

Criteria:
- License compliance: `license_c|license_ce|license_adr`
- Special needs: `forklift_certified`, vehicle type compatibility
- Availability on `planned_date` (excludes already assigned)
- Proximity heuristic: prefer same country/city as `origin`
- Preference: drivers with `current_vehicle`

Assignment flow (two-stage):
- Preview only (no side effects): `GET /api/orders/{id}/preview_assignment/` returns top candidates, `assigned_driver/assigned_vehicle` suggestion, reasons
- Confirm (side effects): `POST /api/orders/{id}/assign/` persists `driver`, `vehicle`, sets `status=assigned`

Granite VLLM receives data and based on it model chooses the best candidate.

#### Email Extraction (`api/ai_extraction.py`)

Transforms raw email text into structured order fields.

Endpoint: `POST /api/orders/extract-from-email/` with `email_body`.

Data is sent to Granite VLLM and added to orders.

### Financials

Canonical formula:
- `cost = (distance_km * 0.8 + (distance_km/100)*30*6.15) * 1.1`
- `revenue = cost * 1.3`
- `profit = revenue - cost`

Enforcement in codebase:
- Serializer-level compute on create/update (`OrderCreateSerializer.create/update`); fields are read-only from clients to avoid drift
- Explicit recalculation endpoint: `POST /api/orders/{id}/calculate_financials/` recomputes and persists from current route

Defensive defaults: If route/distance is absent during create/update, values are set to `0.0` to avoid nulls.

### Legal/Constraints Engine

- `Holiday` model with per-country flags (e.g., `license_*_allowed`) used in assignment to warn/block when `route.holiday_blocked`
- `TransportLaw` model stores per-country restrictions (weight/size/tolls/emissions, etc.); serves as a baseline for extended enforcement

### API Documentation

- OpenAPI schema: `/api/schema/`
- Swagger UI: `/api/schema/swagger-ui/`
- drf-spectacular notes:
  - For `APIView` without `serializer_class`, add `@extend_schema` or migrate to `GenericAPIView`
  - For `SerializerMethodField` returning objects, annotate with `@extend_schema_field`
