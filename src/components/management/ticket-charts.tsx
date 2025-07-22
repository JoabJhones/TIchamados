
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Ticket } from "@/lib/types"

const chartConfigCategory = {
  Hardware: { label: "Hardware", color: "hsl(var(--chart-1))" },
  Software: { label: "Software", color: "hsl(var(--chart-2))" },
  Rede: { label: "Rede", color: "hsl(var(--chart-3))" },
  Acesso: { label: "Acesso", color: "hsl(var(--chart-4))" },
  Outros: { label: "Outros", color: "hsl(var(--chart-5))" },
}

const chartConfigStatus = {
    Aberto: { label: "Aberto", color: "hsl(var(--primary))" },
    "Em Andamento": { label: "Em Andamento", color: "hsl(var(--chart-4))" },
    Concluído: { label: "Concluído", color: "hsl(var(--accent))" },
    Cancelado: { label: "Cancelado", color: "hsl(var(--muted-foreground))" },
}


export function TicketCharts({ tickets }: { tickets: Ticket[] }) {
  const ticketsByCategory = tickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.keys(ticketsByCategory).map(category => ({
    name: category,
    total: ticketsByCategory[category],
    fill: chartConfigCategory[category as keyof typeof chartConfigCategory]?.color
  }))

  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

 const statusData = Object.keys(ticketsByStatus).map(status => ({
    name: status,
    value: ticketsByStatus[status],
    fill: chartConfigStatus[status as keyof typeof chartConfigStatus]?.color
  }));

  return (
     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
        <CardHeader>
          <CardTitle className="font-headline">Chamados por Categoria</CardTitle>
          <CardDescription>Distribuição de chamados nas categorias.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigCategory} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={categoryData} layout="vertical" margin={{ left: 10 }}>
               <CartesianGrid horizontal={false} />
               <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 10)}
              />
              <XAxis dataKey="total" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="total" layout="vertical" radius={5} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-headline">Chamados por Status</CardTitle>
           <CardDescription>Visão geral do status dos chamados.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfigStatus}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                 {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
               <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
     </div>
  )
}
