import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APIEndpoints, Architecture, AIModels, QuickStart } from '@/components/docs'

export function Docs() {
  const navigate = useNavigate()

  const endpoints = [
    {
      method: 'POST',
      path: '/api/orders',
      description: 'Dodaj nowe zlecenie',
      body: '{ "cargo_type": "pallets", "weight": 24000, "route": {...} }'
    },
    {
      method: 'GET',
      path: '/api/orders/{id}/match',
      description: 'Pobierz rekomendacje AI dla zlecenia',
      body: null
    },
    {
      method: 'GET',
      path: '/api/vehicles',
      description: 'Lista dostępnych pojazdów',
      body: null
    },
    {
      method: 'GET',
      path: '/api/drivers',
      description: 'Lista dostępnych kierowców',
      body: null
    },
    {
      method: 'POST',
      path: '/api/tracking/update',
      description: 'Aktualizuj pozycję pojazdu',
      body: '{ "vehicle_id": "123", "lat": 52.23, "lng": 21.01 }'
    },
    {
      method: 'GET',
      path: '/api/holidays',
      description: 'Kalendarz zakazów świątecznych',
      body: null
    }
  ]

  const models = [
    {
      name: 'Scoring Model',
      description: 'Wylicza % dopasowania kierowca-pojazd-zlecenie',
      tech: 'Granite OSS + InstructLab fine-tuning'
    },
    {
      name: 'Email Parser',
      description: 'Ekstrakcja danych ze zleceń mailowych',
      tech: 'Llama Stack Agent + vLLM'
    },
    {
      name: 'Route Optimizer',
      description: 'Optymalizacja tras i przewidywanie ETA',
      tech: 'Custom ML model + OSRM routing'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Dokumentacja API</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/')}>Strona główna</Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Dokumentacja Techniczna</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">API endpoints, architektura i integracja</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <APIEndpoints endpoints={endpoints} />
              <Architecture />
              <AIModels models={models} />
            </div>
            <QuickStart />
          </div>
        </div>
      </main>
    </div>
  )
}

