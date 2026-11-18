import { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const item = window.localStorage.getItem('calendar_events');
      const parsed = item ? JSON.parse(item) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Error reading from localStorage', error);
      return [];
    }
  });

  // Salva a cada alteração.
  useEffect(() => {
    try {
      window.localStorage.setItem('calendar_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Error saving to localStorage', error);
    }
  }, [events]);

  // Lembretes: um único timer que sempre lê a lista mais recente,
  // sem reiniciar a cada edição e sem repetir o aviso do mesmo evento.
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      checkNotifications(eventsRef.current, notifiedRef.current);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    // Chamado a partir do clique em "Salvar", que é quando o navegador aceita o pedido.
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
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

function checkNotifications(events: CalendarEvent[], notified: Set<string>) {
  if (typeof Notification === 'undefined') return;

  // Os navegadores só aceitam o pedido de permissão após um clique do usuário,
  // então aqui só avisamos se a permissão já foi concedida.
  if (Notification.permission !== 'granted') return;

  const now = Date.now();

  events.forEach(event => {
    if (!event.date || !event.startTime) return;

    const [year, month, day] = event.date.split('-').map(Number);
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const minutesAway = (new Date(year, month - 1, day, hours, minutes).getTime() - now) / 60000;

    // Avisa uma vez por evento quando faltarem 15 minutos ou menos (e ainda não começou).
    const key = `${event.id}|${event.date}|${event.startTime}`;
    if (minutesAway > 0 && minutesAway <= 15 && !notified.has(key)) {
      notified.add(key);
      new Notification(`Lembrete: ${event.title}`, {
        body: `O evento começa em breve, às ${event.startTime}`
      });
    }
  });
}
