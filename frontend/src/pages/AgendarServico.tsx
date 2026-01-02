import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import SlotSelector from '../components/SlotSelector';
import agendamentoService from '../lib/agendamentoService';
import chamadoService from '../lib/chamadoService';

interface Slot {
  inicio: Date;
  fim: Date;
  disponivel: boolean;
  profissionalId: string;
}

export function AgendarServico() {
  const { chamadoId } = useParams<{ chamadoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const profissionalId = searchParams.get('profissionalId') || '';
  const profissionalNome = searchParams.get('profissionalNome') || 'Profissional';

  const [chamado, setChamado] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [agendando, setAgendando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chamadoId) {
      carregarChamado();
    }
  }, [chamadoId]);

  const carregarChamado = async () => {
    try {
      setLoading(true);
      const data = await chamadoService.buscarChamado(chamadoId!);
      setChamado(data);
    } catch (err) {
      console.error('Erro ao carregar chamado:', err);
      setError('Não foi possível carregar os dados do chamado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmarAgendamento = async () => {
    if (!selectedSlot) return;

    try {
      setAgendando(true);
      setError(null);

      await agendamentoService.criarAgendamento({
        chamadoId: chamadoId!,
        profissionalId,
        dataHoraInicio: selectedSlot.inicio.toISOString(),
        dataHoraFim: selectedSlot.fim.toISOString(),
        duracaoEstimadaMinutos: 120,
        observacoes,
      });

      navigate(`/chamados/${chamadoId}/confirmado`);
    } catch (err) {
      console.error('Erro ao agendar:', err);
      setError('Não foi possível confirmar o agendamento. Tente outro horário.');
      setAgendando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Agendar Serviço
        </h1>
        <p className="text-gray-600 mt-1">
          Chamado: {chamado?.titulo || chamadoId}
        </p>
      </div>

      {/* Info do Profissional */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profissional Selecionado
        </h3>
        <p className="text-gray-700">{profissionalNome}</p>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg">
          <p className="font-medium">Erro</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Slot Selector */}
      <div className="mb-6">
        <SlotSelector
          profissionalId={profissionalId}
          duracaoServico={120}
          onSelectSlot={handleSelectSlot}
        />
      </div>

      {/* Observações */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Adicione informações adicionais sobre o agendamento..."
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmarAgendamento}
          disabled={!selectedSlot || agendando}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {agendando ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </div>
  );
}

export default AgendarServico;
