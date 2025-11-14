import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Clock, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout'

export function Home() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section - Full Width */}
      <section className="pt-32 pb-20 px-8 bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4 text-red-500" />
            <span className="text-zinc-300">Intelligent Transport Order Matching System</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Logistics Automation
            <span className="text-red-600"> Powered by AI</span>
          </h2>
          
          <p className="text-xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            TruckAI automatically matches the best driver-vehicle-order combination, 
            maximizing profit and predicting all legal constraints in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white text-lg h-14 px-10 border-0"
              onClick={() => navigate('/orders')}
            >
              View Demo
              <Truck className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width Dark */}
      <section className="py-20 px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-red-500" />
                </div>
                <CardTitle className="text-4xl text-white">80%</CardTitle>
                <CardDescription className="text-lg text-zinc-400">
                  Faster order processing time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-red-500" />
                </div>
                <CardTitle className="text-4xl text-white">15-25%</CardTitle>
                <CardDescription className="text-lg text-zinc-400">
                  Higher margins on same fleet
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-red-500" />
                </div>
                <CardTitle className="text-4xl text-white">100%</CardTitle>
                <CardDescription className="text-lg text-zinc-400">
                  Legal compliance - zero errors
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section className="py-20 px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            How TruckAI Works?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-900 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-white text-xl">Automatic Order Matching</CardTitle>
                <CardDescription className="text-base text-zinc-400 leading-relaxed">
                  AI analyzes cargo requirements, vehicle parameters, driver licenses, 
                  and legal conditions - all in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-900 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-white text-xl">Profit Maximization</CardTitle>
                <CardDescription className="text-base text-zinc-400 leading-relaxed">
                  Algorithm calculates predicted profit considering distance, fuel costs, 
                  order specifics, and fleet utilization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-900 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-white text-xl">Requirements Validator</CardTitle>
                <CardDescription className="text-base text-zinc-400 leading-relaxed">
                  Automatic verification of licenses (C, C+E, ADR), vehicle type, refrigeration 
                  requirements, and national holiday restrictions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 hover:border-red-900 transition-all">
              <CardHeader>
                <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-white text-xl">Tracking & Analytics</CardTitle>
                <CardDescription className="text-base text-zinc-400 leading-relaxed">
                  Live monitoring, dynamic ETA, automatic generation of performance reports 
                  and driver rankings.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width Red */}
      <section className="py-24 px-8 bg-gradient-to-r from-red-950 via-red-900 to-red-950">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready for Automation?
          </h3>
          <p className="text-red-100 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Turn orders into pure profit - without losing fleet control, 
            without manual work, with the power of artificial intelligence.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-900 hover:bg-zinc-100 text-lg h-14 px-10 font-semibold"
            onClick={() => navigate('/orders')}
          >
            View Demo
            <Truck className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer - Full Width */}
      <footer className="py-8 px-8 border-t border-zinc-800 bg-black">
        <p className="text-center text-zinc-500 text-sm">
          TruckAI © 2025 - Red Hat Challenge | Collabothon 2025
        </p>
      </footer>
    </div>
  )
}

