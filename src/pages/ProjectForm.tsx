import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Company, Environment, ProjectStatus, Extra } from '@/types';
import { cn } from '@/lib/utils';

const companies: Company[] = ['Caza 43', 'SOHO', 'ELIAS'];
const statuses: ProjectStatus[] = ['Em andamento', 'Finalizado', 'Aguardando', 'Cancelado'];
const environments: Environment[] = ['Cozinha', 'Quarto', 'Banheiro', 'Área social', 'Escritório', 'Churrasqueira'];

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, sellers, addProject, updateProject, getProjectById } = useData();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    company: '' as Company | '',
    sellerId: '',
    status: 'Em andamento' as ProjectStatus,
    observations: '',
    environments: [] as Environment[],
    measurementDate: undefined as Date | undefined,
    measurementDeadline: undefined as Date | undefined,
    deliveryAddress: '',
    appliances: '',
    extras: [] as Extra[],
  });

  useEffect(() => {
    if (id) {
      const project = getProjectById(id);
      if (project) {
        setFormData({
          name: project.name,
          clientId: project.clientId,
          company: project.company,
          sellerId: project.sellerId,
          status: project.status,
          observations: project.observations || '',
          environments: project.environments,
          measurementDate: project.measurementDate ? new Date(project.measurementDate) : undefined,
          measurementDeadline: project.measurementDeadline ? new Date(project.measurementDeadline) : undefined,
          deliveryAddress: project.deliveryAddress || '',
          appliances: project.appliances || '',
          extras: project.extras,
        });
      }
    }
  }, [id, getProjectById]);

  const handleEnvironmentToggle = (env: Environment) => {
    setFormData((prev) => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter((e) => e !== env)
        : [...prev.environments, env],
    }));
  };

  const handleAddExtra = () => {
    setFormData((prev) => ({
      ...prev,
      extras: [...prev.extras, { id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1 }],
    }));
  };

  const handleUpdateExtra = (index: number, field: 'name' | 'quantity', value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.map((extra, i) =>
        i === index ? { ...extra, [field]: value } : extra
      ),
    }));
  };

  const handleRemoveExtra = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.clientId || !formData.company || !formData.sellerId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const projectData = {
      name: formData.name,
      clientId: formData.clientId,
      company: formData.company as Company,
      sellerId: formData.sellerId,
      status: formData.status,
      observations: formData.observations,
      environments: formData.environments,
      measurementDate: formData.measurementDate,
      measurementDeadline: formData.measurementDeadline,
      deliveryAddress: formData.deliveryAddress,
      appliances: formData.appliances,
      extras: formData.extras.filter((e) => e.name.trim() !== ''),
    };

    if (isEditing && id) {
      updateProject(id, projectData);
      toast({
        title: 'Projeto atualizado',
        description: 'As informações do projeto foram atualizadas.',
      });
    } else {
      addProject(projectData);
      toast({
        title: 'Projeto criado',
        description: 'O novo projeto foi adicionado com sucesso.',
      });
    }

    navigate('/projects');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={isEditing ? 'Editar Projeto' : 'Novo Projeto'}
        description={isEditing ? 'Atualize as informações do projeto' : 'Preencha os dados do novo projeto'}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Reforma Cozinha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Select value={formData.company} onValueChange={(v) => setFormData({ ...formData, company: v as Company })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller">Vendedor *</Label>
              <Select value={formData.sellerId} onValueChange={(v) => setFormData({ ...formData, sellerId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Environments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ambientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {environments.map((env) => (
                <div key={env} className="flex items-center space-x-2">
                  <Checkbox
                    id={env}
                    checked={formData.environments.includes(env)}
                    onCheckedChange={() => handleEnvironmentToggle(env)}
                  />
                  <Label htmlFor={env} className="cursor-pointer">
                    {env}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prazos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Data de Medida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.measurementDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.measurementDate
                      ? format(formData.measurementDate, "dd/MM/yyyy")
                      : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.measurementDate}
                    onSelect={(date) => setFormData({ ...formData, measurementDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Prazo de Medida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.measurementDeadline && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.measurementDeadline
                      ? format(formData.measurementDeadline, "dd/MM/yyyy")
                      : "Selecionar prazo"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.measurementDeadline}
                    onSelect={(date) => setFormData({ ...formData, measurementDeadline: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="Endereço completo de entrega"
            />
          </CardContent>
        </Card>

        {/* Appliances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Eletros</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.appliances}
              onChange={(e) => setFormData({ ...formData, appliances: e.target.value })}
              placeholder="Liste os eletrodomésticos do projeto..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Extras */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pedido de Extras</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddExtra}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {formData.extras.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum extra adicionado.</p>
            ) : (
              <div className="space-y-4">
                {formData.extras.map((extra, index) => (
                  <div key={extra.id} className="flex items-center gap-4">
                    <Input
                      value={extra.name}
                      onChange={(e) => handleUpdateExtra(index, 'name', e.target.value)}
                      placeholder="Nome do extra"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="1"
                      value={extra.quantity}
                      onChange={(e) => handleUpdateExtra(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExtra(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações sobre o projeto..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
