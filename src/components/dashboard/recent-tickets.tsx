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

export function RecentTickets({ tickets }: { tickets: Ticket[] }) {
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
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
