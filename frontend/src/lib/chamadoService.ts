import api from './api';

export interface CriarChamadoRequest {
  titulo: string;
  descricao: string;
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  grupoId: string;
  contextoId: string;
  opcao?: string;
}

export interface ChamadoResponse {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  contextoId: string;
  grupoId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UploadAnexoRequest {
  arquivo: File;
  chamadoId: string;
}

export interface AnexoResponse {
  id: string;
  nomeOriginal: string;
  url: string;
  tamanho: number;
  tipo: string;
  criadoEm: string;
}

/**
 * Cria um novo chamado
 */
export const criarChamado = async (
  data: CriarChamadoRequest
): Promise<ChamadoResponse> => {
  const response = await api.post<ChamadoResponse>('/chamados', data);
  return response.data;
};

/**
 * Upload de anexos para um chamado
 */
export const uploadAnexo = async (
  chamadoId: string,
  arquivo: File
): Promise<AnexoResponse> => {
  const formData = new FormData();
  formData.append('file', arquivo);

  const response = await api.post<AnexoResponse>(
    `/chamados/${chamadoId}/anexos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Upload múltiplos anexos
 */
export const uploadMultiplosAnexos = async (
  chamadoId: string,
  arquivos: File[]
): Promise<AnexoResponse[]> => {
  const uploads = arquivos.map((arquivo) =>
    uploadAnexo(chamadoId, arquivo)
  );
  return Promise.all(uploads);
};

/**
 * Busca chamado por ID
 */
export const buscarChamado = async (
  chamadoId: string
): Promise<ChamadoResponse> => {
  const response = await api.get<ChamadoResponse>(`/chamados/${chamadoId}`);
  return response.data;
};

/**
 * Lista os chamados do usuário
 */
export const listarChamados = async (filtros?: {
  status?: string;
  prioridade?: string;
  contextoId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ChamadoResponse[]; total: number }> => {
  const response = await api.get<{ data: ChamadoResponse[]; total: number }>(
    '/chamados',
    { params: filtros }
  );
  return response.data;
};

/**
 * Atualiza um chamado
 */
export const atualizarChamado = async (
  chamadoId: string,
  dados: Partial<CriarChamadoRequest>
): Promise<ChamadoResponse> => {
  const response = await api.patch<ChamadoResponse>(
    `/chamados/${chamadoId}`,
    dados
  );
  return response.data;
};

/**
 * Delete um chamado
 */
export const deletarChamado = async (chamadoId: string): Promise<void> => {
  await api.delete(`/chamados/${chamadoId}`);
};

export default {
  criarChamado,
  uploadAnexo,
  uploadMultiplosAnexos,
  buscarChamado,
  listarChamados,
  atualizarChamado,
  deletarChamado,
};
