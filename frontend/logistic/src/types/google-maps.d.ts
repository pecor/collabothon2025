// Google Maps type declarations
interface Window {
  google: typeof google
  initGoogleMapsCallback?: () => void
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: any)
    }
    class Marker {
      constructor(options?: any)
      setMap(map: Map | null): void
      addListener(event: string, handler: () => void): void
    }
    class DirectionsService {
      route(request: any, callback: (result: any, status: string) => void): void
    }
    class DirectionsRenderer {
      constructor(options?: any)
      setDirections(result: any): void
      setMap(map: Map | null): void
    }
    class InfoWindow {
      constructor(options?: any)
      open(map: Map, marker: Marker): void
    }
    namespace Animation {
      const DROP: any
    }
    namespace TravelMode {
      const DRIVING: any
    }
    class Point {
      constructor(x: number, y: number)
    }
  }
}
