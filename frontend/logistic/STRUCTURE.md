# Struktura Projektu Frontend - TruckAI

```
frontend/logistic/
├── src/
│   ├── components/           # Komponenty wielokrotnego użytku
│   │   ├── ui/              # Komponenty UI z shadcn/ui
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   └── orders/          # Komponenty związane ze zleceniami
│   │       ├── OrderForm.tsx           # Formularz ręczny
│   │       ├── EmailUpload.tsx         # Upload i AI ekstrakcja
│   │       ├── RequirementsSummary.tsx # Podsumowanie wymagań
│   │       └── index.ts
│   │
│   ├── pages/               # Główne widoki/strony
│   │   ├── Home.tsx         # Strona główna (landing)
│   │   ├── AddOrder.tsx     # Widok dodawania zlecenia
│   │   └── index.ts
│   │
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # Helper functions (cn, etc.)
│   │
│   ├── App.tsx              # Main app entry (router placeholder)
│   ├── App.css              # Global app styles
│   ├── index.css            # Tailwind + theme config
│   └── main.tsx             # React root
│
├── public/
├── components.json          # shadcn/ui config
└── package.json
```

## 🎨 Konwencje designu

### Paleta kolorów (Dark theme)
- **Główne tło**: `bg-black`, `bg-zinc-900`, `bg-zinc-950`
- **Karty**: `bg-zinc-900` + `border-zinc-800`
- **Akcenty**: `text-red-500`, `bg-red-600`, `bg-red-900`
- **Teksty**: `text-white`, `text-zinc-400`, `text-zinc-500`

### Wzory hover
- Karty: `hover:border-zinc-700` lub `hover:border-red-900`
- Przyciski primary: `bg-red-600 hover:bg-red-700`
- Przyciski outline: `border-zinc-700 hover:bg-zinc-900`

### Spacing
- Sections padding: `py-20 px-8` lub `py-24 px-8`
- Container max-width: `max-w-7xl mx-auto`
- Gap między kartami: `gap-6` lub `gap-8`

## 📦 Komponenty

### UI Components (shadcn/ui)
Podstawowe komponenty z biblioteki shadcn/ui:
- `Button` - przyciski z wariantami
- `Card` + `CardHeader` + `CardTitle` + `CardDescription` - karty

### Order Components

#### `OrderForm`
Ręczny formularz wprowadzania parametrów zlecenia.

**Props:** Brak (zarządza stanem wewnętrznie)

**Funkcje:**
- Pola: typ towaru, waga, wymiary (L/W/H), temperatura
- Szczegóły: adresy załadunku/rozładunku, daty
- Wymagania specjalne (ADR, wózek, etc.)

#### `EmailUpload`
Komponent do uploadowania emaili i automatycznej ekstrakcji danych.

**Props:** Brak

**Funkcje:**
- Upload pliku (.eml, .txt, .msg)
- Wklejanie treści maila
- Symulacja AI processing (TODO: integracja z API)
- Podgląd wyodrębnionych danych

#### `RequirementsSummary`
Sidebar z podsumowaniem wymagań prawnych i rekomendacją pojazdu.

**Props:** Brak (mockowane dane)

**Funkcje:**
- Lista wymagań z statusami (required/optional/not-needed)
- Statystyki: ile wymaganych, opcjonalnych
- Rekomendacja typu pojazdu

## 🔄 Pages Flow

### Home → AddOrder
```
User clicks "Rozpocznij dobieranie zlecenia"
  → Navigate to AddOrder page
  → User chooses: Manual form OR Email AI
  → Fill data → Click "Analizuj zlecenie"
  → (TODO) Navigate to Matching Results
```

## 🚀 Dodawanie nowych komponentów

### Krok 1: Stwórz komponent
```tsx
// src/components/example/MyComponent.tsx
export function MyComponent() {
  return <div>...</div>
}
```

### Krok 2: Export w index.ts
```tsx
// src/components/example/index.ts
export { MyComponent } from './MyComponent'
```

### Krok 3: Import w stronie
```tsx
import { MyComponent } from '@/components/example'
```

## 🎯 Następne komponenty do zbudowania

1. **MatchingResults** - wyniki AI matchingu
2. **VehicleCard** - karta pojedynczego pojazdu
3. **DriverCard** - karta kierowcy
4. **RouteMap** - mapa trasy
5. **ProfitCalculator** - kalkulator zysku
6. **TrackingWidget** - tracking na żywo

