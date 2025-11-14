# TruckAI – Inteligentny system doboru zleceń transportowych

## Pitch Deck – Red Hat Challenge dla Commerzbank Collabothon 2025

---

## 1. Problem do rozwiązania

### Współczesne wyzwania logistyki
- **Ręczna alokacja zleceń**: Firmy tracą dziesiątki godzin na ręcznym przypisywaniu kursów do dostępnych samochodów
- **Nieoptymalne trasy**: Brak automatyzacji to niepotrzebnie zmarnowany potencjał floty
- **Zawiłość wymagań**: Kategoria prawa jazdy, ADR, krajowe zakazy świąteczne, gabaryty – każdy przypadek wymaga indywidualnej uwagi
- **Brak dynamicznej optymalizacji**: Decyzje podejmowane bez wsparcia danych: reaktywność zamiast przewidywania

### Szansa rynkowa
Firmy transportowe potrzebują systemu, który **automatycznie** dobiera najlepszy zestaw kierowca-pojazd-zlecenie maksymalizując zysk i **automatycznie przewiduje** wszystkie ograniczenia oraz potencjalny zysk z każdego kursu.

---

## 2. Nasze rozwiązanie

### TruckAI: Sztuczna inteligencja dla transportu

**Główne funkcje:**
- **Automatyczny dobór zleceń**: AI analizuje wymagania ładunku, parametry pojazdów, uprawnienia kierowców i warunki prawne
- **Algorytm maksymalizacji zysku**: Wylicza przewidywany zysk z kursu biorąc pod uwagę dystans, koszty, specyfikę zlecenia
- **Walidator wymagań**: Weryfikuje uprawnienia, ADR, odpowiedni typ auta, wymogi chłodni/box/skrzynia oraz krajowe ograniczenia w czasie świąt
- **Tracker na żywo i dynamiczne ETA**: Bieżący monitoring pojazdu, aktualizacja ETA, automatyczne generowanie raportów wydajności
- **Integracja emailowa**: System automatycznie przetwarza maile przychodzące (bek-end LLM+parser), wyodrębniając z nich zadania transportowe i automatycznie proponując optymalne przypisanie.

**Rozwiązania na typowe problemy:**
- Unikanie błędów kadrowych (brak uprawnień, brak wymaganych przeszkolonych kierowców) – AI blokuje możliwość błędnego przydziału
- Pełna zgodność z prawem: Automatyczna blokada prób załadunku/wyjazdu w dni z zakazem w danym kraju oraz dla konkretnego typu pojazdu/licencji
- Dynamiczne szacowanie wyników – AI wylicza ROI każdej trasy, wskazując najbardziej opłacalne zgłoszenie każdego dnia
- Sugerowanie alternatywnych tras i podziału ładunków (np. split palet dla różnych klientów w jednej trasie)

---

## 3. Architektura i technologia

### Stos technologiczny:
```
┌─────────────────────────────────────────┐
│   Red Hat OpenShift (Kubernetes)        │
├─────────────────────────────────────────┤
│  • Backend (Django/FastAPI)             │
│  • Serwis parsera emaili                │
│  • Silnik optymalizacji AI              │
│  • Tracker na żywo (microservice)       │
├─────────────────────────────────────────┤
│   Red Hat OpenShift AI (RHOAI)          │
├─────────────────────────────────────────┤
│  • Agent Llama Stack                    │
│  • vLLM (serving modelu ML w czasie rzeczywistym) │
│  • Granite OSS Model (fine-tuning przez InstructLab) │
├─────────────────────────────────────────┤
│   PostgreSQL (baza danych)              │
│   Podman Desktop (testowanie lokalne)   │
└─────────────────────────────────────────┘
```

### Mocne strony – Architektura AI
- Każde zlecenie obsługiwane przez **agenta LLM** (Llama Stack) analizującego dane z maila i bazy
- Część decyzyjna – dedykowany agent AI wylicza opłacalność (zasilany faktycznymi rozkładami jazdy, kosztami, obłożeniem floty)
- Warstwa weryfikacji – automatyczne blokowanie zakazów (na podstawie tabeli świąt i wymagań krajowych dla typów pojazdów/licencji)
- Serwis mikro-prognoz: każdy tracking generuje predykcję opóźnienia, korekty ETAs i wpływ na następne zlecenia

