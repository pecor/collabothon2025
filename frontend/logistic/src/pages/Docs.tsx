import { BookOpen } from 'lucide-react'
import { APIEndpoints, Architecture, AIModels, QuickStart } from '@/components/docs'
import { Navbar } from '@/components/layout'

export function Docs() {
  const endpoints = [
    {
      method: 'POST' as const,
      path: '/api/orders',
      description: 'Add a new order',
      body: '{ "cargo_type": "pallets", "weight": 24000, "route": {...} }'
    },
    {
      method: 'GET' as const,
      path: '/api/orders/{id}/match',
      description: 'Get AI recommendations for an order',
      body: null
    },
    {
      method: 'GET' as const,
      path: '/api/vehicles',
      description: 'List of available vehicles',
      body: null
    },
    {
      method: 'GET' as const,
      path: '/api/drivers',
      description: 'List of available drivers',
      body: null
    },
    {
      method: 'POST' as const,
      path: '/api/tracking/update',
      description: 'Update vehicle position',
      body: '{ "vehicle_id": "123", "lat": 52.23, "lng": 21.01 }'
    },
    {
      method: 'GET' as const,
      path: '/api/holidays',
      description: 'Holiday traffic bans calendar',
      body: null
    }
  ]

  const models = [
    {
      name: 'Scoring Model',
      description: 'Calculates match percentage for driver-vehicle-order',
      tech: 'Granite OSS + InstructLab fine-tuning'
    },
    {
      name: 'Email Parser',
      description: 'Extracts data from email orders',
      tech: 'Llama Stack Agent + vLLM'
    },
    {
      name: 'Route Optimizer',
      description: 'Route optimization and ETA prediction',
      tech: 'Custom ML model + OSRM routing'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-36 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Technical Documentation</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">API endpoints, architecture, and integration</p>

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

