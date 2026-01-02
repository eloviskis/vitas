-- Schema do banco de dados PostgreSQL - Projeto VITAS
-- Modelagem das entidades core

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE tipo_usuario AS ENUM ('cliente', 'profissional', 'operador', 'admin');
CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'bloqueado', 'pendente_verificacao');
CREATE TYPE tipo_contexto AS ENUM ('casa', 'vida_digital', 'filhos', 'pais_idosos', 'transicoes');
CREATE TYPE status_caso AS ENUM ('novo', 'triagem', 'proposta', 'agendado', 'em_execucao', 'concluido', 'cancelado', 'reaberto');
CREATE TYPE urgencia_caso AS ENUM ('baixa', 'media', 'alta', 'critica');
CREATE TYPE status_os AS ENUM ('agendada', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE tipo_followup AS ENUM ('d_7', 'd_30', 'd_90');
CREATE TYPE tipo_anexo AS ENUM ('foto', 'documento', 'nota', 'orcamento');

-- Tabela: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    foto_url TEXT,
    tipo tipo_usuario NOT NULL DEFAULT 'cliente',
    status status_usuario NOT NULL DEFAULT 'pendente_verificacao',
    email_verificado BOOLEAN DEFAULT FALSE,
    telefone_verificado BOOLEAN DEFAULT FALSE,
    ultimo_acesso TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_status ON usuarios(status);

-- Tabela: grupos (famílias/organizações)
CREATE TABLE grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    admin_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grupos_admin_id ON grupos(admin_id);

-- Tabela: grupo_membros (N:N entre usuários e grupos)
CREATE TABLE grupo_membros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    papel VARCHAR(50) NOT NULL DEFAULT 'membro', -- admin, membro, visualizador
    permissoes JSONB DEFAULT '{}', -- {"pode_criar_chamado": true, "pode_aprovar_orcamento": false}
    adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, usuario_id)
);

CREATE INDEX idx_grupo_membros_grupo_id ON grupo_membros(grupo_id);
CREATE INDEX idx_grupo_membros_usuario_id ON grupo_membros(usuario_id);

-- Tabela: contextos
CREATE TABLE contextos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    tipo tipo_contexto NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    metadados JSONB DEFAULT '{}', -- {"endereco": {...}, "configuracoes": {...}}
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contextos_grupo_id ON contextos(grupo_id);
CREATE INDEX idx_contextos_tipo ON contextos(tipo);

