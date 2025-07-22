
import type { Ticket, User, Technician, KnowledgeArticle, TicketPriority, TicketCategory, TicketInteraction, TicketStatus } from './types';
import { collection, addDoc, getDocs, doc, getDoc, query, where, writeBatch, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const articles: KnowledgeArticle[] = [
    {
      id: 'KB-001',
      title: 'Como configurar uma VPN no Windows',
      category: 'Rede',
      content: 'Este guia passo a passo mostra como configurar uma conexão VPN no Windows 11...',
      createdAt: new Date('2024-06-10T10:00:00Z'),
      author: { id: 'user-1', name: 'Ana Silva', email: 'ana.silva@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Vendas', contact: '1111' },
    },
    {
      id: 'KB-002',
      title: 'Solucionando problemas comuns de impressora',
      category: 'Hardware',
      content: 'Sua impressora não está funcionando? Aqui estão os problemas mais comuns e como resolvê-los...',
      createdAt: new Date('2024-06-15T11:30:00Z'),
      author: { id: 'user-2', name: 'Bruno Costa', email: 'bruno.costa@example.com', avatarUrl: 'https://placehold.co/100x100', role: 'user', department: 'Financeiro', contact: '2222' },
    },
];

const processTicketDoc = (doc: any) => {
    const data = doc.data();
    if (!data) return null;
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        interactions: (data.interactions || []).map((interaction: any) => ({
            ...interaction,
            createdAt: interaction.createdAt.toDate()
        }))
    } as Ticket;
};

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
    return querySnapshot.docs.map(processTicketDoc).filter((t): t is Ticket => t !== null);
};

export const addTicket = async (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'interactions'> & {requester: User}) => {
    const newTicketData = {
        ...ticketData,
        status: 'Aberto',
        createdAt: new Date(),
        updatedAt: new Date(),
        interactions: [
             { id: `int-${Date.now()}`, author: ticketData.requester, content: 'Chamado criado.', createdAt: new Date(), isInternal: false }
        ]
    };
    const docRef = await addDoc(collection(db, "tickets"), newTicketData);
    return { id: docRef.id, ...newTicketData };
}

export const addInteractionToTicket = async (ticketId: string, author: User | Technician, content: string, isInternal: boolean): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
        const ticketData = ticketSnap.data();
        const authorRole = 'role' in author ? author.role : 'technician';
        
        const newInteraction: TicketInteraction = {
            id: `int-${Date.now()}`,
            author: { // Storing a minimal author object
                id: author.id,
                name: author.name,
                email: author.email,
                avatarUrl: author.avatarUrl,
                role: authorRole === 'admin' || authorRole === 'user' ? authorRole : undefined,
            },
            content,
            isInternal,
            createdAt: new Date(),
        };

        const currentInteractions = ticketData.interactions || [];
        const updatedInteractions = [...currentInteractions, newInteraction];

        let newStatus = ticketData.status;
        if (!isInternal && ticketData.status !== 'Concluído' && ticketData.status !== 'Cancelado') {
             if(authorRole === 'admin') {
                newStatus = 'Aguardando Usuário';
             } else { // User or Technician without admin role
                newStatus = 'Em Andamento';
             }
        }
        
        await updateDoc(ticketRef, { 
            interactions: updatedInteractions, 
            updatedAt: new Date(),
            status: newStatus 
        });
        
        const updatedTicketSnap = await getDoc(ticketRef);
        return processTicketDoc(updatedTicketSnap);
    }
    return null;
};


export const getTicketById = async (id: string): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);
    return ticketSnap.exists() ? processTicketDoc(ticketSnap) : null;
}

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
        avatarUrl: `https://placehold.co/100x100.png`,
        workload: 0,
    };
    const docRef = await addDoc(collection(db, "technicians"), newTechnicianData);
    return { id: docRef.id, ...newTechnicianData };
}

const updateTicketAndReturn = async (ticketId: string, dataToUpdate: object): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, { ...dataToUpdate, updatedAt: new Date() });
    const updatedSnap = await getDoc(ticketRef);
    return processTicketDoc(updatedSnap);
};

export const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    return updateTicketAndReturn(ticketId, { status });
};

export const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    return updateTicketAndReturn(ticketId, { priority });
};

export const assignTicketToTechnician = (ticketId: string, technician: Technician | null) => {
    return updateTicketAndReturn(ticketId, { assignedTo: technician });
};

export const deleteTicket = async (ticketId: string): Promise<void> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    await deleteDoc(ticketRef);
};


export const getKnowledgeArticles = () => articles;
export const TICKET_CATEGORIES: readonly string[] = ['Rede', 'Software', 'Hardware', 'Acesso', 'Outros'];
export const TICKET_PRIORITIES: readonly string[] = ['Baixa', 'Média', 'Alta', 'Crítica'];
