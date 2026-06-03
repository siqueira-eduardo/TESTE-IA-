import React from 'react';
import { CalendarEvent } from '../types';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  addDays, parseISO, isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SharedViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

// ----------------------------------------------------------------------
// Month View
// ----------------------------------------------------------------------
export function MonthView({ currentDate, events, onEventClick, onDateClick }: SharedViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col h-full bg-white flex-1 animate-in fade-in duration-300">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, idx) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => e.date === formattedDate)
                                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`min-h-[100px] border-b border-r border-gray-100 p-1 flex flex-col hover:bg-gray-50/50 cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-gray-50/30' : ''}
              `}
            >
              <div className="flex items-center justify-center p-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isDayToday ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                `}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-hide pointer-events-auto">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className="text-xs px-1.5 py-1 rounded truncate shadow-sm hover:opacity-80 transition-opacity cursor-pointer border border-black/5"
                    style={{ backgroundColor: `${event.color}20`, color: event.color, borderLeftWidth: '3px', borderLeftColor: event.color }}
                  >
                    <span className="font-semibold mr-1">{event.startTime}</span>
                    {event.category && (
                      <span className="inline-block px-1 mr-1 text-[9px] uppercase tracking-wider rounded bg-white/60 font-semibold align-middle">
                        {event.category.substring(0, 3)}
                      </span>
                    )}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Week View
// ----------------------------------------------------------------------
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function WeekView({ currentDate, events, onEventClick, onDateClick }: SharedViewProps) {
  const startDate = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex border-b border-gray-200">
        <div className="w-16 border-r border-gray-200 bg-gray-50/50"></div>
        {days.map(day => {
           const isDayToday = isToday(day);
           return (
            <div 
              key={day.toISOString()} 
              className="flex-1 text-center py-2 border-r border-gray-200 cursor-pointer hover:bg-gray-50 group"
              onClick={() => onDateClick(day)}
            >
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDayToday ? 'text-blue-600' : 'text-gray-500'}`}>
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={`text-xl mx-auto w-8 h-8 flex items-center justify-center rounded-full ${isDayToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-800'}`}>
                {format(day, 'dd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative bg-gray-50/30">
        <div className="flex">
          {/* Time axis */}
          <div className="w-16 flex flex-col bg-white border-r border-gray-200 z-10 sticky left-0">
            {HOURS.map(hour => (
              <div key={`time-${hour}`} className="h-16 text-xs text-gray-400 text-right pr-2 pt-2 border-b border-gray-100">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Days */}
          {days.map((day, idx) => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const dayEvents = events.filter(e => e.date === formattedDate);

            return (
              <div key={`day-${idx}`} className="flex-1 min-w-0 border-r border-gray-100 relative">
                {HOURS.map(hour => (
                  <div key={`cell-${hour}`} className="h-16 border-b border-gray-100/50" />
                ))}
                
                {/* Events for this day */}
                {dayEvents.map(event => {
                  const [hours, minutes] = event.startTime.split(':').map(Number);
                  const [endHours, endMinutes] = event.endTime.split(':').map(Number);
                  
                  const top = (hours * 64) + (minutes / 60 * 64);
                  const durationHours = (endHours + endMinutes/60) - (hours + minutes/60);
                  const height = Math.max(durationHours * 64, 24); // min height 24px

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className="absolute left-1 right-2 rounded px-2 py-1 text-xs shadow-sm cursor-pointer overflow-hidden border transition-transform hover:scale-[1.02] hover:shadow-md z-10 font-medium"
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        backgroundColor: `${event.color}20`,
                        borderLeftColor: event.color,
                        borderLeftWidth: '4px',
                        borderColor: `${event.color}40`,
                        color: event.color
                      }}
                    >
                      <div className="font-semibold flex items-center gap-1">
                        <span className="truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="opacity-80 text-[10px]">{event.startTime}</span>
                        {event.category && (
                          <span className="text-[8px] uppercase px-1 rounded bg-white/50 font-bold">
                            {event.category.substring(0, 3)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Day View
// ----------------------------------------------------------------------
export function DayView({ currentDate, events, onEventClick, onDateClick }: SharedViewProps) {
  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  const dayEvents = events.filter(e => e.date === formattedDate);

  const isDayToday = isToday(currentDate);

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-gray-200 py-3 px-6 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => onDateClick(currentDate)}>
         <div className={`text-sm font-medium uppercase tracking-wider mb-1 ${isDayToday ? 'text-blue-600' : 'text-gray-500'}`}>
            {format(currentDate, 'EEEE', { locale: ptBR })}
          </div>
          <div className={`text-3xl font-light ${isDayToday ? 'text-blue-600 font-normal' : 'text-gray-900'}`}>
            {format(currentDate, 'dd')}
          </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative bg-gray-50/30">
        <div className="flex">
          {/* Time axis */}
          <div className="w-20 flex flex-col bg-white border-r border-gray-200 z-10 sticky left-0 shadow-sm">
            {HOURS.map(hour => (
              <div key={`time-${hour}`} className="h-20 text-sm text-gray-500 text-right pr-4 pt-3 border-b border-gray-100 font-medium">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex-1 relative">
            {HOURS.map(hour => (
              <div key={`cell-${hour}`} className="h-20 border-b border-gray-100/80" />
            ))}
            
            {/* Events */}
            <div className="absolute inset-0 pl-2 pr-6">
              {dayEvents.map(event => {
                const [hours, minutes] = event.startTime.split(':').map(Number);
                const [endHours, endMinutes] = event.endTime.split(':').map(Number);
                
                const top = (hours * 80) + (minutes / 60 * 80);
                const durationHours = (endHours + endMinutes/60) - (hours + minutes/60);
                const height = Math.max(durationHours * 80, 40); // min height 40px

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="absolute left-4 right-4 rounded-lg p-3 text-sm shadow-sm cursor-pointer overflow-hidden border transition-all hover:-translate-y-0.5 hover:shadow-md z-10"
                    style={{ 
                      top: `${top}px`, 
                      height: `${height}px`,
                      backgroundColor: `${event.color}15`,
                      borderLeftColor: event.color,
                      borderLeftWidth: '5px',
                      borderColor: `${event.color}30`,
                      color: '#1f2937' // dark slate
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-base flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2" style={{ color: event.color }}>
                        {event.title}
                        {event.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/60 uppercase tracking-wider font-bold w-fit">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <div className="px-2 py-0.5 rounded text-xs font-semibold bg-white/50 border border-white/40 shadow-sm whitespace-nowrap" style={{ color: event.color }}>
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                    {event.description && (
                      <div className="mt-1 opacity-80 line-clamp-2 leading-tight">
                        {event.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Current Time Indicator (mocked static for simple demo, real version would interval-update) */}
            {isDayToday && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 flex items-center"
                style={{ top: `${(new Date().getHours() * 80) + (new Date().getMinutes() / 60 * 80)}px` }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
