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
              {/* API Endpoints */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
                    <Code className="h-6 w-6 text-red-500" />
                    Dostępne endpointy
                  </CardTitle>
                  <div className="space-y-3">
                    {endpoints.map((endpoint, idx) => (
                      <div key={idx} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                              endpoint.method === 'GET'
                                ? 'bg-blue-900/30 text-blue-400'
                                : 'bg-green-900/30 text-green-400'
                            }`}
                          >
                            {endpoint.method}
                          </span>
                          <code className="text-red-400 font-mono text-sm flex-1">{endpoint.path}</code>
                        </div>
                        <p className="text-zinc-300 text-sm mb-2">{endpoint.description}</p>
                        {endpoint.body && (
                          <div className="bg-black/50 rounded p-2 mt-2">
                            <code className="text-green-400 text-xs font-mono">{endpoint.body}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>

              {/* Architecture */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
                    <Server className="h-6 w-6 text-red-500" />
                    Architektura
                  </CardTitle>
                  <div className="bg-zinc-800 rounded-lg p-6 font-mono text-sm text-zinc-300 whitespace-pre border border-zinc-700">
                    {`┌─────────────────────────────────────┐
│   Frontend (React + TypeScript)    │
│   • Vite + TailwindCSS 4            │
│   • shadcn/ui components            │
└──────────────┬──────────────────────┘
               │ REST API / WebSocket
┌──────────────▼──────────────────────┐
│   Backend (Django/FastAPI)          │
│   • Python 3.11+                    │
│   • PostgreSQL database             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Red Hat OpenShift AI (RHOAI)      │
│   • vLLM inference server           │
│   • Llama Stack agents              │
│   • Granite OSS model               │
└─────────────────────────────────────┘`}
                  </div>
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      <strong>Deploy:</strong> Red Hat OpenShift (Kubernetes)
                      <br />
                      <strong>Local Dev:</strong> Podman Desktop
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* AI Models */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
                    <Zap className="h-6 w-6 text-red-500" />
                    Modele AI
                  </CardTitle>
                  <div className="space-y-3">
                    {models.map((model, idx) => (
                      <div key={idx} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">{model.name}</h4>
                        <p className="text-zinc-300 text-sm mb-2">{model.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Database className="h-3 w-3 text-red-500" />
                          <span className="text-zinc-400">{model.tech}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Quick Start Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-red-900/30 to-red-950/20 border-red-800 sticky top-28">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Quick Start</CardTitle>
                  <div className="space-y-4">
                    <div>
                      <p className="text-red-200 text-sm font-semibold mb-2">1. Clone repo</p>
                      <div className="bg-black/50 rounded p-2">
                        <code className="text-green-400 text-xs">git clone ...</code>
                      </div>
                    </div>
                    <div>
                      <p className="text-red-200 text-sm font-semibold mb-2">2. Install deps</p>
                      <div className="bg-black/50 rounded p-2">
                        <code className="text-green-400 text-xs">npm install</code>
                      </div>
                    </div>
                    <div>
                      <p className="text-red-200 text-sm font-semibold mb-2">3. Start dev</p>
                      <div className="bg-black/50 rounded p-2">
                        <code className="text-green-400 text-xs">npm run dev</code>
                      </div>
                    </div>
                    <div>
                      <p className="text-red-200 text-sm font-semibold mb-2">4. API Base URL</p>
                      <div className="bg-black/50 rounded p-2">
                        <code className="text-blue-400 text-xs">
                          http://localhost:8000/api
                        </code>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-red-500" />
                    Bezpieczeństwo
                  </CardTitle>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p>• API Key authentication</p>
                    <p>• Rate limiting (100 req/min)</p>
                    <p>• HTTPS only w produkcji</p>
                    <p>• CORS configured</p>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg mb-3">FAQ</CardTitle>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-white font-medium mb-1">Jak działa scoring AI?</p>
                      <p className="text-zinc-400">Model analizuje 20+ parametrów i zwraca % dopasowania 0-100.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Jak integrować z ERP?</p>
                      <p className="text-zinc-400">REST API + webhooks dla real-time updates.</p>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Koszt inference AI?</p>
                      <p className="text-zinc-400">~100ms per request, self-hosted na OpenShift.</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

