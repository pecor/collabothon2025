import { StatsCards, RecentOrders, TopRoutes, AlertsSidebar } from '@/components/dashboard'
import { Navbar } from '@/components/layout'

export function Dashboard() {

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
      <Navbar />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Analytics Dashboard</h2>
          <p className="text-zinc-400 text-lg mb-8">System efficiency and performance analysis</p>

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

