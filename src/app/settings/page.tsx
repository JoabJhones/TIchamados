export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">
        Configurações
      </h2>
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Em breve
          </h3>
          <p className="text-sm text-muted-foreground">
            Opções de personalização e configurações da conta estarão disponíveis aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
