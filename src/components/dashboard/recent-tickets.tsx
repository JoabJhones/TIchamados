
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Ticket } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

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

export function RecentTickets({ tickets, isLoading }: { tickets: Ticket[], isLoading: boolean }) {
  const router = useRouter();

  const handleTicketClick = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Chamados Recentes</CardTitle>
        <CardDescription>
          Uma visão geral dos seus chamados mais recentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Prioridade</TableHead>
              <TableHead className="text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : tickets.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        Nenhum chamado encontrado.
                    </TableCell>
                </TableRow>
            ) : (
                tickets.map((ticket) => (
                <TableRow key={ticket.id} onClick={() => handleTicketClick(ticket.id)} className="cursor-pointer">
                    <TableCell>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground md:hidden">
                        {ticket.id}
                    </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", statusColorMap[ticket.status])} />
                            {ticket.status}
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    <Badge variant={priorityVariantMap[ticket.priority] || 'outline'}>
                        {ticket.priority}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    {format(ticket.createdAt, "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
