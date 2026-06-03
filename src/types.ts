export type ViewType = 'month' | 'week' | 'day';

export type EventCategory = 'Trabalho' | 'Pessoal' | 'Saúde' | 'Finanças' | 'Outros';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
  category?: EventCategory | string;
}
