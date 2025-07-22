
'use client';
import { Activity, CircleCheck, Clock, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RecentTickets } from '@/components/dashboard/recent-tickets';
import { listenToTickets } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState, useRef } from 'react';
import type { Ticket } from '@/lib/types';

interface DashboardPageProps {
  playNewMessageSfx?: () => void;
}

export default function DashboardPage({ playNewMessageSfx }: DashboardPageProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenToTickets(user.id, user.role, (newTickets) => {
      if (isInitialLoad.current) {
        setTickets(newTickets);
        isInitialLoad.current = false;
      } else {
        // Check for new messages if the user is not an admin
        if (user.role !== 'admin') {
          newTickets.forEach(newTicket => {
            const oldTicket = tickets.find(t => t.id === newTicket.id);
            if (oldTicket && newTicket.interactions.length > oldTicket.interactions.length) {
              const newInteraction = newTicket.interactions[newTicket.interactions.length - 1];
              if (newInteraction.author.role === 'admin') {
                  playNewMessageSfx?.();
              }
            }
          });
        }
        setTickets(newTickets);
      }
      if (isLoading) setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, tickets, isLoading, playNewMessageSfx]);
  
  if (isLoading) {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  const openTickets = tickets.filter(t => t.status === 'Aberto').length;
  const inProgressTickets = tickets.filter(t => t.status === 'Em Andamento').length;
  const completedTickets = tickets.filter(t => t.status === 'Concluído').length;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Painel de Controle
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chamados Abertos
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando atribuição
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Andamento
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">
              Sendo atendidos no momento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídos
            </CardTitle>
            <CircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Resolvidos nos últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <RecentTickets tickets={tickets.slice(0, 10)} isLoading={isLoading}/>
      </div>
    </div>
  );
}
