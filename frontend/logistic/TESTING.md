# Jak przetestować widok "Dodaj Zlecenie"

## 🚀 Uruchomienie

```bash
cd frontend/logistic
npm run dev
```

Aplikacja uruchomi się na: **http://localhost:5173**

## 📋 Scenariusze testowe

### Scenariusz 1: Formularz ręczny

1. Na stronie domyślnie zobaczysz widok **"Dodaj / Pobierz Zlecenie"**
2. Kliknij zakładkę **"Formularz ręczny"** (domyślnie aktywna)
3. Wypełnij pola:
   - **Typ towaru**: `Palety Euro`
   - **Waga**: `24000` kg
   - **Wymiary**: Długość `240`, Szerokość `120`, Wysokość `180` cm
   - **Temperatura**: `Ambient`
   - **Wymagania specjalne**: `Pasy mocujące`
   - **Adres załadunku**: `Warszawa, ul. Transportowa 1`
   - **Data załadunku**: wybierz dowolną przyszłą datę
   - **Adres rozładunku**: `Berlin, Hauptstraße 45`
   - **Data rozładunku**: wybierz datę po załadunku
4. Kliknij **"Analizuj zlecenie"**
5. Sprawdź konsolę przeglądarki (F12) - zobaczysz dane formularza

**Oczekiwany rezultat:**
- Formularz jest responsywny i działa na mobile/desktop
- Wszystkie pola są edytowalne
- Focus states (czerwona ramka) działają poprawnie

---

### Scenariusz 2: Upload Email z AI

1. Kliknij zakładkę **"Upload / Email AI"**
2. Wklej przykładowy tekst maila w pole tekstowe:

```
Temat: Zlecenie transport Warszawa-Hamburg

Dzień dobry,

Potrzebujemy transportu:
- 33 palety Euro
- Waga: 24 tony
- Trasa: Warszawa → Hamburg
- Temperatura: Ambient (nie wymaga chłodzenia)
- Typ pojazdu: Plandeka standardowa
- Załadunek: 20.11.2025, 08:00
- Brak ADR

Proszę o wycenę.
```

3. Kliknij **"Wyodrębnij dane AI"**
4. Poczekaj 2 sekundy (symulacja AI)
5. Zobaczysz zieloną ramkę z wykrytymi danymi:
   - Typ ładunku: Palety Euro - 33 szt.
   - Waga: 24000 kg
   - Trasa: Warszawa → Hamburg
   - Temperatura: Ambient
   - ADR: Nie
   - Typ pojazdu: Plandeka

**Oczekiwany rezultat:**
- Przycisk pokazuje "AI analizuje..." ze spinnerem
- Po 2 sekundach pojawia się zielona ramka z danymi
- Przyciski "Użyj tych danych" i "Edytuj" są widoczne

---

### Scenariusz 3: Sidebar z wymaganiami

**Po prawej stronie** (na dużych ekranach) lub **na dole** (mobile) zobaczysz:

1. **Statystyki:**
   - 2 wymagane
   - 1 opcjonalne
   - 2 niepotrzebne

2. **Lista wymagań** z kolorowanymi statusami:
   - 🔴 Wymagane (Prawo jazdy C+E, Plandeka)
   - 🟡 Opcjonalne (Wózek widłowy)
   - ⚫ Niepotrzebne (ADR, Zakaz świąteczny)

3. **Rekomendacja pojazdu** (czerwona karta na dole):
   - Typ: Plandeka standardowa
   - Ładowność min: 24 tony
   - Wymiary: 13.6m
   - Dodatkowe: Pasy mocujące

**Oczekiwany rezultat:**
- Sidebar jest sticky (przykleja się przy scrollu)
- Wszystkie ikony i kolory są poprawne
- Hover effects działają

---

### Scenariusz 4: Header i nawigacja

1. W górnej części strony zobaczysz:
   - Logo TruckAI (czerwona ciężarówka)
   - Przycisk "Wstecz" (strzałka w lewo)
   - Przycisk "Zapisz jako szkic"

2. Kliknij przycisk **"Wstecz"** (← ikona)
   - TODO: Powinien wrócić do strony głównej (wymaga routingu)

3. Kliknij **"Zapisz jako szkic"**
   - TODO: Powinien zapisać dane (wymaga API)

**Oczekiwany rezultat:**
- Header jest fixed i zawsze widoczny
- Przyciski są klikalne (na razie bez akcji)

---

## 🎨 Testy wizualne

### Responsywność
1. Otwórz DevTools (F12)
2. Przełącz na widok mobile (Ctrl+Shift+M)
3. Testuj różne rozdzielczości:
   - 📱 Mobile: 375px, 414px
   - 📱 Tablet: 768px, 1024px
   - 💻 Desktop: 1440px, 1920px

**Oczekiwany rezultat:**
- Layout zmienia się z 2 kolumn na 1 kolumnę poniżej `lg` breakpoint
- Wszystkie pola formularza są czytelne na mobile
- Przyciski mają odpowiedni rozmiar do tapnięcia

### Dark theme
- Tło: Czarne z odcieniami szarości
- Akcenty: Czerwone (przyciski, ikony)
- Tekst: Biały i szary
- Hover: Subtelne zmiany kolorów borderów

---

## 🐛 Znane ograniczenia (TODO)

1. **Brak routingu** - przycisk "Wstecz" nie działa
2. **Brak API integration** - formularz tylko loguje do konsoli
3. **AI processing jest mock** - symulacja 2s delay
4. **Brak walidacji** - pola nie są wymagane
5. **Brak zapisywania** - dane nie są persystowane

---

## ✅ Checklist funkcjonalności

- [x] Formularz ręczny z wszystkimi polami
- [x] Upload email textarea
- [x] Przycisk "Wyodrębnij dane AI"
- [x] Animacja loading (spinner)
- [x] Podgląd wyodrębnionych danych
- [x] Sidebar z wymaganiami
- [x] Statystyki wymagań
- [x] Rekomendacja typu pojazdu
- [x] Toggle między trybami (manual/email)
- [x] Responsywny layout
- [x] Dark theme (czarno-czerwony)
- [x] Hover effects
- [x] Fixed header
- [ ] Routing
- [ ] API integration
- [ ] Walidacja formularza
- [ ] Zapisywanie szkiców
- [ ] Prawdziwa AI ekstrakcja

