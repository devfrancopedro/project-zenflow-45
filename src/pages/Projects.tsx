import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Building2, User, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Project, ProjectStatus, Company } from '@/types';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const { projects, deleteProject, getClientById, getSellerById } = useData();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState<Company | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const clientIdFilter = searchParams.get('clientId');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCompany = companyFilter === 'all' || project.company === companyFilter;
      const matchesClient = !clientIdFilter || project.clientId === clientIdFilter;
      return matchesSearch && matchesStatus && matchesCompany && matchesClient;
    });
  }, [projects, search, statusFilter, companyFilter, clientIdFilter]);

  const handleDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      toast({
        title: 'Projeto excluído',
        description: 'O projeto foi removido com sucesso.',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projetos"
        description="Gerencie todos os seus projetos"
        action={
          <Button asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Em andamento">Em andamento</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
              <SelectItem value="Aguardando">Aguardando</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={(v) => setCompanyFilter(v as Company | 'all')}>
            <SelectTrigger className="w-[140px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Caza 43">Caza 43</SelectItem>
              <SelectItem value="SOHO">SOHO</SelectItem>
              <SelectItem value="ELIAS">ELIAS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Project List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum projeto encontrado"
          description="Crie seu primeiro projeto para começar a acompanhar o progresso."
          actionLabel="Criar Projeto"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const client = getClientById(project.clientId);
            const seller = getSellerById(project.sellerId);
            
            return (
              <Card key={project.id} className="hover-lift group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{client?.name || 'Cliente não encontrado'}</span>
                            <span className="text-border">•</span>
                            <Building2 className="h-4 w-4" />
                            <span>{project.company}</span>
                          </div>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.environments.map((env) => (
                          <Badge key={env} variant="secondary" className="text-xs">
                            {env}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.measurementDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Medida: {format(new Date(project.measurementDate), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                        {seller && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Vendedor: {seller.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/projects/${project.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(project)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto "{selectedProject?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
