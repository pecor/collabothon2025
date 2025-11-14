import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lightbulb, TrendingUp, Clock, DollarSign } from 'lucide-react'

export function RequirementsSummary() {
  const tips = [
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: 'AI Email Parser',
      description: 'Upload email screenshot and let AI extract all order details automatically'
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      title: 'Smart Matching',
      description: 'Our AI will automatically suggest the best driver and vehicle for your order'
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: 'Route Optimization',
      description: 'System calculates optimal routes considering traffic, holidays, and restrictions'
    },
    {
      icon: <DollarSign className="h-5 w-5 text-red-500" />,
      title: 'Cost Analysis',
      description: 'Automatic profit calculation based on distance, cargo type, and market rates'
    }
  ]

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Quick Tips
        </CardTitle>
        <CardDescription className="text-zinc-400">
          How TruckAI helps you manage orders
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6 space-y-3">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {tip.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{tip.title}</h4>
                <p className="text-zinc-400 text-sm">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 border border-red-800 rounded-lg p-4 mt-4">
          <h4 className="text-white font-semibold mb-2">Need help?</h4>
          <p className="text-red-100 text-sm mb-3">
            Switch to <span className="font-bold">Email AI mode</span> to let our system extract data from order emails or screenshots.
          </p>
          <div className="flex items-center gap-2 text-xs text-red-300">
            <span>✓ Faster data entry</span>
            <span>•</span>
            <span>✓ Fewer errors</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

