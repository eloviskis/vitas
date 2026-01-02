import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import ProfissionalSelector from '../components/ProfissionalSelector';
import triagemService, { ResultadoTriagem } from '../lib/triagemService';
import chamadoService from '../lib/chamadoService';

type Prioridade = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export function TriagemChamado() {
  const { chamadoId } = useParams<{ chamadoId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [retriaging, setRetriaging] = useState(false);
  const [resultadoTriagem, setResultadoTriagem] = useState<ResultadoTriagem | null>(null);
  const [chamado, setChamado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chamadoId) {
      carregarTriagem();
    }
  }, [chamadoId]);

  const carregarTriagem = async () => {
    try {
      setLoading(true);
      setError(null);

      const chamadoData = await chamadoService.buscarChamado(chamadoId!);
      setChamado(chamadoData);

      const resultado = await triagemService.simularTriagem({
        especialidadeRequerida: chamadoData.contextoId || 'REFORMA',
        prioridade: (chamadoData.prioridade || 'NORMAL') as Prioridade,
      });

      setResultadoTriagem(resultado);
    } catch (err) {
      console.error('Erro ao carregar triagem:', err);
      setError('Não foi possível carregar a triagem. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetriage = async () => {
    try {
      setRetriaging(true);
      setError(null);

      const resultado = await triagemService.retriage(chamadoId!, {
        especialidadeRequerida: chamado.contextoId || 'REFORMA',
        prioridade: (chamado.prioridade || 'NORMAL') as Prioridade,
      });

      setResultadoTriagem(resultado);
    } catch (err) {
      console.error('Erro ao retriar:', err);
      setError('Não foi possível re-executar a triagem.');
    } finally {
      setRetriaging(false);
    }
  };

  const handleConfirmarSelecao = async (profissional: any) => {
    try {
      setConfirmando(true);
      setError(null);

      await triagemService.confirmarSelecao(chamadoId!, profissional.id);
      navigate(`/chamados/${chamadoId}`);
    } catch (err) {
      console.error('Erro ao confirmar seleção:', err);
      setError('Não foi possível confirmar a seleção do profissional.');
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Processando triagem...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg">
          <p className="font-medium">Erro ao carregar triagem</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Triagem de Profissional</h1>
            <p className="text-gray-600 mt-1">
              Chamado: {chamado?.titulo || chamadoId}
            </p>
          </div>

          <button
            onClick={handleRetriage}
            disabled={retriaging}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${retriaging ? 'animate-spin' : ''}`} />
            Recalcular
          </button>
        </div>
      </div>

      {chamado && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Detalhes do Chamado</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Contexto:</span>{' '}
              <span className="font-medium">{chamado.contextoId || 'Casa'}</span>
            </div>
            <div>
              <span className="text-gray-600">Prioridade:</span>{' '}
              <span className={`font-medium ${
                chamado.prioridade === 'URGENTE' ? 'text-red-600' : 
                chamado.prioridade === 'ALTA' ? 'text-orange-600' : 
                'text-gray-900'
              }`}>
                {chamado.prioridade || 'NORMAL'}
              </span>
            </div>
          </div>
        </div>
      )}

      {resultadoTriagem && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <ProfissionalSelector
            profissionaisCandidatos={resultadoTriagem.profissionaisOrdenados}
            profissionalRecomendado={resultadoTriagem.profissionalRecomendado}
            podeSerAutomatizado={resultadoTriagem.podeSerAutomatizado}
            onSelectProfissional={handleConfirmarSelecao}
            isLoading={confirmando}
          />
        </div>
      )}

      {resultadoTriagem && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Justificativa</h4>
          <p className="text-sm text-gray-700">{resultadoTriagem.justificativa}</p>
        </div>
      )}
    </div>
  );
}

export default TriagemChamado;
