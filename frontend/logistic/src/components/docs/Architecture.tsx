import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Server } from 'lucide-react'

export function Architecture() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
          <Server className="h-6 w-6 text-red-500" />
          Architecture
        </CardTitle>
        <div className="bg-zinc-800 rounded-lg p-3 sm:p-6 font-mono text-xs sm:text-sm text-zinc-300 whitespace-pre border border-zinc-700 overflow-x-auto">
          {`┌─────────────────────────────────────┐
│   Frontend (React + TypeScript)     │
│   • Vite + TailwindCSS 4            │
│   • shadcn/ui components            │
└──────────────┬──────────────────────┘
               │ REST API / WebSocket
┌──────────────▼──────────────────────┐
│   Backend (Django)                  │
│   • Python 3.11+                    │
│   • PostgreSQL database             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Red Hat OpenShift AI (RHOAI)      │
│   • vLLM inference server           │
│   • Llama Stack agents              │
│   • Granite OSS model               │
└─────────────────────────────────────┘`}
        </div>
        <div className="mt-4 p-3 sm:p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-xs sm:text-sm">
          <p className="text-blue-300">
            <strong>Deployment:</strong> Red Hat OpenShift (Kubernetes)
            <br />
            <strong>Local Dev:</strong> Podman Desktop
          </p>
        </div>
      </CardHeader>
    </Card>
  )
}

