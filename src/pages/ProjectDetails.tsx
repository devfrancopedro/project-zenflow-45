import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Pencil,
  User,
  Building2,
  Calendar,
  MapPin,
  Zap,
  Package,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, getClientById, getSellerById } = useData();

  const project = id ? getProjectById(id) : undefined;
  const client = project ? getClientById(project.clientId) : undefined;
  const seller = project ? getSellerById(project.sellerId) : undefined;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold">Projeto não encontrado</h2>
        <Button variant="link" onClick={() => navigate('/projects')}>
          Voltar para projetos
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={project.name}
        description={`Criado em ${format(new Date(project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
        action={
          <Button asChild>
            <Link to={`/projects/${project.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Company */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <StatusBadge status={project.status} />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{project.company}</span>
                </div>
                {project.measurementDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Medida: {format(new Date(project.measurementDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Environments */}
          {project.environments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ambientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.environments.map((env) => (
                    <Badge key={env} variant="secondary" className="text-sm">
                      {env}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          {project.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{project.deliveryAddress}</p>
              </CardContent>
            </Card>
          )}

          {/* Appliances */}
          {project.appliances && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" />
                  Eletros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{project.appliances}</p>
              </CardContent>
            </Card>
          )}

          {/* Extras */}
          {project.extras.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Pedido de Extras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.extras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="font-medium">{extra.name}</span>
                      <Badge variant="outline">{extra.quantity}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observations */}
          {project.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{project.observations}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <span className="text-lg font-bold text-primary">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{client.name}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller Info */}
          {seller && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="font-bold text-muted-foreground">
                      {seller.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-sm text-muted-foreground">{seller.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prazos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.measurementDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Medida</p>
                  <p className="font-medium">
                    {format(new Date(project.measurementDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
              {project.measurementDeadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Prazo de Medida</p>
                  <p className="font-medium">
                    {format(new Date(project.measurementDeadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
              {!project.measurementDate && !project.measurementDeadline && (
                <p className="text-sm text-muted-foreground">Nenhum prazo definido</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
