import { useState } from 'react';
import { Plus, Search, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Seller } from '@/types';

export default function Sellers() {
  const { sellers, addSeller, updateSeller, deleteSeller, projects } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(search.toLowerCase()) ||
      seller.email.toLowerCase().includes(search.toLowerCase())
  );

  const getProjectCount = (sellerId: string) => {
    return projects.filter((p) => p.sellerId === sellerId).length;
  };

  const handleOpenDialog = (seller?: Seller) => {
    if (seller) {
      setSelectedSeller(seller);
      setFormData({
        name: seller.name,
        email: seller.email,
        phone: seller.phone || '',
      });
    } else {
      setSelectedSeller(null);
      setFormData({ name: '', email: '', phone: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeller) {
      updateSeller(selectedSeller.id, formData);
      toast({
        title: 'Vendedor atualizado',
        description: 'Os dados do vendedor foram atualizados com sucesso.',
      });
    } else {
      addSeller(formData);
      toast({
        title: 'Vendedor criado',
        description: 'O novo vendedor foi adicionado com sucesso.',
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedSeller) {
      deleteSeller(selectedSeller.id);
      toast({
        title: 'Vendedor excluído',
        description: 'O vendedor foi removido com sucesso.',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedSeller(null);
  };

  const openDeleteDialog = (seller: Seller) => {
    setSelectedSeller(seller);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Vendedores"
        description="Gerencie sua equipe de vendas"
        action={
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Vendedor
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar vendedores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Seller List */}
      {filteredSellers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum vendedor encontrado"
          description="Adicione seu primeiro vendedor para começar a atribuir projetos."
          actionLabel="Adicionar Vendedor"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSellers.map((seller) => {
            const projectCount = getProjectCount(seller.id);
            return (
              <Card key={seller.id} className="hover-lift group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <span className="text-lg font-bold text-muted-foreground">
                        {seller.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(seller)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(seller)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-3">{seller.name}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{seller.email}</span>
                    </div>
                    {seller.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {projectCount} {projectCount === 1 ? 'projeto' : 'projetos'} atribuídos
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
            </DialogTitle>
            <DialogDescription>
              {selectedSeller
                ? 'Atualize as informações do vendedor.'
                : 'Preencha os dados do novo vendedor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedSeller ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O vendedor "{selectedSeller?.name}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
