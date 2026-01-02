import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nomeCompleto: '',
    role: 'cuidador',
    termosAceitos: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termosAceitos) {
      setError('Você deve aceitar os termos de uso');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">VITAS</h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              faça login na sua conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                required
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                className="input mt-1"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input mt-1"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input mt-1"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Tipo de perfil
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="input mt-1"
              >
                <option value="cuidador">Cuidador</option>
                <option value="familiar">Familiar</option>
                <option value="profissional">Profissional de Saúde</option>
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <input
              id="termos"
              name="termos"
              type="checkbox"
              checked={formData.termosAceitos}
              onChange={(e) => setFormData({ ...formData, termosAceitos: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="termos" className="ml-2 block text-sm text-gray-900">
              Aceito os{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Política de Privacidade
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span>Criando conta...</span>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Criar conta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
