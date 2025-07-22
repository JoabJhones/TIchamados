import { CreateTicketForm } from '@/components/tickets/create-ticket-form';

export default function NewTicketPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Abrir Novo Chamado
        </h2>
      </div>
      <CreateTicketForm />
    </div>
  );
}
