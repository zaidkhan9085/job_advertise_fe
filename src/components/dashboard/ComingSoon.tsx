import { Construction } from "lucide-react";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-6">
        <Construction className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-sm">
        This section is still being built and isn&apos;t available yet.
      </p>
    </div>
  );
}
