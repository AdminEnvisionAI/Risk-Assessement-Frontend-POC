import React, { useState } from 'react';
import { X, Zap, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (companyName: string) => Promise<void>;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsLoading(true);
    try {
      await onGenerate(companyName);
      setCompanyName('');
      onClose();
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-[#0B1121] border border-white/10 rounded-3xl z-[90] shadow-2xl overflow-hidden"
          >
            <div className="relative h-32 bg-gradient-to-br from-violet-600 to-indigo-600 p-6 flex flex-col justify-end">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">New Assessment</h2>
                  <p className="text-violet-100 text-xs opacity-80">AI-Powered Risk Analysis</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Target Entity</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter Company Name (e.g., Zomato)"
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                      autoFocus
                    />
                    <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
                  </div>
                  <p className="text-[10px] text-slate-500 pl-1">
                    Our AI will scan global databases to generate a comprehensive risk profile.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !companyName.trim()}
                  className="w-full py-3.5 rounded-xl bg-white text-violet-950 font-bold text-sm hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Initializing Analysis...
                    </>
                  ) : (
                    <>
                      Generate Report
                      <Zap size={16} fill="currentColor" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};