import React, { useState, useMemo } from 'react';
import { ViewType, CalendarEvent } from './types';
import { useEvents } from './hooks/useEvents';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthView, WeekView, DayView } from './components/CalendarViews';
import { EventModal } from './components/EventModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SheetsSyncModal } from './components/SheetsSyncModal';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { Plus } from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSheetsSyncOpen, setIsSheetsSyncOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | undefined>(undefined);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | undefined>(undefined);

  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  // Filter events by search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDateForNewEvent(date);
    setEventToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setSelectedDateForNewEvent(currentDate);
    setEventToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    if ('id' in eventData) {
      updateEvent(eventData as CalendarEvent);
    } else {
      addEvent(eventData);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenSheetsSync={() => setIsSheetsSyncOpen(true)}
      />

      <main className="flex-1 flex overflow-hidden p-4 md:p-6 pb-24 md:pb-6 relative">
        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {view === 'month' && (
            <MonthView 
              currentDate={currentDate} 
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
          {view === 'week' && (
            <WeekView 
              currentDate={currentDate} 
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
          {view === 'day' && (
            <DayView 
              currentDate={currentDate} 
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleOpenNewModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-blue-300 z-30"
        aria-label="Adicionar evento"
      >
        <Plus size={28} />
      </button>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={deleteEvent}
        eventToEdit={eventToEdit}
        selectedDate={selectedDateForNewEvent}
      />

      <AnalyticsModal 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        events={events}
      />

      <SheetsSyncModal
        isOpen={isSheetsSyncOpen}
        onClose={() => setIsSheetsSyncOpen(false)}
        events={events}
      />
    </div>
  );
}

