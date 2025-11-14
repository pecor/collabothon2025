# TruckAI - Collabothon 2025

Inteligentny system doboru zleceń transportowych z wykorzystaniem AI.

## 🚀 Struktura projektu

```
collabothon2025/
├── backend/          # Django/FastAPI backend
├── frontend/         # React + TypeScript frontend
│   └── logistic/     # Główna aplikacja
│       └── src/
│           ├── App.tsx           # 🏠 STRONA GŁÓWNA
│           └── components/ui/    # Komponenty shadcn/ui
└── pitchdeck-pl.md  # Pitch deck projektu
```

## 🎨 Frontend - Strona główna

**Lokalizacja:** `frontend/logistic/src/App.tsx`

### Co zawiera strona główna:

1. **Hero Section** - Główny przekaz z CTA
   - Tytuł: "Automatyzacja logistyki z mocą AI"
   - Badge z opisem systemu
   - 2 przyciski CTA:
     - "Rozpocznij dobieranie zlecenia" (primary)
     - "Zobacz demo" (outline)

2. **Statystyki (3 karty)**
   - 80% krótszy czas obsługi
   - 15-25% wyższe marże
   - 100% zgodność z przepisami

3. **Sekcja "Jak działa TruckAI?" (4 karty)**
   - Automatyczny dobór zleceń
   - Maksymalizacja zysku
   - Walidator wymagań
   - Tracking i Analytics

4. **Sekcja CTA końcowa**
   - Niebieska karta z głównym Call-to-Action
   - "Wybierz zlecenie do optymalizacji"

### Użyte komponenty shadcn/ui:
- `Button` - różne warianty (default, outline, secondary)
- `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent`

### Ikony (lucide-react):
- `Truck` - logo i CTA
- `Clock` - oszczędność czasu
- `TrendingUp` - wzrost marż
- `Shield` - zgodność
- `Zap` - automatyzacja
- `BarChart3` - analytics

## 🛠️ Uruchomienie

### Frontend
```bash
cd frontend/logistic
npm install
npm run dev
```

Aplikacja uruchomi się na: `http://localhost:5173`

### Backend
```bash
cd backend
# instrukcje wkrótce
```

## 📄 Strony aplikacji

### 1. **Strona główna** (`src/pages/Home.tsx`) ✅
Landing page z opisem systemu, statystykami i CTA

### 2. **Dodaj Zlecenie** (`src/pages/AddOrder.tsx`) ✅
Widok do dodawania i analizy zleceń transportowych

**Komponenty:**
- `OrderForm` - Ręczny formularz parametrów zlecenia
- `EmailUpload` - Upload maila/pliku z automatyczną ekstrakcją AI
- `RequirementsSummary` - Podsumowanie wymagań prawnych i technicznych

**Funkcje:**
- ✅ Formularz z parametrami: typ towaru, waga, wymiary, temperatura
- ✅ Szczegóły załadunku/rozładunku (adresy, daty)
- ✅ Upload maila z automatyczną ekstrakcją danych przez AI
- ✅ Podgląd wykrytych parametrów z możliwością edycji
- ✅ Automatyczna analiza wymagań (ADR, typ pojazdu, uprawnienia)
- ✅ Rekomendacja typu pojazdu
- ✅ Toggle między trybem ręcznym a AI

### 3. **Flota i Kierowcy** (`src/pages/Fleet.tsx`) ✅
- Lista pojazdów z parametrami i scoring
- Lista kierowców z uprawnieniami
- Wyszukiwarka i filtry

### 4. **Wymagania i Walidacja** (`src/pages/Requirements.tsx`) ✅
- Lista wymagań prawnych (kierowca, pojazd, szkolenia)
- Walidacja dat z kalendarzem świąt
- Sprawdzanie zakazów ruchu

### 5. **Propozycje AI** (`src/pages/Matching.tsx`) ✅
- Rekomendowane zestawy kierowca-pojazd
- Scoring 0-100% z uzasadnieniem AI
- Symulacja zyskowności (koszt, zysk, ETA)

### 6. **Wizualizacja Trasy** (`src/pages/Route.tsx`) ✅
- Placeholder mapy (Google Maps/OSM)
- Waypoints z statusami
- Monitoring pojazdu na żywo
- Ograniczenia prawne na trasie

### 7. **Dashboard Analityczny** (`src/pages/Dashboard.tsx`) ✅
- Statystyki: zlecenia, ROI, czas realizacji
- Wykresy efektywności
- Case study najlepszych tras
- Alerty i problemy

### 8. **Dokumentacja API** (`src/pages/Docs.tsx`) ✅
- Lista endpointów REST API
- Architektura systemu
- Modele AI i scoring
- Quick Start guide
- FAQ implementacyjne

## 🧭 Nawigacja między stronami

### Routing (React Router v6):
```
/ → Home (strona główna)
/add-order → Dodaj zlecenie
/fleet → Flota i kierowcy
/requirements → Wymagania i walidacja
/matching → Propozycje AI
/route → Wizualizacja trasy
/dashboard → Dashboard analityczny
/docs → Dokumentacja API
```

### Flow użytkownika:
```
Home → AddOrder → Requirements → Matching → Route → Dashboard
  ↓                                                       ↑
Fleet ←------------------------------------------→ Docs
```

### Nawigacja w headerach:
- **Home**: Flota | Dashboard | API Docs
- **Każda strona**: ← Wstecz | Logo (→ Home)

## 📝 Następne kroki

Do dodania:
- ✅ ~~Routing (React Router)~~ - **GOTOWE**
- **Strona dopasowania** - wyniki AI matchingu kierowca-pojazd-zlecenie
- **Dashboard** - tracking na żywo, analytics, raporty
- **API Integration** - podłączenie backendu

## 🎯 Technologie

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS 4, shadcn/ui
- **Backend:** Django/FastAPI (w development)
- **AI:** Red Hat OpenShift AI, Llama Stack, Granite OSS
- **Deploy:** Red Hat OpenShift (Kubernetes)