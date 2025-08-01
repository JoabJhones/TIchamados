
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookText,
  Home,
  LogOut,
  PlusCircle,
  Settings,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { useAuth } from '@/contexts/auth-context';
import React, { useRef } from 'react';
import { AudioController, AudioControllerRef } from './audio-controller';

const navItems = [
  { href: '/', label: 'Painel', icon: Home, admin: false },
  { href: '/tickets/new', label: 'Novo Chamado', icon: PlusCircle, admin: false },
  { href: '/knowledge-base', label: 'Base de Conhecimento', icon: BookText, admin: true },
  { href: '/management', label: 'Gerenciamento', icon: Users, admin: true },
  { href: '/settings', label: 'Configurações', icon: Settings, admin: true },
];

function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
      // Show admin items only to admins
      if (item.admin && user?.role !== 'admin') {
          return false;
      }
      // Hide management from non-admins
      if(user?.role !== 'admin' && item.href === '/management') {
          return false;
      }
       // Show knowledge base to all, but the link logic might differ
      if (item.href === '/knowledge-base') {
          return true;
      }
      // Show non-admin items to everyone
      if (!item.admin) {
        return true;
      }
      return user?.role === 'admin';
  });


  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const isKnowledgeBase = item.href === '/knowledge-base';
        const href = isKnowledgeBase && user?.role === 'admin' ? '/knowledge-base#new' : item.href;
        
        return (
            <Link href={href} key={item.href}>
            <SidebarMenuItem>
                <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
                >
                <item.icon />
                <span>{item.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </Link>
        )
      })}
    </SidebarMenu>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
    
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
            <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {user.email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')} disabled={user.role !== 'admin'}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppFooter() {
    return (
        <footer className="border-t bg-background px-6 py-4">
            <div className="text-center text-sm text-muted-foreground">
                <p>
                    Desenvolvido por{' '}
                    <a
                        href="https://t.me/JoabJhones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                        Joab Jhones
                    </a>
                    .
                </p>
                <p>Uma solução inteligente para gestão de chamados de TI.</p>
            </div>
        </footer>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const audioControllerRef = useRef<AudioControllerRef>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if(loading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Carregando...</p>
        </div>
    )
  }
  
  if (isAuthPage) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-grow flex">{children}</main>
            <AppFooter />
        </div>
    );
  }

  if (!user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Redirecionando para o login...</p>
        </div>
    )
  }
  
  const childrenWithSfx = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
          playNewTicketSfx: () => audioControllerRef.current?.playNewTicketSound(),
          playNewMessageSfx: () => audioControllerRef.current?.playNewMessageSound(),
        } as any);
    }
    return child;
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="flex items-center gap-2 p-2">
            <Logo className="size-8" />
            <span className="text-lg font-headline font-semibold">EloTech</span>
            <div className="flex-1" />
            <SidebarTrigger className="hidden md:flex" />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="p-2">
            <UserMenu />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col bg-background">
            <div className="flex-grow">
              {childrenWithSfx}
            </div>
            <AppFooter />
        </SidebarInset>
        <AudioController ref={audioControllerRef} />
      </div>
    </SidebarProvider>
  );
}
