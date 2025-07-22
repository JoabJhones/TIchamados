
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Wand2, Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, addTicket } from '@/lib/mock-data';
import { getAiSuggestions } from '@/lib/actions';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(5, {
    message: 'O título deve ter pelo menos 5 caracteres.',
  }),
  description: z.string().min(20, {
    message: 'A descrição deve ter pelo menos 20 caracteres.',
  }),
  category: z.string({
    required_error: 'Por favor, selecione uma categoria.',
  }),
  priority: z.string({
    required_error: 'Por favor, selecione uma prioridade.',
  }),
});

export function CreateTicketForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleSuggestion = async () => {
    const description = form.getValues('description');
    if (!description || description.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Descrição muito curta',
        description: 'Por favor, forneça mais detalhes na descrição antes de usar a sugestão de IA.',
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await getAiSuggestions(description);
      if (result.category) {
        form.setValue('category', result.category, { shouldValidate: true });
      }
      if (result.priority) {
        form.setValue('priority', result.priority, { shouldValidate: true });
      }
      toast({
        title: 'Sugestões aplicadas!',
        description: 'A categoria e a prioridade foram preenchidas pela IA.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na Sugestão',
        description: 'Não foi possível obter sugestões da IA. Tente novamente.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro de autenticação', description: 'Você precisa estar logado para criar um chamado.' });
        return;
    }
    
    setIsSubmitting(true);
    
    const newTicket = {
      id: `TKT-${String(Date.now()).slice(-5)}`,
      status: 'Aberto' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      requester: user,
      ...values,
    };
    
    // Simulate API call
    setTimeout(() => {
        addTicket(newTicket);
        toast({
            title: 'Chamado Criado!',
            description: 'Seu chamado foi enviado para a nossa equipe de suporte.',
        });
        form.reset();
        router.push('/');
        setIsSubmitting(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Computador não liga" {...field} />
              </FormControl>
              <FormDescription>
                Um resumo curto e direto do seu problema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o problema com o máximo de detalhes possível..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Quanto mais detalhes você fornecer, mais rápido poderemos ajudar.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4 rounded-lg border bg-card-foreground/5 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-headline">Classificação</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestion} disabled={isSuggesting || isSubmitting}>
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Sugerir com IA
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {TICKET_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                            {cat}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma prioridade" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {TICKET_PRIORITIES.map((prio) => (
                            <SelectItem key={prio} value={prio}>
                            {prio}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>
        <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Enviando...' : 'Enviar Chamado'}
        </Button>
      </form>
    </Form>
  );
}
