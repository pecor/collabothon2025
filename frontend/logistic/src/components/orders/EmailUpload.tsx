import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Upload, FileText, Sparkles, AlertCircle, CheckCircle, X, Edit } from 'lucide-react'
import { useState, useEffect } from 'react'
import { 
  extractOrderFromEmail, 
  type ExtractedOrderData, 
  api,
  getCargoTypeOptions,
  getTemperatureOptions,
  getSpecialRequirementsOptions,
  getVehicleTypeOptions
} from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

interface EditableOrderData extends ExtractedOrderData {
  origin?: string
  destination?: string
}

export function EmailUpload() {
  const navigate = useNavigate()
  const [emailContent, setEmailContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedOrderData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editableData, setEditableData] = useState<EditableOrderData | null>(null)
  
  // Select options
  const [cargoTypeOptions, setCargoTypeOptions] = useState<string[]>([])
  const [temperatureOptions, setTemperatureOptions] = useState<string[]>([])
  const [specialReqOptions, setSpecialReqOptions] = useState<string[]>([])
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  // Load select options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [cargoTypes, temperatures, specialReqs, vehicleTypes] = await Promise.all([
          getCargoTypeOptions(),
          getTemperatureOptions(),
          getSpecialRequirementsOptions(),
          getVehicleTypeOptions()
        ])
        
        setCargoTypeOptions(cargoTypes.choices)
        setTemperatureOptions(temperatures.choices)
        setSpecialReqOptions(specialReqs.choices)
        setVehicleTypeOptions(vehicleTypes.choices)
      } catch (err) {
        console.error('Failed to load select options:', err)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    loadOptions()
  }, [])

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

  const processEmail = async (content: string) => {
    setIsProcessing(true)
    setError(null)
    setExtractedData(null)
    
    try {
      const result = await extractOrderFromEmail(content)
      
      if (result.success && result.data) {
        setExtractedData(result.data)
      } else {
        setError(result.error || 'Failed to extract data from email')
        // Still show partial data if available
        if (result.data) {
          setExtractedData(result.data)
        }
      }
    } catch (err: any) {
      console.error('Email extraction error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to process email. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaste = () => {
    if (emailContent.trim()) {
      processEmail(emailContent)
    }
  }

  const handleCreateOrder = async (data?: EditableOrderData) => {
    const orderData = data || extractedData
    if (!orderData) return
    
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)
    setIsEditModalOpen(false)
    
    try {
      // Step 1: Create Cargo
      const cargoData = {
        name: orderData.cargo_name || 'Unknown Cargo',
        length: 120,
        width: 80,
        height: 100,
        weight: orderData.weight || 1000,
        requires_cold: orderData.temperature !== 'Ambient',
        requires_box: false,
        requires_crate: false,
        forklift_needed: orderData.weight > 5000,
        license_c_required: true,
        license_ce_required: orderData.weight > 15000,
        license_adr_required: orderData.adr_required,
        special_training: orderData.special_requirements !== 'None' ? [orderData.special_requirements] : []
      }
      
      const cargoResponse = await api.post('/cargos/', cargoData)
      console.log('Cargo created:', cargoResponse.data)
      
      // Step 2: Create Route
      const routeData = {
        origin: (data as EditableOrderData)?.origin || orderData.loading_address || 'Unknown',
        destination: (data as EditableOrderData)?.destination || orderData.unloading_address || 'Unknown',
        distance_km: 500,
        estimated_time: '06:00:00',
        holiday_blocked: false,
        status: 'planned'
      }
      
      const routeResponse = await api.post('/routes/', routeData)
      console.log('Route created:', routeResponse.data)
      
      // Step 3: Create Order with all required fields
      const newOrderData = {
        user: 1, // Default user
        cargo: cargoResponse.data.id,
        route: routeResponse.data.id,
        planned_date: orderData.loading_date || new Date().toISOString().split('T')[0],
        status: 'new',
        // Required fields from OrderCreateSerializer
        origin: (data as EditableOrderData)?.origin || orderData.loading_address || 'Unknown',
        destination: (data as EditableOrderData)?.destination || orderData.unloading_address || 'Unknown',
        cargo_type: orderData.cargo_type || 'General Cargo',
        weight: orderData.weight || 0,
        temperature: orderData.temperature || 'Ambient',
        special_requirements: orderData.special_requirements || 'None',
        loading_date: orderData.loading_date || new Date().toISOString().split('T')[0],
        unloading_date: orderData.unloading_date || orderData.loading_date || new Date().toISOString().split('T')[0]
      }
      
      const orderResponse = await api.post('/orders/', newOrderData)
      console.log('Order created:', orderResponse.data)
      
      setSuccessMessage(`Order has been created!`)
      
      // Redirect to orders list after 2 seconds
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
      
    } catch (err: any) {
      console.error('Error creating order:', err)
      const errorDetails = err.response?.data 
        ? JSON.stringify(err.response.data, null, 2)
        : err.message
      setError(`Error while creating order: ${errorDetails}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenEditModal = () => {
    if (!extractedData) return
    setEditableData({
      ...extractedData,
      origin: extractedData.loading_address || '',
      destination: extractedData.unloading_address || ''
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdited = () => {
    if (editableData) {
      handleCreateOrder(editableData)
    }
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
              <h3 className="text-white font-semibold mb-1">Upload email file</h3>
              <p className="text-zinc-500 text-sm">Format: .eml, .txt, .msg</p>
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
              Choose file
            </Button>
          </div>
        </div>

        {/* Or Paste */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-zinc-900 text-zinc-500">or paste content</span>
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="text-zinc-400 text-sm block mb-2">Email content</label>
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Paste the email content with transport order here..."
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
              AI is analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Extract data with AI
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold mb-1">Error</h4>
                <p className="text-red-300 text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-green-400 font-semibold mb-1">Success!</h4>
                <p className="text-green-300 text-sm">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Automatically extracted data</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Cargo name:</span>
                <p className="text-white font-medium">{extractedData.cargo_name}</p>
              </div>
              <div>
                <span className="text-zinc-500">Type:</span>
                <p className="text-white font-medium">{extractedData.cargo_type}</p>
              </div>
              <div>
                <span className="text-zinc-500">Weight:</span>
                <p className="text-white font-medium">{extractedData.weight} kg</p>
              </div>
              <div>
                <span className="text-zinc-500">Temperature:</span>
                <p className="text-white font-medium">{extractedData.temperature}</p>
              </div>
              <div>
                <span className="text-zinc-500">Loading address:</span>
                <p className="text-white font-medium">{extractedData.loading_address || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-zinc-500">Unloading address:</span>
                <p className="text-white font-medium">{extractedData.unloading_address || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-zinc-500">Loading date:</span>
                <p className="text-white font-medium">
                  {extractedData.loading_date ? new Date(extractedData.loading_date).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <span className="text-zinc-500">Special requirements:</span>
                <p className="text-white font-medium">{extractedData.special_requirements}</p>
              </div>
              <div>
                <span className="text-zinc-500">ADR:</span>
                <p className="text-white font-medium">{extractedData.adr_required ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-zinc-500">Vehicle type:</span>
                <p className="text-white font-medium">{extractedData.vehicle_type}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={() => handleCreateOrder()}
                disabled={isSaving || !!successMessage}
              >
                {isSaving ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Creating order...
                  </>
                ) : successMessage ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Created!
                  </>
                ) : (
                  'Create order'
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-white hover:bg-zinc-700"
                onClick={handleOpenEditModal}
                disabled={isSaving || !!successMessage}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editableData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Edit className="h-5 w-5 text-red-500" />
                  Edit order data
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargo_name" className="text-zinc-300">
                      Cargo name *
                    </Label>
                    <Input
                      id="cargo_name"
                      value={editableData.cargo_name}
                      onChange={(e) => setEditableData({ ...editableData, cargo_name: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo_type" className="text-zinc-300">
                      Cargo type *
                    </Label>
                    <Select
                      id="cargo_type"
                      value={editableData.cargo_type}
                      onChange={(e) => setEditableData({ ...editableData, cargo_type: e.target.value })}
                      options={cargoTypeOptions}
                      disabled={isLoadingOptions}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-zinc-300">
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={editableData.weight}
                      onChange={(e) => setEditableData({ ...editableData, weight: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-zinc-300">
                      Temperature *
                    </Label>
                    <Select
                      id="temperature"
                      value={editableData.temperature}
                      onChange={(e) => setEditableData({ ...editableData, temperature: e.target.value })}
                      options={temperatureOptions}
                      disabled={isLoadingOptions}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-zinc-300">
                      Loading address *
                    </Label>
                    <Input
                      id="origin"
                      value={editableData.origin}
                      onChange={(e) => setEditableData({ ...editableData, origin: e.target.value })}
                      placeholder="e.g. Warsaw, Poland"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-zinc-300">
                      Unloading address *
                    </Label>
                    <Input
                      id="destination"
                      value={editableData.destination}
                      onChange={(e) => setEditableData({ ...editableData, destination: e.target.value })}
                      placeholder="e.g. Hamburg, Germany"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loading_date" className="text-zinc-300">
                      Loading date *
                    </Label>
                    <Input
                      id="loading_date"
                      type="date"
                      value={editableData.loading_date || ''}
                      onChange={(e) => setEditableData({ ...editableData, loading_date: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unloading_date" className="text-zinc-300">
                      Unloading date
                    </Label>
                    <Input
                      id="unloading_date"
                      type="date"
                      value={editableData.unloading_date || ''}
                      onChange={(e) => setEditableData({ ...editableData, unloading_date: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type" className="text-zinc-300">
                      Vehicle type
                    </Label>
                    <Select
                      id="vehicle_type"
                      value={editableData.vehicle_type}
                      onChange={(e) => setEditableData({ ...editableData, vehicle_type: e.target.value })}
                      options={vehicleTypeOptions}
                      disabled={isLoadingOptions}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="special_requirements" className="text-zinc-300">
                      Special requirements
                    </Label>
                    <Select
                      id="special_requirements"
                      value={editableData.special_requirements}
                      onChange={(e) => setEditableData({ ...editableData, special_requirements: e.target.value })}
                      options={specialReqOptions}
                      disabled={isLoadingOptions}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded p-3 text-sm text-zinc-400">
                  <strong className="text-zinc-300">Note:</strong> Fields marked with * are required to create an order.
                </div>
              </div>

              <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdited}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!editableData.cargo_name || !editableData.cargo_type || !editableData.origin || !editableData.destination}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save and create order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

