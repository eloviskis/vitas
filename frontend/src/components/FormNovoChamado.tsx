import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormNovoChamadoProps {
  contexto?: string;
  opcao?: string;
  onSubmit?: (data: NovoChamadoData) => Promise<void>;
  isLoading?: boolean;
}

export interface NovoChamadoData {
  titulo: string;
  descricao: string;
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  contexto?: string;
  opcao?: string;
  anexos: File[];
}

const FormNovoChamado: React.FC<FormNovoChamadoProps> = ({
  contexto = 'casa',
  opcao,
  onSubmit,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<NovoChamadoData, 'anexos'>>({
    titulo: '',
    descricao: '',
    prioridade: 'NORMAL',
    contexto,
    opcao,
  });

  const [anexos, setAnexos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          anexos: `Arquivo ${file.name} é muito grande (máx 10MB)`,
        }));
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          anexos: `Tipo de arquivo ${file.name} não é permitido`,
        }));
        return false;
      }
      return true;
    });

    setAnexos((prev) => [...prev, ...validFiles]);
  };

  const removeAnexo = (index: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    } else if (formData.titulo.length < 10) {
      newErrors.titulo = 'Título deve ter pelo menos 10 caracteres';
    } else if (formData.titulo.length > 200) {
      newErrors.titulo = 'Título não pode exceder 200 caracteres';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 20) {
      newErrors.descricao = 'Descrição deve ter pelo menos 20 caracteres';
    } else if (formData.descricao.length > 2000) {
      newErrors.descricao = 'Descrição não pode exceder 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          ...formData,
          anexos,
        });
      } else {
        // Simular sucesso se não houver handler
        console.log('Chamado criado:', { ...formData, anexos });
        navigate('/cases', { state: { success: true } });
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Erro ao criar chamado',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitting = submitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Erro geral */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Contexto e Opção (read-only) */}
      <div className="grid grid-cols-2 gap-4">
        {contexto && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contexto
            </label>
            <input
              type="text"
              value={contexto.charAt(0).toUpperCase() + contexto.slice(1)}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
            />
          </div>
        )}
        {opcao && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço
            </label>
            <input
              type="text"
              value={opcao}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
          Título do Chamado *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleInputChange}
          placeholder="Descreva brevemente o que você precisa (mínimo 10 caracteres)"
          maxLength={200}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.titulo ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.titulo && <p className="text-red-600 text-sm mt-1">{errors.titulo}</p>}
        <p className="text-gray-500 text-sm mt-1">{formData.titulo.length}/200</p>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição Detalhada *
        </label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleInputChange}
          placeholder="Forneça detalhes sobre seu pedido: localização, tamanho, preferências, orçamento, etc."
          maxLength={2000}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.descricao ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.descricao && <p className="text-red-600 text-sm mt-1">{errors.descricao}</p>}
        <p className="text-gray-500 text-sm mt-1">{formData.descricao.length}/2000</p>
      </div>

      {/* Prioridade */}
      <div>
        <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700 mb-1">
          Prioridade *
        </label>
        <select
          id="prioridade"
          name="prioridade"
          value={formData.prioridade}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="BAIXA">Baixa - Sem pressa (mais de 2 semanas)</option>
          <option value="NORMAL">Normal - Até 2 semanas</option>
          <option value="ALTA">Alta - Até 5 dias</option>
          <option value="URGENTE">Urgente - Até 48 horas</option>
        </select>
      </div>

      {/* Anexos */}
      <div>
        <label htmlFor="anexos" className="block text-sm font-medium text-gray-700 mb-1">
          Anexos (Fotos, Documentos)
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="text-4xl mb-2">📎</div>
          <p className="text-gray-700 font-medium">Clique ou arraste arquivos aqui</p>
          <p className="text-gray-500 text-sm mt-1">
            Fotos, PDFs, DOC (máx 10MB cada)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          id="anexos"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
        />
        {errors.anexos && <p className="text-red-600 text-sm mt-1">{errors.anexos}</p>}

        {/* Lista de Anexos */}
        {anexos.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {anexos.length} arquivo{anexos.length > 1 ? 's' : ''} selecionado{anexos.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {anexos.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnexo(index)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Próximos passos:</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Após enviar, você será conectado a profissionais qualificados</li>
          <li>Eles analisarão sua solicitação e oferecerão orçamentos</li>
          <li>Você poderá comparar preços e escolher o melhor profissional</li>
          <li>Agendamento e execução do serviço</li>
        </ol>
      </div>

      {/* Botões */}
      <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.titulo || !formData.descricao}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Criando Chamado...' : 'Criar Chamado'}
        </button>
      </div>
    </form>
  );
};

export default FormNovoChamado;
