import React from 'react';
import { ViewType } from '../types';
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAnalytics: () => void;
  onOpenSheetsSync: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
  onOpenAnalytics,
  onOpenSheetsSync
}: CalendarHeaderProps) {
  
  const getHeaderText = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    } else if (view === 'week') {
      return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    } else {
      return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center w-full md:w-auto justify-between md:justify-start gap-4">
        <div className="flex items-center gap-2 text-blue-600">
          <CalendarIcon size={24} className="text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Agenda</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onToday}
            className="px-4 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hoje
          </button>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={onPrev}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={onNext}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <h2 className="text-lg font-medium text-gray-800 w-48 capitalize md:w-auto">
            {getHeaderText()}
          </h2>
        </div>
      </div>

      <div className="flex items-center w-full md:w-auto gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['month', 'week', 'day'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                view === v 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
        
        <button
          onClick={onOpenSheetsSync}
          className="p-2 ml-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-transparent shadow-sm flex items-center justify-center gap-2 font-medium text-sm"
          aria-label="Exportar para Google Sheets"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sheet"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/><line x1="9" x2="9" y1="9" y2="21"/><line x1="15" x2="15" y1="9" y2="21"/></svg>
          <span className="hidden lg:inline">Sheets</span>
        </button>

        <button
          onClick={onOpenAnalytics}
          className="p-2 ml-2 bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent shadow-sm flex items-center justify-center gap-2 font-medium text-sm"
          aria-label="Insights da Agenda"
        >
          <BarChart3 size={18} />
          <span className="hidden lg:inline">Insights</span>
        </button>
      </div>
    </header>
  );
}
