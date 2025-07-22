
'use client';

import { getTicketById, getTechnicians } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowLeft, AtSign, Building, Phone, Send, Tag, User, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/constants";


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
}

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const ticket = getTicketById(params.id);
    const technicians = getTechnicians();

    if (!ticket) {
        notFound();
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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                   Detalhes do Chamado #{ticket.id}
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
                           <div className="space-y-4">
                               <div className="flex items-start gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={ticket.requester.avatarUrl} alt={ticket.requester.name} />
                                        <AvatarFallback>{ticket.requester.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{ticket.requester.name} <span className="text-xs text-muted-foreground font-normal">abriu o chamado</span></p>
                                        <p className="text-xs text-muted-foreground">{format(ticket.createdAt, "dd/MM/yyyy HH:mm")}</p>
                                    </div>
                               </div>
                               {isAdmin && (
                                   <>
                                    <Separator />
                                    <div>
                                        <Textarea placeholder="Adicionar comentário interno ou responder ao usuário..." className="mb-2" />
                                        <div className="flex justify-between items-center">
                                             <Button variant="outline" size="sm">
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Modelos de Resposta
                                            </Button>
                                            <div>
                                                <Button variant="secondary" size="sm" className="mr-2">Comentário Interno</Button>
                                                <Button className="bg-accent hover:bg-accent/90" size="sm">
                                                    <Send className="mr-2 h-4 w-4" />
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

