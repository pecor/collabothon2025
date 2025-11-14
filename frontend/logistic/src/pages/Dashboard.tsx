import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatsCards, RecentOrders, TopRoutes, AlertsSidebar } from '@/components/dashboard'

export function Dashboard() {
  const navigate = useNavigate()

  const stats = {
    totalOrders: 127,
    activeOrders: 8,
    completedToday: 5,
    avgTime: '11.2h',
    aiRecommendation: '94%',
    realROI: '+18.5%',
    totalProfit: 145200,
    savedTime: '42h'
  }

  const recentOrders = [
    { id: '#1247', route: 'Warszawa → Berlin', status: 'completed', profit: 3200, time: '12h 30m', score: 95 },
    { id: '#1246', route: 'Poznań → Hamburg', status: 'in-progress', profit: 2800, time: '8h 15m', score: 87 },
    { id: '#1245', route: 'Kraków → Praga', status: 'completed', profit: 4100, time: '14h 00m', score: 92 },
    { id: '#1244', route: 'Gdańsk → Kopenhaga', status: 'completed', profit: 5200, time: '18h 45m', score: 89 }
  ]

  const alerts = [
    { type: 'warning', message: 'Pojazd WA 67890 wymaga przeglądu za 3 dni', priority: 'medium' },
    { type: 'info', message: 'Nowe zlecenie #1248 czeka na przypisanie', priority: 'low' },
    { type: 'error', message: 'Kierowca P. Wiśniewski - upływający certyfikat ADR', priority: 'high' }
  ]

  const topRoutes = [
    { route: 'Warszawa → Berlin', count: 23, avgProfit: 3150, avgScore: 91 },
    { route: 'Poznań → Hamburg', count: 18, avgProfit: 2900, avgScore: 88 },
    { route: 'Kraków → Wiedeń', count: 15, avgProfit: 3800, avgScore: 93 }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Dashboard analityczny</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/docs')}>Dokumentacja API</Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Dashboard Analityczny</h2>
          <p className="text-zinc-400 text-lg mb-8">Efektywność systemu i analiza wyników</p>

          {/* Main Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-950/20 border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-6 w-6 text-blue-400" />
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <CardDescription className="text-blue-300 text-sm">Zlecenia ogółem</CardDescription>
                <CardTitle className="text-white text-3xl">{stats.totalOrders}</CardTitle>
                <p className="text-blue-300 text-xs mt-2">+12 w tym miesiącu</p>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-950/20 border-green-800">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="h-6 w-6 text-green-400" />
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <CardDescription className="text-green-300 text-sm">Realny ROI</CardDescription>
                <CardTitle className="text-white text-3xl">{stats.realROI}</CardTitle>
                <p className="text-green-300 text-xs mt-2">{stats.totalProfit.toLocaleString()} PLN zysku</p>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <CardDescription className="text-purple-300 text-sm">Rekomendacje AI</CardDescription>
                <CardTitle className="text-white text-3xl">{stats.aiRecommendation}</CardTitle>
                <p className="text-purple-300 text-xs mt-2">Zleceń z auto-matchem</p>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-950/20 border-orange-800">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 text-orange-400" />
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <CardDescription className="text-orange-300 text-sm">Średni czas</CardDescription>
                <CardTitle className="text-white text-3xl">{stats.avgTime}</CardTitle>
                <p className="text-orange-300 text-xs mt-2">Zaoszczędzono {stats.savedTime}</p>
              </CardHeader>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Orders */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Ostatnie zlecenia</CardTitle>
                  <div className="space-y-3">
                    {recentOrders.map(order => (
                      <div key={order.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400 font-mono text-sm">{order.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                order.status === 'completed'
                                  ? 'bg-green-900/30 text-green-400'
                                  : 'bg-blue-900/30 text-blue-400'
                              }`}
                            >
                              {order.status === 'completed' ? 'Zakończone' : 'W trasie'}
                            </span>
                          </div>
                          <span className="text-green-400 font-bold">+{order.profit} PLN</span>
                        </div>
                        <p className="text-white font-medium mb-2">{order.route}</p>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span>⏱ {order.time}</span>
                          <span>📊 {order.score}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>

              {/* Top Routes */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Najlepsze trasy (Case Study)</CardTitle>
                  <div className="space-y-3">
                    {topRoutes.map((route, idx) => (
                      <div key={idx} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-white font-semibold">{route.route}</p>
                          <span className="text-zinc-400 text-sm">{route.count} kursów</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-zinc-400 text-xs">Średni zysk</p>
                            <p className="text-green-400 font-bold">{route.avgProfit} PLN</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-xs">Średnie dopasowanie</p>
                            <p className="text-blue-400 font-bold">{route.avgScore}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Alerts Sidebar */}
            <div>
              <Card className="bg-zinc-900 border-zinc-800 sticky top-28">
                <CardHeader>
                  <CardTitle className="text-white text-xl mb-4">Alerty i problemy</CardTitle>
                  <div className="space-y-3">
                    {alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          alert.priority === 'high'
                            ? 'bg-red-900/20 border-red-800'
                            : alert.priority === 'medium'
                            ? 'bg-yellow-900/20 border-yellow-800'
                            : 'bg-blue-900/20 border-blue-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.type === 'error' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-white text-sm">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>

              {/* Chart Placeholder */}
              <Card className="bg-zinc-900 border-zinc-800 mt-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg mb-4">Wykres tygodniowy</CardTitle>
                  <div className="h-48 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <p className="text-zinc-400 text-sm">Chart.js / Recharts</p>
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

