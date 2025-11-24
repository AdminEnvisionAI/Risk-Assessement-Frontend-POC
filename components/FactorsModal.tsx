import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskSchemaStructure } from '../types';

interface FactorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: RiskSchemaStructure;
}

export const FactorsModal: React.FC<FactorsModalProps> = ({ isOpen, onClose, schema }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-800 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <h2 className="text-xl font-bold text-white">Risk Factors Schema</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-xs font-mono text-blue-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};