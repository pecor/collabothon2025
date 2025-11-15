import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin, Navigation } from 'lucide-react'

// Extend Window interface
declare global {
  interface Window {
    initGoogleMapsCallback?: () => void
  }
}

interface RouteMapProps {
  origin: string
  destination: string
  currentPosition?: { lat: number; lng: number } | null
  status?: string
  onRouteDataLoaded?: (data: RouteData) => void
}

interface RouteData {
  origin: { coordinates: { lat: number; lng: number } }
  destination: { coordinates: { lat: number; lng: number } }
  distance_km: number
  estimated_time_formatted: string
  countries_passed: Array<{ name: string; code: string }>
  cities?: Array<{ name: string; country: string; country_code: string; coordinates: { lat: number; lng: number } }>
  waypoints?: Array<{ lat: number; lng: number }>
}

// Global flag to prevent multiple Google Maps loads
let isGoogleMapsLoading = false

export function RouteMap({ origin, destination, currentPosition, status, onRouteDataLoaded }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null)
  const truckMarker = useRef<google.maps.Marker | null>(null)
  const isMountedRef = useRef(true)

  // Load Google Maps script (only once)
  useEffect(() => {
    isMountedRef.current = true
    
    const loadGoogleMaps = () => {
      console.log('Checking Google Maps availability...')
      
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded, waiting for container...')
        // Wait for the DOM ref to be available before initializing
        const checkContainer = () => {
          if (!isMountedRef.current) return
          if (mapRef.current) {
            console.log('Container ready, initializing map...')
            initMap()
          } else {
            console.log('Container not ready yet, retrying in 10ms...')
            setTimeout(checkContainer, 10)
          }
        }
        setTimeout(checkContainer, 10)
        return
      }
      
      // Check if script tag exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      
      if (existingScript) {
        console.log('Google Maps script exists, waiting for it to load...')
        // Script exists but not loaded yet, wait for it
        let attempts = 0
        const maxAttempts = 100 // 1 second total
        const checkInterval = setInterval(() => {
          attempts++
          if (window.google && window.google.maps) {
            console.log('Google Maps loaded after waiting')
            clearInterval(checkInterval)
            if (isMountedRef.current) {
              initMap()
            }
          } else if (attempts >= maxAttempts) {
            console.error('Google Maps failed to load within timeout')
            clearInterval(checkInterval)
            if (isMountedRef.current) {
              setError('Google Maps failed to load')
              setIsLoading(false)
            }
          }
        }, 10)
        
        return
      }
      
      if (isGoogleMapsLoading) {
        console.log('Google Maps is already being loaded...')
        return
      }
      
      // Load Google Maps script
      console.log('Loading Google Maps script...')
      isGoogleMapsLoading = true
      
      // Create callback function
      window.initGoogleMapsCallback = () => {
        console.log('Google Maps callback triggered')
        isGoogleMapsLoading = false
        if (isMountedRef.current) {
          setTimeout(() => initMap(), 20)
        }
      }
      
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAd15ZDLWiOlAqNfkLSbp_yayxM7mxOAOA&libraries=places&callback=initGoogleMapsCallback`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('Failed to load Google Maps script')
        isGoogleMapsLoading = false
        if (isMountedRef.current) {
          setError('Failed to load Google Maps')
          setIsLoading(false)
        }
      }
      
      document.head.appendChild(script)
    }
    
    loadGoogleMaps()
    
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fetch route data
  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) {
        console.warn('Origin or destination missing')
        return
      }
      
      try {
        console.log(`Fetching route: ${origin} → ${destination}`)
        setIsLoading(true)
        const response = await fetch('http://localhost:8000/api/routes/calculate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin_address: origin,
            destination_address: destination,
            avoid_tolls: false,
            avoid_highways: false,
            avoid_ferries: false
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to calculate route`)
        }

        const data = await response.json()
        console.log('Route data received:', data)
        setRouteData(data)
        setError(null)
        
        // Notify parent component about route data
        if (onRouteDataLoaded) {
          onRouteDataLoaded(data)
        }
      } catch (err: any) {
        console.error('Route calculation error:', err)
        setError(err.message || 'Failed to load route')
      } finally {
        setIsLoading(false)
      }
    }

    if (origin && destination) {
      fetchRoute()
    }
  }, [origin, destination])

  const initMap = () => {
    if (!mapRef.current) {
      console.warn('Map container ref not available')
      return
    }
    
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps not ready yet')
      // Retry after a delay
      setTimeout(() => {
        if (isMountedRef.current) {
          initMap()
        }
      }, 50)
      return
    }

    try {
      console.log('Initializing Google Maps...')
      const initialMap = new google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 52.237049, lng: 21.017532 }, // Warsaw
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
          }
        ]
      })

      console.log('Map initialized successfully')
      
      if (isMountedRef.current) {
        setMap(initialMap)
        setIsLoading(false)

        // Initialize DirectionsRenderer
        directionsRenderer.current = new google.maps.DirectionsRenderer({
          map: initialMap,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#dc2626',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        })
        
        console.log('DirectionsRenderer initialized')
      }
    } catch (err) {
      console.error('Error initializing map:', err)
      if (isMountedRef.current) {
        setError('Failed to initialize map')
        setIsLoading(false)
      }
    }
  }

  // Draw route on map
  useEffect(() => {
    if (!map) {
      console.log('Map not initialized yet')
      return
    }
    
    if (!window.google) {
      console.log('Google Maps API not available')
      return
    }
    
    if (!routeData) {
      console.log('No route data available')
      return
    }
    
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping route draw')
      return
    }

    console.log('Drawing route on map...')
    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        console.log('Directions result:', status)
        if (status === 'OK' && result && directionsRenderer.current && isMountedRef.current) {
          directionsRenderer.current.setDirections(result)
          console.log('Route drawn successfully')
        } else if (status !== 'OK') {
          console.warn('Directions request failed:', status)
        }
      }
    )
  }, [map, routeData, origin, destination])

  // Add truck marker for current position
  useEffect(() => {
    if (!map || !window.google || !isMountedRef.current) return

    // Remove old marker
    if (truckMarker.current) {
      truckMarker.current.setMap(null)
      truckMarker.current = null
    }

    // Mock current position if not provided (50% between origin and destination)
    let position = currentPosition
    if (!position && routeData && status === 'in_transit') {
      const originCoords = routeData.origin.coordinates
      const destCoords = routeData.destination.coordinates
      
      // Calculate midpoint (simple approximation for demo)
      position = {
        lat: (originCoords.lat + destCoords.lat) / 2,
        lng: (originCoords.lng + destCoords.lng) / 2
      }
    }

    if (position && window.google.maps) {
      try {
        // Create custom truck icon
        const truckIcon = {
          path: 'M17.5 10h-5V8h5v2zm4 1c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-18 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm18-3h-3V4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v12h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5c0-1.1-.9-2-2-2z',
          fillColor: '#dc2626',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#ffffff',
          scale: 1.5,
          anchor: new google.maps.Point(12, 12)
        }

        truckMarker.current = new google.maps.Marker({
          position: position,
          map: map,
          icon: truckIcon,
          title: 'Current Vehicle Position',
          animation: google.maps.Animation.DROP
        })

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 8px;">
              <strong>Vehicle Location</strong><br/>
              Status: ${status === 'in_transit' ? 'In Transit' : 'Assigned'}<br/>
              <small>Live tracking active</small>
            </div>
          `
        })

        truckMarker.current.addListener('click', () => {
          if (truckMarker.current) {
            infoWindow.open(map, truckMarker.current)
          }
        })
      } catch (err) {
        console.error('Error creating truck marker:', err)
      }
    }
    
    return () => {
      // Cleanup marker on unmount
      if (truckMarker.current) {
        truckMarker.current.setMap(null)
        truckMarker.current = null
      }
    }
  }, [map, currentPosition, routeData, status])

  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
        <p className="text-zinc-400">Loading route map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <Navigation className="h-16 w-16 text-zinc-600 mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">Unable to Load Map</h3>
        <p className="text-red-400 mb-4">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-[400px]" />

      {/* Route Info */}
      {routeData && (
        <div className="bg-zinc-900 border-t border-zinc-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Navigation className="h-4 w-4" />
                <span>Distance</span>
              </div>
              <p className="text-white font-semibold">{routeData.distance_km} km</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <MapPin className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <p className="text-white font-semibold">{routeData.estimated_time_formatted}</p>
            </div>
            <div className="col-span-2">
              <div className="text-zinc-400 mb-1">Countries</div>
              <div className="flex flex-wrap gap-2">
                {routeData.countries_passed?.slice(0, 5).map((country) => (
                  <span
                    key={country.code}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs"
                  >
                    {country.code}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {status === 'in_transit' && (
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Vehicle is currently in transit</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
