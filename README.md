# TruckAI - Collabothon 2025

Inteligentny system doboru zleceń transportowych z wykorzystaniem AI do optymalizacji tras i przypisywania kierowców.

## 🚀 Główne funkcjonalności

### 1. 🤖 Analiza AI tras z automatycznym przypisaniem kierowców

System automatycznie analizuje zlecenia i przypisuje najbliższego dostępnego kierowcę, minimalizując koszty transportu.

**Endpoint:** `POST /api/orders/{id}/assign/`

**Jak działa:**
1. **Analiza zlecenia** - System sprawdza wymagania zlecenia (typ towaru, waga, temperatura, wymagania specjalne)
2. **Wybór najbliższego kierowcy** - AI wybiera kierowcę na podstawie:
   - Lokalizacji (kraj i miasto) - preferuje kierowców najbliżej miejsca załadunku
   - Dostępności w dniu zlecenia
   - Uprawnień (licencje C, C+E, ADR, certyfikaty wózków widłowych)
   - Przypisanej ciężarówki (preferuje kierowców z już przypisanym pojazdem)
3. **Minimalizacja kosztów** - System wybiera kierowcę najbliżej trasy, aby zminimalizować:
   - Koszty dojazdu do miejsca załadunku
   - Czas oczekiwania
   - Puste przebiegi

**Przykład odpowiedzi:**
```json
{
  "order_id": 1,
  "assigned_vehicle": {
    "id": 5,
    "registration_no": "WX56789",
    "type": "refrigerated"
  },
  "assigned_driver": {
    "id": 3,
    "name": "Anna Wiśniewska",
    "current_country": "Poland",
    "current_city": "Warsaw"
  },
  "estimated_profit": 1250.50,
  "assignment_reasons": [
    "Vehicle WX56789 meets all requirements",
    "Driver Anna Wiśniewska has required licenses",
    "Driver located in origin country (Poland)",
    "Both available on 2025-12-01"
  ]
}
```

### 2. ⚖️ Analiza prawa transportowego - kto może jechać

System automatycznie sprawdza przepisy transportowe i wyświetla listę wszystkich kierowców, którzy mogą wykonać zlecenie.

**Funkcje analizy prawnej:**
- **Sprawdzanie uprawnień kierowców:**
  - Licencja C (kategoria podstawowa)
  - Licencja C+E (z przyczepą)
  - Certyfikat ADR (materiały niebezpieczne)
  - Certyfikat wózków widłowych
- **Walidacja świąt i zakazów:**
  - Sprawdzanie kalendarza świąt w krajach tranzytowych
  - Weryfikacja zakazów ruchu dla kategorii pojazdów
  - Ostrzeżenia o ograniczeniach prawnych
- **Analiza przepisów krajowych:**
  - Sprawdzanie przepisów transportowych dla każdego kraju na trasie
  - Weryfikacja wymagań dotyczących dokumentów
  - Walidacja limitów czasu pracy

**Endpoint do sprawdzania dostępnych kierowców:**
```
GET /api/users/available_drivers/?date=2025-12-01&license_c=true&license_adr=true&country=Poland
```

### 3. 📋 Lista truckerów w kolejności od najbliższego do najdalszego

System wyświetla wszystkich dostępnych kierowców, którzy spełniają wymagania zlecenia, posortowanych według odległości od miejsca załadunku.

**Sortowanie kierowców:**
1. **Najbliżsi geograficznie** - kierowcy w tym samym kraju/mieście co miejsce załadunku
2. **Z przypisaną ciężarówką** - preferowani kierowcy z już przypisanym pojazdem
3. **Z odpowiednimi uprawnieniami** - kierowcy spełniający wszystkie wymagania prawne
4. **Dostępni w terminie** - kierowcy wolni w dniu zlecenia

**Endpoint:**
```
GET /api/orders/{id}/assign/
```

**Odpowiedź zawiera:**
- Listę wszystkich kompatybilnych kierowców
- Odległość od miejsca załadunku
- Score kompatybilności (0-100%)
- Szczegóły uprawnień każdego kierowcy
- Informacje o przypisanej ciężarówce

### 4. 📧 Import zleceń z maili

System umożliwia automatyczne dodawanie zleceń do bazy danych na podstawie maili.

**Funkcje:**
- **Upload maila** - możliwość przesłania pliku email (.eml, .msg) lub wklejenia treści
- **Automatyczna ekstrakcja danych przez AI:**
  - Miejsce załadunku i rozładunku
  - Data załadunku i rozładunku
  - Typ towaru, waga, wymiary
  - Wymagania specjalne (temperatura, ADR, wózki widłowe)
  - Informacje o kliencie
- **Weryfikacja i edycja** - możliwość sprawdzenia i poprawienia wyekstrahowanych danych przed dodaniem do bazy
- **Automatyczne tworzenie zlecenia** - po weryfikacji zlecenie jest automatycznie dodawane do systemu

**Endpoint:**
```
POST /api/orders/
Content-Type: application/json

{
  "origin": "Warsaw, Poland",
  "destination": "Berlin, Germany",
  "cargo": 1,
  "route": 1,
  "planned_date": "2025-12-01",
  "cargo_type": "Pallets",
  "weight": 1500,
  "temperature": "Ambient",
  "loading_date": "2025-12-01",
  "unloading_date": "2025-12-03"
}
```

## 🏗️ Struktura projektu

