import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export function QuickStart() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-900/30 to-red-950/20 border-red-800 sticky top-28">
        <CardHeader>
          <CardTitle className="text-white text-xl mb-4">Quick Start</CardTitle>
          <div className="space-y-4">
            <div>
              <p className="text-red-200 text-sm font-semibold mb-2">1. Clone the repository</p>
              <div className="bg-black/50 rounded p-2">
                <code className="text-green-400 text-xs">git clone ...</code>
              </div>
            </div>
            <div>
              <p className="text-red-200 text-sm font-semibold mb-2">2. Install dependencies</p>
              <div className="bg-black/50 rounded p-2">
                <code className="text-green-400 text-xs">npm install</code>
              </div>
            </div>
            <div>
              <p className="text-red-200 text-sm font-semibold mb-2">3. Start development server</p>
              <div className="bg-black/50 rounded p-2">
                <code className="text-green-400 text-xs">npm run dev</code>
              </div>
            </div>
            <div>
              <p className="text-red-200 text-sm font-semibold mb-2">4. API Base URL</p>
              <div className="bg-black/50 rounded p-2">
                <code className="text-blue-400 text-xs">
                  http://localhost:1333/api
                </code>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-red-500" />
            Security
          </CardTitle>
          <div className="space-y-2 text-sm text-zinc-300">
            <p>• API Key authentication</p>
            <p>• Rate limiting (100 req/min)</p>
            <p>• HTTPS only in production</p>
            <p>• CORS configured</p>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg mb-3">FAQ</CardTitle>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-white font-medium mb-1">How does AI scoring work?</p>
              <p className="text-zinc-400">The model analyzes 20+ parameters and returns a match percentage (0-100).</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">How to integrate with ERP?</p>
              <p className="text-zinc-400">REST API + webhooks for real-time updates.</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">AI inference cost?</p>
              <p className="text-zinc-400">~100ms per request, self-hosted on OpenShift.</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

