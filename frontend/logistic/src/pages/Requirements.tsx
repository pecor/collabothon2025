import { useNavigate } from 'react-router-dom'
import { LegalRequirementsList, RouteValidation, HolidayCalendar } from '@/components/requirements'
import { Navbar } from '@/components/layout'

export function Requirements() {
  const navigate = useNavigate()

  const legalRequirements = [
    { id: 1, category: 'Kierowca', requirement: 'Prawo jazdy C+E', status: 'required', met: true },
    { id: 2, category: 'Kierowca', requirement: 'Certyfikat ADR', status: 'required', met: true },
    { id: 3, category: 'Kierowca', requirement: 'Karta kierowcy', status: 'required', met: true },
    { id: 4, category: 'Pojazd', requirement: 'Przegląd technicznyważny', status: 'required', met: true },
    { id: 5, category: 'Pojazd', requirement: 'Ubezpieczenie OC/AC', status: 'required', met: true },
    { id: 6, category: 'Pojazd', requirement: 'Certyfikat ADR pojazdu', status: 'required', met: false },
    { id: 7, category: 'Szkolenie', requirement: 'Szkolenie BHP kierowcy', status: 'optional', met: true },
    { id: 8, category: 'Szkolenie', requirement: 'Obsługa wózka widłowego', status: 'optional', met: true }
  ]

  const holidays = [
    { date: '2025-12-24', country: 'PL', name: 'Wigilia', restriction: 'Zakaz ruchu ciężarówek >12t po 12:00', severity: 'high' },
    { date: '2025-12-25', country: 'PL/DE', name: 'Boże Narodzenie', restriction: 'Całkowity zakaz ruchu', severity: 'critical' },
    { date: '2025-12-26', country: 'PL/DE', name: 'Drugi dzień świąt', restriction: 'Całkowity zakaz ruchu', severity: 'critical' },
    { date: '2025-12-31', country: 'PL', name: 'Sylwester', restriction: 'Zakaz ruchu po 18:00', severity: 'medium' },
    { date: '2026-01-01', country: 'PL/DE', name: 'Nowy Rok', restriction: 'Całkowity zakaz ruchu', severity: 'critical' }
  ]

  const routeCheck = {
    date: '2025-12-25',
    route: 'Warszawa → Berlin',
    allowed: false,
    reason: 'Boże Narodzenie - całkowity zakaz ruchu ciężarówek w PL i DE',
    alternative: 'Sugerowana data: 2025-12-27 (piątek)'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Requirements & Validation</h2>
          <p className="text-zinc-400 text-lg mb-8">Detailed analysis of legal requirements and time restrictions</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <RouteValidation routeCheck={routeCheck} />
              <LegalRequirementsList requirements={legalRequirements} />
            </div>

            <div>
              <HolidayCalendar holidays={holidays} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

