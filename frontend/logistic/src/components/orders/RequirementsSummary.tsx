import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Shield, Truck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

interface Requirement {
  id: string
  label: string
  required: boolean
  status: 'required' | 'optional' | 'not-needed'
  description: string
}

export function RequirementsSummary() {
  const requirements: Requirement[] = [
    {
      id: 'adr',
      label: 'ADR Certificate',
      required: false,
      status: 'not-needed',
      description: 'Not required - no hazardous materials'
    },
    {
      id: 'license-ce',
      label: 'Driving License C+E',
      required: true,
      status: 'required',
      description: 'Required - truck with trailer'
    },
    {
      id: 'vehicle-curtain',
      label: 'Curtain-side Vehicle',
      required: true,
      status: 'required',
      description: 'Standard curtain-side trailer'
    },
    {
      id: 'forklift',
      label: 'Forklift On-site',
      required: false,
      status: 'optional',
      description: 'Recommended for faster unloading'
    },
    {
      id: 'holiday-block',
      label: 'Holiday Restrictions',
      required: false,
      status: 'not-needed',
      description: 'Route does not conflict with holidays'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'required':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'optional':
        return <CheckCircle2 className="h-5 w-5 text-yellow-500" />
      case 'not-needed':
        return <XCircle className="h-5 w-5 text-zinc-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'required':
        return (
          <span className="px-2 py-1 bg-red-900/30 border border-red-800 text-red-400 text-xs rounded-md font-medium">
            Required
          </span>
        )
      case 'optional':
        return (
          <span className="px-2 py-1 bg-yellow-900/30 border border-yellow-800 text-yellow-400 text-xs rounded-md font-medium">
            Optional
          </span>
        )
      case 'not-needed':
        return (
          <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs rounded-md font-medium">
            Nie wymagane
          </span>
        )
    }
  }

  const requiredCount = requirements.filter(r => r.status === 'required').length
  const optionalCount = requirements.filter(r => r.status === 'optional').length

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          Order Requirements
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Automatically detected legal and technical requirements
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{requiredCount}</div>
            <div className="text-zinc-500 text-sm mt-1">Wymagane</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{optionalCount}</div>
            <div className="text-zinc-500 text-sm mt-1">Opcjonalne</div>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-zinc-600">
              {requirements.length - requiredCount - optionalCount}
            </div>
            <div className="text-zinc-500 text-sm mt-1">Niepotrzebne</div>
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(req.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-semibold">{req.label}</h4>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-zinc-400 text-sm">{req.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Type Recommendation */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 border border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-900 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg mb-2">
                Rekomendowany typ pojazdu
              </h4>
              <p className="text-red-100 mb-4">
                Na podstawie analizy wymagań zlecenia, system rekomenduje:
              </p>
              <div className="bg-black/30 rounded-lg p-4 border border-red-800">
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-red-300">Typ nadwozia:</span>
                    <p className="text-white font-medium">Plandeka standardowa</p>
                  </div>
                  <div>
                    <span className="text-red-300">Ładowność min.:</span>
                    <p className="text-white font-medium">24 tony</p>
                  </div>
                  <div>
                    <span className="text-red-300">Wymiary min.:</span>
                    <p className="text-white font-medium">13.6m (standardowa naczepa)</p>
                  </div>
                  <div>
                    <span className="text-red-300">Dodatkowe:</span>
                    <p className="text-white font-medium">Pasy mocujące</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

