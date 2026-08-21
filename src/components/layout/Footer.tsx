import type { ReactNode } from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} GraphRec. Learn smarter, together.</p>
        <p className="text-xs text-slate-400">Personalized recommendations, powered by a graph.</p>
      </div>
    </footer>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="container-page py-8 sm:py-10">{children}</div>;
}
