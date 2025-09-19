import { Calendar, Target } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  tag?: string;
}

// Helper function to get category colors and styles
const getCategoryStyles = (tag: string) => {
  const styles: Record<string, { glow: string; bg: string; text: string }> = {
    viaje: { 
      glow: 'shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20', 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-400' 
    },
    detalle: { 
      glow: 'shadow-lg shadow-purple-500/30 ring-2 ring-purple-500/20', 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-400' 
    },
    color: { 
      glow: 'shadow-lg shadow-pink-500/30 ring-2 ring-pink-500/20', 
      bg: 'bg-pink-500/20', 
      text: 'text-pink-400' 
    },
    naturaleza: { 
      glow: 'shadow-lg shadow-green-500/30 ring-2 ring-green-500/20', 
      bg: 'bg-green-500/20', 
      text: 'text-green-400' 
    },
    comida: { 
      glow: 'shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/20', 
      bg: 'bg-orange-500/20', 
      text: 'text-orange-400' 
    },
    arquitectura: { 
      glow: 'shadow-lg shadow-gray-500/30 ring-2 ring-gray-500/20', 
      bg: 'bg-gray-500/20', 
      text: 'text-gray-400' 
    },
    luz: { 
      glow: 'shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-500/20', 
      bg: 'bg-yellow-500/20', 
      text: 'text-yellow-400' 
    },
    memoria: { 
      glow: 'shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20', 
      bg: 'bg-indigo-500/20', 
      text: 'text-indigo-400' 
    },
    urbano: { 
      glow: 'shadow-lg shadow-slate-500/30 ring-2 ring-slate-500/20', 
      bg: 'bg-slate-500/20', 
      text: 'text-slate-400' 
    },
    emo: { 
      glow: 'shadow-lg shadow-red-500/30 ring-2 ring-red-500/20', 
      bg: 'bg-red-500/20', 
      text: 'text-red-400' 
    },
    gente: { 
      glow: 'shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/20', 
      bg: 'bg-cyan-500/20', 
      text: 'text-cyan-400' 
    },
    noche: { 
      glow: 'shadow-lg shadow-violet-500/30 ring-2 ring-violet-500/20', 
      bg: 'bg-violet-500/20', 
      text: 'text-violet-400' 
    }
  };
  
  return styles[tag] || { 
    glow: 'shadow-lg shadow-primary/30 ring-2 ring-primary/20', 
    bg: 'bg-primary/20', 
    text: 'text-primary' 
  };
};

interface ChallengeCardProps {
  challenge: Challenge;
  isFlipped: boolean;
  onFlip: () => void;
}

export const ChallengeCard = ({ challenge, isFlipped, onFlip }: ChallengeCardProps) => {
  const categoryStyles = getCategoryStyles(challenge.tag || '');
  
  return (
    <div className="flip-card w-full h-48" onClick={onFlip}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="flip-card-front">
          <div className={`glass w-full h-full rounded-3xl p-6 flex flex-col justify-center items-center text-center transition-all duration-300 ${categoryStyles.glow}`}>
            {/* Category tag - centered at top */}
            {challenge.tag && (
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium ${categoryStyles.bg} ${categoryStyles.text}`}>
                #{challenge.tag}
              </div>
            )}

            <h3 className="text-xl font-bold text-foreground mb-2 text-center">
              {challenge.title}
            </h3>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              {challenge.date}
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flip-card-back">
          <div className={`glass w-full h-full rounded-3xl p-6 flex flex-col justify-center transition-all duration-300 ${categoryStyles.glow}`}>
            {/* Category tag */}
            {challenge.tag && (
              <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${categoryStyles.bg} ${categoryStyles.text}`}>
                #{challenge.tag}
              </div>
            )}
            
            <h3 className="text-lg font-bold text-foreground mb-4">
              {challenge.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {challenge.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};