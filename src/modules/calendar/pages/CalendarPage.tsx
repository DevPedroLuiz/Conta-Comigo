import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { calendarService } from '../services/CalendarService';
import { CalendarEvent } from '../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CalendarPage() {
  const user = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    if (!user) return;
    setLoading(true);
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const { data } = await calendarService.getEventsForMonth(user.id, month, year);
    if (data) setEvents(data);
    setLoading(false);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfMonth(monthStart); // might need to start on sunday, but let's just use 1st for simple list/grid
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário Financeiro</h1>
          <p className="text-muted-foreground mt-1">Previsão e histórico de movimentações.</p>
        </div>
        <div className="flex items-center gap-4 rounded-full border border-border bg-card p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-medium min-w-[120px] text-center capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">Carregando calendário...</div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="bg-card p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Pad beginning of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-card/50 min-h-[120px] p-2" />
            ))}

            {days.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.date === dayStr);
              const isCurrentDay = isToday(day);

              return (
                <div 
                  key={dayStr} 
                  className={`bg-card min-h-[120px] p-2 transition-colors hover:bg-muted/50 ${isCurrentDay ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-primary text-primary-foreground' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`px-1.5 py-1 text-xs rounded-md truncate border ${
                          event.type === 'INCOME' 
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                        } ${event.status === 'UNPAID' ? 'opacity-60 border-dashed' : ''}`}
                        title={event.title}
                      >
                        <div className="flex justify-between items-center gap-1">
                          <span className="truncate">{event.title}</span>
                          <span className="font-semibold">
                            {event.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Pad end of month */}
            {Array.from({ length: 6 - monthEnd.getDay() }).map((_, i) => (
              <div key={`pad-end-${i}`} className="bg-card/50 min-h-[120px] p-2" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