```
collabothon2025/
├── backend/                    # Django REST Framework backend
│   ├── api/
│   │   ├── models.py          # Modele danych (User, Vehicle, Order, Route, Cargo)
│   │   ├── views.py           # Endpointy API z logiką AI
│   │   ├── serializers.py     # Serializery Django REST
│   │   └── management/        # Komendy zarządzania (import fixtures)
│   ├── config/
│   │   └── settings.py        # Konfiguracja Django (CORS, baza danych)
│   └── fixtures/              # Dane testowe (CSV)
│       ├── users.csv          # Kierowcy z lokalizacją i przypisanymi ciężarówkami
│       ├── vehicles.csv       # Pojazdy
│       ├── orders.csv         # Zlecenia z origin/destination
│       ├── routes.csv         # Trasy
│       └── ...
├── frontend/                   # React + TypeScript frontend
│   └── logistic/
│       └── src/
│           ├── pages/
│           │   ├── Home.tsx           # Strona główna
│           │   ├── AddOrder.tsx      # Dodawanie zleceń (formularz + upload maila)
│           │   ├── Fleet.tsx         # Flota i kierowcy
│           │   ├── Matching.tsx      # Propozycje AI
│           │   └── ...
│           └── components/
└── README.md                   # Ten plik
```

## 🎯 Kluczowe modele danych

### User (Kierowca)
- **Lokalizacja:** `current_country`, `current_city` - aktualna lokalizacja kierowcy
- **Przypisana ciężarówka:** `current_vehicle` - ForeignKey do Vehicle
- **Uprawnienia:** `license_c`, `license_ce`, `license_adr`, `forklift_certified`

### Order (Zlecenie)
- **Lokalizacja:** `origin`, `destination` - miejsce załadunku i rozładunku
- **Parametry:** `cargo_type`, `weight`, `temperature`, `special_requirements`
- **Daty:** `loading_date`, `unloading_date`, `planned_date`
- **Finanse:** `cost`, `revenue`, `profit`

### Vehicle (Pojazd)
- **Przypisany kierowca:** `current_driver` - ForeignKey do User
- **Parametry:** `type`, `capacity_weight`, `capacity_volume`, `has_forklift`

## 🔌 Główne endpointy API

### Zlecenia (Orders)
- `GET /api/orders/` - Lista wszystkich zleceń (filtrowanie po `origin`, `destination`)
- `POST /api/orders/` - Utworzenie nowego zlecenia
- `POST /api/orders/{id}/assign/` - **AI przypisanie kierowcy i pojazdu**
- `GET /api/orders/assignment_status/` - Status przypisania zleceń
- `GET /api/orders/active/` - Aktywne zlecenia

### Kierowcy (Users)
- `GET /api/users/` - Lista kierowców (filtrowanie po `country`, `city`, `vehicle_id`)
- `GET /api/users/available_drivers/` - Dostępni kierowcy z filtrami
- `GET /api/users/by-location/` - Kierowcy wg lokalizacji
- `GET /api/users/by-vehicle/` - Kierowcy przypisani do pojazdu
- `GET /api/users/{id}/statistics/` - Statystyki kierowcy

### Pojazdy (Vehicles)
- `GET /api/vehicles/` - Lista pojazdów (filtrowanie po `driver_id`, `has_driver`)
- `GET /api/vehicles/available_vehicles/` - Dostępne pojazdy

### Trasy (Routes)
- `GET /api/routes/calculate/` - Oblicz trasę z Google Maps API
- `POST /api/routes/optimize/` - Optymalizacja trasy (profit/time/distance)

### Prawo transportowe
- `GET /api/transport-laws/` - Przepisy transportowe wg kraju
- `GET /api/holidays/` - Kalendarz świąt i zakazów

## 🛠️ Uruchomienie

### Backend (Django)
```bash
cd backend
python manage.py migrate
python manage.py import_fixtures  # Import danych testowych
python manage.py runserver
```

Backend uruchomi się na: `http://localhost:8000`
API dokumentacja (Swagger): `http://localhost:8000/api/schema/swagger-ui/`

### Frontend (React)
```bash
cd frontend/logistic
npm install
npm run dev
```

Frontend uruchomi się na: `http://localhost:5173`

## 📊 Przykładowy flow użytkownika

1. **Dodanie zlecenia:**
   - Użytkownik wypełnia formularz lub uploaduje maila
   - System ekstrahuje dane przez AI
   - Zlecenie jest dodawane do bazy

2. **Analiza AI:**
   - Użytkownik klika "Analizuj trasę i przypisz kierowcę"
   - System:
     - Sprawdza wymagania zlecenia
     - Analizuje przepisy transportowe
     - Znajduje wszystkich kompatybilnych kierowców
     - Sortuje ich od najbliższego do najdalszego
     - Wybiera najlepszego kierowcę i pojazd

3. **Weryfikacja:**
   - System wyświetla listę wszystkich dostępnych kierowców
   - Pokazuje score kompatybilności i odległość
   - Użytkownik może zaakceptować lub wybrać innego kierowcę

4. **Przypisanie:**
   - System przypisuje kierowcę i pojazd do zlecenia
   - Aktualizuje status zlecenia na "assigned"
   - Wysyła powiadomienia

## 🎯 Technologie

- **Backend:** Django 4.x, Django REST Framework, PostgreSQL
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui
- **AI/ML:** Red Hat OpenShift AI, Llama Stack, Granite OSS
- **Maps:** Google Maps API (obliczanie tras, geocoding)
- **Deploy:** Red Hat OpenShift (Kubernetes)

## 📝 Następne kroki rozwoju

- [ ] Integracja z systemem email (IMAP/POP3) do automatycznego importu
- [ ] Rozszerzona analiza AI z machine learning do przewidywania kosztów
- [ ] Real-time tracking pojazdów na trasie
- [ ] Integracja z systemami płatności
- [ ] Aplikacja mobilna dla kierowców
- [ ] Dashboard analityczny z raportami ROI

## 📄 Licencja

Projekt stworzony na potrzeby Collabothon 2025.
