import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Upload, FileText, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function EmailUpload() {
  const [emailContent, setEmailContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setEmailContent(content)
        processEmail(content)
      }
      reader.readAsText(file)
    }
  }

  const processEmail = async (_content: string) => {
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setExtractedData({
        cargoType: 'Palety Euro - 33 szt.',
        weight: '24000',
        route: 'Warszawa → Hamburg',
        temperature: 'Ambient',
        adr: false,
        vehicleType: 'Plandeka',
        loadingDate: '2025-11-20T08:00'
      })
      setIsProcessing(false)
    }, 2000)
  }

  const handlePaste = () => {
    processEmail(emailContent)
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <Mail className="h-6 w-6 text-red-500" />
          Automatic Email Extraction
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Paste email content or upload .eml file - AI will extract all data
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-6 space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-zinc-800 p-4 rounded-full">
              <Upload className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Prześlij plik email</h3>
              <p className="text-zinc-500 text-sm">Format .eml, .txt, .msg</p>
            </div>
            <input
              type="file"
              id="file-upload"
              accept=".eml,.txt,.msg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Wybierz plik
            </Button>
          </div>
        </div>

        {/* Or Paste */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-zinc-900 text-zinc-500">lub wklej treść</span>
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="text-zinc-400 text-sm block mb-2">Treść maila</label>
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Wklej tutaj treść maila ze zleceniem transportowym..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 min-h-[200px] resize-y font-mono text-sm"
          />
        </div>

        <Button
          onClick={handlePaste}
          disabled={!emailContent || isProcessing}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              AI analizuje...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Wyodrębnij dane AI
            </>
          )}
        </Button>

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Dane wykryte automatycznie</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Typ ładunku:</span>
                <p className="text-white font-medium">{extractedData.cargoType}</p>
              </div>
              <div>
                <span className="text-zinc-500">Waga:</span>
                <p className="text-white font-medium">{extractedData.weight} kg</p>
              </div>
              <div>
                <span className="text-zinc-500">Trasa:</span>
                <p className="text-white font-medium">{extractedData.route}</p>
              </div>
              <div>
                <span className="text-zinc-500">Temperatura:</span>
                <p className="text-white font-medium">{extractedData.temperature}</p>
              </div>
              <div>
                <span className="text-zinc-500">ADR:</span>
                <p className="text-white font-medium">{extractedData.adr ? 'Tak' : 'Nie'}</p>
              </div>
              <div>
                <span className="text-zinc-500">Typ pojazdu:</span>
                <p className="text-white font-medium">{extractedData.vehicleType}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                Użyj tych danych
              </Button>
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-700">
                Edytuj
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

