export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your security and notification preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden p-8 text-center text-muted-foreground">
        <p>Settings functionality will be implemented in future phases after auth integration.</p>
      </div>
    </div>
  );
}
