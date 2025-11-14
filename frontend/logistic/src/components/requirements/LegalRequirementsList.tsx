import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle2, XCircle } from 'lucide-react'

interface Requirement {
  id: number
  category: string
  requirement: string
  status: 'required' | 'optional'
  met: boolean
}

interface LegalRequirementsListProps {
  requirements: Requirement[]
}

export function LegalRequirementsList({ requirements }: LegalRequirementsListProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-red-500" />
          Wymagania prawne
        </CardTitle>
        <div className="space-y-3">
          {requirements.map(req => (
            <div key={req.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">
                      {req.category}
                    </span>
                    {req.status === 'required' && (
                      <span className="text-xs px-2 py-0.5 bg-red-900/30 border border-red-800 rounded text-red-400">
                        Wymagane
                      </span>
                    )}
                  </div>
                  <p className="text-white font-medium">{req.requirement}</p>
                </div>
                {req.met ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

