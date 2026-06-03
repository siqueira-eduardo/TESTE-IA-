import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const item = window.localStorage.getItem('calendar_events');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.warn('Error reading from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('calendar_events', JSON.stringify(events));
      
      // Simple notification system check (check for events in the next 15 mins)
      const interval = setInterval(() => {
        checkNotifications(events);
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    } catch (error) {
      console.warn('Error saving to localStorage', error);
    }
  }, [events]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return { events, addEvent, updateEvent, deleteEvent };
}

function checkNotifications(events: CalendarEvent[]) {
  const now = new Date();
  
  events.forEach(event => {
    if (!event.date || !event.startTime) return;
    
    // Parse event date and time
    const [year, month, day] = event.date.split('-').map(Number);
    const [hours, minutes] = event.startTime.split(':').map(Number);
    
    const eventTime = new Date(year, month - 1, day, hours, minutes);
    
    // Check if event is exactly 15 minutes away
    const timeDiff = eventTime.getTime() - now.getTime();
    const minutesAway = Math.round(timeDiff / (1000 * 60));
    
    // Alert nicely using standard notification or alert if exact match
    if (minutesAway === 15) {
      // In a real app we'd use the Notification API, but browsers often block it in iframes
      // So we use a visual alert or console log as a fallback for the AI Studio preview.
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Lembrete: ${event.title}`, {
          body: `O evento começa em 15 minutos, às ${event.startTime}`
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  });
}
