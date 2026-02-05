import { useMemo, useRef, useState } from 'react';
import {
  File as FileIcon,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  Pencil,
  UploadCloud,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
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
import { useToast } from '@/hooks/use-toast';
import { Project, ProjectFile, ProjectFileType } from '@/types';
import { useData } from '@/contexts/DataContext';

type SortField = 'name' | 'type' | 'uploadedAt';
type SortDirection = 'asc' | 'desc';

interface ProjectFilesProps {
  project: Project;
  canManageFiles?: boolean;
}

function getFileType(file: File): ProjectFileType {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return 'image';
  if (['doc', 'docx'].includes(ext || '')) return 'document';
  if (['xls', 'xlsx'].includes(ext || '')) return 'spreadsheet';
  if (['zip', 'rar'].includes(ext || '')) return 'archive';

  return 'other';
}

function getFileIcon(type: ProjectFileType) {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'image':
      return FileImage;
    case 'document':
      return FileText;
    case 'spreadsheet':
      return FileSpreadsheet;
    case 'archive':
      return FileArchive;
    default:
      return FileIcon;
  }
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function ProjectFiles({ project, canManageFiles = true }: ProjectFilesProps) {
  const { updateProject } = useData();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<ProjectFile | null>(null);
  const [renamingFile, setRenamingFile] = useState<ProjectFile | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const files = project.files || [];

  const filteredAndSortedFiles = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(term),
    );

    const sorted = [...filtered].sort((a, b) => {
      let compare = 0;
      if (sortField === 'name') {
        compare = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        compare = a.type.localeCompare(b.type);
      } else if (sortField === 'uploadedAt') {
        compare = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      return sortDirection === 'asc' ? compare : -compare;
    });

    return sorted;
  }, [files, search, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const handleFilesAddToProject = (newFiles: ProjectFile[]) => {
    try {
      updateProject(project.id, {
        files: [...files, ...newFiles],
      });
      toast({
        title: 'Arquivos adicionados',
        description: `${newFiles.length} arquivo(s) foram anexados ao projeto.`,
      });
    } catch {
      toast({
        title: 'Erro ao adicionar arquivos',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    }
  };

  const simulateUpload = (id: string) => {
    setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

    const start = Date.now();
    const duration = 1200 + Math.random() * 800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setUploadProgress((prev) => ({ ...prev, [id]: progress }));

      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setUploadProgress((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }, 400);
      }
    };

    requestAnimationFrame(tick);
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || !canManageFiles) return;

    const now = new Date();
    const newFiles: ProjectFile[] = [];

    Array.from(fileList).forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9);
      const url = URL.createObjectURL(file);

      const newFile: ProjectFile = {
        id,
        name: file.name,
        url,
        size: file.size,
        mimeType: file.type,
        type: getFileType(file),
        uploadedAt: now,
        // Placeholder até integração com autenticação real
        uploadedBy: 'Usuário atual',
      };

      newFiles.push(newFile);
      simulateUpload(id);
    });

    if (newFiles.length > 0) {
      handleFilesAddToProject(newFiles);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    // Permitir o mesmo arquivo de novo
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDownload = (file: ProjectFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast({
        title: 'Erro ao baixar arquivo',
        description: 'Não foi possível iniciar o download.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (!fileToDelete) return;
    try {
      updateProject(project.id, {
        files: files.filter((f) => f.id !== fileToDelete.id),
      });
      toast({
        title: 'Arquivo removido',
        description: `"${fileToDelete.name}" foi excluído do projeto.`,
      });
    } catch {
      toast({
        title: 'Erro ao excluir arquivo',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setFileToDelete(null);
    }
  };

  const handleRename = () => {
    if (!renamingFile) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    try {
      updateProject(project.id, {
        files: files.map((f) =>
          f.id === renamingFile.id ? { ...f, name: trimmed } : f,
        ),
      });
      toast({
        title: 'Arquivo renomeado',
        description: 'O nome do arquivo foi atualizado.',
      });
    } catch {
      toast({
        title: 'Erro ao renomear arquivo',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setRenamingFile(null);
      setRenameValue('');
    }
  };

  const canPreview = (file: ProjectFile) =>
    file.type === 'image' || file.type === 'pdf';

  const hasUploadsInProgress = Object.keys(uploadProgress).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Arquivos do Projeto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Anexe contratos, plantas, imagens da obra e outros documentos.
          </p>
        </div>
        {canManageFiles && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Adicionar arquivos
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.zip,.rar"
            />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {canManageFiles && (
          <div
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
            <p className="text-sm font-medium">
              Arraste e solte arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground">
              ou clique em &quot;Adicionar arquivos&quot; para selecionar do seu
              computador.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Formatos: PDF, imagens (JPG, PNG, WEBP), DOC, DOCX, XLS, XLSX, ZIP, RAR
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Ordenar por:</span>
            <button
              type="button"
              className={`rounded-full border px-2 py-1 ${
                sortField === 'uploadedAt' ? 'border-primary text-primary' : ''
              }`}
              onClick={() => handleSortChange('uploadedAt')}
            >
              Data
            </button>
            <button
              type="button"
              className={`rounded-full border px-2 py-1 ${
                sortField === 'name' ? 'border-primary text-primary' : ''
              }`}
              onClick={() => handleSortChange('name')}
            >
              Nome
            </button>
            <button
              type="button"
              className={`rounded-full border px-2 py-1 ${
                sortField === 'type' ? 'border-primary text-primary' : ''
              }`}
              onClick={() => handleSortChange('type')}
            >
              Tipo
            </button>
          </div>
        </div>

        {hasUploadsInProgress && (
          <div className="space-y-2 rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Enviando arquivos...</span>
              <span className="text-muted-foreground">
                {Object.keys(uploadProgress).length} em andamento
              </span>
            </div>
            <Progress
              value={
                Object.values(uploadProgress).reduce((acc, v) => acc + v, 0) /
                Object.values(uploadProgress).length
              }
            />
          </div>
        )}

        {filteredAndSortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-muted/20 py-6 text-center">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Nenhum arquivo anexado a este projeto.
            </p>
            <p className="text-xs text-muted-foreground">
              Use o botão &quot;Adicionar arquivos&quot; para começar.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead className="hidden sm:table-cell">Tamanho</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Enviado por
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFiles.map((file) => {
                  const Icon = getFileIcon(file.type);
                  const isUploading = uploadProgress[file.id] !== undefined;

                  return (
                    <TableRow key={file.id} className="align-middle">
                      <TableCell className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {file.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                              <Badge
                                variant="outline"
                                className="border-dashed text-[10px]"
                              >
                                {file.type === 'pdf'
                                  ? 'PDF'
                                  : file.type === 'image'
                                  ? 'Imagem'
                                  : file.type === 'document'
                                  ? 'Documento'
                                  : file.type === 'spreadsheet'
                                  ? 'Planilha'
                                  : file.type === 'archive'
                                  ? 'Compactado'
                                  : 'Outro'}
                              </Badge>
                              {isUploading && (
                                <span className="text-[10px] text-muted-foreground">
                                  Enviando...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="mt-2 w-40">
                            <Progress value={uploadProgress[file.id]} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(file.uploadedAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {file.uploadedBy}
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        {canPreview(file) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Visualizar"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Baixar"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                        {canManageFiles && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Renomear"
                              onClick={() => {
                                setRenamingFile(file);
                                setRenameValue(file.name);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Excluir"
                              onClick={() => setFileToDelete(file)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Preview modal */}
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile?.name}</DialogTitle>
            </DialogHeader>
            {previewFile && previewFile.type === 'image' && (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
            )}
            {previewFile && previewFile.type === 'pdf' && (
              <iframe
                src={previewFile.url}
                title={previewFile.name}
                className="h-[70vh] w-full rounded-md border"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog
          open={!!fileToDelete}
          onOpenChange={(open) => {
            if (!open) setFileToDelete(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O arquivo &quot;
                {fileToDelete?.name}
                &quot; será removido permanentemente deste projeto.
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

        {/* Rename dialog (usa Dialog simples para facilitar) */}
        <Dialog
          open={!!renamingFile}
          onOpenChange={(open) => {
            if (!open) {
              setRenamingFile(null);
              setRenameValue('');
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Renomear arquivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRenamingFile(null);
                    setRenameValue('');
                  }}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleRename}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

