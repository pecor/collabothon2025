import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

interface RouteCheck {
  date: string
  route: string
  allowed: boolean
  reason: string
  alternative?: string
}

interface RouteValidationProps {
  routeCheck: RouteCheck
}

export function RouteValidation({ routeCheck }: RouteValidationProps) {
  return (
    <Card className={`border-2 ${routeCheck.allowed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {routeCheck.allowed ? (
            <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2">
              {routeCheck.allowed ? 'Trasa dozwolona' : 'Trasa zablokowana'}
            </CardTitle>
            <CardDescription className="text-base mb-4">
              <span className="text-white font-medium">{routeCheck.route}</span> w dniu {routeCheck.date}
            </CardDescription>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className={routeCheck.allowed ? 'text-green-200' : 'text-red-200'}>
                {routeCheck.reason}
              </p>
            </div>
            {!routeCheck.allowed && routeCheck.alternative && (
              <div className="flex items-start gap-2 text-yellow-200">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Alternatywna data:</p>
                  <p className="text-yellow-100">{routeCheck.alternative}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