**Doposażenie własne:**
- Dynamiczny ranking kierowców (Scoring skuteczności, błędy, terminowość)
- Feedback-loop: Automatyczne uczenie modelu na podstawie realnych zysków i nieudanych przypisań (reinforcement learning w mikro-skali)

---

## 4. Model danych

- **User**: Kierowca z uprawnieniami (C, C+E, ADR, wózek)
- **Vehicle**: Auto z ładownością, typem (chłodnia/box/skrzynia/forklift)
- **Cargo**: Parametry przesyłki (wymiary, waga, wymagania)
- **Order**: Zlecenie, planowane/realne daty, wyliczony zysk
- **Holiday**: Blokada krajowa/typowa (np. Niemcy – niedziela, święto tylko ADR)
- **Tracker**: Pozycja, ETA, historia

---

## 5. Przewaga biznesowa

- **Czas reakcji**: Redukcja czasu alokacji zleceń z godzin do sekund
- **Większa rentowność**: Automatyczne wybieranie najlepiej opłacalnych kursów przy danych zasobach
- **Zero błędów prawnych**: Blokowanie zleceń ze złym kierowcą/pojazdem albo z naruszeniem świątecznych zakazów
- **Pełna cyfryzacja**: Zlecenia z maila, walidacja przez AI, przepisanie do ERP
- **Skalowalność**: System obsłuży setki zleceń dziennie bez dodatkowych dyspozytorów

**Innowacje AI/RedHat:**
- vLLM na RHOAI – inference 100ms dla zlecenia
- Llama Stack agent – szybka ekstrakcja i rozumienie tekstu transportowego
- Granite OSS – model autorski wytrenowany na rzeczywistych danych klientów transportowych
- Automatyczny feedback loop oraz samouczenie na nieudanych i udanych trasach

---

## 6. Integracja Red Hat – jak zrealizujemy challenge

- **Deployment na Red Hat OpenShift** (aplikacja kontenerowa Django + serwisy AI)
- **Model Llama/Granite** wdrożony w Red Hat OpenShift AI (RHOAI)
- **vLLM** – dispatcher inference do zarządzania requestami pod presją wielu zgłoszeń
- **Podman Desktop** – pipeline CI do testowania i rozwoju agentów lokalnie
- **Devspaces (VS Code w przeglądarce)** – współpraca zespołu 9 osób w czasie rzeczywistym
- **Fine-tuning InstructLab** – retrain modelu na danych transportowych

---

## 7. Wizja wdrożenia

- MVP – pełna automatyzacja rozdzielania zleceń, email parser, algorytm zysku, walidacja prawna (Collabothon)
- Etap 2 – Analytics dashboard, API ERP + TMS, integracja raportowania dla zarządów
- Etap 3 – Sieć firm, współdzielone trasy i predykcja kosztów/carbon footprint lokalizacja floty

**Target:** Średnie firmy transportowe (20-100 aut), operatorzy spedycyjni, firmy z chłodniami (cold chain)

---

## 8. Model finansowy

- **Subskrypcja**: 250-350zł/auto/miesiąc (prosty pricing)
- **Poziom rynku PL+DE**: 2 500 firm, łączny potencjał 150 mln zł/rok
- **Adopcja**: 20% w 1. roku, 35%/2. rok, 60%/3. rok

| Rok | Klienci | Przychód | Marża |
|-----|---------|----------|-------|
| 1   | 300     | 9 mln    | 75%   |
| 2   | 700     | 26 mln   | 80%   |
| 3   | 1 500   | 63 mln   | 82%   |

---

## 9. Podsumowanie – przewaga TruckAI

- 80% krótszy czas obsługi zlecenia
- 15-25% wyższe marże (większy zysk na tej samej flocie)
- Regulatory Compliance out of the box (brak kar, zero pomyłek)
- Szybki start – wdrożenie w 2 dni, bez zmiany ERP
- Stały rozwój – integracja z API przewoźników i partnerów

## Call to Action

- Demo: automatyczna alokacja na produkcji (flow mail / klik → zysk)
- Mierniki: live ROI, redukcja kosztów, terminowość
- Test onboarding: Przekonać 3 realnych użytkowników z PL/DE

---

**TruckAI to Twój nowy agent skuteczności. Zamień zlecenia w czysty zysk – bez utraty kontroli nad flotą, bez ręcznej roboty, z mocą sztucznej inteligencji.** 🚀