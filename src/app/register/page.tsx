'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newUser = await register({ name, email, department, contact, password });
      if (newUser) {
        toast({ title: 'Cadastro realizado com sucesso!', description: `Bem-vindo, ${newUser.name}!` });
        router.push('/');
      } else {
        throw new Error();
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Erro no Cadastro',
          description: 'Não foi possível realizar o cadastro. Verifique os dados ou tente novamente.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="mx-auto max-w-sm w-full">
         <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
                <Logo className="h-10 w-10 text-primary"/>
            </div>
          <CardTitle className="text-2xl font-bold font-headline">Cadastro | EloTech</CardTitle>
          <CardDescription>Crie sua conta para abrir e acompanhar chamados</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Seu nome" required value={name} onChange={e => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="department">Setor</Label>
                <Input id="department" placeholder="Ex: Financeiro" required value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="contact">Ramal/Telefone</Label>
                <Input id="contact" placeholder="Ex: 4001" required value={contact} onChange={e => setContact(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="underline">
                    Entrar
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
