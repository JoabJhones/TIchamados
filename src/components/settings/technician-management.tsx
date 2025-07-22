
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addTechnician, getTechnicians } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Technician } from '@/lib/types';


const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  skills: z.string().min(3, 'Insira pelo menos uma habilidade.'),
});

export function TechnicianManagement() {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', skills: '' },
  });

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        const fetchedTechnicians = await getTechnicians();
        setTechnicians(fetchedTechnicians);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar técnicos',
          description: 'Não foi possível carregar a lista de técnicos.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchTechnicians();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const skillsArray = values.skills.split(',').map(s => s.trim());
      const newTechnician = await addTechnician({ ...values, skills: skillsArray });
      setTechnicians(prev => [...prev, newTechnician]);
      toast({
        title: 'Sucesso!',
        description: `Técnico ${newTechnician.name} cadastrado.`,
      });
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível cadastrar o técnico.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Cadastrar Novo Responsável</CardTitle>
          <CardDescription>Adicione um novo técnico à sua equipe de suporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
               {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Habilidades</Label>
              <Input id="skills" placeholder="Ex: Hardware, Rede, Software" {...form.register('skills')} />
              <p className="text-sm text-muted-foreground">Separe as habilidades por vírgula.</p>
               {form.formState.errors.skills && <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Técnico'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Técnicos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os técnicos disponíveis para atribuição.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Técnico</TableHead>
                            <TableHead>Habilidades</TableHead>
                            <TableHead className="text-right">Carga</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {technicians.map(tech => (
                            <TableRow key={tech.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={tech.avatarUrl} alt={tech.name} />
                                            <AvatarFallback>{tech.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{tech.name}</p>
                                            <p className="text-sm text-muted-foreground">{tech.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {tech.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{tech.workload}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
