import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Restriction {
  location: string
  rule: string
  severity: 'ok' | 'info' | 'warning'
}

interface RouteRestrictionsProps {
  restrictions: Restriction[]
}

export function RouteRestrictions({ restrictions }: RouteRestrictionsProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl mb-4">Ograniczenia na trasie</CardTitle>
        <div className="space-y-3">
          {restrictions.map((rest, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                rest.severity === 'ok'
                  ? 'bg-green-900/20 border-green-800'
                  : rest.severity === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-800'
                  : 'bg-blue-900/20 border-blue-800'
              }`}
            >
              <p className="text-white font-medium mb-1">{rest.location}</p>
              <p className="text-zinc-300 text-sm">{rest.rule}</p>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

