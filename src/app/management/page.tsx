
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTickets } from "@/lib/mock-data";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { TicketCharts } from "@/components/management/ticket-charts";
import { RecentTickets } from "@/components/dashboard/recent-tickets";

export default function ManagementPage() {
    const tickets = getTickets();
    const openTickets = tickets.filter(t => t.status === 'Aberto').length;
    const inProgressTickets = tickets.filter(t => t.status === 'Em Andamento').length;
    const criticalTickets = tickets.filter(t => t.priority === 'Crítica').length;
    const completedTickets = tickets.filter(t => t.status === 'Concluído').length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Painel de Gerenciamento
        </h2>
        <p className="text-muted-foreground">
            Uma visão geral e em tempo real dos chamados da equipe de TI.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">Aguardando atribuição</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">Sendo atendidos pela equipe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalTickets}</div>
            <p className="text-xs text-muted-foreground">Chamados com prioridade crítica</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTickets}</div>
            <p className="text-xs text-muted-foreground">Resolvidos pela equipe</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
             <TicketCharts tickets={tickets} />
        </div>
        <div className="col-span-1 lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Atividade Recente</CardTitle>
                    <CardDescription>Chamados que foram atualizados recentemente.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <RecentTickets tickets={tickets.slice(0,5)} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
