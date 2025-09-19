import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

// Types for API responses
interface Challenge {
  id: number;
  day_index: number;
  title: string;
  description: string;
  tag: string;
  created_at: string;
}

interface Submission {
  submission_id: string;
  day_index: number;
  challenge_title: string;
  photo_url: string;
  title: string;
  note?: string;
  username?: string;
  user_id?: string;
  created_at: string;
  location_lat?: number;
  location_lng?: number;
}

interface CalendarData {
  day_index: number;
  challenge_title: string;
  challenge_description: string;
  challenge_tag: string;
  manuela_photo_url?: string;
  manuela_title?: string;
  manuela_note?: string;
  manuela_created_at?: string;
  felipe_photo_url?: string;
  felipe_title?: string;
  felipe_note?: string;
  felipe_created_at?: string;
  has_manuela: boolean;
  has_felipe: boolean;
}

interface UserProgress {
  total_challenges: number;
  completed_challenges: number;
  current_day: number;
  completion_percentage: number;
}

interface DashboardData {
  current_challenge_id: number;
  current_challenge_title: string;
  current_challenge_description: string;
  current_challenge_tag: string;
  current_day: number;
  total_challenges: number;
  completed_challenges: number;
  completion_percentage: number;
  has_submission_today: boolean;
}

interface CreateSubmissionParams {
  challengeId: number;
  photoUrl: string;
  title: string;
  note?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  const clearError = () => setError(null);

