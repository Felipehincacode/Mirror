import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Loader2, CalendarX } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [dailyMessage, setDailyMessage] = useState<string>('');

  const { getCalendarData, loading, error } = useApi();

  // Trip start date from backend config
  const TRIP_START_DATE = new Date('2025-09-14');

  const fetchDailyMessage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching message for date:', today);

      const { data, error } = await supabase
        .from('daily_messages')
        .select('message')
        .eq('date', today);

      if (error) {
        console.warn('Error fetching message:', error);
        console.log('Error details:', error);
        setDailyMessage('Welcome to your family calendar!');
        return;
      }

      console.log('Data received:', data);
      if (data && data.length > 0) {
        setDailyMessage(data[0].message);
      } else {
        console.log('No messages found for today');
        setDailyMessage('Welcome to your family calendar!');
      }
    } catch (err) {
      console.error('Error fetching daily message:', err);
      setDailyMessage('Welcome to your family calendar!');
    }
  };

  useEffect(() => {
    const fetchCalendarData = async () => {
      const data = await getCalendarData();
      setCalendarData(data || []);
    };

    fetchCalendarData();
    fetchDailyMessage();
  }, []);

  // Convert day index to actual date
  const getDayDate = (dayIndex: number): Date => {
    const date = new Date(TRIP_START_DATE);
    date.setDate(date.getDate() + dayIndex - 1);
    return date;
  };

  // Get calendar data for specific date
  const getDataForDate = (date: Date): any => {
    const dayIndex = Math.floor((date.getTime() - TRIP_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return calendarData.find(day => day.day_index === dayIndex);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const hasPhotos = (date: Date | null) => {
    if (!date) return false;
    const dayData = getDataForDate(date);
    return dayData && (dayData.has_manuela || dayData.has_felipe);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dayData = getDataForDate(date);
    setSelectedDayData(dayData);
  };

  // Get photos for selected date
  const getPhotosForSelectedDate = () => {
    if (!selectedDayData) return [];
    
    const photos = [];
    
    if (selectedDayData.has_manuela) {
      photos.push({
        id: `manuela-${selectedDayData.day_index}`,
        url: selectedDayData.manuela_photo_url,
        title: selectedDayData.manuela_title,
        author: 'Manuela',
        note: selectedDayData.manuela_note,
        created_at: selectedDayData.manuela_created_at
      });
    }
    
    if (selectedDayData.has_felipe) {
      photos.push({
        id: `felipe-${selectedDayData.day_index}`,
        url: selectedDayData.felipe_photo_url,
        title: selectedDayData.felipe_title,
        author: 'Felipe',
        note: selectedDayData.felipe_note,
        created_at: selectedDayData.felipe_created_at
      });
    }
    
    return photos;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const selectedPhotos = getPhotosForSelectedDate();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:justify-center bg-gradient-to-br from-accent/40 via-secondary/30 to-primary/40 backdrop-blur-sm shadow-2xl border-2 border-foreground rounded-3xl mx-2 my-4 md:my-8 mb-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/10 to-transparent rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-accent/15 to-error/15 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-full"></div>
      <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-gradient-to-tl from-accent/12 to-error/12 rounded-full"></div>

      {/* Header */}
      <div className="p-3 pb-1 relative z-10">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">CALENDAR</h1>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all duration-200 border border-outline-variant/20 hover:border-primary/30"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>

          <h2 className="text-lg font-semibold text-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-all duration-200 border border-outline-variant/20 hover:border-primary/30"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-foreground">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-3 pb-2 overflow-y-auto flex-1">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <CalendarX size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Failed to load calendar</p>
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </div>
        )}

        {/* Calendar grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-6">
              {days.map((date, index) => {
                const isSelected = selectedDate && date && 
                  date.toDateString() === selectedDate.toDateString();
                const dayData = date ? getDataForDate(date) : null;
                const isInTripRange = date && date >= TRIP_START_DATE && 
                  Math.floor((date.getTime() - TRIP_START_DATE.getTime()) / (1000 * 60 * 60 * 24)) < 90;

                return (
                  <button
                    key={index}
                    onClick={() => date && handleDateSelect(date)}
                    disabled={!date || !isInTripRange}
                    className={`relative aspect-square p-2 md:p-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 overflow-hidden ${
                      !date || !isInTripRange
                        ? 'text-black/50'
                        : hasPhotos(date)
                        ? 'hover:opacity-80'
                        : 'hover:bg-surface-container text-black hover:text-black'
                    } ${
                      isSelected
                        ? 'ring-2 ring-black shadow-lg'
                        : ''
                    }`}
                  >
                    {date && (
                      <>
                        {dayData && isInTripRange && hasPhotos(date) && (
                          <div className="absolute inset-0">
                            {dayData.has_manuela && !dayData.has_felipe && (
                              <img
                                src="/manuela_avatar.png"
                                alt="Manuela"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {dayData.has_felipe && !dayData.has_manuela && (
                              <img
                                src="/felipe_avatar .png"
                                alt="Felipe"
                                className="w-full h-full object-cover"
                              />
                            )}
                            {dayData.has_manuela && dayData.has_felipe && (
                              <div className="relative w-full h-full">
                                <img
                                  src="/manuela_avatar.png"
                                  alt="Manuela"
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                                />
                                <img
                                  src="/felipe_avatar .png"
                                  alt="Felipe"
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <span className={`relative z-10 font-bold ${
                          hasPhotos(date) ? 'text-white drop-shadow-lg' : ''
                        }`}>{date.getDate()}</span>
                        {hasPhotos(date) && (
                          <div className="absolute bottom-1 right-1 z-20">
                            <Camera size={10} className="text-white drop-shadow" />
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Selected Date Photos */}
        {selectedDate && selectedDayData && (
          <div className="bg-secondary/20 rounded-xl p-3 border-2 border-foreground backdrop-blur-sm mt-2">
            <div className="mb-2">
              <h3 className="text-base font-semibold text-foreground">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-xs text-foreground/80">
                Day {selectedDayData.day_index} • {selectedDayData.challenge_title}
              </p>
              {selectedDayData.challenge_description && (
                <p className="text-xs text-foreground/70 mt-1">
                  {selectedDayData.challenge_description}
                </p>
              )}
            </div>

            {selectedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {selectedPhotos.map(photo => (
                  <div key={photo.id} className="group relative">
                    <img
                      src={photo.url}
                      alt={photo.title || `${photo.author}'s photo`}
                      className="w-full aspect-square object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                      <div className="absolute bottom-1 left-1 right-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {photo.title || `${photo.author}'s photo`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {photo.author}
                        </p>
                        {photo.note && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {photo.note}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Author indicator */}
                    <div className="absolute top-1 left-1">
                      <div className={`w-2 h-2 rounded-full ${
                        photo.author === 'Manuela' ? 'bg-pink-500' : 'bg-blue-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Camera size={24} className="mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">No photos for this day yet</p>
              </div>
            )}
          </div>
        )}

        {/* Daily Message */}
        {!loading && !error && calendarData.length > 0 && (
          <div className="mt-3 bg-primary rounded-lg p-4 border-2 border-foreground backdrop-blur-sm text-center">
            <h4 className="text-sm font-medium text-white mb-3">Daily Message</h4>
            <p className="text-sm text-white leading-relaxed">{dailyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};