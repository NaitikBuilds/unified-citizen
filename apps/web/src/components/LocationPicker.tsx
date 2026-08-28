import { useState, useCallback, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Search, X, Loader2 } from "lucide-react";

// Fix Leaflet default icon paths (bundled assets)
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom red marker icon for the selected location
const selectedIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationValue {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (loc: LocationValue) => void;
}

// Reverse geocode using Nominatim (OSM) — free, no API key
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { "User-Agent": "CIVIX-Grievance-Platform/1.0" } }
  );
  const data = await res.json();
  return data.display_name || "";
}

// Forward geocode (search) using Nominatim
interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

async function forwardGeocode(query: string): Promise<GeocodeResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
    { headers: { "User-Agent": "CIVIX-Grievance-Platform/1.0" } }
  );
  return res.json();
}

// Component that handles map click events
function MapClickHandler({
  onPositionSelect,
}: {
  onPositionSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component that flies the map to a position
function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasLocation = value.latitude !== 0 && value.longitude !== 0;

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectPosition = useCallback(
    async (lat: number, lng: number) => {
      const address = await reverseGeocode(lat, lng);
      onChange({ latitude: lat, longitude: lng, address });
    },
    [onChange]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      selectPosition(lat, lng);
    },
    [selectPosition]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);

      if (query.trim().length < 3) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await forwardGeocode(query);
          setSearchResults(results);
          setShowResults(results.length > 0);
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    []
  );

  const handleResultClick = useCallback(
    (result: GeocodeResult) => {
      onChange({
        latitude: result.lat,
        longitude: result.lon,
        address: result.display_name,
      });
      setSearchQuery(result.display_name.split(",")[0]);
      setShowResults(false);
    },
    [onChange]
  );

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await selectPosition(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [selectPosition]);

  const handleClear = useCallback(() => {
    onChange({ latitude: 0, longitude: 0, address: "" });
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  }, [onChange]);

  const center: [number, number] = hasLocation
    ? [value.latitude, value.longitude]
    : [26.8467, 80.9462]; // Default: Kanpur, India

  const inputStyle = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative" ref={resultsRef}>
        <div className="relative flex items-center rounded-xl" style={inputStyle}>
          <div className="pl-3 text-gray-500">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() =>
              searchResults.length > 0 && setShowResults(true)
            }
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="pr-3 text-gray-500 hover:text-gray-300 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full rounded-xl overflow-hidden shadow-lg" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}>
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition border-b border-white/5 last:border-0"
                onClick={() => handleResultClick(r)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-500" />
                  <span className="line-clamp-2">{r.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/15 transition disabled:opacity-50"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          {locating ? "Locating..." : "Use my location"}
        </button>
        {hasLocation && (
          <span className="text-xs text-gray-500">
            Lat: {value.latitude.toFixed(5)}, Lng: {value.longitude.toFixed(5)}
          </span>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <MapContainer
          center={center}
          zoom={hasLocation ? 16 : 12}
          className="w-full"
          style={{ height: "250px" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyTo position={hasLocation ? [value.latitude, value.longitude] : null} />
          <MapClickHandler onPositionSelect={handleMapClick} />
          {hasLocation && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={selectedIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Address preview */}
      {value.address && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg text-xs text-gray-400" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{value.address}</span>
        </div>
      )}

      {/* Instructions */}
      {!hasLocation && (
        <p className="text-[11px] text-gray-600">
          Click on the map to place a pin, search for an address, or use your current location.
        </p>
      )}
    </div>
  );
}
