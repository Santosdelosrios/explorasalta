const CODE_ALPHABET = '23456789CFGHJMPQRVWX';
const LATITUDE_MAX = 90;
const LONGITUDE_MAX = 180;
const PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];
const SEPARATOR = '+';
const SEPARATOR_POSITION = 8;

function clipLatitude(latitude: number): number {
  return Math.min(LATITUDE_MAX, Math.max(-LATITUDE_MAX, latitude));
}

function normalizeLongitude(longitude: number): number {
  let value = longitude % 360;
  if (value < -LONGITUDE_MAX) value += 360;
  else if (value > LONGITUDE_MAX) value -= 360;
  return value;
}

/**
 * Encode a latitude/longitude into a 10-digit Open Location Code (Plus Code).
 */
export function encodePlusCode(latitude: number, longitude: number): string {
  let lat = clipLatitude(latitude);
  let lng = normalizeLongitude(longitude);

  if (lat === LATITUDE_MAX) {
    lat -= 1e-12; // avoid hitting the max boundary
  }

  lat += LATITUDE_MAX;
  lng += LONGITUDE_MAX;

  let code = '';
  for (const resolution of PAIR_RESOLUTIONS) {
    const lngDigit = Math.floor(lng / resolution);
    lng -= lngDigit * resolution;
    code += CODE_ALPHABET.charAt(lngDigit);

    const latDigit = Math.floor(lat / resolution);
    lat -= latDigit * resolution;
    code += CODE_ALPHABET.charAt(latDigit);
  }

  return code.slice(0, SEPARATOR_POSITION) + SEPARATOR + code.slice(SEPARATOR_POSITION);
}
