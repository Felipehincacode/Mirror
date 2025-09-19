import { useState, useEffect } from 'react';
import { User, Users, Loader2, ImageOff, MapPin, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useApi } from '@/hooks/useApi';
import { reverseGeocode } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type GalleryTab = 'manuela' | 'mirror' | 'felipe';

export const Gallery = () => {
  const [activeTab, setActiveTab] = useState<GalleryTab>('mirror');
  const [photos, setPhotos] = useState<any[]>([]);
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { currentUser, getFelipeUser, getManuelaUser, loading: userLoading } = useCurrentUser();
  const {
    getGalleryManuela,
    getGalleryFelipe,
    getGalleryMirror,
    loading: apiLoading,
    error
  } = useApi();

  // Dynamic tabs based on current user
  const getTabs = () => {
    if (!currentUser) {
      return [
        { id: 'manuela' as GalleryTab, label: 'Manuela', icon: User },
        { id: 'mirror' as GalleryTab, label: 'Mirror', icon: Users },
        { id: 'felipe' as GalleryTab, label: 'Felipe', icon: User },
      ];
    }

    if (currentUser.type === 'manuela') {
      return [
        { id: 'manuela' as GalleryTab, label: 'Manuela', icon: User },
        { id: 'mirror' as GalleryTab, label: 'Mirror', icon: Users },
        { id: 'felipe' as GalleryTab, label: 'Felipe', icon: User },
      ];
    } else {
      return [
        { id: 'felipe' as GalleryTab, label: 'Felipe', icon: User },
        { id: 'mirror' as GalleryTab, label: 'Mirror', icon: Users },
        { id: 'manuela' as GalleryTab, label: 'Manuela', icon: User },
      ];
    }
  };

  const tabs = getTabs();

  // Function to fetch countries for photos with locations
  const fetchCountries = async (photoList: any[]) => {
    const newCountries: Record<string, string> = {};

    for (const photo of photoList) {
      if (photo.location_lat && photo.location_lng && !countries[photo.submission_id]) {
        const country = await reverseGeocode(photo.location_lat, photo.location_lng);
        if (country) {
          newCountries[photo.submission_id] = country;
        }
      }
    }

    if (Object.keys(newCountries).length > 0) {
      setCountries(prev => ({ ...prev, ...newCountries }));
    }
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      if (userLoading) return;
      
      try {
        let data: any[] = [];
        
        const felipeUser = getFelipeUser();
        const manuelaUser = getManuelaUser();
        
        switch (activeTab) {
          case 'manuela':
            if (manuelaUser?.id) {
              data = await getGalleryManuela(manuelaUser.id);
            }
            break;
          case 'felipe':
            if (felipeUser?.id) {
              data = await getGalleryFelipe(felipeUser.id);
            }
            break;
          case 'mirror':
            data = await getGalleryMirror();
            break;
        }
        
        setPhotos(data || []);
        // Fetch countries for photos with locations
        if (data && data.length > 0) {
          fetchCountries(data);
        }
      } catch (error) {
        console.error('Error fetching gallery photos:', error);
        setPhotos([]);
      }
    };

    fetchPhotos();
  }, [activeTab, userLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm border-2 border-foreground rounded-3xl mx-2 my-4 md:my-8 mb-20 shadow-2xl overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/10 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-accent/15 to-error/15 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      {/* Header */}
      <div className="p-3 pb-2">
        <h1 className="text-xl font-bold text-foreground mb-3 text-center">Gallery</h1>

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

      {/* Photo Grid */}
      <div className="flex-1 px-3 pb-3 overflow-y-auto">
        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-8">
            <ImageOff size={32} className="text-muted-foreground mb-2" />
            <p className="text-base font-medium text-foreground mb-1">Failed to load photos</p>
            <p className="text-xs text-muted-foreground text-center">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {(userLoading || apiLoading) && !error && (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-surface-container animate-pulse" />
            ))}
          </div>
        )}

        {/* Photos grid */}
        {!userLoading && !apiLoading && !error && (
          <>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.submission_id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-surface-container cursor-pointer"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.title || `Day ${photo.day_index} photo`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />

                    {/* Overlay with title and location */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-medium text-foreground truncate">
                          {photo.title || `Day ${photo.day_index}`}
                        </p>
                        {countries[photo.submission_id] && (
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <MapPin size={10} className="mr-1" />
                            {countries[photo.submission_id]}
                          </p>
                        )}
                      </div>

                      {/* Day badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Day {photo.day_index}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-8">
                <ImageOff size={32} className="text-muted-foreground mb-2" />
                <p className="text-base font-medium text-foreground mb-1">No photos yet</p>
                <p className="text-xs text-muted-foreground text-center">
                  {activeTab === 'mirror'
                    ? 'Photos from both users will appear here once uploaded.'
                    : `Photos from ${activeTab} will appear here once uploaded.`
                  }
                </p>
              </div>
            )}
          </>
        )}

        {/* Info footer */}
        {photos.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} loaded
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm border-2 border-foreground rounded-3xl overflow-hidden">
          {selectedPhoto && (
            <>
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-center text-xl font-bold text-foreground">
                  {selectedPhoto.title || `Day ${selectedPhoto.day_index}`}
                </DialogTitle>
              </DialogHeader>

              <div className="px-4 pb-4">
                <div className="relative rounded-xl overflow-hidden bg-surface-container mb-4">
                  <img
                    src={selectedPhoto.photo_url}
                    alt={selectedPhoto.title || `Day ${selectedPhoto.day_index} photo`}
                    className="w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-primary/90 text-primary-foreground text-sm px-3 py-1 rounded-full">
                      Day {selectedPhoto.day_index}
                    </span>
                    {selectedPhoto.username && (
                      <span className="text-sm text-muted-foreground">
                        by {selectedPhoto.username}
                      </span>
                    )}
                  </div>

                  {selectedPhoto.note && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedPhoto.note}</p>
                    </div>
                  )}

                  {countries[selectedPhoto.submission_id] && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Location</h4>
                      <button
                        className="text-sm text-primary hover:text-primary/80 flex items-center"
                        onClick={() => {
                          // Navigate to map view
                          window.dispatchEvent(new CustomEvent('navigateToView', { detail: 'map' }));
                          setIsLightboxOpen(false);
                        }}
                      >
                        <MapPin size={14} className="mr-1" />
                        {countries[selectedPhoto.submission_id]}
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground text-center pt-2 border-t border-surface-container">
                    {new Date(selectedPhoto.created_at).toLocaleDateString()} • {new Date(selectedPhoto.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};