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
    { id: '#1247', route: 'Warszawa → Berlin', status: 'completed' as const, profit: 3200, time: '12h 30m', score: 95 },
    { id: '#1246', route: 'Poznań → Hamburg', status: 'in-progress' as const, profit: 2800, time: '8h 15m', score: 87 },
    { id: '#1245', route: 'Kraków → Praga', status: 'completed' as const, profit: 4100, time: '14h 00m', score: 92 },
    { id: '#1244', route: 'Gdańsk → Kopenhaga', status: 'completed' as const, profit: 5200, time: '18h 45m', score: 89 }
  ]

  const alerts = [
    { type: 'warning' as const, message: 'Pojazd WA 67890 wymaga przeglądu za 3 dni', priority: 'medium' as const },
    { type: 'info' as const, message: 'Nowe zlecenie #1248 czeka na przypisanie', priority: 'low' as const },
    { type: 'error' as const, message: 'Kierowca P. Wiśniewski - upływający certyfikat ADR', priority: 'high' as const }
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

          <StatsCards stats={stats} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <RecentOrders orders={recentOrders} />
              <TopRoutes routes={topRoutes} />
            </div>
            <AlertsSidebar alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}

