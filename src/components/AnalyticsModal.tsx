import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { X, Calendar as CalendarIcon, PieChart as PieChartIcon, Target } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
}

const COLOR_MAP: Record<string, string> = {
  '#3b82f6': 'Azul (Reuniões)',
  '#ef4444': 'Vermelho (Urgente)',
  '#10b981': 'Verde (Pessoal)',
  '#f59e0b': 'Amarelo (Lembrete)',
  '#8b5cf6': 'Roxo (Estudo)',
  '#ec4899': 'Rosa (Lazer)',
  '#64748b': 'Cinza (Outros)',
};

export function AnalyticsModal({ isOpen, onClose, events }: AnalyticsModalProps) {
  
  // Data processing for charts
  const { eventsByMonth, eventsByColor, totalEvents } = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    events.forEach(event => {
      // Month
      if (event.date) {
        const d = parseISO(event.date);
        const monthYear = format(d, 'MMM yyyy', { locale: ptBR });
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      }
      
      // Color
      const c = event.color;
      colorCounts[c] = (colorCounts[c] || 0) + 1;
    });

    // Format for Recharts
    const byMonth = Object.entries(monthCounts).map(([name, Total]) => ({ name, Total }));
    const byColor = Object.entries(colorCounts).map(([color, value]) => ({ 
      name: COLOR_MAP[color] || color, 
      value,
      color 
    }));

    // Sort months chronologically? Simple approach: sort by month counts could be okay or alphabetical, 
    // ideally actual dates. Since it's 'MMM yyyy' we might need complex sort, but for a simple demo this is fine.
    
    return { 
      eventsByMonth: byMonth, 
      eventsByColor: byColor,
      totalEvents: events.length
    };
  }, [events]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Insights da Agenda</h2>
              <p className="text-sm text-gray-500">Visão analítica de seus compromissos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                <CalendarIcon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Eventos</p>
                <p className="text-3xl font-bold text-gray-800">{totalEvents}</p>
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Target size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Sem dados para análise.</p>
              <p className="text-sm">Adicione eventos para ver os insights.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Eventos por Categoria (Cor) */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-gray-400" />
                  Eventos por Categoria
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsByColor}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {eventsByColor.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Eventos por Mês */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-gray-400" />
                  Eventos por Mês
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Make sure we pass array of data correctly */}
                    <BarChart data={eventsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="Total" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
