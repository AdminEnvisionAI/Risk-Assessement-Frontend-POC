import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskData, AssessmentItem } from '../types';
import { ArrowRight, Activity, Globe, ShieldAlert, Loader2, Trash2 } from 'lucide-react';

interface CompanyCardProps {
  data: RiskData;
  onDelete?: (runId: string, companyName: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ data, onDelete }) => {
  const navigate = useNavigate();
  const profile = data.steps?.risk_schema_design?.result?.risk_schema?.company_profile;
  const assessment = data.steps?.risk_assessment?.result?.assessment;
  
  const isProcessing = data.status === 'in_progress' || data.status === 'pending';

  // Calculate Risk Score
  let riskScore = 0;
  let maxScore = 0;
  if (assessment) {
    const items = Object.values(assessment) as AssessmentItem[];
    items.forEach(item => {
      maxScore += 10;
      if (item.rating === 'HIGH') riskScore += 10;
      else if (item.rating === 'MEDIUM') riskScore += 6;
      else if (item.rating === 'LOW') riskScore += 2;
    });
  }
  const percentage = maxScore > 0 ? Math.round((riskScore / maxScore) * 100) : 0;

  let scoreColor = 'bg-emerald-500';
  if (percentage > 40) scoreColor = 'bg-amber-500';
  if (percentage > 70) scoreColor = 'bg-rose-500';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (window.confirm(`Are you sure you want to delete the risk assessment for "${data.company_name}"? This action cannot be undone.`)) {
        onDelete(data.run_id, data.company_name);
      }
    }
  };

  return (
    <div 
      onClick={() => !isProcessing && navigate(`/report/${data.run_id}`)}
      className={`group relative bg-[#0B1121] rounded-[2rem] p-8 border border-white/10 transition-all duration-300 shadow-2xl overflow-hidden
        ${isProcessing 
          ? 'cursor-wait border-amber-500/30 bg-[#0B1121]/80' 
          : 'hover:border-violet-500/30 hover:shadow-violet-500/10 cursor-pointer'
        }
      `}
    >
      <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full transition-all duration-500 opacity-5 
        ${isProcessing ? 'bg-amber-500 animate-pulse' : (percentage > 70 ? 'bg-rose-500' : 'bg-violet-500')}`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg border border-white/10
             ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white'}
          `}>
            {data.company_name.substring(0, 1)}
          </div>
          
          {isProcessing ? (
            <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Loader2 size={12} className="animate-spin" />
              Analyzing
            </div>
          ) : (
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <ShieldAlert size={12} /> Risk Score
               </div>
               <div className="text-2xl font-bold text-white">{percentage}/100</div>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-200 transition-colors truncate">{data.company_name}</h3>
        
        {isProcessing ? (
           <div className="space-y-4 py-6">
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <span>Data Collection</span>
                    <span className="text-amber-400">In Progress...</span>
                 </div>
                 <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-1/2 animate-shimmer"></div>
                 </div>
              </div>
              <p className="text-xs text-slate-400 font-light text-center border-t border-white/5 pt-4">
                 AI agents are currently gathering and analyzing risk vectors for this entity.
              </p>
           </div>
        ) : (
          <>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
               <div className={`h-full rounded-full ${scoreColor} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
            </div>

            <p className="text-slate-400 text-sm mb-8 line-clamp-2 font-light leading-relaxed h-10">
              {profile?.business_model_notes || "Business analysis pending..."}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Activity size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Sector</span>
                </div>
                <div className="text-white font-medium text-xs truncate">{profile?.sector || 'N/A'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 text-fuchsia-400 mb-1">
                  <Globe size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Region</span>
                </div>
                <div className="text-white font-medium text-xs truncate">{profile?.key_geographies?.[0] || 'Global'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
              <span className="text-[10px] text-slate-600 font-mono">ID: {data.run_id.substring(0, 8)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all duration-200 border border-rose-500/20 hover:border-rose-500/40"
                  title="Delete Assessment"
                >
                  <Trash2 size={14} />
                </button>
                <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:translate-x-1 transition-transform bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10">
                  View Report <ArrowRight size={14} className="text-violet-400" />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};