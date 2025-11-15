import requests
import json
from typing import List, Dict, Any


GRANITE_API_URL = "https://truckai-granite-vllm-truckai-project.apps.cluster-bt99s.bt99s.sandbox1766.opentlc.com/v1/chat/completions"


def calculate_simple_distance(city1: str, city2: str) -> int:
    """
    Prosta heurystyka odległości między miastami
    (w produkcji użyj Google Maps API)
    """
    # Słownik głównych miast i ich współrzędnych (uproszczone)
    cities_coords = {
        'warsaw': (52.2, 21.0),
        'warszawa': (52.2, 21.0),
        'krakow': (50.0, 19.9),
        'kraków': (50.0, 19.9),
        'gdansk': (54.4, 18.6),
        'gdańsk': (54.4, 18.6),
        'berlin': (52.5, 13.4),
        'munich': (48.1, 11.6),
        'prague': (50.1, 14.4),
        'praha': (50.1, 14.4),
        'vienna': (48.2, 16.4),
        'wien': (48.2, 16.4),
        'budapest': (47.5, 19.0),
        'amsterdam': (52.4, 4.9),
        'brussels': (50.8, 4.4),
        'paris': (48.9, 2.4),
        'cologne': (50.9, 6.9),
        'frankfurt': (50.1, 8.7),
    }
    
    city1_key = city1.lower().strip().split(',')[0].strip()
    city2_key = city2.lower().strip().split(',')[0].strip()
    
    if city1_key in cities_coords and city2_key in cities_coords:
        lat1, lon1 = cities_coords[city1_key]
        lat2, lon2 = cities_coords[city2_key]
        
        # Prosta kalkulacja (nie dokładna, ale wystarczająca)
        # ~111 km na stopień szerokości geograficznej
        dist = ((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) ** 0.5 * 111
        return int(dist)
    
    # Jeśli nie znamy miast, zwróć średnią wartość
    return 300


def ai_score_drivers(order, compatible_drivers) -> List[Dict[str, Any]]:
    """
    Używa Granite AI do oceny kierowców dla danego zlecenia
    
    Args:
        order: Order object
        compatible_drivers: QuerySet of User objects
        
    Returns:
        List of dicts: [{'driver_id': X, 'score': Y, 'reason': '...', 'distance_km': Z}]
    """
    
    # Przygotuj dane o kierowcach
    drivers_data = []
    for driver in compatible_drivers:
        # Oblicz odległość do punktu załadunku
        driver_location = f"{driver.current_city}, {driver.current_country}" if driver.current_city else "Unknown"
        distance_km = calculate_simple_distance(
            driver.current_city or "Warsaw",
            order.origin
        )
        
        drivers_data.append({
            'id': driver.id,
            'name': driver.name,
            'current_location': driver_location,
            'distance_to_origin_km': distance_km,
            'has_vehicle': driver.current_vehicle is not None,
            'vehicle_type': driver.current_vehicle.type if driver.current_vehicle else None,
            'licenses': {
                'C': driver.license_c,
                'CE': driver.license_ce,
                'ADR': driver.license_adr,
                'forklift': driver.forklift_certified
            }
        })
    
    # Stwórz prompt dla AI
    prompt = f"""You are a logistics AI assistant. Score each driver for this transport order.

ORDER DETAILS:
- Route: {order.origin} → {order.destination}
- Date: {order.planned_date}
- Weight: {order.weight} kg
- Temperature: {order.temperature or 'Ambient'}
- Special requirements: {order.special_requirements or 'None'}

AVAILABLE DRIVERS:
{json.dumps(drivers_data, indent=2)}

SCORING RULES (0-100):
1. Distance to pickup location: 
   - 0-50 km: +40 points
   - 51-150 km: +30 points
   - 151-300 km: +20 points
   - 301+ km: +10 points

2. Has assigned vehicle: +25 points

3. Location match (same country as origin): +20 points

4. Vehicle type match (if has vehicle):
   - Refrigerated for cold cargo: +15 points
   - Box for fragile cargo: +10 points

Calculate total score for each driver and provide SHORT reason.

Return ONLY valid JSON array (no markdown, no explanation):
[{{"driver_id": 1, "score": 85, "reason": "Close to origin, has vehicle"}}, ...]

Sort by score (highest first)."""

    try:
        # Wywołaj Granite API
        response = requests.post(
            GRANITE_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": "truckai-granite-vllm",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500,
                "temperature": 0.3  # Niższa temperatura = bardziej deterministyczne odpowiedzi
            },
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        
        # Wyciągnij odpowiedź AI
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '[]')
        
        # Wyczyść odpowiedź (usuń markdown jeśli jest)
        json_str = ai_response.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:]
        elif json_str.startswith('```'):
            json_str = json_str[3:]
        if json_str.endswith('```'):
            json_str = json_str[:-3]
        json_str = json_str.strip()
        
        # Znajdź tablicę JSON
        start_idx = json_str.find('[')
        end_idx = json_str.rfind(']')
        if start_idx != -1 and end_idx != -1:
            json_str = json_str[start_idx:end_idx + 1]
        
        # Parsuj JSON
        scores = json.loads(json_str)
        
        # Dodaj odległości do wyniku (z naszych obliczeń)
        for score in scores:
            driver_id = score.get('driver_id')
            driver_info = next((d for d in drivers_data if d['id'] == driver_id), None)
            if driver_info:
                score['distance_km'] = driver_info['distance_to_origin_km']
        
        return scores
        
    except requests.exceptions.RequestException as e:
        print(f"AI API error: {e}")
        # Fallback: prosta lokalna ocena
        return _fallback_scoring(drivers_data)
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"AI response was: {ai_response if 'ai_response' in locals() else 'N/A'}")
        return _fallback_scoring(drivers_data)
        
    except Exception as e:
        print(f"Unexpected error in AI scoring: {e}")
        return _fallback_scoring(drivers_data)


def _fallback_scoring(drivers_data: List[Dict]) -> List[Dict]:
    """
    Prosta lokalna ocena gdy AI nie działa
    """
    scores = []
    for driver in drivers_data:
        score = 50  # Bazowy wynik
        
        # Odległość
        distance = driver['distance_to_origin_km']
        if distance < 50:
            score += 40
        elif distance < 150:
            score += 30
        elif distance < 300:
            score += 20
        else:
            score += 10
        
        # Ma pojazd
        if driver['has_vehicle']:
            score += 25
        
        scores.append({
            'driver_id': driver['id'],
            'score': min(score, 100),
            'reason': f"Distance: {distance}km, Has vehicle: {driver['has_vehicle']}",
            'distance_km': distance
        })
    
    # Sortuj po wyniku
    return sorted(scores, key=lambda x: x['score'], reverse=True)
