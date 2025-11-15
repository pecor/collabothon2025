import requests
import json
from typing import Dict, Any, List


GRANITE_API_URL = "https://truckai-granite-vllm-truckai-project.apps.cluster-bt99s.bt99s.sandbox1766.opentlc.com/v1/chat/completions"


def get_available_options() -> Dict[str, Any]:
    """
    Get available options from the database for AI to choose from
    """
    from .models import Order, Vehicle
    
    # Cargo types
    existing_cargo_types = Order.objects.values_list('cargo_type', flat=True).distinct()
    cargo_types = list(set([ct for ct in existing_cargo_types if ct] + [
        'Pallets', 'Boxes', 'Chemicals', 'Electronics', 'Food Products',
        'Machinery', 'Textiles', 'Pharmaceuticals', 'Furniture',
        'Automotive Parts', 'Fresh Vegetables', 'Frozen Goods', 'Liquids',
        'Construction Materials', 'Paper Products', 'General Cargo'
    ]))
    
    # Temperature options
    existing_temps = Order.objects.values_list('temperature', flat=True).distinct()
    temperatures = list(set([t for t in existing_temps if t] + [
        'Ambient', '2 to 4', '2 to 8', '-18 to -20', '-15 to -18',
        '-2 to 0', '0 to 4', '15 to 20', 'Frozen', 'Refrigerated',
        'Cool', 'Room Temperature'
    ]))
    
    # Special requirements
    existing_reqs = Order.objects.values_list('special_requirements', flat=True).distinct()
    special_requirements = list(set([r for r in existing_reqs if r] + [
        'ADR', 'Forklift', 'Tarpaulin', 'Refrigerated', 'Refrigerated ADR',
        'Forklift Tarpaulin', 'Hazardous Materials', 'Oversized Load',
        'Fragile', 'High Value', 'Time Sensitive', 'Customs Documentation', 'None'
    ]))
    
    # Vehicle types
    vehicle_types = [label for value, label in Vehicle.TYPE_CHOICES]
    vehicle_type_map = {label.lower(): label for value, label in Vehicle.TYPE_CHOICES}
    vehicle_type_map.update({value.lower(): label for value, label in Vehicle.TYPE_CHOICES})
    
    return {
        'cargo_types': sorted(cargo_types),
        'temperatures': sorted(temperatures, key=lambda x: (x != 'Ambient', x)),
        'special_requirements': sorted(special_requirements),
        'vehicle_types': vehicle_types,
        'vehicle_type_map': vehicle_type_map
    }


