import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react'

interface Alert {
  type: 'error' | 'warning' | 'info'
  message: string
  priority: 'high' | 'medium' | 'low'
}

interface AlertsSidebarProps {
  alerts: Alert[]
}

export function AlertsSidebar({ alerts }: AlertsSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800 sticky top-28">
        <CardHeader>
          <CardTitle className="text-white text-xl mb-4">Alerts & Issues</CardTitle>
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

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg mb-4">Weekly Chart</CardTitle>
          <div className="h-48 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">Chart.js / Recharts</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

