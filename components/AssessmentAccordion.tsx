import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, ShieldAlert, CheckCircle2, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiskAssessmentResult, RiskSchemaStructure, RiskSchemaItem, AssessmentItem } from '../types';

interface AssessmentAccordionProps {
  assessment: RiskAssessmentResult;
  schema: RiskSchemaStructure;
  type: 'internal' | 'external';
}

type FilterType = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const AssessmentAccordion: React.FC<AssessmentAccordionProps> = ({ assessment, schema, type }) => {
  const categories = schema[type];
  const [filter, setFilter] = useState<FilterType>('ALL');
  
  const getResult = (catName: string, itemId: string) => {
    const key = `${type}.${catName}.${itemId}`;
    return assessment.assessment[key];
  };

  const hasItems = (items: RiskSchemaItem[], catName: string) => {
    return items.some(item => {
      const res = getResult(catName, item.id);
      return res && (filter === 'ALL' || res.rating === filter);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-slate-400 text-xs mr-2">
          <Filter size={14} />
          <span>Filter:</span>
        </div>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              filter === f 
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' 
                : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {Object.entries(categories).map(([categoryName, items]: [string, RiskSchemaItem[]]) => {
        if (!hasItems(items, categoryName)) return null;

        return (
          <div key={categoryName} className="space-y-3">
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest pl-1 mb-4 opacity-80 flex items-center gap-2">
              <span className="w-1 h-4 bg-violet-500 rounded-full"></span>
              {categoryName}
            </h4>
            
            <div className="grid gap-3">
              {items.map((item) => {
                const result = getResult(categoryName, item.id);
                if (!result) return null;
                if (filter !== 'ALL' && result.rating !== filter) return null;

                return (
                  <RiskItem key={item.id} item={item} result={result} />
                );
              })}
            </div>
          </div>
        );
      })}
      
      {Object.entries(categories).every(([cat, items]) => !hasItems(items, cat)) && (
        <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">
          <p>No {filter.toLowerCase()} priority risks found in this category.</p>
        </div>
      )}
    </div>
  );
};

interface RiskItemProps {
  item: RiskSchemaItem;
  result: AssessmentItem;
}

const RiskItem: React.FC<RiskItemProps> = ({ item, result }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRiskStyles = (rating: string) => {
    switch(rating) {
      case 'HIGH': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: ShieldAlert, badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'MEDIUM': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'LOW': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', icon: Info, badge: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const styles = getRiskStyles(result.rating);
  const Icon = styles.icon;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${isOpen ? 'border-violet-500/30 bg-[#0B1121]' : 'border-white/5 bg-[#0B1121]/60'} overflow-hidden transition-all duration-300 hover:border-white/10`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left group hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.color} border ${styles.border} shadow-lg shadow-black/20`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`font-semibold text-sm md:text-base text-slate-200 group-hover:text-white transition-colors truncate ${isOpen ? 'text-violet-200' : ''}`}>
              {item.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-light hidden md:block">{item.why_necessary}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-3 shrink-0">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border tracking-wider uppercase ${styles.badge}`}>
            {result.rating}
          </span>
          <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-white/10 rotate-180' : 'bg-transparent'}`}>
            <ChevronDown size={16} className={`text-slate-500 ${isOpen ? 'text-white' : ''}`} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-6 space-y-6 bg-[#0f1629]/50">
              <div className="grid grid-cols-1 gap-6">
                 <div>
                    <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Risk Driver</h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">{item.why_necessary}</p>
                 </div>
                 <div>
                    <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">AI Analysis</h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">{result.reasoning}</p>
                 </div>
              </div>
              
              <div className="relative p-5 rounded-xl bg-black/20 border border-white/5">
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-violet-500/50 rounded-r"></div>
                <h5 className="text-xs font-bold uppercase text-violet-400 mb-2 ml-2 tracking-wider flex items-center gap-2">
                  <Info size={12} /> Supporting Evidence
                </h5>
                <p className="text-sm text-slate-400 italic ml-2 leading-relaxed">
                  "{result.evidence}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 opacity-60 border-t border-white/5 mt-2">
                 <span className="text-[10px] uppercase text-slate-500 font-mono mt-2">
                   ID: {item.id}
                 </span>
                 <span className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-2">
                   Hint: {item.source_hint}
                 </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};