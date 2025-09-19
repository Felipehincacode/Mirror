import { useState, useRef, useEffect } from 'react';
import { Home } from './views/Home';
import { Gallery } from './views/Gallery';
import { Map } from './views/Map';
import { Calendar } from './views/Calendar';
import { BottomNavigation } from './navigation/BottomNavigation';
import { PWAInstaller } from './PWAInstaller';
import { ParallaxBackground } from './ParallaxBackground';

export type ViewType = 'home' | 'gallery' | 'map' | 'calendar';

const MirrorApp = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const views = [
    { id: 'home', component: Home },
    { id: 'gallery', component: Gallery },
    { id: 'map', component: Map },
    { id: 'calendar', component: Calendar },
  ] as const;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const viewWidth = container.clientWidth;
      const currentIndex = Math.round(scrollLeft / viewWidth);
      const newView = views[currentIndex]?.id as ViewType;

      if (newView && newView !== currentView) {
        setCurrentView(newView);
      }
    };

    // Listen for navigation events from components
    const handleNavigate = (event: CustomEvent<ViewType>) => {
      scrollToView(event.detail);
    };

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE') {
        scrollToView(event.data.url as ViewType);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('navigateToView', handleNavigate as EventListener);
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('navigateToView', handleNavigate as EventListener);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [currentView, views]);

  const scrollToView = (viewId: ViewType) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const viewIndex = views.findIndex(v => v.id === viewId);
    const scrollLeft = viewIndex * container.clientWidth;
    
    setCurrentView(viewId);
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      {/* Parallax Background */}
      <ParallaxBackground />

      {/* PWA Install Banner */}
      <PWAInstaller />

      {/* Main scroll container */}
      <div
        ref={scrollContainerRef}
        className="scroll-container flex h-full overflow-x-auto overflow-y-hidden relative z-20"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {views.map(({ id, component: Component }) => (
          <div
            key={id}
            className="scroll-section flex-shrink-0 w-full h-full"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Component />
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentView={currentView}
        onViewChange={scrollToView}
      />
    </div>
  );
};

export default MirrorApp;