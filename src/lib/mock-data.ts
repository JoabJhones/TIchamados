import type { Ticket, User, Technician, KnowledgeArticle } from './types';

const users: User[] = [
  { id: 'user-1', name: 'Ana Silva', email: 'ana.silva@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Vendas', contact: '1111' },
  { id: 'user-2', name: 'Bruno Costa', email: 'bruno.costa@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Financeiro', contact: '2222' },
  { id: 'user-3', name: 'Carla Dias', email: 'carla.dias@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Marketing', contact: '3333' },
  { id: 'admin-1', name: 'Admin', email: 'admin@elotech.com', avatarUrl: 'https://placehold.co/100x100', role: 'admin' },
];

const technicians: Technician[] = [
  { id: 'tech-1', name: 'Roberto Almeida', email: 'roberto.almeida@elotech.com', avatarUrl: 'https://placehold.co/100x100', skills: ['Hardware', 'Rede'], workload: 3 },
  { id: 'tech-2', name: 'Fernanda Lima', email: 'fernanda.lima@elotech.com', avatarUrl: 'https://placehold.co/100x100', skills: ['Software', 'Acesso'], workload: 5 },
  { id: 'tech-3', name: 'Gabriel Souza', email: 'gabriel.souza@elotech.com', avatarUrl: 'https://placehold.co/100x100', skills: ['Rede', 'Software', 'Hardware'], workload: 2 },
];

const tickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Computador não liga',
    description: 'Meu computador de mesa não está ligando desde ontem. Já verifiquei a tomada e o cabo de força, mas nada acontece. A luz do monitor acende, mas a CPU parece morta.',
    status: 'Aberto',
    priority: 'Alta',
    category: 'Hardware',
    requester: users[0],
    assignedTo: technicians[0],
    createdAt: new Date('2024-07-22T09:00:00Z'),
    updatedAt: new Date('2024-07-22T09:30:00Z'),
  },
  {
    id: 'TKT-002',
    title: 'Impressora offline',
    description: 'A impressora do departamento de finanças está aparecendo como offline para todos. Reiniciamos a impressora e o roteador, mas o problema persiste.',
    status: 'Em Andamento',
    priority: 'Média',
    category: 'Rede',
    requester: users[1],
    assignedTo: technicians[2],
    createdAt: new Date('2024-07-22T10:15:00Z'),
    updatedAt: new Date('2024-07-22T10:45:00Z'),
  },
  {
    id: 'TKT-003',
    title: 'Erro ao abrir o sistema de Vendas',
    description: 'Estou recebendo um erro "Falha na conexão com o banco de dados" ao tentar abrir o sistema de Vendas. Outros sistemas estão funcionando normalmente.',
    status: 'Concluído',
    priority: 'Crítica',
    category: 'Software',
    requester: users[2],
    assignedTo: technicians[1],
    createdAt: new Date('2024-07-21T14:00:00Z'),
    updatedAt: new Date('2024-07-21T16:30:00Z'),
  },
  {
    id: 'TKT-004',
    title: 'Solicitação de acesso à pasta compartilhada',
    description: 'Preciso de acesso de leitura e escrita à pasta compartilhada do projeto "Órion" na rede.',
    status: 'Aberto',
    priority: 'Baixa',
    category: 'Acesso',
    requester: users[0],
    createdAt: new Date('2024-07-23T08:30:00Z'),
    updatedAt: new Date('2024-07-23T08:30:00Z'),
  },
  {
    id: 'TKT-005',
    title: 'Wi-Fi instável na sala de reuniões',
    description: 'A conexão Wi-Fi na sala de reuniões "Aquário" está caindo constantemente durante as videochamadas.',
    status: 'Em Andamento',
    priority: 'Alta',
    category: 'Rede',
    requester: users[1],
    assignedTo: technicians[2],
    createdAt: new Date('2024-07-23T11:00:00Z'),
    updatedAt: new Date('2024-07-23T11:20:00Z'),
  },
];

const articles: KnowledgeArticle[] = [
    {
      id: 'KB-001',
      title: 'Como configurar uma VPN no Windows',
      category: 'Rede',
      content: 'Este guia passo a passo mostra como configurar uma conexão VPN no Windows 11...',
      createdAt: new Date('2024-06-10T10:00:00Z'),
      author: users[0],
    },
    {
      id: 'KB-002',
      title: 'Solucionando problemas comuns de impressora',
      category: 'Hardware',
      content: 'Sua impressora não está funcionando? Aqui estão os problemas mais comuns e como resolvê-los...',
      createdAt: new Date('2024-06-15T11:30:00Z'),
      author: users[1],
    },
];

export const getTickets = (userId?: string, userRole?: string) => {
    if (userRole === 'admin') {
        return tickets;
    }
    if (userId) {
        return tickets.filter(t => t.requester.id === userId);
    }
    return [];
};
export const getTicketById = (id: string) => tickets.find(t => t.id === id);
export const getUsers = () => users;
export const getTechnicians = () => technicians;
export const getKnowledgeArticles = () => articles;
export const TICKET_CATEGORIES: readonly string[] = ['Rede', 'Software', 'Hardware', 'Acesso', 'Outros'];
export const TICKET_PRIORITIES: readonly string[] = ['Baixa', 'Média', 'Alta', 'Crítica'];
