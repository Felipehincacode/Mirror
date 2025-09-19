import { useState, useEffect } from 'react';
import { Camera, RotateCcw, Loader2, LogOut, User } from 'lucide-react';
import { ChallengeCard } from '../cards/ChallengeCard';
import { UploadModal } from '../modals/UploadModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { NotificationManager } from '../notifications/NotificationManager';

// Helper function to get user avatar
const getUserAvatar = (userType: 'felipe' | 'manuela' | null) => {
  switch (userType) {
    case 'felipe':
      return '/felipe_avatar .png';
    case 'manuela':
      return '/manuela_avatar.png';
    default:
      return null;
  }
};

export const Home = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [hasSubmission, setHasSubmission] = useState(false);
  
  const { currentUser, loading: userLoading } = useCurrentUser();
  const { 
    getDashboardData,
    loading: apiLoading, 
    error 
  } = useApi();
  const { signOut } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.id) {
        // Use the more efficient dashboard function
        const dashboardData = await getDashboardData(currentUser.id);
        
        if (dashboardData) {
          // Set challenge data
          setCurrentChallenge({
            id: dashboardData.current_challenge_id,
            title: dashboardData.current_challenge_title,
            description: dashboardData.current_challenge_description,
            tag: dashboardData.current_challenge_tag,
            day_index: dashboardData.current_day
          });
          
          // Set progress data
          setUserProgress({
            total_challenges: dashboardData.total_challenges,
            completed_challenges: dashboardData.completed_challenges,
            current_day: dashboardData.current_day,
            completion_percentage: dashboardData.completion_percentage
          });
          
          // Set submission status
          setHasSubmission(dashboardData.has_submission_today);
        }
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [currentUser, userLoading]);

  const isLoading = userLoading || apiLoading;
  const currentDay = userProgress?.current_day || 1;
  const completionPercentage = userProgress?.completion_percentage || 0;
  const totalSubmissions = 2; // Felipe + Manuela
  const currentSubmissions = hasSubmission ? 1 : 0; // For now, just current user
  const userAvatar = getUserAvatar(currentUser?.type || null);

  return (
    <div className="relative flex flex-col items-center justify-center h-[calc(100vh-6rem)] p-6 bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm border-2 border-foreground rounded-3xl mx-2 my-4 md:my-8 mb-20 shadow-2xl overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/10 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-accent/15 to-error/15 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* User Indicator */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 bg-surface-container/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-outline-variant/20">
        <div className="relative">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User size={16} className="text-primary-foreground" />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface-container" />
        </div>
        <div className="text-xs">
          <div className="font-medium text-foreground">{currentUser?.name || 'User'}</div>
          <div className="text-xs text-muted-foreground">Day {currentDay}</div>
        </div>
      </div>

      {/* Top Right Buttons */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
        <NotificationManager />
        <button
          onClick={signOut}
          className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors group"
          aria-label="Sign out"
        >
          <LogOut size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 max-w-sm w-full">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img
              src="/logo_mirror.png"
              alt="Mirror"
              className="h-40 w-auto object-contain mirror-logo transition-all duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Interactive Challenge Card */}
        <div className="relative w-full">
          {isLoading ? (
            <div className="w-full h-48 bg-surface-container rounded-2xl animate-pulse flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : currentChallenge ? (
            <>
              <ChallengeCard
                challenge={{
                  id: currentChallenge.id?.toString() || '1',
                  title: currentChallenge.title || 'Loading...',
                  description: currentChallenge.description || '',
                  date: new Date().toLocaleDateString(),
                  completed: hasSubmission,
                  tag: currentChallenge.tag
                }}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />

              {/* Challenge info */}
              <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <RotateCcw size={14} className="mr-1" />
                  Tap to flip
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${hasSubmission ? 'bg-success' : 'bg-warning'}`} />
                  {hasSubmission ? 'Completed' : 'Pending'}
                </div>
              </div>
            </>
          ) : error ? (
            <div className="w-full h-48 bg-surface-container rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-error text-sm mb-2">Failed to load challenge</p>
                <p className="text-muted-foreground text-xs">{error}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-surface-container rounded-2xl flex items-center justify-center">
              <p className="text-muted-foreground">No challenge available</p>
            </div>
          )}
        </div>

      </div>

      {/* Upload Banner Button - fits container border */}
      <div className="absolute bottom-0 left-0 right-0">
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={isLoading}
          className="w-full h-12 bg-primary text-primary-foreground rounded-b-3xl border-2 border-foreground border-t-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
          aria-label="Upload photo"
        >
          <Camera size={20} className="mr-2" />
          <span className="font-medium">Upload Photo</span>
        </button>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        challengeId={currentChallenge?.id || 1}
        onSuccess={() => {
          // Refresh data after successful upload
          if (currentUser?.id) {
            getDashboardData(currentUser.id).then(dashboardData => {
              if (dashboardData) {
                setHasSubmission(dashboardData.has_submission_today);
                setUserProgress({
                  total_challenges: dashboardData.total_challenges,
                  completed_challenges: dashboardData.completed_challenges,
                  current_day: dashboardData.current_day,
                  completion_percentage: dashboardData.completion_percentage
                });
              }
            });
          }
        }}
      />
    </div>
  );
};