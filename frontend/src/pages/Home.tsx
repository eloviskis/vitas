import { useAuth } from '@/contexts/AuthContext';
import { FolderKanban, Users, Bell, TrendingUp } from 'lucide-react';

export function Home() {
  const { user } = useAuth();

  const stats = [
    { name: 'Casos Ativos', value: '12', icon: FolderKanban, color: 'bg-blue-500' },
    { name: 'Grupos', value: '3', icon: Users, color: 'bg-green-500' },
    { name: 'Notificações', value: '5', icon: Bell, color: 'bg-yellow-500' },
    { name: 'Atividade', value: '+23%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.nomeCompleto?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Bem-vindo de volta ao VITAS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-lg ${stat.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-2">
              <FolderKanban className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Novo caso criado</p>
              <p className="text-sm text-gray-600">Comprar medicamentos - há 2 horas</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Membro adicionado</p>
              <p className="text-sm text-gray-600">Maria foi adicionada ao grupo Casa - há 5 horas</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="rounded-full bg-yellow-100 p-2">
              <Bell className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Lembrete</p>
              <p className="text-sm text-gray-600">Consulta médica amanhã às 10h - há 1 dia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