def extract_order_data_from_email(email_content: str) -> Dict[str, Any]:
    """
    Extract structured order data from email content using Granite AI
    
    Args:
        email_content: Raw email text content
        
    Returns:
        Dictionary with extracted order fields
    """
    
    # Get available options from database
    options = get_available_options()
    
    prompt = f"""Analyze the following transport order email and extract structured data.

CRITICAL RULES:
1. ONLY extract information that is EXPLICITLY stated in the email
2. If information is NOT clearly mentioned, use null for that field
3. DO NOT guess, assume, or invent any values
4. You MUST choose values EXACTLY as they appear in the available options provided below

AVAILABLE OPTIONS (choose EXACTLY as shown):
- Cargo Types: {', '.join(options['cargo_types'])}
- Temperature: {', '.join(options['temperatures'])}
- Special Requirements: {', '.join(options['special_requirements'])}
- Vehicle Types: {', '.join(options['vehicle_types'])}

Return ONLY a JSON object with these exact fields (use null if information is NOT explicitly stated):

{{
  "cargo_name": "string - ONLY if cargo description is explicitly mentioned, otherwise null",
  "cargo_type": "string - MUST be EXACTLY one of the Cargo Types listed above, or null if not mentioned",
  "weight": number - weight in KILOGRAMS ONLY if explicitly stated (if in tons, multiply by 1000), or null if not mentioned,
  "temperature": "string - MUST be EXACTLY one of the Temperature options above, or null if not mentioned",
  "special_requirements": "string - MUST be EXACTLY one of the Special Requirements above, or null if not mentioned",
  "loading_address": "string - pickup location city ONLY if explicitly stated, otherwise null",
  "unloading_address": "string - delivery location city ONLY if explicitly stated, otherwise null",
  "loading_date": "string - YYYY-MM-DD format ONLY if date is explicitly stated, otherwise null",
  "unloading_date": "string - YYYY-MM-DD format ONLY if date is explicitly stated, otherwise null",
  "adr_required": boolean - true ONLY if ADR/hazardous materials are explicitly mentioned, otherwise false,
  "vehicle_type": "string - MUST be EXACTLY one of the Vehicle Types above, or null if not mentioned"
}}

MATCHING RULES (only apply if information exists):
- Temperature: "2-8°C" or "Refrigerated (2-8)" → "2 to 8"
- Temperature: "Refrigerated" without range → "Refrigerated"
- Temperature: Not mentioned → null (NOT "Ambient")
- Special Requirements: "ADR required" → "ADR"
- Special Requirements: "Forklift needed" → "Forklift"
- Special Requirements: Not mentioned → null (NOT "None")
- Cargo Type: Match to closest option from list, or null if unclear
- Vehicle Type: Match to closest option from list, or null if not mentioned
- Weight: Convert tons to kg (tons × 1000), or null if not stated
- Addresses: Extract ONLY city names, or null if not stated

DO NOT MAKE UP OR ASSUME ANY VALUES. If in doubt, use null.

Email content:
{email_content}

Return ONLY the JSON object. Use null for any field that is not explicitly mentioned in the email."""

    try:
        response = requests.post(
            GRANITE_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": "truckai-granite-vllm",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1000,
                "temperature": 0.2  # Lower temperature for more consistent structured output
            },
            timeout=30
        )
        
        response.raise_for_status()
        result = response.json()
        
        # Extract the AI response
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        # Try to parse JSON from the response
        # Sometimes AI includes markdown code blocks or extra text, so we clean that
        json_str = ai_response.strip()
        
        # Remove markdown code blocks
        if json_str.startswith('```json'):
            json_str = json_str[7:]
        elif json_str.startswith('```'):
            json_str = json_str[3:]
        if json_str.endswith('```'):
            json_str = json_str[:-3]
        
        json_str = json_str.strip()
        
        # Try to extract JSON object if there's extra text
        # Look for the first { and last }
        start_idx = json_str.find('{')
        end_idx = json_str.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            json_str = json_str[start_idx:end_idx + 1]
        
        extracted_data = json.loads(json_str)
        
        # Map AI values to available options (fuzzy matching)
        def find_best_match(value: str, options: list) -> str:
            """Find the best matching option for a given value"""
            if not value or not options:
                return value
            
            value_lower = value.lower().strip()
            
            # Exact match
            for option in options:
                if option.lower() == value_lower:
                    return option
            
            # Contains match
            for option in options:
                if value_lower in option.lower() or option.lower() in value_lower:
                    return option
            
            # Temperature special handling: convert "2-8" or "2-8°C" to "2 to 8"
            if any(char.isdigit() for char in value):
                # Extract numbers
                import re
                value_numbers = re.findall(r'-?\d+', value)
                
                for option in options:
                    option_numbers = re.findall(r'-?\d+', option)
                    
                    # If same numbers, it's a match
                    if value_numbers and option_numbers and value_numbers == option_numbers:
                        return option
            
            # Default to first option if no match found
            return options[0] if options else value
        
        # Apply fuzzy matching to ensure values are from available options
        mapped_cargo_type = find_best_match(extracted_data.get('cargo_type', ''), options['cargo_types'])
        mapped_temperature = find_best_match(extracted_data.get('temperature', ''), options['temperatures'])
        mapped_special_req = find_best_match(extracted_data.get('special_requirements', ''), options['special_requirements'])
        
        # Special handling for vehicle_type - can be value or label
        raw_vehicle_type = extracted_data.get('vehicle_type', '').lower()
        mapped_vehicle_type = options['vehicle_type_map'].get(raw_vehicle_type) or find_best_match(
            extracted_data.get('vehicle_type', ''), 
            options['vehicle_types']
        )
        
        # Validate and clean the data - keep nulls if AI didn't find information
        cleaned_data = {
            'cargo_name': extracted_data.get('cargo_name') or None,
            'cargo_type': mapped_cargo_type if mapped_cargo_type and extracted_data.get('cargo_type') else None,
            'weight': extracted_data.get('weight') if extracted_data.get('weight') is not None else None,
            'temperature': mapped_temperature if mapped_temperature and extracted_data.get('temperature') else None,
            'special_requirements': mapped_special_req if mapped_special_req and extracted_data.get('special_requirements') else None,
            'loading_address': extracted_data.get('loading_address') or None,
            'unloading_address': extracted_data.get('unloading_address') or None,
            'loading_date': extracted_data.get('loading_date') or None,
            'unloading_date': extracted_data.get('unloading_date') or None,
            'adr_required': extracted_data.get('adr_required', False),
            'vehicle_type': mapped_vehicle_type if mapped_vehicle_type and extracted_data.get('vehicle_type') else None,
            'success': True,
            'raw_ai_response': ai_response
        }
        
        return cleaned_data
        
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'AI API request failed: {str(e)}',
            'cargo_name': 'Unknown',
            'cargo_type': 'General Cargo',
            'weight': 0,
            'temperature': 'Ambient',
            'special_requirements': 'None',
            'loading_address': '',
            'unloading_address': '',
            'loading_date': None,
            'unloading_date': None,
            'adr_required': False,
            'vehicle_type': 'Curtain-side'
        }
    except json.JSONDecodeError as e:
        return {
            'success': False,
            'error': f'Failed to parse AI response as JSON: {str(e)}',
            'raw_response': ai_response if 'ai_response' in locals() else '',
            'cargo_name': 'Unknown',
            'cargo_type': 'General Cargo',
            'weight': 0,
            'temperature': 'Ambient',
            'special_requirements': 'None',
            'loading_address': '',
            'unloading_address': '',
            'loading_date': None,
            'unloading_date': None,
            'adr_required': False,
            'vehicle_type': 'Curtain-side'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'cargo_name': 'Unknown',
            'cargo_type': 'General Cargo',
            'weight': 0,
            'temperature': 'Ambient',
            'special_requirements': 'None',
            'loading_address': '',
            'unloading_address': '',
            'loading_date': None,
            'unloading_date': None,
            'adr_required': False,
            'vehicle_type': 'Curtain-side'
        }


