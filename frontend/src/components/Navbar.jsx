import { ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-ink">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Main">
        <a href="/" className="flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-ink">
            <ShieldCheck size={19} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            InternShield <span className="text-brand">AI</span>
          </span>
        </a>
        <span className="hidden text-sm text-white/60 sm:block">Fake Internship Offer Detector</span>
      </nav>
    </header>
  );
}
