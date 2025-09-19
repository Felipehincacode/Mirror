import { Home, Images, MapPin, Calendar } from 'lucide-react';
import type { ViewType } from '../MirrorApp';

interface BottomNavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const BottomNavigation = ({ currentView, onViewChange }: BottomNavigationProps) => {
  const navItems = [
    { id: 'home' as ViewType, icon: Home, label: 'Home' },
    { id: 'gallery' as ViewType, icon: Images, label: 'Gallery' },
    { id: 'map' as ViewType, icon: MapPin, label: 'Map' },
    { id: 'calendar' as ViewType, icon: Calendar, label: 'Calendar' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-full px-2 rounded-3xl">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${
              currentView === id
                ? 'bg-primary text-primary-foreground scale-110'
                : 'text-muted-foreground hover:text-foreground hover:scale-105'
            }`}
            aria-label={label}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
            
            {/* Active indicator */}
            {currentView === id && (
              <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};