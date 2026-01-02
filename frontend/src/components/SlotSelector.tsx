import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface Slot {
  inicio: Date;
  fim: Date;
  disponivel: boolean;
  profissionalId: string;
}

interface SlotSelectorProps {
  profissionalId: string;
  duracaoServico: number;
  onSelectSlot: (slot: Slot) => void;
}

export function SlotSelector({
  profissionalId,
  duracaoServico,
  onSelectSlot,
}: SlotSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarSlots();
  }, [selectedDate, profissionalId]);

  const carregarSlots = async () => {
    setLoading(true);
    try {
      const inicio = new Date(selectedDate);
      inicio.setHours(0, 0, 0, 0);
      
      const fim = new Date(selectedDate);
      fim.setHours(23, 59, 59, 999);

      const slotsSimulados = gerarSlotsSimulados(inicio);
      setSlots(slotsSimulados);
    } catch (error) {
      console.error('Erro ao carregar slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarSlotsSimulados = (inicio: Date): Slot[] => {
    const slots: Slot[] = [];
    const current = new Date(inicio);
    current.setHours(8, 0, 0, 0);

    while (current.getHours() < 18) {
      const slotFim = new Date(current);
      slotFim.setMinutes(current.getMinutes() + 60);

      const agora = new Date();
      const disponivel = current > agora && Math.random() > 0.3;

      slots.push({
        inicio: new Date(current),
        fim: new Date(slotFim),
        disponivel,
        profissionalId,
      });

      current.setMinutes(current.getMinutes() + 60);
    }

    return slots;
  };

  const handleSelectSlot = (slot: Slot) => {
    if (!slot.disponivel) return;
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  const formatarHora = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const proximosDias = () => {
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date();
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Selecione a Data
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {proximosDias().map((dia, idx) => {
            const isSelected = dia.toDateString() === selectedDate.toDateString();
            const isToday = dia.toDateString() === new Date().toDateString();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(dia)}
                className={`p-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-medium">
                  {dia.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {dia.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horários Disponíveis
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando horários...</div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum horário disponível</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map((slot, idx) => {
              const isSelected = selectedSlot?.inicio.getTime() === slot.inicio.getTime();

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectSlot(slot)}
                  disabled={!slot.disponivel}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white'
                      : slot.disponivel
                      ? 'bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {formatarHora(slot.inicio)}
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  {!slot.disponivel && (
                    <div className="text-xs mt-1 text-gray-500">Ocupado</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✓ Horário Selecionado</h4>
          <div className="text-sm text-green-700">
            <p>
              <strong>Data:</strong> {selectedSlot.inicio.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p>
              <strong>Horário:</strong> {formatarHora(selectedSlot.inicio)} - {formatarHora(selectedSlot.fim)}
            </p>
            <p>
              <strong>Duração:</strong> {duracaoServico} minutos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlotSelector;
