import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client, Project, Seller } from '@/types';

interface DataContextType {
  clients: Client[];
  projects: Project[];
  sellers: Seller[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSeller: (seller: Omit<Seller, 'id'>) => void;
  updateSeller: (id: string, seller: Partial<Seller>) => void;
  deleteSeller: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getProjectById: (id: string) => Project | undefined;
  getSellerById: (id: string) => Seller | undefined;
  getProjectsByClientId: (clientId: string) => Project[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data
const initialClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    phone: '(11) 99999-1234',
    email: 'maria.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'João Santos',
    phone: '(11) 98888-5678',
    email: 'joao.santos@email.com',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    phone: '(11) 97777-9012',
    email: 'ana.oliveira@email.com',
    createdAt: new Date('2024-03-10'),
  },
];

const initialSellers: Seller[] = [
  { id: '1', name: 'Carlos Mendes', email: 'carlos@empresa.com', phone: '(11) 91111-1111' },
  { id: '2', name: 'Fernanda Lima', email: 'fernanda@empresa.com', phone: '(11) 92222-2222' },
  { id: '3', name: 'Roberto Alves', email: 'roberto@empresa.com', phone: '(11) 93333-3333' },
];

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Reforma Cozinha Completa',
    clientId: '1',
    company: 'Caza 43',
    sellerId: '1',
    status: 'Em andamento',
    observations: 'Cliente prefere tons claros',
    environments: ['Cozinha'],
    measurementDate: new Date('2024-01-20'),
    measurementDeadline: new Date('2024-02-15'),
    deliveryAddress: 'Rua das Flores, 123 - São Paulo, SP',
    appliances: 'Fogão cooktop, Geladeira duplex, Microondas embutido',
    extras: [{ id: '1', name: 'Puxadores especiais', quantity: 12 }],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Projeto Quarto Suíte',
    clientId: '2',
    company: 'SOHO',
    sellerId: '2',
    status: 'Finalizado',
    environments: ['Quarto', 'Banheiro'],
    measurementDate: new Date('2024-02-25'),
    measurementDeadline: new Date('2024-03-20'),
    extras: [],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-25'),
  },
  {
    id: '3',
    name: 'Área Gourmet Premium',
    clientId: '3',
    company: 'ELIAS',
    sellerId: '3',
    status: 'Em andamento',
    environments: ['Churrasqueira', 'Área social'],
    appliances: 'Churrasqueira a gás, Adega climatizada',
    extras: [
      { id: '1', name: 'Bancada de mármore', quantity: 1 },
      { id: '2', name: 'Iluminação LED', quantity: 8 },
    ],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: generateId(),
      createdAt: new Date(),
    };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => (client.id === id ? { ...client, ...updates } : client))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const addSeller = (seller: Omit<Seller, 'id'>) => {
    const newSeller: Seller = {
      ...seller,
      id: generateId(),
    };
    setSellers((prev) => [...prev, newSeller]);
  };

  const updateSeller = (id: string, updates: Partial<Seller>) => {
    setSellers((prev) =>
      prev.map((seller) => (seller.id === id ? { ...seller, ...updates } : seller))
    );
  };

  const deleteSeller = (id: string) => {
    setSellers((prev) => prev.filter((seller) => seller.id !== id));
  };

  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getProjectById = (id: string) => projects.find((p) => p.id === id);
  const getSellerById = (id: string) => sellers.find((s) => s.id === id);
  const getProjectsByClientId = (clientId: string) =>
    projects.filter((p) => p.clientId === clientId);

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        sellers,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addSeller,
        updateSeller,
        deleteSeller,
        getClientById,
        getProjectById,
        getSellerById,
        getProjectsByClientId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
