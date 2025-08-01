export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Concluído' | 'Cancelado' | 'Aguardando Usuário';
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
  skills: string[];
  workload: number;
}

export interface TicketInteraction {
    id: string;
    author: Partial<User> | Partial<Technician>;
    content: string;
    createdAt: Date;
    isInternal: boolean;
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
  interactions: TicketInteraction[];
  userIsTyping?: boolean;
  technicianIsTyping?: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
  author: User;
}
