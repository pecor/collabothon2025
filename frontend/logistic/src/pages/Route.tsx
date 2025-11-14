import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MapPlaceholder, RouteDetails, RouteRestrictions, VehicleStatus } from '@/components/route'

export function Route() {
  const navigate = useNavigate()

  const routeDetails = {
    from: 'Warszawa, ul. Transportowa 1',
    to: 'Berlin, Hauptstraße 45',
    distance: '573 km',
    duration: '6h 45min',
    eta: '2025-11-20 15:30'
  }

  const waypoints = [
    { name: 'Warszawa (start)', time: '08:00', status: 'completed', alert: null },
    { name: 'Poznań (postój)', time: '11:15', status: 'completed', alert: null },
    { name: 'Granica PL/DE', time: '13:30', status: 'current', alert: 'Kontrola celna - opóźnienie 15min' },
    { name: 'Frankfurt (Oder)', time: '14:00', status: 'pending', alert: null },
    { name: 'Berlin (cel)', time: '15:30', status: 'pending', alert: null }
  ]

  const restrictions = [
    { location: 'Niemcy - Autostrada A2', rule: 'Zakaz wyprzedzania ciężarówek 06:00-20:00', severity: 'info' },
    { location: 'Niemcy - ogólnokrajowy', rule: 'Brak zakazów świątecznych w tym dniu', severity: 'ok' }
  ]

  const vehicle = {
    name: 'Mercedes Actros',
    plate: 'WA 12345',
    driver: 'Jan Kowalski',
    speed: '87 km/h',
    fuel: '78%'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/matching')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Wizualizacja trasy</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Wizualizacja Trasy</h2>
          <p className="text-zinc-400 text-lg mb-8">Mapa, ETA i monitoring w czasie rzeczywistym</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Map Placeholder */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                    <div className="text-center">
                      <Navigation className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold mb-2">Interaktywna Mapa</p>
                      <p className="text-zinc-400 text-sm">
                        Tutaj wyświetli się mapa z trasą {routeDetails.from} → {routeDetails.to}
                      </p>
                      <p className="text-zinc-500 text-xs mt-2">(Integracja: Google Maps / OpenStreetMap API)</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Route Details */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Szczegóły trasy</CardTitle>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <MapPin className="h-5 w-5 text-green-500 mb-2" />
                      <p className="text-zinc-400 text-xs mb-1">Początek</p>
                      <p className="text-white font-medium text-sm">{routeDetails.from}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <MapPin className="h-5 w-5 text-red-500 mb-2" />
                      <p className="text-zinc-400 text-xs mb-1">Koniec</p>
                      <p className="text-white font-medium text-sm">{routeDetails.to}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <Navigation className="h-5 w-5 text-blue-500 mb-2" />
                      <p className="text-zinc-400 text-xs mb-1">Dystans</p>
                      <p className="text-white font-bold text-lg">{routeDetails.distance}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <Clock className="h-5 w-5 text-yellow-500 mb-2" />
                      <p className="text-zinc-400 text-xs mb-1">ETA</p>
                      <p className="text-white font-bold text-lg">{routeDetails.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {waypoints.map((point, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          point.status === 'completed'
                            ? 'bg-green-900/20 border border-green-800'
                            : point.status === 'current'
                            ? 'bg-blue-900/20 border border-blue-800'
                            : 'bg-zinc-800 border border-zinc-700'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {point.status === 'completed' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : point.status === 'current' ? (
                            <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-zinc-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{point.name}</p>
                          <p className="text-zinc-400 text-sm">{point.time}</p>
                          {point.alert && (
                            <div className="flex items-center gap-2 mt-1 text-yellow-400 text-xs">
                              <AlertCircle className="h-3 w-3" />
                              {point.alert}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>

              {/* Restrictions */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Ograniczenia na trasie</CardTitle>
                  <div className="space-y-3">
                    {restrictions.map((rest, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          rest.severity === 'ok'
                            ? 'bg-green-900/20 border-green-800'
                            : rest.severity === 'warning'
                            ? 'bg-yellow-900/20 border-yellow-800'
                            : 'bg-blue-900/20 border-blue-800'
                        }`}
                      >
                        <p className="text-white font-medium mb-1">{rest.location}</p>
                        <p className="text-zinc-300 text-sm">{rest.rule}</p>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Vehicle Status Sidebar */}
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800 sticky top-28">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Status pojazdu</CardTitle>
                  <div className="space-y-4">
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <p className="text-zinc-400 text-xs mb-1">Pojazd</p>
                      <p className="text-white font-bold text-lg">{vehicle.name}</p>
                      <p className="text-zinc-400 text-sm">{vehicle.plate}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <p className="text-zinc-400 text-xs mb-1">Kierowca</p>
                      <p className="text-white font-medium">{vehicle.driver}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <p className="text-zinc-400 text-xs mb-1">Prędkość</p>
                      <p className="text-white font-bold text-2xl">{vehicle.speed}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <p className="text-zinc-400 text-xs mb-1">Paliwo</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: vehicle.fuel }}></div>
                        </div>
                        <span className="text-white font-medium text-sm">{vehicle.fuel}</span>
                      </div>
                    </div>
                    <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                      <p className="text-green-400 font-medium">🟢 Tracking aktywny</p>
                      <p className="text-green-200 text-xs mt-1">Ostatnia aktualizacja: 30s temu</p>
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

