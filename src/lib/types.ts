export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Cancelado';
export type TicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type TicketCategory = 'Rede' | 'Software' | 'Hardware' | 'Acesso' | 'Outros';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'user';
  department?: string;
  contact?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  skills: (TicketCategory | 'Outros')[];
  workload: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requester: User;
  assignedTo?: Technician;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
  author: User;
}
