
'use client';

import { listenToTicketById, getTechnicians, addInteractionToTicket, updateTicketStatus, updateTicketPriority, assignTicketToTechnician, deleteTicket, updateTypingStatus } from "@/lib/mock-data";
import { notFound, useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowLeft, AtSign, Building, Phone, Send, Tag, User, Wand2, MessageSquare, Shield, Loader2, Trash2, Keyboard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/constants";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Ticket, Technician, TicketStatus, TicketPriority, User as UserType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const priorityVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Crítica': 'destructive',
  'Alta': 'default',
  'Média': 'secondary',
  'Baixa': 'outline',
};

const statusColorMap: { [key: string]: string } = {
    'Aberto': 'bg-blue-500',
    'Em Andamento': 'bg-yellow-500',
    'Concluído': 'bg-green-500',
    'Cancelado': 'bg-gray-500',
    'Aguardando Usuário': 'bg-orange-500',
}

export default function TicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(e.target.value);
        if (!user || !ticket) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        } else {
            // Started typing
            updateTypingStatus(ticket.id, user.role, true);
        }

        typingTimeoutRef.current = setTimeout(() => {
            // Stopped typing
            updateTypingStatus(ticket.id, user.role, false);
            typingTimeoutRef.current = null;
        }, 2000); // 2-second timeout
    };


    useEffect(() => {
        if (!ticketId) return;

        setIsLoading(true);
        const unsubscribe = listenToTicketById(ticketId, (updatedTicket) => {
            if (updatedTicket) {
                setTicket(updatedTicket);
            } else {
                notFound();
            }
            if (isLoading) setIsLoading(false);
        });

        // Fetch technicians if admin
        if (user?.role === 'admin') {
            getTechnicians().then(setTechnicians);
        }

        return () => {
             if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
             if (user && ticket) updateTypingStatus(ticketId, user.role, false);
             unsubscribe();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId, user?.role]);


    const handleUpdateTicket = async (updateFn: () => Promise<Ticket | null>, successMessage: string, errorMessage: string) => {
        try {
            const updatedTicket = await updateFn();
            if (updatedTicket) {
                toast({ title: "Sucesso!", description: successMessage });
            } else {
                throw new Error();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: errorMessage });
        }
    };

    const handleStatusChange = (status: TicketStatus) => {
        handleUpdateTicket(
            () => updateTicketStatus(ticket!.id, status),
            `Status do chamado atualizado para "${status}".`,
            "Não foi possível atualizar o status."
        );
    };

    const handlePriorityChange = (priority: TicketPriority) => {
        handleUpdateTicket(
            () => updateTicketPriority(ticket!.id, priority),
            `Prioridade do chamado atualizada para "${priority}".`,
            "Não foi possível atualizar a prioridade."
        );
    };

    const handleAssignTechnician = (techId: string) => {
        const technician = technicians.find(t => t.id === techId);
        handleUpdateTicket(
            () => assignTicketToTechnician(ticket!.id, technician || null),
            techId === 'unassigned' ? `Chamado não atribuído.` : `Chamado atribuído a ${technician!.name}.`,
            "Não foi possível atribuir o técnico."
        );
    };
    
    const handleDeleteTicket = async () => {
        if (!ticket) return;
        if (ticket.status !== 'Concluído') {
            toast({ variant: "destructive", title: "Ação não permitida", description: "O chamado só pode ser excluído após ser marcado como 'Concluído'." });
            return;
        }
        setIsDeleting(true);
        try {
            await deleteTicket(ticket.id);
            toast({ title: "Sucesso!", description: "O chamado foi excluído permanentemente." });
            router.push('/management');
        } catch (error) {
            toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível excluir o chamado." });
            setIsDeleting(false);
        }
    }


    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!ticket) {
        return null;
    }
    
    if (user?.role !== 'admin' && user?.id !== ticket.requester.id) {
        return (
             <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="font-headline text-3xl font-bold tracking-tight">Acesso Negado</h2>
                <p className="text-muted-foreground">Você não tem permissão para visualizar este chamado.</p>
            </div>
        )
    }

    const isAdmin = user?.role === 'admin';
    const isTyping = isAdmin ? ticket.userIsTyping : ticket.technicianIsTyping;
    const typingUser = isAdmin ? ticket.requester.name : (ticket.assignedTo?.name || "Técnico");


    const handleAddInteraction = async (isInternal: boolean) => {
        if (!newComment.trim() || !user || !ticket) return;
        setIsSubmitting(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        await updateTypingStatus(ticket.id, user.role, false);
        
        try {
            let author: UserType | Technician = user;
            if (isAdmin && ticket.assignedTo) {
                 author = ticket.assignedTo;
            }

            await addInteractionToTicket(ticket.id, author, newComment, isInternal);
            setNewComment("");
            toast({
                title: "Sucesso!",
                description: `Sua mensagem foi ${isInternal ? 'adicionada como um comentário interno' : 'enviada'}.`,
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Erro",
                description: "Ocorreu uma falha ao adicionar o comentário.",
            });
        } finally {
             setIsSubmitting(false);
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                   Detalhes do Chamado #{ticket.id.substring(0, 7)}...
                </h2>
                <Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{ticket.title}</CardTitle>
                             <CardDescription>
                                Criado em {format(ticket.createdAt, "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Interações</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-6">
                               {ticket.interactions.map(interaction => (
                                   <div key={interaction.id} className={cn("flex items-start gap-4", interaction.isInternal && "rounded-md border border-dashed border-yellow-500/50 bg-yellow-500/5 p-3")}>
                                        <Avatar className="h-9 w-9 border">
                                            {interaction.author.avatarUrl && <AvatarImage src={interaction.author.avatarUrl} alt={interaction.author.name} />}
                                            <AvatarFallback>{interaction.author.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none">{interaction.author.name}</p>
                                                <div className="flex items-center gap-2">
                                                    {interaction.isInternal && <Badge variant="outline" className="text-xs border-yellow-500/80 text-yellow-600"><Shield className="mr-1 h-3 w-3" /> Interno</Badge>}
                                                    <p className="text-xs text-muted-foreground">{format(interaction.createdAt, "dd/MM/yyyy HH:mm")}</p>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{interaction.content}</p>
                                        </div>
                                   </div>
                               ))}
                                
                                {isTyping && (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                         <Keyboard className="h-4 w-4" />
                                         <span>{typingUser} está digitando...</span>
                                     </div>
                                 )}

                                {(isAdmin || ticket.status !== 'Concluído') && (
                                   <>
                                    <Separator />
                                    <div>
                                        <Textarea 
                                            placeholder={isAdmin ? "Adicionar comentário interno ou responder ao usuário..." : "Adicionar um comentário..."} 
                                            className="mb-2" 
                                            value={newComment}
                                            onChange={handleTyping}
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex justify-end items-center gap-2">
                                             {isAdmin && (
                                                <Button variant="secondary" size="sm" onClick={() => handleAddInteraction(true)} disabled={isSubmitting || !newComment.trim()}>
                                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                                    Comentário Interno
                                                </Button>
                                             )}
                                            <Button className="bg-accent hover:bg-accent/90" size="sm" onClick={() => handleAddInteraction(false)} disabled={isSubmitting || !newComment.trim()}>
                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                {isAdmin ? 'Enviar para Usuário' : 'Enviar Comentário'}
                                            </Button>
                                        </div>
                                    </div>
                                   </>
                               )}
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-lg">Informações</CardTitle>
                             {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-7 w-7"
                                            disabled={isDeleting || ticket.status !== 'Concluído'}
                                            title="Excluir chamado"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o chamado e todas as suas interações.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteTicket} disabled={isDeleting}>
                                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Excluir'}
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-2">
                                <div className={cn("h-3 w-3 rounded-full", statusColorMap[ticket.status])} />
                                {isAdmin ? (
                                    <Select value={ticket.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="text-sm h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TICKET_STATUSES.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-sm">{ticket.status}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground mr-2">Categoria:</span>
                                 <Badge variant="outline">{ticket.category}</Badge>
                            </div>
                             <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground mr-2">Prioridade:</span>
                                {isAdmin ? (
                                    <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                                        <SelectTrigger className="text-sm h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TICKET_PRIORITIES.map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge>
                                )}
                            </div>

                            <Separator />

                            <h4 className="font-semibold">Solicitante</h4>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{ticket.requester.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AtSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{ticket.requester.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{ticket.requester.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{ticket.requester.contact}</span>
                            </div>

                             <Separator />

                            <h4 className="font-semibold">Técnico Responsável</h4>
                            {isAdmin ? (
                                <Select value={ticket.assignedTo?.id || 'unassigned'} onValueChange={handleAssignTechnician}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Atribuir a um técnico..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="unassigned">Não atribuído</SelectItem>
                                        {technicians.map(tech => (
                                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {ticket.assignedTo ? (
                                        <>
                                            <Avatar className="h-8 w-8">
                                                {ticket.assignedTo.avatarUrl && <AvatarImage src={ticket.assignedTo.avatarUrl} alt={ticket.assignedTo.name} />}
                                                <AvatarFallback>{ticket.assignedTo.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{ticket.assignedTo.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    