import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Code } from 'lucide-react'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  body: string | null
}

interface APIEndpointsProps {
  endpoints: Endpoint[]
}

export function APIEndpoints({ endpoints }: APIEndpointsProps) {
  return (
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
  )
}

