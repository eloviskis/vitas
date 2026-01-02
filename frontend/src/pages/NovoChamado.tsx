import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const NovoChamado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('normal');
  const [loading, setLoading] = useState(false);

  const contexto = searchParams.get('contexto') || 'casa';
  const opcao = searchParams.get('opcao') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Integrar com API
      console.log({
        titulo,
        descricao,
        contexto,
        opcao,
        prioridade,
      });
      
      // Simular sucesso
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Novo Chamado - {contexto.charAt(0).toUpperCase() + contexto.slice(1)}
              </h1>
              {opcao && (
                <p className="text-gray-600 text-sm mt-1">
                  Serviço: <span className="font-medium">{opcao}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Chamado *
              </label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Descreva brevemente o que você precisa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Detalhada
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Forneça detalhes sobre o seu pedido, localização, preferências..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baixa">Baixa - Sem pressa</option>
                <option value="normal">Normal - Até 2 semanas</option>
                <option value="alta">Alta - Até 5 dias</option>
                <option value="urgente">Urgente - Até 48 horas</option>
              </select>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Próximo passo:</strong> Após enviar o chamado, você será conectado
                a profissionais qualificados que poderão atender sua solicitação.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !titulo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Criando...' : 'Criar Chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NovoChamado;
