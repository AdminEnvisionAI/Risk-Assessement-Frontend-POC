import React from 'react';
import { X, Globe, Briefcase, Lightbulb, MapPin, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyProfile } from '../types';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  companyName: string;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({ isOpen, onClose, profile, companyName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 m-auto w-full max-w-4xl h-fit max-h-[90vh] bg-[#0B1121] border border-white/10 rounded-[2.5rem] z-[70] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header with Gradient */}
            <div className="relative h-32 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 flex items-center px-8 shrink-0">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="relative z-10 flex items-center gap-6 w-full">
                  <div className="w-20 h-20 rounded-2xl bg-white text-violet-600 text-4xl font-bold flex items-center justify-center shadow-xl">
                     {companyName.substring(0, 1)}
                  </div>
                  <div>
                     <h2 className="text-3xl font-bold text-white tracking-tight">{companyName}</h2>
                     <p className="text-violet-100 font-medium opacity-90">Comprehensive Corporate Profile</p>
                  </div>
               </div>
               <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
               >
                  <X size={20} />
               </button>
            </div>
            
            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sector & Geographies */}
                  <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-violet-400">
                           <Briefcase size={20} />
                           <h3 className="text-sm font-bold uppercase tracking-wider">Industry Sector</h3>
                        </div>
                        <p className="text-xl text-white font-medium">{profile.sector}</p>
                     </div>

                     <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-fuchsia-400">
                           <Globe size={20} />
                           <h3 className="text-sm font-bold uppercase tracking-wider">Key Geographies</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {profile.key_geographies.map((geo, idx) => (
                              <span key={idx} className="px-3 py-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-sm font-medium flex items-center gap-1.5">
                                 <MapPin size={12} />
                                 {geo}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Business Model */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-violet-500/[0.03] border border-white/5 hover:border-violet-500/20 transition-colors md:row-span-2">
                     <div className="flex items-center gap-3 mb-4 text-indigo-400">
                        <Building2 size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Business Model Logic</h3>
                     </div>
                     <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-light">
                        <p>{profile.business_model_notes}</p>
                     </div>
                  </div>

                  {/* Assumptions */}
                  <div className="md:col-span-2 p-6 rounded-3xl bg-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                     <div className="flex items-center gap-3 mb-4 text-amber-400">
                        <Lightbulb size={20} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">Strategic Assumptions</h3>
                     </div>
                     <p className="text-slate-300 italic text-lg font-light border-l-2 border-amber-500/30 pl-4">
                        "{profile.assumptions}"
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};