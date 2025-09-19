import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApi } from '@/hooks/useApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { compressImage } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: number;
  onSuccess: () => void;
}

export const UploadModal = ({ isOpen, onClose, challengeId, onSuccess }: UploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, createSubmission } = useApi();
  const { currentUser } = useCurrentUser();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        // Compress the image
        const compressedFile = await compressImage(file, 1600, 1600, 0.85);
        setSelectedFile(compressedFile);

        // Create preview from compressed file
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original file if compression fails
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleGetLocation = () => {
    console.log('[DEBUG] handleGetLocation called');
    console.log('[DEBUG] navigator.geolocation available:', !!navigator.geolocation);

    // Check if we're in a secure context (required for geolocation)
    console.log('[DEBUG] isSecureContext:', window.isSecureContext);
    console.log('[DEBUG] protocol:', window.location.protocol);

    // Clear any previous error when starting a new request
    setLocationError(null);
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      console.log('[DEBUG] Requesting geolocation permission...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[DEBUG] Geolocation success:', position.coords);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null); // Clear any previous error
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('[DEBUG] Geolocation error:', error);
          console.error('[DEBUG] Error code:', error.code);
          console.error('[DEBUG] Error message:', error.message);

          // Set user-friendly error messages in the UI instead of alerts
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.error('[DEBUG] User denied geolocation permission');
              setLocationError('Location permission denied. Enable location access in browser settings and try again.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('[DEBUG] Location information unavailable');
              setLocationError('Location unavailable. Check GPS settings and try again.');
              break;
            case error.TIMEOUT:
              console.error('[DEBUG] Geolocation request timed out');
              setLocationError('Location request timed out. Please try again.');
              break;
            default:
              console.error('[DEBUG] Unknown geolocation error');
              setLocationError('Unable to get location. Please try again.');
          }

          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      console.error('[DEBUG] Geolocation API not available');
      console.warn('Geolocation not supported by this browser');
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !currentUser?.id || !title.trim()) return;

    setIsUploading(true);
    try {
      // Upload photo to Supabase storage
      const photoUrl = await uploadPhoto(selectedFile, currentUser.id, challengeId);
      if (!photoUrl) throw new Error('Failed to upload photo');

      // Create submission
      const success = await createSubmission({
        challengeId,
        photoUrl,
        title: title.trim(),
        note: note.trim() || undefined,
        location: location || undefined,
      });

      if (success) {
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setTitle('');
    setNote('');
    setLocation(null);
    setLocationError(null);
    setIsGettingLocation(false);
    setIsCompressing(false);
    onClose();
  };

  const canSubmit = selectedFile && title.trim() && !isUploading && !isCompressing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>
            Share your photo for today's challenge
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo</label>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                {isCompressing && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Compressing...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to select a photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your photo a title"
              maxLength={100}
            />
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Note (optional)
            </label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a personal note..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Location</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {location ? 'Location Added' : locationError ? 'Try Again' : 'Add Location'}
              </Button>
            </div>
            {location && (
              <p className="text-xs text-muted-foreground">
                Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {locationError}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};