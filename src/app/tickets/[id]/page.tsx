
'use client';

import { getTicketById, getTechnicians, addInteractionToTicket } from "@/lib/mock-data";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowLeft, AtSign, Building, Phone, Send, Tag, User, Wand2, MessageSquare, Shield, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/constants";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Ticket, Technician } from "@/lib/types";

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
    const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTicketDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTicket = await getTicketById(ticketId);
            if (fetchedTicket) {
                setTicket(fetchedTicket);
            } else {
                notFound();
            }

            if (user?.role === 'admin') {
                const fetchedTechnicians = await getTechnicians();
                setTechnicians(fetchedTechnicians);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os detalhes do chamado."});
            notFound();
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, user?.role, toast]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!ticket) {
        // This case is handled by notFound(), but it's good for type safety
        return null;
    }
    
    // Authorization: only admin or the ticket requester can see the ticket
    if (user?.role !== 'admin' && user?.id !== ticket.requester.id) {
        return (
             <div className="flex-1 space-y-4 p-8 pt-6">
                <h2 className="font-headline text-3xl font-bold tracking-tight">Acesso Negado</h2>
                <p className="text-muted-foreground">Você não tem permissão para visualizar este chamado.</p>
            </div>
        )
    }

    const isAdmin = user?.role === 'admin';

    const handleAddInteraction = async (isInternal: boolean) => {
        if (!newComment.trim() || !user) return;
        setIsSubmitting(true);
        
        try {
            const updatedTicket = await addInteractionToTicket(ticket.id, user, newComment, isInternal);
            if (updatedTicket) {
                setTicket(updatedTicket); // Update state to re-render
                setNewComment("");
                toast({
                    title: "Sucesso!",
                    description: `Sua mensagem foi ${isInternal ? 'adicionada como um comentário interno' : 'enviada para o usuário'}.`,
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Erro",
                    description: "Não foi possível adicionar o comentário.",
                });
            }
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
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => window.history.back()}>
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
                                            <AvatarImage src={interaction.author.avatarUrl} alt={interaction.author.name} />
                                            <AvatarFallback>{interaction.author.name[0]}</AvatarFallback>
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

                               {isAdmin && (
                                   <>
                                    <Separator />
                                    <div>
                                        <Textarea 
                                            placeholder="Adicionar comentário interno ou responder ao usuário..." 
                                            className="mb-2" 
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex justify-between items-center">
                                             <Button variant="outline" size="sm" disabled>
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Modelos de Resposta
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleAddInteraction(true)} disabled={isSubmitting || !newComment.trim()}>
                                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                                    Comentário Interno
                                                </Button>
                                                <Button className="bg-accent hover:bg-accent/90" size="sm" onClick={() => handleAddInteraction(false)} disabled={isSubmitting || !newComment.trim()}>
                                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                    Enviar para Usuário
                                                </Button>
                                            </div>
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
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{backgroundColor: statusColorMap[ticket.status]}} />
                                {isAdmin ? (
                                    <Select defaultValue={ticket.status}>
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
                                 {isAdmin ? (
                                     <Badge variant="outline">{ticket.category}</Badge>
                                 ) : (
                                     <span className="text-sm">{ticket.category}</span>
                                 )}
                            </div>
                             <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground mr-2">Prioridade:</span>
                                {isAdmin ? (
                                    <Select defaultValue={ticket.priority}>
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
                                <Select defaultValue={ticket.assignedTo?.id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Atribuir a um técnico..." />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                                <AvatarImage src={ticket.assignedTo.avatarUrl} alt={ticket.assignedTo.name} />
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
