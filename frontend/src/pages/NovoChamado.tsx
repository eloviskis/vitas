import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import FormNovoChamado, { NovoChamadoData } from '../components/FormNovoChamado';

const NovoChamado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const contexto = searchParams.get('contexto') || 'casa';
  const opcao = searchParams.get('opcao') || '';

  const handleSubmit = async (data: NovoChamadoData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Integrar com API real
      // const response = await api.post('/chamados', {
      //   titulo: data.titulo,
      //   descricao: data.descricao,
      //   prioridade: data.prioridade,
      //   contextoId: contextoId,
      //   grupoId: grupoId,
      //   opcao: data.opcao,
      // });

      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simular upload de anexos
      if (data.anexos.length > 0) {
        // const formData = new FormData();
        // data.anexos.forEach((file) => {
        //   formData.append('files', file);
        // });
        // await api.post(`/chamados/${response.data.id}/anexos`, formData);
      }

      console.log('Chamado criado com sucesso:', data);

      // Redirecionar com sucesso
      navigate('/cases', {
        state: {
          success: true,
          message: 'Chamado criado com sucesso! Em breve você receberá propostas de profissionais.',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar chamado. Tente novamente.';
      setError(message);
      console.error('Erro ao criar chamado:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              title="Voltar"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Novo Chamado
              </h1>
              {contexto && (
                <p className="text-gray-600 text-sm mt-1">
                  Contexto: <span className="font-medium capitalize">{contexto}</span>
                  {opcao && ` • Serviço: ${opcao}`}
                </p>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
              1
            </div>
            <span className="text-gray-600">Descrever Serviço</span>
            
            <div className="h-1 flex-1 bg-gray-300 mx-2"></div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-bold">
              2
            </div>
            <span className="text-gray-600">Selecionar Profissional</span>
            
            <div className="h-1 flex-1 bg-gray-300 mx-2"></div>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-bold">
              3
            </div>
            <span className="text-gray-600">Agendar</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <FormNovoChamado
            contexto={contexto}
            opcao={opcao}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dicas para melhor resultado:</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-xl">📸</span>
              <div>
                <p className="font-medium">Tire fotos de qualidade</p>
                <p className="text-sm text-gray-600">
                  Fotos claras ajudam profissionais a entender melhor seu projeto
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-medium">Seja específico na descrição</p>
                <p className="text-sm text-gray-600">
                  Quanto mais detalhes, mais precisos serão os orçamentos recebidos
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">💰</span>
              <div>
                <p className="font-medium">Mencione seu orçamento</p>
                <p className="text-sm text-gray-600">
                  Isso ajuda a filtrar profissionais com preços compatíveis
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-medium">Defina a prioridade corretamente</p>
                <p className="text-sm text-gray-600">
                  Serviços urgentes recebem mais atenção dos profissionais
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NovoChamado;
