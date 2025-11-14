import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MatchCard } from '@/components/matching'

export function Matching() {
  const navigate = useNavigate()

  const matches = [
    {
      id: 1,
      score: 95,
      vehicle: { name: 'Mercedes Actros', plate: 'WA 12345', type: 'Plandeka' },
      driver: { name: 'Jan Kowalski', licenses: ['C+E', 'ADR'] },
      profit: 3200,
      cost: 1800,
      eta: '12h 30min',
      reasons: [
        'Pełna zgodność z wymaganiami zlecenia',
        'Optymalna ładowność 24t',
        'Kierowca z certyfikatem ADR i 12 lat doświadczenia',
        'Pojazd dostępny od zaraz'
      ]
    },
    {
      id: 2,
      score: 87,
      vehicle: { name: 'Scania R450', plate: 'WA 11111', type: 'Plandeka' },
      driver: { name: 'Maria Lewandowska', licenses: ['C+E', 'ADR', 'Wózek'] },
      profit: 3100,
      cost: 1900,
      eta: '12h 45min',
      reasons: [
        'Wszystkie wymagania spełnione',
        'Kierowca z najwyższą oceną (5.0)',
        'Dodatkowe uprawnienie wózka widłowego',
        'Niewielkie opóźnienie dostępności (+2h)'
      ]
    },
    {
      id: 3,
      score: 78,
      vehicle: { name: 'Volvo FH16', plate: 'WA 67890', type: 'Chłodnia' },
      driver: { name: 'Anna Nowak', licenses: ['C+E', 'Wózek'] },
      profit: 2800,
      cost: 2200,
      eta: '13h 15min',
      reasons: [
        'Podstawowe wymagania spełnione',
        'Brak certyfikatu ADR (ale niewymagany)',
        'Nadmiarowa funkcja chłodni',
        'Wyższe koszty eksploatacji'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/requirements')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Propozycje AI</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/route')}>Zobacz trasę</Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Propozycje AI</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">Najlepsze zestawy kierowca-pojazd dla Twojego zlecenia</p>

          <div className="space-y-6">
            {matches.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

