import { useState, useEffect } from 'react';
import { Star, CheckCircle2, Clock, DollarSign, AlertCircle } from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  rating: number;
  chamadosEmAndamento: number;
  valorHora: number;
  aceitaUrgentes: boolean;
  score: number;
  matchPercentual: number;
}

interface ProfissionalSelectorProps {
  profissionaisCandidatos: Profissional[];
  profissionalRecomendado: Profissional;
  podeSerAutomatizado: boolean;
  onSelectProfissional: (profissional: Profissional) => void;
  isLoading?: boolean;
}

export function ProfissionalSelector({
  profissionaisCandidatos,
  profissionalRecomendado,
  podeSerAutomatizado,
  onSelectProfissional,
  isLoading = false,
}: ProfissionalSelectorProps) {
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string>(
    profissionalRecomendado?.id || ''
  );

  useEffect(() => {
    if (profissionalRecomendado) {
      setSelectedProfissionalId(profissionalRecomendado.id);
    }
  }, [profissionalRecomendado]);

  const handleSelect = (profissional: Profissional) => {
    setSelectedProfissionalId(profissional.id);
    onSelectProfissional(profissional);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 75) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 65) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-orange-100 text-orange-800 border-orange-300';
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Recomendação de Profissional</h3>
        <p className="text-sm text-gray-600">
          {podeSerAutomatizado
            ? '✓ Resultado com alta compatibilidade - Pronto para atuação automática'
            : '⚠ Recomendação assistida - Validação manual sugerida'}
        </p>
      </div>

      {/* Profissional Recomendado Destacado */}
      {profissionalRecomendado && (
        <div
          className="p-4 border-2 border-green-300 bg-green-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleSelect(profissionalRecomendado)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-lg text-gray-900">
                {profissionalRecomendado.nome}
                {selectedProfissionalId === profissionalRecomendado.id && (
                  <CheckCircle2 className="inline ml-2 w-5 h-5 text-green-600" />
                )}
              </h4>
              <p className="text-sm text-gray-600">{profissionalRecomendado.especialidade}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(profissionalRecomendado.score)}`}>
              {profissionalRecomendado.score.toFixed(0)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{profissionalRecomendado.rating.toFixed(1)}/5.0</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{profissionalRecomendado.chamadosEmAndamento} em andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>R$ {profissionalRecomendado.valorHora}/hora</span>
            </div>
            {profissionalRecomendado.aceitaUrgentes && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Aceita urgentes</span>
              </div>
            )}
          </div>

          {podeSerAutomatizado && (
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-800 font-medium">
              ✓ Compatibilidade excelente - Pronto para automação
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      {profissionaisCandidatos.length > 1 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Outras opções</span>
          </div>
        </div>
      )}

      {/* Outros Profissionais */}
      {profissionaisCandidatos.length > 1 && (
        <div className="space-y-2">
          {profissionaisCandidatos.map((prof) => (
            <div
              key={prof.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedProfissionalId === prof.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleSelect(prof)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {prof.nome}
                    {selectedProfissionalId === prof.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{prof.especialidade}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{prof.rating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{prof.chamadosEmAndamento} em atendimento</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span>R$ {prof.valorHora}/h</span>
                    </div>
                    {prof.aceitaUrgentes && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span>Urgentes</span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`ml-3 px-2 py-1 rounded-full text-xs font-bold border text-center min-w-14 ${getScoreBadgeColor(prof.score)}`}
                >
                  {prof.score.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          disabled={isLoading || !selectedProfissionalId}
          onClick={() => {
            const selected = profissionaisCandidatos.find(
              (p) => p.id === selectedProfissionalId
            ) || profissionalRecomendado;
            if (selected) {
              onSelectProfissional(selected);
            }
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Confirmando...' : 'Confirmar Seleção'}
        </button>
      </div>
    </div>
  );
}

export default ProfissionalSelector;