  // Challenge-related functions
  const getCurrentChallenge = async (): Promise<Challenge | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_current_challenge');
      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getChallengeByDay = async (dayNumber: number): Promise<Challenge | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_challenge_by_day', {
        day_number: dayNumber
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAllChallenges = async (): Promise<Challenge[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_all_challenges');
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // User progress
  const getUserProgress = async (userId?: string): Promise<UserProgress | null> => {
    if (!userId && !currentUser?.id) return null;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_user_progress', {
        user_uuid: userId || currentUser!.id
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Gallery functions
  const getGalleryManuela = async (userId: string): Promise<Submission[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_gallery_manuela', {
        p_user_id: userId
      });
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGalleryFelipe = async (userId: string): Promise<Submission[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_gallery_felipe', {
        p_user_id: userId
      });
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getGalleryMirror = async (): Promise<Submission[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_gallery_mirror');
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Map functions
  const getMapPhotos = async (userId: string): Promise<Submission[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_map_photos', {
        p_user_id: userId
      });
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Calendar functions
  const getCalendarData = async (): Promise<CalendarData[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_calendar_data');
      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Submission functions
  const createSubmission = async (params: CreateSubmissionParams): Promise<boolean> => {
    if (!currentUser?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('create_submission', {
        p_user_id: currentUser.id,
        p_challenge_id: params.challengeId,
        p_photo_url: params.photoUrl,
        p_title: params.title,
        p_note: params.note || null,
        p_location_lat: params.location?.lat || null,
        p_location_lng: params.location?.lng || null
      });
      if (error) throw error;
      
      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to create submission');
      }
      
      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Storage functions
  const uploadPhoto = async (file: File, userId: string, challengeId: number): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${challengeId}/original.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('submission')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('submission')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user submission for specific challenge
  const getUserSubmissionByChallenge = async (userId: string, challengeId: number): Promise<any | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_user_submission_by_challenge', {
        p_user_id: userId,
        p_challenge_id: challengeId
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get dashboard data (more efficient than separate calls)
  const getDashboardData = async (userId?: string): Promise<DashboardData | null> => {
    if (!userId && !currentUser?.id) return null;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_data', {
        p_user_id: userId || currentUser!.id
      });
      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Push notification functions
  const savePushSubscription = async (params: {
    endpoint: string;
    p256dhKey: string;
    authKey: string;
  }): Promise<boolean> => {
    if (!currentUser?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('save_push_subscription', {
        p_user_id: currentUser.id,
        p_endpoint: params.endpoint,
        p_p256dh_key: params.p256dhKey,
        p_auth_key: params.authKey
      });
      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to save push subscription');
      }

      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePushSubscription = async (): Promise<boolean> => {
    if (!currentUser?.id) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('delete_push_subscription', {
        p_endpoint: '', // This will be handled by the function to delete all for user
        p_user_id: currentUser.id
      });
      if (error) throw error;

      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to delete push subscription');
      }

      return true;
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Offline functionality
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingUploads, setPendingUploads] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check pending uploads count
  const checkPendingUploads = async () => {
    try {
      if ('indexedDB' in window) {
        const request = indexedDB.open('mirror-uploads', 1);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['pending-uploads'], 'readonly');
          const store = transaction.objectStore('pending-uploads');
          const countRequest = store.count();

          countRequest.onsuccess = () => {
            setPendingUploads(countRequest.result);
          };
        };
      }
    } catch (error) {
      console.error('Error checking pending uploads:', error);
    }
  };

  // Upload photo with offline support
  const uploadPhotoOffline = async (file: File, challengeId: number, title: string, note?: string, location?: { lat: number; lng: number }): Promise<{ success: boolean; offline?: boolean; photoUrl?: string }> => {
    if (!currentUser?.id) {
      setError('User not authenticated');
      return { success: false };
    }

    // If online, try normal upload first
    if (isOnline) {
      try {
        const photoUrl = await uploadPhoto(file, currentUser.id, challengeId);
        if (photoUrl) {
          // Create submission
          const success = await createSubmission({
            challengeId,
            photoUrl,
            title,
            note,
            location
          });

          if (success) {
            await checkPendingUploads(); // Update count
            return { success: true, photoUrl };
          }
        }
      } catch (error) {
        console.log('Online upload failed, falling back to offline mode');
      }
    }

    // If offline or online upload failed, save to IndexedDB
    try {
      // Save to IndexedDB for later sync
      const uploadData = {
        userId: currentUser.id,
        challengeId,
        file,
        fileName: file.name,
        title,
        note,
        location,
        timestamp: Date.now()
      };

      // Save to service worker's IndexedDB
      if ('serviceWorker' in navigator && 'indexedDB' in window) {
        const registration = await navigator.serviceWorker.ready;

        // Send message to service worker to queue the upload
        registration.active?.postMessage({
          type: 'QUEUE_UPLOAD',
          data: uploadData
        });

        await checkPendingUploads(); // Update count
        return { success: true, offline: true };
      } else {
        throw new Error('Offline storage not supported');
      }
    } catch (error) {
      console.error('Error saving offline upload:', error);
      setError('Failed to save photo for offline upload');
      return { success: false };
    }
  };

  // Force sync pending uploads
  const forceSyncPendingUploads = async (): Promise<boolean> => {
    if (!isOnline) {
      setError('Cannot sync while offline');
      return false;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        // Register background sync
        if ('sync' in registration) {
          await (registration as any).sync.register('upload-photos');
          return true;
        } else {
          // Fallback: manually trigger sync
          registration.active?.postMessage({
            type: 'MANUAL_SYNC'
          });
          return true;
        }
      }
    } catch (error) {
      console.error('Error forcing sync:', error);
      setError('Failed to sync pending uploads');
      return false;
    }

    return false;
  };

  // Check pending uploads on mount
  useEffect(() => {
    checkPendingUploads();
  }, []);

  return {
    // State
    loading,
    error,
    clearError,
    isOnline,
    pendingUploads,

    // Challenge functions
    getCurrentChallenge,
    getChallengeByDay,
    getAllChallenges,

    // User functions
    getUserProgress,
    getDashboardData,

    // Gallery functions
    getGalleryManuela,
    getGalleryFelipe,
    getGalleryMirror,

    // Map functions
    getMapPhotos,

    // Calendar functions
    getCalendarData,

    // Submission functions
    createSubmission,
    uploadPhoto,
    uploadPhotoOffline,
    getUserSubmissionByChallenge,
    forceSyncPendingUploads,
    checkPendingUploads,

    // Push notification functions
    savePushSubscription,
    deletePushSubscription,
  };
};
