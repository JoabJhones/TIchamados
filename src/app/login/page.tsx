
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
import { Loader2 } from 'lucide-react';

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
      }
    } catch (error: any) {
       let description = 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.';
       // Firebase auth error codes for invalid credentials or user not found
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
           description = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
       } else if (error.code === 'auth/too-many-requests') {
            description = 'Acesso temporariamente bloqueado devido a muitas tentativas. Tente novamente mais tarde.';
       }
       toast({
          variant: 'destructive',
          title: 'Falha no Login',
          description: description,
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
