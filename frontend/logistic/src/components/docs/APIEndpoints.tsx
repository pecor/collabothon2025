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
  // ...existing code...
  // Add missing endpoints from backend
  const extraEndpoints: Endpoint[] = [
    {
      method: 'POST',
      path: '/api/routes/calculate/',
      description: 'Calculate route, distance, and time between two addresses',
      body: '{ "origin_address": "Warsaw, Poland", "destination_address": "Berlin, Germany", "avoid_tolls": false, "avoid_highways": false, "avoid_ferries": false }'
    },
    {
      method: 'POST',
      path: '/api/orders/extract-from-email/',
      description: 'Extract order details from email content',
      body: '{ "email_body": "..." }'
    },
    {
      method: 'GET',
      path: '/api/dashboard/stats/',
      description: 'Get dashboard statistics',
      body: null
    },
    {
      method: 'GET',
      path: '/api/transport-laws/',
      description: 'List of transport laws',
      body: null
    }
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
          <Code className="h-6 w-6 text-red-500" />
          Available Endpoints
        </CardTitle>
        <div className="space-y-3">
          {[...endpoints, ...extraEndpoints].map((endpoint, idx) => (
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