def analyze_route_regulations(countries_codes: List[str], distance_km: float = 0, estimated_time_hours: float = 0) -> Dict[str, Any]:
    """
    Analyze transport regulations for countries on the route using AI.
    
    Args:
        countries_codes: List of country codes (e.g., ['PL', 'DE'])
        distance_km: Total route distance in kilometers
        estimated_time_hours: Estimated travel time in hours
        
    Returns:
        Dictionary with regulatory requirements and important notes for each country
    """
    from .models import TransportLaw
    
    if not countries_codes:
        return {
            'success': False,
            'error': 'No countries provided',
            'regulations': []
        }
    
    # Map country codes to full names
    country_code_map = {
        'PL': 'Poland',
        'DE': 'Germany',
        'FR': 'France',
        'AT': 'Austria',
        'IT': 'Italy',
        'ES': 'Spain',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CZ': 'Czech Republic',
        'SK': 'Slovakia',
        'HU': 'Hungary',
        'RO': 'Romania',
        'PT': 'Portugal',
    }
    
    country_names = [country_code_map.get(code, code) for code in countries_codes]
    
    # Fetch transport laws for these countries
    transport_laws = TransportLaw.objects.filter(country__in=country_names)
    
    if not transport_laws.exists():
        return {
            'success': False,
            'error': f'No transport law data found for countries: {", ".join(country_names)}',
            'regulations': []
        }
    
    # Prepare data for AI analysis
    regulations_data = []
    for law in transport_laws:
        # Extract only the most important fields for AI to avoid token limit
        regulation_info = {
            'country': law.country,
            'hotel_required': not law.rest_45h_in_cabin_allowed,
            'min_hotel_standard': law.min_hotel_standard,
            'hotel_invoice_required': law.hotel_invoice_required,
            'weekend_driving_ban': law.weekend_driving_ban,
            'ban_details': law.ban_details,
            'emission_zone': law.emission_zone_lez,
            'emission_zone_cities': law.emission_zone_cities,
            'min_euro_class': law.min_euro_class,
            'toll_system': law.toll_system,
            'toll_payment_method': law.toll_payment_method,
            'driver_cpc_required': law.driver_cpc_required,
            'a1_certificate_required': law.a1_certificate_required,
            'a1_notes': law.a1_certificate_notes,
            'required_documents': law.required_documents,
            'winter_tires_required': law.winter_tires_required,
            'winter_tires_period': f"{law.winter_tires_period_start} to {law.winter_tires_period_end}" if law.winter_tires_period_start else None,
            'posting_declaration_required': law.posting_declaration_required,
            'posting_declaration_portal': law.posting_declaration_portal,
            'cargo_insurance_mandatory': law.cargo_insurance_mandatory,
            'max_weight_ton': law.max_weight_ton,
            'speed_limit_highway': law.speed_limit_highway_kmh,
            'notes': law.notes,
        }
        regulations_data.append(regulation_info)
    
    # Create prompt for AI
    prompt = f"""You are a transport logistics expert. Analyze the transport regulations for a truck route and provide CRITICAL requirements and warnings.

ROUTE INFORMATION:
- Countries: {', '.join(country_names)} (codes: {', '.join(countries_codes)})
- Distance: {distance_km:.2f} km
- Estimated time: {estimated_time_hours:.2f} hours
- Current date: November 15, 2025

REGULATIONS DATA:
{json.dumps(regulations_data, indent=2)}

TASK:
For EACH country, provide a brief summary (2-4 sentences) focusing on the MOST IMPORTANT requirements that drivers must know. Focus on:
1. Hotel/rest requirements (can driver sleep in cabin?)
2. Weekend driving bans (dates and times)
3. Required certificates (A1, posting declaration, etc.)
4. Toll system requirements
5. Any CRITICAL warnings or special requirements
6. Winter tire requirements (we are in mid-November 2025)

Return ONLY a JSON array with one object per country:
[
  {{
    "country": "Country Name",
    "country_code": "XX",
    "critical_requirements": [
      "Brief requirement 1",
      "Brief requirement 2",
      "Brief requirement 3"
    ],
    "hotel_required": true/false,
    "hotel_details": "Brief details if required",
    "weekend_ban": true/false,
    "weekend_ban_details": "Brief details if exists",
    "winter_tires_required": true/false,
    "winter_tires_details": "Brief details if required",
    "special_warnings": "Any critical warnings or notes"
  }}
]

Keep each requirement SHORT and ACTIONABLE. Use simple language. Return ONLY the JSON array."""

    try:
        # Call AI API with multiple attempts if needed (small model may struggle)
        max_attempts = 2
        for attempt in range(max_attempts):
            response = requests.post(
                GRANITE_API_URL,
                headers={"Content-Type": "application/json"},
                json={
                    "model": "truckai-granite-vllm",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 2000,
                    "temperature": 0.3  # Slightly higher for better understanding
                },
                timeout=45
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Extract AI response
            ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '[]')
            
            # Clean response
            json_str = ai_response.strip()
            
            # Remove markdown
            if json_str.startswith('```json'):
                json_str = json_str[7:]
            elif json_str.startswith('```'):
                json_str = json_str[3:]
            if json_str.endswith('```'):
                json_str = json_str[:-3]
            
            json_str = json_str.strip()
            
            # Extract JSON array
            start_idx = json_str.find('[')
            end_idx = json_str.rfind(']')
            
            if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                json_str = json_str[start_idx:end_idx + 1]
            
            try:
                parsed_regulations = json.loads(json_str)
                
                # Validate and ensure we have data for all countries
                if isinstance(parsed_regulations, list) and len(parsed_regulations) > 0:
                    return {
                        'success': True,
                        'regulations': parsed_regulations,
                        'countries_analyzed': len(parsed_regulations),
                        'raw_ai_response': ai_response
                    }
            except json.JSONDecodeError:
                if attempt < max_attempts - 1:
                    # Try again with simpler prompt
                    prompt = f"""Analyze transport regulations for {', '.join(country_names)}.

Data: {json.dumps(regulations_data, indent=2)}

Return simple JSON array with country requirements. Keep it short."""
                    continue
                else:
                    raise
        
        # If we get here, all attempts failed
        return {
            'success': False,
            'error': 'Failed to parse AI response after multiple attempts',
            'regulations': create_fallback_regulations(regulations_data, countries_codes),
            'raw_response': ai_response if 'ai_response' in locals() else ''
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': f'AI API request failed: {str(e)}',
            'regulations': create_fallback_regulations(regulations_data, countries_codes)
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'regulations': create_fallback_regulations(regulations_data, countries_codes)
        }


