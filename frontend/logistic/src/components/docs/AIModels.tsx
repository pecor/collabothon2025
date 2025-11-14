import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Database } from 'lucide-react'

interface Model {
  name: string
  description: string
  tech: string
}

interface AIModelsProps {
  models: Model[]
}

export function AIModels({ models }: AIModelsProps) {
  return (
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
  )
}

