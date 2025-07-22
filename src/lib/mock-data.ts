
import type { Ticket, User, Technician, KnowledgeArticle, TicketPriority, TicketCategory, TicketInteraction } from './types';
import { collection, addDoc, getDocs, doc, getDoc, query, where, writeBatch, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const users: User[] = [
  { id: 'user-1', name: 'Ana Silva', email: 'ana.silva@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Vendas', contact: '1111' },
  { id: 'user-2', name: 'Bruno Costa', email: 'bruno.costa@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Financeiro', contact: '2222' },
  { id: 'user-3', name: 'Carla Dias', email: 'carla.dias@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Marketing', contact: '3333' },
  { id: 'admin-1', name: 'Admin', email: 'admin@elotech.com', avatarUrl: 'https://placehold.co/100x100', role: 'admin' },
];


let tickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Computador não liga',
    description: 'Meu computador de mesa não está ligando desde ontem. Já verifiquei a tomada e o cabo de força, mas nada acontece. A luz do monitor acende, mas a CPU parece morta.',
    status: 'Aberto',
    priority: 'Alta',
    category: 'Hardware',
    requester: users[0],
    assignedTo: undefined,
    createdAt: new Date('2024-07-22T09:00:00Z'),
    updatedAt: new Date('2024-07-22T09:30:00Z'),
    interactions: [
      { id: 'int-1', author: users[0], content: 'Chamado criado.', createdAt: new Date('2024-07-22T09:00:00Z'), isInternal: false }
    ]
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

export const getTickets = async (userId?: string, userRole?: string): Promise<Ticket[]> => {
    const ticketsCollection = collection(db, 'tickets');
    let q;
    if (userRole === 'admin') {
        q = query(ticketsCollection, orderBy('createdAt', 'desc'));
    } else if (userId) {
        q = query(ticketsCollection, where('requester.id', '==', userId), orderBy('createdAt', 'desc'));
    } else {
        return [];
    }

    const querySnapshot = await getDocs(q);
    const tickets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            interactions: data.interactions.map((interaction: any) => ({
                ...interaction,
                createdAt: interaction.createdAt.toDate()
            }))
        } as Ticket;
    });

    return tickets;
};

export const addTicket = async (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'interactions'> & {requester: User}) => {
    const newTicketData = {
        ...ticketData,
        status: 'Aberto',
        createdAt: new Date(),
        updatedAt: new Date(),
        interactions: [
             { author: ticketData.requester, content: 'Chamado criado.', createdAt: new Date(), isInternal: false }
        ]
    };
    const docRef = await addDoc(collection(db, "tickets"), newTicketData);
    return { id: docRef.id, ...newTicketData };
}

export const addInteractionToTicket = async (ticketId: string, author: User | Technician, content: string, isInternal: boolean): Promise<Ticket | undefined> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
        const ticket = ticketSnap.data() as Ticket;
        const newInteraction = {
            id: `int-${Date.now()}`,
            author,
            content,
            isInternal,
            createdAt: new Date(),
        };

        const currentInteractions = ticket.interactions || [];
        const updatedInteractions = [...currentInteractions, newInteraction];

        let newStatus = ticket.status;
        if (!isInternal && ticket.status !== 'Concluído' && ticket.status !== 'Cancelado') {
             if(author.role === 'admin') {
                newStatus = 'Aguardando Usuário';
             } else {
                newStatus = 'Em Andamento';
             }
        }

        const batch = writeBatch(db);
        batch.update(ticketRef, { 
            interactions: updatedInteractions, 
            updatedAt: new Date(),
            status: newStatus 
        });
        await batch.commit();

        const updatedTicketSnap = await getDoc(ticketRef);
        const updatedData = updatedTicketSnap.data();
        if (!updatedData) return undefined;
        
        return {
            id: updatedTicketSnap.id,
            ...updatedData,
            createdAt: updatedData.createdAt.toDate(),
            updatedAt: updatedData.updatedAt.toDate(),
            interactions: updatedData.interactions.map((interaction: any) => ({
                ...interaction,
                createdAt: interaction.createdAt.toDate()
            }))
        } as Ticket;
    }
    return undefined;
};


export const getTicketById = async (id: string): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
        const data = ticketSnap.data();
        return {
            id: ticketSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            interactions: data.interactions.map((interaction: any) => ({
                ...interaction,
                createdAt: interaction.createdAt.toDate()
            }))
        } as Ticket;
    }
    return null;
}
export const getUsers = () => users;

export const getTechnicians = async (): Promise<Technician[]> => {
    const techniciansCollection = collection(db, 'technicians');
    const querySnapshot = await getDocs(techniciansCollection);
    const technicians = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Technician));
    return technicians;
};


export const addTechnician = async (techData: Omit<Technician, 'id' | 'avatarUrl' | 'workload'>) => {
    const newTechnicianData = {
        ...techData,
        avatarUrl: `https://placehold.co/100x100?text=${techData.name[0]}`,
        workload: 0,
    };
    const docRef = await addDoc(collection(db, "technicians"), newTechnicianData);
    return { id: docRef.id, ...newTechnicianData };
}

export const getKnowledgeArticles = () => articles;
export const TICKET_CATEGORIES: readonly string[] = ['Rede', 'Software', 'Hardware', 'Acesso', 'Outros'];
export const TICKET_PRIORITIES: readonly string[] = ['Baixa', 'Média', 'Alta', 'Crítica'];
