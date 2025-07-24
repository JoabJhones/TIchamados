
import type { Ticket, User, Technician, KnowledgeArticle, TicketPriority, TicketCategory, TicketInteraction, TicketStatus } from './types';
import { collection, addDoc, getDocs, doc, getDoc, query, where, writeBatch, orderBy, updateDoc, deleteDoc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

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

const processArticleDoc = (doc: any) => {
    const data = doc.data();
    if (!data) return null;
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
    } as KnowledgeArticle;
};

export const listenToKnowledgeArticles = (callback: (articles: KnowledgeArticle[]) => void): Unsubscribe => {
    const articlesCollection = collection(db, 'knowledgeArticles');
    const q = query(articlesCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
        const articles = querySnapshot.docs.map(processArticleDoc).filter((a): a is KnowledgeArticle => a !== null);
        callback(articles);
    }, (error) => {
        console.error("Error listening to knowledge articles:", error);
    });
};

export const addKnowledgeArticle = async (articleData: Omit<KnowledgeArticle, 'id' | 'createdAt'>) => {
    const newArticleData = {
        ...articleData,
        createdAt: new Date(),
    };
    const docRef = await addDoc(collection(db, 'knowledgeArticles'), newArticleData);
    return { id: docRef.id, ...newArticleData, createdAt: newArticleData.createdAt };
}


export const listenToTickets = (userId: string, userRole: 'admin' | 'user', callback: (tickets: Ticket[]) => void): Unsubscribe => {
    const ticketsCollection = collection(db, 'tickets');
    let q;

    if (userRole === 'admin') {
        q = query(ticketsCollection, orderBy('createdAt', 'desc'));
    } else {
        q = query(ticketsCollection, where('requester.id', '==', userId));
    }

    return onSnapshot(q, (querySnapshot) => {
        const tickets = querySnapshot.docs.map(processTicketDoc).filter((t): t is Ticket => t !== null);
        // Sort locally if not admin to avoid composite index
        if (userRole !== 'admin') {
            tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        callback(tickets);
    }, (error) => {
        console.error("Error listening to tickets:", error);
        // Handle error appropriately
    });
};


export const getTickets = async (userId?: string, userRole?: string): Promise<Ticket[]> => {
    const ticketsCollection = collection(db, 'tickets');
    let q;
    if (userRole === 'admin') {
        q = query(ticketsCollection, orderBy('createdAt', 'desc'));
    } else if (userId) {
        q = query(ticketsCollection, where('requester.id', '==', userId));
    } else {
        return [];
    }

    const querySnapshot = await getDocs(q);
    const tickets = querySnapshot.docs.map(processTicketDoc).filter((t): t is Ticket => t !== null);
    
    // Sort locally because Firestore requires an index for this query
    if (userRole !== 'admin') {
        tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return tickets;
};

export const addTicket = async (ticketData: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'interactions'> & {requester: User}) => {
    const newTicketData = {
        ...ticketData,
        status: 'Aberto',
        createdAt: new Date(),
        updatedAt: new Date(),
        interactions: [
             { id: `int-${Date.now()}`, author: ticketData.requester, content: 'Chamado criado.', createdAt: new Date(), isInternal: false }
        ],
        userIsTyping: false,
        technicianIsTyping: false,
    };
    const docRef = await addDoc(collection(db, "tickets"), newTicketData);
    return { id: docRef.id, ...newTicketData };
}

export const addInteractionToTicket = async (ticketId: string, author: User | Technician, content: string, isInternal: boolean): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (ticketSnap.exists()) {
        const ticketData = ticketSnap.data();
        
        const newInteraction: TicketInteraction = {
            id: `int-${Date.now()}`,
            author: {
                id: author.id,
                name: author.name,
                email: author.email,
                avatarUrl: author.avatarUrl,
                role: 'role' in author ? author.role : 'admin', // Technician doesn't have a role, default to admin
            },
            content,
            isInternal,
            createdAt: new Date(),
        };

        const currentInteractions = ticketData.interactions || [];
        const updatedInteractions = [...currentInteractions, newInteraction];

        let newStatus = ticketData.status;
        const authorIsAdmin = !('department' in author); // A simple way to check if author is a technician/admin

        if (!isInternal && ticketData.status !== 'Concluído' && ticketData.status !== 'Cancelado') {
             if(authorIsAdmin) {
                newStatus = 'Aguardando Usuário';
             } else if (ticketData.status === 'Aguardando Usuário') {
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

export const listenToTicketById = (id: string, callback: (ticket: Ticket | null) => void): Unsubscribe => {
    const ticketRef = doc(db, 'tickets', id);
    return onSnapshot(ticketRef, (doc) => {
        callback(processTicketDoc(doc));
    });
};

export const updateTypingStatus = async (ticketId: string, userRole: 'admin' | 'user', isTyping: boolean) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const updateData = userRole === 'admin' ? { technicianIsTyping: isTyping } : { userIsTyping: isTyping };
    await updateDoc(ticketRef, updateData);
};


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


export const getKnowledgeArticles = async (): Promise<KnowledgeArticle[]> => {
    const articlesCollection = collection(db, 'knowledgeArticles');
     const q = query(articlesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(processArticleDoc).filter((a): a is KnowledgeArticle => a !== null);
};
export const TICKET_CATEGORIES: readonly string[] = ['Rede', 'Software', 'Hardware', 'Acesso', 'Outros'];
export const TICKET_PRIORITIES: readonly string[] = ['Baixa', 'Média', 'Alta', 'Crítica'];
