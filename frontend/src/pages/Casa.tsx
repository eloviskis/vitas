import React from 'react';
import { useNavigate } from 'react-router-dom';
import CasaOptionCard from '../components/CasaOptionCard';

interface CasaOption {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
}

const casaOptions: CasaOption[] = [
  {
    id: 'reforma',
    title: 'Reforma',
    icon: '🔨',
    description: 'Trabalhos de reforma, construção e ampliação',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'limpeza',
    title: 'Limpeza Profunda',
    icon: '🧹',
    description: 'Limpeza geral, vidros, organização de ambientes',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'jardim',
    title: 'Jardinagem',
    icon: '🌿',
    description: 'Cuidado com plantas, paisagismo, poda',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'manutencao',
    title: 'Manutenção',
    icon: '🔧',
    description: 'Consertos gerais, encanamento, eletricidade',
    color: 'from-gray-500 to-slate-500',
  },
  {
    id: 'pintura',
    title: 'Pintura',
    icon: '🎨',
    description: 'Pintura de paredes, móveis e acabamentos',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'mudanca',
    title: 'Mudança',
    icon: '📦',
    description: 'Transporte e organização de móveis',
    color: 'from-indigo-500 to-blue-500',
  },
];

const Casa: React.FC = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (optionId: string) => {
    navigate(`/chamado/novo?contexto=casa&opcao=${optionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏠</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contexto Casa</h1>
              <p className="text-gray-600 mt-1">
                Serviços profissionais para sua casa e propriedade
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">✓</div>
            <h3 className="font-semibold text-gray-900 mb-1">Profissionais Qualificados</h3>
            <p className="text-sm text-gray-600">
              Equipes verificadas e com excelentes avaliações
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 mb-1">Preços Justos</h3>
            <p className="text-sm text-gray-600">
              Compare orçamentos e escolha o melhor para você
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📞</div>
            <h3 className="font-semibold text-gray-900 mb-1">Agendamento Fácil</h3>
            <p className="text-sm text-gray-600">
              Reserve horários que combinem com sua disponibilidade
            </p>
          </div>
        </div>

        {/* Options Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Como podemos ajudar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casaOptions.map((option) => (
              <CasaOptionCard
                key={option.id}
                option={option}
                onSelect={() => handleOptionSelect(option.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Context Help */}
      <div className="bg-blue-50 border-t border-blue-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Precisa de algo diferente?
          </h3>
          <p className="text-gray-700 mb-4">
            Se você não encontrou o serviço que procura, você pode descrever sua
            necessidade em detalhes ao criar um chamado, e nossos profissionais
            especializados avaliarão sua solicitação.
          </p>
          <button
            onClick={() => navigate('/chamado/novo?contexto=casa')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>➕</span> Criar Chamado Personalizado
          </button>
        </div>
      </div>
    </div>
  );
};

export default Casa;