-- Tabela: casos (chamados)
CREATE TABLE casos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contexto_id UUID NOT NULL REFERENCES contextos(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo_problema VARCHAR(100),
    urgencia urgencia_caso NOT NULL DEFAULT 'media',
    status status_caso NOT NULL DEFAULT 'novo',
    orcamento_maximo DECIMAL(10, 2),
    disponibilidade JSONB, -- {"dias": ["seg", "ter"], "horarios": ["manha", "tarde"]}
    triagem_automatica BOOLEAN DEFAULT TRUE,
    tags VARCHAR(50)[],
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_casos_contexto_id ON casos(contexto_id);
CREATE INDEX idx_casos_usuario_id ON casos(usuario_id);
CREATE INDEX idx_casos_status ON casos(status);
CREATE INDEX idx_casos_criado_em ON casos(criado_em DESC);

-- Tabela: profissionais
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT UNIQUE,
    especialidades VARCHAR(100)[],
    regioes_atendimento JSONB, -- [{"cidade": "São Paulo", "bairros": ["Pinheiros", "Vila Madalena"]}]
    disponibilidade JSONB, -- {"seg": ["08:00-12:00", "14:00-18:00"]}
    preco_base DECIMAL(10, 2),
    score DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 a 5.00
    total_servicos INTEGER DEFAULT 0,
    verificado BOOLEAN DEFAULT FALSE,
    documentos_verificados BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profissionais_usuario_id ON profissionais(usuario_id);
CREATE INDEX idx_profissionais_score ON profissionais(score DESC);
CREATE INDEX idx_profissionais_especialidades ON profissionais USING GIN(especialidades);

-- Tabela: ordens_servico
CREATE TABLE ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE RESTRICT,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
    data_agendada TIMESTAMP NOT NULL,
    data_iniciada TIMESTAMP,
    data_concluida TIMESTAMP,
    status status_os NOT NULL DEFAULT 'agendada',
    valor_acordado DECIMAL(10, 2),
    valor_final DECIMAL(10, 2),
    avaliacao_nota INTEGER CHECK (avaliacao_nota >= 1 AND avaliacao_nota <= 5),
    avaliacao_comentario TEXT,
    avaliado_em TIMESTAMP,
    garantia_ate DATE,
    notas_internas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ordens_servico_caso_id ON ordens_servico(caso_id);
CREATE INDEX idx_ordens_servico_profissional_id ON ordens_servico(profissional_id);
CREATE INDEX idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX idx_ordens_servico_data_agendada ON ordens_servico(data_agendada);

-- Tabela: followups
CREATE TABLE followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    tipo tipo_followup NOT NULL,
    data_prevista DATE NOT NULL,
    data_enviada TIMESTAMP,
    respondido BOOLEAN DEFAULT FALSE,
    data_resposta TIMESTAMP,
    satisfeito BOOLEAN,
    problema_persistiu BOOLEAN,
    comentario TEXT,
    reabriu_caso BOOLEAN DEFAULT FALSE,
    caso_reaberto_id UUID REFERENCES casos(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_followups_os_id ON followups(os_id);
CREATE INDEX idx_followups_data_prevista ON followups(data_prevista);
CREATE INDEX idx_followups_respondido ON followups(respondido);

-- Tabela: anexos (polimórfica)
CREATE TABLE anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidade_tipo VARCHAR(50) NOT NULL, -- 'caso', 'ordem_servico', 'followup'
    entidade_id UUID NOT NULL,
    tipo tipo_anexo NOT NULL,
    url TEXT NOT NULL,
    nome_arquivo VARCHAR(255),
    tamanho_bytes BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    criado_por UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anexos_entidade ON anexos(entidade_tipo, entidade_id);
CREATE INDEX idx_anexos_criado_em ON anexos(criado_em DESC);

-- Tabela: auditoria (log de ações importantes)
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    acao VARCHAR(100) NOT NULL, -- 'criar_caso', 'concluir_os', 'avaliar_servico', etc
    entidade_tipo VARCHAR(50),
    entidade_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_acao ON auditoria(acao);
CREATE INDEX idx_auditoria_criado_em ON auditoria(criado_em DESC);

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar_em
CREATE TRIGGER trigger_atualizar_usuarios BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trigger_atualizar_grupos BEFORE UPDATE ON grupos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trigger_atualizar_contextos BEFORE UPDATE ON contextos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trigger_atualizar_casos BEFORE UPDATE ON casos FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trigger_atualizar_profissionais BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
CREATE TRIGGER trigger_atualizar_ordens_servico BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Usuários do sistema (clientes, profissionais, operadores)';
COMMENT ON TABLE grupos IS 'Grupos/famílias que compartilham contextos';
COMMENT ON TABLE contextos IS 'Contextos de vida (casa, vida digital, filhos, etc)';
COMMENT ON TABLE casos IS 'Chamados/casos abertos pelos usuários';
COMMENT ON TABLE profissionais IS 'Dados específicos de profissionais prestadores de serviço';
COMMENT ON TABLE ordens_servico IS 'Ordens de serviço geradas a partir de casos';
COMMENT ON TABLE followups IS 'Follow-ups automáticos pós-serviço (D+7, D+30, D+90)';
COMMENT ON TABLE anexos IS 'Anexos (fotos, documentos) vinculados a qualquer entidade';
COMMENT ON TABLE auditoria IS 'Log de auditoria de ações importantes no sistema';
