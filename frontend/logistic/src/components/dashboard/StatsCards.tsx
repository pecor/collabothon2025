import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Package, DollarSign, BarChart3, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'

interface Stats {
  totalOrders: number
  activeOrders: number
  completedToday: number
  avgTime: string
  aiRecommendation: string
  realROI: string
  totalProfit: number
  savedTime: string
}

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card
        className="bg-gradient-to-br from-blue-900/30 to-blue-950/20 border-blue-800 animate-glow-blue"
        style={{ animationDelay: '0s' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Package className="h-6 w-6 text-blue-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <CardDescription className="text-blue-300 text-sm">Total Orders</CardDescription>
          <CardTitle className="text-white text-3xl">{stats.totalOrders}</CardTitle>
          <p className="text-blue-300 text-xs mt-2">+12 this month</p>
        </CardHeader>
      </Card>
      <Card
        className="bg-gradient-to-br from-green-900/30 to-green-950/20 border-green-800 animate-glow-green"
        style={{ animationDelay: '0.7s' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-6 w-6 text-green-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <CardDescription className="text-green-300 text-sm">Real ROI</CardDescription>
          <CardTitle className="text-white text-3xl">{stats.realROI}</CardTitle>
          <p className="text-green-300 text-xs mt-2">{stats.totalProfit.toLocaleString()} PLN profit</p>
        </CardHeader>
      </Card>
      <Card
        className="bg-gradient-to-br from-purple-900/30 to-purple-950/20 border-purple-800 animate-glow-purple"
        style={{ animationDelay: '1.4s' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-6 w-6 text-purple-400" />
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </div>
          <CardDescription className="text-purple-300 text-sm">AI Recommendations</CardDescription>
          <CardTitle className="text-white text-3xl">{stats.aiRecommendation}</CardTitle>
          <p className="text-purple-300 text-xs mt-2">Orders with auto-match</p>
        </CardHeader>
      </Card>
      <Card
        className="bg-gradient-to-br from-orange-900/30 to-orange-950/20 border-orange-800 animate-glow-orange"
        style={{ animationDelay: '2.1s' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-6 w-6 text-orange-400" />
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <CardDescription className="text-orange-300 text-sm">Avg Time</CardDescription>
          <CardTitle className="text-white text-3xl">{stats.avgTime}</CardTitle>
          <p className="text-orange-300 text-xs mt-2">Saved {stats.savedTime}</p>
        </CardHeader>
      </Card>
    </div>
  )
}

