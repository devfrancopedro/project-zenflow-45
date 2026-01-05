import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FolderKanban, Users, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['hsl(245, 85%, 32%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function Dashboard() {
  const { projects, clients, getClientById } = useData();
  const [dateRange, setDateRange] = useState('month');

  const now = new Date();
  const getDateRange = () => {
    switch (dateRange) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const range = getDateRange();
  const filteredProjects = projects.filter((p) =>
    isWithinInterval(new Date(p.createdAt), { start: range.start, end: range.end })
  );

  const inProgressCount = projects.filter((p) => p.status === 'Em andamento').length;
  const completedCount = projects.filter((p) => p.status === 'Finalizado').length;
  const totalClients = clients.length;
  const totalProjects = projects.length;

  const statusData = [
    { name: 'Em andamento', value: projects.filter((p) => p.status === 'Em andamento').length },
    { name: 'Finalizado', value: projects.filter((p) => p.status === 'Finalizado').length },
    { name: 'Aguardando', value: projects.filter((p) => p.status === 'Aguardando').length },
    { name: 'Cancelado', value: projects.filter((p) => p.status === 'Cancelado').length },
  ].filter((d) => d.value > 0);

  const companyData = [
    { name: 'Caza 43', count: projects.filter((p) => p.company === 'Caza 43').length },
    { name: 'SOHO', count: projects.filter((p) => p.company === 'SOHO').length },
    { name: 'ELIAS', count: projects.filter((p) => p.company === 'ELIAS').length },
  ];

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus projetos e clientes"
        action={
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total de Projetos"
          value={totalProjects}
          icon={FolderKanban}
          variant="primary"
        />
        <StatCard
          title="Em Andamento"
          value={inProgressCount}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Finalizados"
          value={completedCount}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Total de Clientes"
          value={totalClients}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Bar Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projetos por Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(245, 85%, 32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="h-5 w-5 text-primary" />
              Status dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Projetos Recentes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => {
              const client = getClientById(project.clientId);
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client?.name} • {project.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={project.status} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.updatedAt), "dd MMM", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
