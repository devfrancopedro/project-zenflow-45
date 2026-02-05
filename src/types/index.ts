export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  createdAt: Date;
}

export interface Extra {
  id: string;
  name: string;
  quantity: number;
}

export interface Measurement {
  id: string;
  name: string;
  value: string;
}

export type ProjectFileType =
  | 'pdf'
  | 'image'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  | 'other';

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  type: ProjectFileType;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}

export type Company = "Caza 43" | "SOHO" | "ELIAS";
export type ProjectStatus = "Em andamento" | "Finalizado" | "Aguardando" | "Cancelado";
export type Environment = "Cozinha" | "Quarto" | "Banheiro" | "Área social" | "Escritório" | "Churrasqueira";

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  company: Company;
  sellerId: string;
  status: ProjectStatus;
  observations?: string;
  environments: Environment[];
  measurementDate?: Date;
  measurementDeadline?: Date;
  deliveryAddress?: string;
  appliances?: string;
  extras: Extra[];
  measurements: Measurement[];
  images: ProjectImage[];
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
}