def create_fallback_regulations(regulations_data: List[Dict], countries_codes: List[str]) -> List[Dict]:
    """
    Create fallback regulations summary when AI fails.
    Simple rule-based extraction of critical info.
    """
    fallback_regs = []
    
    country_code_map = {v: k for k, v in {
        'PL': 'Poland', 'DE': 'Germany', 'FR': 'France', 'AT': 'Austria',
        'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands', 'BE': 'Belgium',
        'CZ': 'Czech Republic', 'SK': 'Slovakia', 'HU': 'Hungary',
        'RO': 'Romania', 'PT': 'Portugal'
    }.items()}
    
    for reg_data in regulations_data:
        country = reg_data.get('country', '')
        country_code = country_code_map.get(country, '')
        
        critical_reqs = []
        
        # Hotel requirement
        if reg_data.get('hotel_required'):
            hotel_std = reg_data.get('min_hotel_standard', 'proper accommodation')
            critical_reqs.append(f"Driver must rest in {hotel_std} (not in cabin)")
        
        # Weekend ban
        if reg_data.get('weekend_driving_ban'):
            ban_detail = reg_data.get('ban_details', 'weekend driving restricted')
            critical_reqs.append(f"Weekend driving ban: {ban_detail}")
        
        # A1 Certificate
        if reg_data.get('a1_certificate_required'):
            critical_reqs.append("A1 certificate required for international transport")
        
        # Posting declaration
        if reg_data.get('posting_declaration_required'):
            portal = reg_data.get('posting_declaration_portal', 'national portal')
            critical_reqs.append(f"Posting declaration required via {portal}")
        
        # Winter tires
        if reg_data.get('winter_tires_required'):
            period = reg_data.get('winter_tires_period', 'winter period')
            critical_reqs.append(f"Winter tires mandatory during {period}")
        
        # Toll system
        if reg_data.get('toll_system'):
            critical_reqs.append(f"Toll system: {reg_data['toll_system']}")
        
        fallback_regs.append({
            'country': country,
            'country_code': country_code,
            'critical_requirements': critical_reqs[:5],  # Top 5
            'hotel_required': reg_data.get('hotel_required', False),
            'hotel_details': reg_data.get('min_hotel_standard', ''),
            'weekend_ban': reg_data.get('weekend_driving_ban', False),
            'weekend_ban_details': reg_data.get('ban_details', ''),
            'winter_tires_required': reg_data.get('winter_tires_required', False),
            'winter_tires_details': reg_data.get('winter_tires_period', ''),
            'special_warnings': reg_data.get('notes', '')
        })
    
    return fallback_regs
