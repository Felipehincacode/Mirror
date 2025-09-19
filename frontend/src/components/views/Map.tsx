import { useState, useEffect, useRef } from 'react';
import { User, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useApi } from '@/hooks/useApi';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type MapTab = 'manuela' | 'felipe';

export const Map = () => {
  const [activeTab, setActiveTab] = useState<MapTab>('manuela');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  const { getFelipeUser, getManuelaUser, loading: userLoading } = useCurrentUser();
  const { getMapPhotos } = useApi();

  const tabs = [
    { id: 'manuela' as MapTab, label: 'Manuela', icon: User },
    { id: 'felipe' as MapTab, label: 'Felipe', icon: User },
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      if (userLoading) return;
      
      setLoading(true);
      try {
        const felipeUser = getFelipeUser();
        const manuelaUser = getManuelaUser();
        
        const userId = activeTab === 'manuela' ? manuelaUser?.id : felipeUser?.id;
        
        if (userId) {
          const data = await getMapPhotos(userId);
          setPhotos(data || []);
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error fetching map photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [activeTab, userLoading]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        setMapError(null);

        // Initialize Leaflet map with OpenStreetMap
        map.current = L.map(mapContainer.current, {
          center: [20, 0], // Center of the world
          zoom: 2,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);

        // Handle map load
        map.current.whenReady(() => {
          setMapLoaded(true);
          console.log('Leaflet map loaded successfully');
        });

        // Add zoom controls
        L.control.zoom({
          position: 'topright'
        }).addTo(map.current);

        // Add scale control
        L.control.scale({
          position: 'bottomleft',
          metric: true,
          imperial: false
        }).addTo(map.current);

      } catch (error) {
        console.error('Failed to initialize Leaflet map:', error);
        setMapError(error instanceof Error ? error.message : 'Failed to initialize map');
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Update markers when photos change
  useEffect(() => {
    if (!map.current || loading || !mapLoaded || mapError) return;

    try {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add new markers for photos with location
      photos.forEach((photo: any) => {
        if (photo.location_lat && photo.location_lng) {
          try {
            // Create custom icon with photo
            const customIcon = L.divIcon({
              html: `
                <div class="w-12 h-12 bg-primary rounded-full border-4 border-white shadow-lg cursor-pointer flex items-center justify-center">
                  <img
                    src="${photo.photo_url}"
                    alt="${photo.title}"
                    class="w-8 h-8 rounded-full object-cover"
                    onerror="this.style.display='none'"
                  />
                </div>
              `,
              className: 'custom-marker',
              iconSize: [48, 48],
              iconAnchor: [24, 24],
            });

            // Create popup
            const popupContent = `
              <div class="p-3 max-w-xs">
                <img src="${photo.photo_url}" alt="${photo.title}" class="w-full h-32 object-cover rounded-lg mb-2" onerror="this.style.display='none'"/>
                <h3 class="font-semibold text-sm mb-1">${photo.title}</h3>
                <p class="text-xs text-gray-600">Day ${photo.day_index} • ${photo.challenge_title}</p>
                ${photo.note ? `<p class="text-xs mt-1">${photo.note}</p>` : ''}
              </div>
            `;

            // Create and add marker
            const marker = L.marker([photo.location_lat, photo.location_lng], { icon: customIcon })
              .bindPopup(popupContent)
              .addTo(map.current!);

            markers.current.push(marker);
          } catch (markerError) {
            console.warn('Failed to create marker for photo:', photo.title, markerError);
          }
        }
      });

      // Fit map to markers if we have photos
      if (photos.length > 0) {
        try {
          const bounds = L.latLngBounds([]);
          photos.forEach((photo: any) => {
            if (photo.location_lat && photo.location_lng) {
              bounds.extend([photo.location_lat, photo.location_lng]);
            }
          });

          if (bounds.isValid()) {
            map.current!.fitBounds(bounds, { padding: [20, 20] });
          }
        } catch (boundsError) {
          console.warn('Failed to fit map bounds:', boundsError);
        }
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }, [photos, loading, mapLoaded, mapError]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm border-2 border-foreground rounded-3xl mx-2 my-4 md:my-8 mb-20 shadow-2xl overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/10 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-accent/15 to-error/15 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      {/* Custom marker styles */}
      <style>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--surface));
          color: hsl(var(--foreground));
          border-radius: 0.5rem;
          box-shadow: 0 4px 24px hsl(var(--background) / 0.6);
        }
        .leaflet-popup-tip {
          background: hsl(var(--surface));
        }
        .leaflet-popup-content {
          margin: 0;
          font-family: inherit;
        }
      `}</style>
      {/* Header */}
      <div className="p-3 pb-2">
        <h1 className="text-xl font-bold text-foreground mb-3">Map</h1>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface-container rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
              }`}
            >
              <Icon size={14} className="mr-1.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 mx-3 mb-3 bg-surface-container rounded-xl overflow-hidden relative">
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3 p-6">
              <AlertTriangle size={48} className="mx-auto text-warning" />
              <div>
                <p className="text-lg font-medium text-foreground">Map Unavailable</p>
                <p className="text-sm text-muted-foreground max-w-md">{mapError}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>To fix this:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
                    <li>Get a Mapbox token from <a href="https://mapbox.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">mapbox.com</a></li>
                    <li>Add it to your <code className="bg-surface-container px-1 py-0.5 rounded">.env.local</code> file</li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="absolute inset-0" />

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-container/80">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading photos...</p>
                </div>
              </div>
            )}

            {!loading && !mapError && photos.length === 0 && mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-3">
                  <MapPin size={48} className="mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium text-foreground">No Photos Yet</p>
                    <p className="text-sm text-muted-foreground">Photos with location will appear here</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};