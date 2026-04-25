import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Sun, HardHat } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg italic shadow-sm">
            CBC
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase italic">
            Solar Projetos <span className="text-blue-600">|</span> <span className="font-normal text-slate-400 normal-case italic">Gestão de Obras</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Usuário</p>
                <p className="text-xs font-semibold text-slate-700">{user.displayName}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="btn-primary"
            >
              Entrar com Google
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="w-full">
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 max-w-md w-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HardHat size={32} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold mb-3 uppercase italic tracking-tight">Acesso Restrito</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Autentique-se para gerenciar os projetos e equipes da CBC Solar.
                </p>
                <button
                  onClick={signIn}
                  className="w-full btn-primary py-3 text-sm"
                >
                  Fazer Login
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
