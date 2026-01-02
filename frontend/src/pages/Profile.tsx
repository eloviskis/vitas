import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Save, Mail, Phone, User } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nomeCompleto: user?.nomeCompleto || '',
    telefone: user?.telefone || '',
    bio: user?.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateUser(formData);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col items-center space-y-4 pb-6 border-b border-gray-200">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
              {user?.foto ? (
                <img src={user.foto} alt={user.nomeCompleto} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary-600" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{user?.nomeCompleto}</h2>
            <p className="text-sm text-gray-600">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user?.email}
                disabled
                className="input pl-10 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                disabled={!editing}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!editing}
                className="input pl-10"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!editing}
              rows={4}
              className="input resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            {editing ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      nomeCompleto: user?.nomeCompleto || '',
                      telefone: user?.telefone || '',
                      bio: user?.bio || '',
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-primary w-full"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Conta</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            Alterar Senha
          </button>
          <button className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            Configurar Autenticação de Dois Fatores
          </button>
          <button className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
            Privacidade e Dados (LGPD)
          </button>
          <button className="w-full text-left px-4 py-3 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  );
}
