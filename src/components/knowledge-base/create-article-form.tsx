
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { TICKET_CATEGORIES, addKnowledgeArticle } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
  title: z.string().min(10, {
    message: 'O título deve ter pelo menos 10 caracteres.',
  }),
  content: z.string().min(50, {
    message: 'O conteúdo deve ter pelo menos 50 caracteres.',
  }),
  category: z.string({
    required_error: 'Por favor, selecione uma categoria.',
  }),
});

export function CreateKnowledgeArticleForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Erro de autenticação', description: 'Você precisa estar logado.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        await addKnowledgeArticle({ ...values, author: user });
        toast({
            title: 'Artigo Criado!',
            description: 'O novo artigo foi adicionado à base de conhecimento.',
        });
        form.reset();
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Erro ao Criar Artigo',
            description: 'Não foi possível criar o artigo. Tente novamente.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Adicionar Novo Artigo</CardTitle>
            <CardDescription>Crie um novo artigo para a base de conhecimento.</CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Artigo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Como resetar a senha de rede" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria para o artigo" />
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Artigo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escreva o passo a passo ou a solução detalhada aqui..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                       <FormDescription>
                        Use uma linguagem clara e objetiva. Você pode incluir links e formatação básica.
                    </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Publicando...' : 'Publicar Artigo'}
                </Button>
              </form>
            </Form>
        </CardContent>
    </Card>
  );
}
