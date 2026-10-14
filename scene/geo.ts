import * as THREE from "three";

/**
 * Lat/lon → unit vector, matching THREE.SphereGeometry's UV layout
 * so points line up with an equirectangular texture.
 */
export function latLonToVec3(lat: number, lon: number, out = new THREE.Vector3()) {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const phi = u * Math.PI * 2;
  const theta = v * Math.PI;
  return out.set(
    -Math.cos(phi) * Math.sin(theta),
    Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
  );
}

export { mulberry32 } from "@/lib/random";

export type City = { name: string; lat: number; lon: number; w: number };

/** Population-weighted light sources. Middle East is denser on purpose. */
export const CITIES: City[] = [
  // Saudi Arabia & Gulf
  { name: "Riyadh", lat: 24.71, lon: 46.68, w: 1.0 },
  { name: "Jeddah", lat: 21.49, lon: 39.19, w: 0.85 },
  { name: "Mecca", lat: 21.39, lon: 39.86, w: 0.6 },
  { name: "Medina", lat: 24.47, lon: 39.61, w: 0.5 },
  { name: "Dammam", lat: 26.42, lon: 50.09, w: 0.6 },
  { name: "Tabuk", lat: 28.38, lon: 36.57, w: 0.25 },
  { name: "Abha", lat: 18.22, lon: 42.5, w: 0.3 },
  { name: "Hail", lat: 27.52, lon: 41.69, w: 0.2 },
  { name: "Buraidah", lat: 26.33, lon: 43.97, w: 0.3 },
  { name: "Dubai", lat: 25.2, lon: 55.27, w: 0.8 },
  { name: "Abu Dhabi", lat: 24.45, lon: 54.38, w: 0.5 },
  { name: "Doha", lat: 25.29, lon: 51.53, w: 0.5 },
  { name: "Kuwait", lat: 29.38, lon: 47.99, w: 0.55 },
  { name: "Manama", lat: 26.23, lon: 50.59, w: 0.35 },
  { name: "Muscat", lat: 23.59, lon: 58.41, w: 0.4 },
  { name: "Sanaa", lat: 15.37, lon: 44.19, w: 0.3 },
  // Levant, Iraq, Iran, Turkey
  { name: "Baghdad", lat: 33.31, lon: 44.36, w: 0.7 },
  { name: "Basra", lat: 30.51, lon: 47.78, w: 0.35 },
  { name: "Amman", lat: 31.95, lon: 35.93, w: 0.45 },
  { name: "Damascus", lat: 33.51, lon: 36.28, w: 0.45 },
  { name: "Beirut", lat: 33.89, lon: 35.5, w: 0.4 },
  { name: "Tel Aviv", lat: 32.08, lon: 34.78, w: 0.5 },
  { name: "Tehran", lat: 35.69, lon: 51.39, w: 0.85 },
  { name: "Isfahan", lat: 32.65, lon: 51.67, w: 0.35 },
  { name: "Mashhad", lat: 36.3, lon: 59.6, w: 0.35 },
  { name: "Istanbul", lat: 41.01, lon: 28.98, w: 0.9 },
  { name: "Ankara", lat: 39.93, lon: 32.86, w: 0.5 },
  { name: "Izmir", lat: 38.42, lon: 27.14, w: 0.35 },
  // Africa
  { name: "Cairo", lat: 30.04, lon: 31.24, w: 1.0 },
  { name: "Alexandria", lat: 31.2, lon: 29.92, w: 0.5 },
  { name: "Khartoum", lat: 15.5, lon: 32.56, w: 0.4 },
  { name: "Addis Ababa", lat: 9.03, lon: 38.74, w: 0.45 },
  { name: "Nairobi", lat: -1.29, lon: 36.82, w: 0.45 },
  { name: "Lagos", lat: 6.52, lon: 3.38, w: 0.75 },
  { name: "Kinshasa", lat: -4.44, lon: 15.27, w: 0.45 },
  { name: "Johannesburg", lat: -26.2, lon: 28.05, w: 0.6 },
  { name: "Casablanca", lat: 33.57, lon: -7.59, w: 0.5 },
  { name: "Algiers", lat: 36.75, lon: 3.06, w: 0.45 },
  { name: "Tunis", lat: 36.81, lon: 10.18, w: 0.35 },
  { name: "Accra", lat: 5.6, lon: -0.19, w: 0.35 },
  { name: "Dar es Salaam", lat: -6.79, lon: 39.21, w: 0.35 },
  // Europe
  { name: "London", lat: 51.51, lon: -0.13, w: 0.95 },
  { name: "Paris", lat: 48.86, lon: 2.35, w: 0.9 },
  { name: "Madrid", lat: 40.42, lon: -3.7, w: 0.6 },
  { name: "Barcelona", lat: 41.39, lon: 2.17, w: 0.45 },
  { name: "Rome", lat: 41.9, lon: 12.5, w: 0.55 },
  { name: "Milan", lat: 45.46, lon: 9.19, w: 0.6 },
  { name: "Berlin", lat: 52.52, lon: 13.4, w: 0.6 },
  { name: "Ruhr", lat: 51.45, lon: 7.01, w: 0.75 },
  { name: "Amsterdam", lat: 52.37, lon: 4.9, w: 0.55 },
  { name: "Brussels", lat: 50.85, lon: 4.35, w: 0.45 },
  { name: "Munich", lat: 48.14, lon: 11.58, w: 0.4 },
  { name: "Vienna", lat: 48.21, lon: 16.37, w: 0.4 },
  { name: "Warsaw", lat: 52.23, lon: 21.01, w: 0.45 },
  { name: "Athens", lat: 37.98, lon: 23.73, w: 0.45 },
  { name: "Bucharest", lat: 44.43, lon: 26.1, w: 0.4 },
  { name: "Kyiv", lat: 50.45, lon: 30.52, w: 0.45 },
  { name: "Moscow", lat: 55.76, lon: 37.62, w: 0.9 },
  { name: "St Petersburg", lat: 59.93, lon: 30.36, w: 0.45 },
  { name: "Stockholm", lat: 59.33, lon: 18.07, w: 0.3 },
  // South & Central Asia
  { name: "Karachi", lat: 24.86, lon: 67.0, w: 0.75 },
  { name: "Lahore", lat: 31.55, lon: 74.34, w: 0.6 },
  { name: "Delhi", lat: 28.61, lon: 77.21, w: 1.0 },
  { name: "Mumbai", lat: 19.08, lon: 72.88, w: 0.95 },
  { name: "Ahmedabad", lat: 23.02, lon: 72.57, w: 0.45 },
  { name: "Bangalore", lat: 12.97, lon: 77.59, w: 0.6 },
  { name: "Chennai", lat: 13.08, lon: 80.27, w: 0.55 },
  { name: "Kolkata", lat: 22.57, lon: 88.36, w: 0.75 },
  { name: "Hyderabad", lat: 17.39, lon: 78.49, w: 0.5 },
  { name: "Dhaka", lat: 23.81, lon: 90.41, w: 0.75 },
  { name: "Kabul", lat: 34.56, lon: 69.21, w: 0.3 },
  { name: "Tashkent", lat: 41.3, lon: 69.24, w: 0.35 },
  // East Asia & beyond
  { name: "Beijing", lat: 39.9, lon: 116.4, w: 0.9 },
  { name: "Shanghai", lat: 31.23, lon: 121.47, w: 0.95 },
  { name: "Guangzhou", lat: 23.13, lon: 113.26, w: 0.85 },
  { name: "Chengdu", lat: 30.57, lon: 104.07, w: 0.5 },
  { name: "Tokyo", lat: 35.68, lon: 139.69, w: 1.0 },
  { name: "Seoul", lat: 37.57, lon: 126.98, w: 0.8 },
  { name: "Bangkok", lat: 13.76, lon: 100.5, w: 0.6 },
  { name: "Singapore", lat: 1.35, lon: 103.82, w: 0.6 },
  { name: "Jakarta", lat: -6.21, lon: 106.85, w: 0.75 },
  { name: "Manila", lat: 14.6, lon: 120.98, w: 0.6 },
  { name: "Sydney", lat: -33.87, lon: 151.21, w: 0.5 },
  // Americas
  { name: "New York", lat: 40.71, lon: -74.0, w: 1.0 },
  { name: "Chicago", lat: 41.88, lon: -87.63, w: 0.7 },
  { name: "Los Angeles", lat: 34.05, lon: -118.24, w: 0.85 },
  { name: "Houston", lat: 29.76, lon: -95.37, w: 0.55 },
  { name: "Toronto", lat: 43.65, lon: -79.38, w: 0.55 },
  { name: "Mexico City", lat: 19.43, lon: -99.13, w: 0.8 },
  { name: "Sao Paulo", lat: -23.55, lon: -46.63, w: 0.85 },
  { name: "Rio", lat: -22.91, lon: -43.17, w: 0.55 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.38, w: 0.6 },
  { name: "Bogota", lat: 4.71, lon: -74.07, w: 0.45 },
  { name: "Lima", lat: -12.05, lon: -77.04, w: 0.4 },
];

/** Network hubs that carry visible connection arcs and nodes. */
export const HUBS = [
  "Riyadh",
  "Jeddah",
  "Dubai",
  "Cairo",
  "Istanbul",
  "Kuwait",
  "Tehran",
  "Karachi",
  "Mumbai",
  "Delhi",
  "Addis Ababa",
  "Nairobi",
  "Athens",
  "Moscow",
  "Lagos",
  "Paris",
] as const;

/** Arc pairs between hubs (indices into HUBS). Riyadh-centric. */
export const LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 7],
  [0, 8],
  [0, 10],
  [0, 13],
  [1, 3],
  [2, 8],
  [3, 12],
  [4, 15],
  [5, 6],
  [8, 9],
  [10, 11],
  [3, 14],
];

export function cityByName(name: string): City {
  const c = CITIES.find((c) => c.name === name);
  if (!c) throw new Error(`Unknown city ${name}`);
  return c;
}
