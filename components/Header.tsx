import React from 'react';
import { Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors border border-violet-500/20">
            <Shield className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            Risk<span className="text-violet-400 font-bold">Analyzer</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 border border-white/10 shadow-lg shadow-violet-500/20" />
        </div>
      </div>
    </header>
  );
};