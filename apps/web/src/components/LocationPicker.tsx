import { useState, useCallback, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Search, X, Loader2 } from "lucide-react";

// Pure SVG pin — no external images
const pinSvg = `<svg viewBox="0 0 24 36" width="28" height="40" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444"/>
  <circle cx="12" cy="11" r="5" fill="white"/>
</svg>`;
const pinIcon = L.divIcon({
  className: "",
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  html: pinSvg,
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

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    { headers: { "User-Agent": "CIVIX-Grievance-Platform/1.0" } }
  );
  const data = await res.json();
  return data.display_name || "";
}

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

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mountedRef = useRef(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasLocation = value.latitude !== 0 && value.longitude !== 0;

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [26.8467, 80.9462],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });

    mapInstance.current = map;

    return () => {
      mountedRef.current = false;
      map.remove();
      mapInstance.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const placeMarker = useCallback(
    async (lat: number, lng: number) => {
      const map = mapInstance.current;
      if (!map) return;

      // Remove old marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      // Add new marker
      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      markerRef.current = marker;

      // Fly to position
      map.setView([lat, lng], 16);

      // Defer the parent state update so Leaflet's animation isn't interrupted
      const coords = { latitude: lat, longitude: lng };
      setTimeout(() => {
        if (!mountedRef.current) return;
        reverseGeocode(lat, lng)
          .then((address) => { if (mountedRef.current) onChange({ ...coords, address }); })
          .catch(() => { if (mountedRef.current) onChange({ ...coords, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }); });
      }, 0);
    },
    [onChange]
  );

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback((query: string) => {
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
  }, []);

  const handleResultClick = useCallback(
    (result: GeocodeResult) => {
      setSearchQuery(result.display_name.split(",")[0]);
      setShowResults(false);
      // Directly place marker — no state-driven re-render of MapContainer
      placeMarker(result.lat, result.lon);
    },
    [placeMarker]
  );

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await placeMarker(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [placeMarker]);

  const handleClear = useCallback(() => {
    onChange({ latitude: 0, longitude: 0, address: "" });
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
      mapInstance.current.flyTo([26.8467, 80.9462], 12, { duration: 1 });
    }
  }, [onChange]);

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
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {searchQuery && (
            <button type="button" onClick={handleClear} className="pr-3 text-gray-500 hover:text-gray-300 transition">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div
            className="absolute z-[1000] mt-1 w-full rounded-xl overflow-hidden shadow-lg"
            style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
          >
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
          {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
          {locating ? "Locating..." : "Use my location"}
        </button>
        {hasLocation && (
          <span className="text-xs text-gray-500">
            Lat: {value.latitude.toFixed(5)}, Lng: {value.longitude.toFixed(5)}
          </span>
        )}
      </div>

      {/* Map — plain div, Leaflet manages everything imperatively */}
      <div
        ref={mapRef}
        className="w-full rounded-xl"
        style={{ height: "250px", border: "1px solid rgba(255,255,255,0.1)" }}
      />

      {/* Address preview */}
      {value.address && (
        <div
          className="flex items-start gap-2 p-2.5 rounded-lg text-xs text-gray-400"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{value.address}</span>
        </div>
      )}

      {!hasLocation && (
        <p className="text-[11px] text-gray-600">
          Click on the map to place a pin, search for an address, or use your current location.
        </p>
      )}
    </div>
  );
}
