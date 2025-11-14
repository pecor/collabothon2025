import { useState, useEffect } from 'react'
import { StatsCards, RecentOrders, TopRoutes, AlertsSidebar } from '@/components/dashboard'
import { Navbar } from '@/components/layout'
import { getDashboardStats, getOrders, type Order } from '@/lib/api'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedToday: 0,
    avgTime: '0h',
    aiRecommendation: '0%',
    realROI: '0%',
    totalProfit: 0,
    savedTime: '0h'
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, ordersData] = await Promise.all([
          getDashboardStats(),
          getOrders()
        ])

        // Map dashboard stats
        setStats({
          totalOrders: dashboardData.orders.total,
          activeOrders: dashboardData.orders.active,
          completedToday: dashboardData.orders.completed,
          avgTime: '11.2h', // TODO: Calculate from actual data
          aiRecommendation: '94%', // TODO: Calculate from AI metrics
          realROI: '+18.5%', // TODO: Calculate from profit data
          totalProfit: 145200, // TODO: Sum from completed orders
          savedTime: '42h' // TODO: Calculate from AI efficiency
        })

        // Map recent orders (last 4)
        const recent = ordersData
          .slice(0, 4)
          .map((order: Order) => ({
            id: `#${order.id}`,
            route: order.route_info || 'Unknown',
            status: order.status === 'in_transit' ? 'in-progress' as const : 
                   order.status === 'completed' ? 'completed' as const : 
                   'in-progress' as const,
            profit: 3200, // TODO: Calculate from order data
            time: '12h 30m', // TODO: Calculate from route estimated_time
            score: 90 // TODO: Get from AI scoring
          }))
        
        setRecentOrders(recent)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const alerts = [
    { type: 'warning' as const, message: 'Vehicle WA 67890 requires inspection in 3 days', priority: 'medium' as const },
    { type: 'info' as const, message: 'New order waiting for assignment', priority: 'low' as const },
    { type: 'error' as const, message: 'Driver - expiring ADR certificate', priority: 'high' as const }
  ]

  const topRoutes = [
    { route: 'Warszawa → Berlin', count: 23, avgProfit: 3150, avgScore: 91 },
    { route: 'Poznań → Hamburg', count: 18, avgProfit: 2900, avgScore: 88 },
    { route: 'Kraków → Wiedeń', count: 15, avgProfit: 3800, avgScore: 93 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-24 pb-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

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

