import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APIEndpoints, Architecture, AIModels, QuickStart } from '@/components/docs'
import { Navbar } from '@/components/layout'

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
      <Navbar />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Technical Documentation</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">API endpoints, architecture and integration</p>

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

