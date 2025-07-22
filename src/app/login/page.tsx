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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login({ email, pass: password });
      if (user) {
        toast({ title: 'Login bem-sucedido!', description: `Bem-vindo de volta, ${user.name}.` });
        router.push('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Falha no Login',
          description: 'Usuário ou senha inválidos. Por favor, tente novamente.',
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Ocorreu um erro ao tentar fazer login.',
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
          <CardTitle className="text-2xl font-bold font-headline">Login | EloTech</CardTitle>
          <CardDescription>Insira suas credenciais para acessar o portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Usuário</Label>
              <Input
                id="email"
                type="text"
                placeholder="Digite seu usuário"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
            <div className="mt-4 text-center text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="underline">
                    Cadastre-se
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
