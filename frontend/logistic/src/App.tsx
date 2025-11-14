import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-center gap-8 mb-6">
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="h-20 w-20 hover:drop-shadow-lg transition-all" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="h-20 w-20 hover:drop-shadow-lg transition-all animate-spin-slow" alt="React logo" />
            </a>
          </div>
          <CardTitle className="text-4xl text-center">Vite + React + shadcn/ui</CardTitle>
          <CardDescription className="text-center text-lg">
            Test komponentów Button i Card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={() => setCount((count) => count + 1)}
              size="lg"
              className="w-full max-w-xs"
            >
              Count is {count}
            </Button>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Edytuj <code className="bg-muted px-2 py-1 rounded">src/App.tsx</code> i zapisz żeby przetestować HMR
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Kliknij na loga Vite i React żeby dowiedzieć się więcej
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
