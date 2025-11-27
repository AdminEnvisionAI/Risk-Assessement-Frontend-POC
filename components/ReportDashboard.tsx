import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Activity, Layout, Code2, Globe, Briefcase, ExternalLink, 
  ChevronRight, AlertCircle, ChevronLeft, BookOpen, Lightbulb, Target, Cpu, 
  Building, Quote, CheckCircle2, Hash, Loader2, Download, BarChart3, Shield,
  Zap, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { RiskRadar } from './RiskRadar';
import { RiskDistributionChart } from './RiskDistributionChart';
import { AssessmentAccordion } from './AssessmentAccordion';
import { FactorsModal } from './FactorsModal';
import { CompanyProfileModal } from './CompanyProfileModal';
import { RiskWordCloud } from './RiskWordCloud';
import { RiskData, AssessmentItem } from '../types';
import { SAMPLE_RISK_DATA } from '../constants';

const API_BASE_URL = 'http://127.0.0.1:8001';

const MarkdownComponents = {
  h1: ({ children }: any) => (
    <div className="relative mb-8 mt-6 group break-words">
       <div className="absolute -left-6 top-1 w-1 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
       <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {children}
       </h1>
    </div>
  ),
  h2: ({ children }: any) => (
    <div className="flex items-end gap-3 mt-10 mb-6 pb-4 border-b border-white/5 group break-words">
      <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-violet-500/20 transition-colors shrink-0">
         <Hash size={18} />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">{children}</h2>
    </div>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-white mt-8 mb-4 flex items-center gap-2 break-words">
      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0" />
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-slate-300 leading-7 text-base mb-6 tracking-wide font-light">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="grid gap-3 my-6 bg-black/20 p-6 rounded-2xl border border-white/5">{children}</ul>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start gap-3 text-slate-300 leading-relaxed group text-sm md:text-base">
      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-1 group-hover:text-emerald-400 transition-colors" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="relative p-6 my-8 rounded-2xl bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-white/10 overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
        <Quote size={80} className="text-white" />
      </div>
      <div className="relative z-10 flex gap-4">
         <div className="w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full shrink-0" />
         <div className="italic text-violet-100/90 text-base font-medium leading-relaxed">
           {children}
         </div>
      </div>
    </blockquote>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-white decoration-violet-500/30 decoration-2 underline-offset-2 underline">
      {children}
    </strong>
  ),
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300 underline decoration-fuchsia-500/30 underline-offset-2 transition-colors inline-flex items-center gap-1 break-all">
      {children}
      <ExternalLink size={12} />
    </a>
  )
};

export const ReportDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'report'>('overview');
  const [isFactorsOpen, setIsFactorsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [reportStep, setReportStep] = useState(0);
  
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get-all-reports`,{method:"POST"});
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        const allReports: RiskData[] = result.reports ? result.reports : (Array.isArray(result) ? result : []);
        
        const report = allReports.find(r => r.run_id === id);
        if (report) {
          setData(report);
        } else {
          if (id === SAMPLE_RISK_DATA.run_id) {
             setData(SAMPLE_RISK_DATA);
          } else {
             setError('Report not found');
          }
        }
      } catch (err) {
        console.error(err);
        if (id === SAMPLE_RISK_DATA.run_id) {
            setData(SAMPLE_RISK_DATA);
        } else {
            setError('Failed to load report data. Server might be offline.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'report' && reportContentRef.current) {
      reportContentRef.current.scrollTop = 0;
    }
  }, [reportStep, activeTab]);

  const handleDownloadReport = () => {
    if (!data || !data.researched_sections) return;

    const fullContent = data.researched_sections
      .map(section => `# ${section.section_name}\n\n${section.content}`)
      .join('\n\n---\n\n');

    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.company_name}_Risk_Report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-400 bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p>Initializing Deep AI Analysis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-400 bg-slate-950">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Report</h2>
        <p>{error || 'Unknown error occurred'}</p>
        <Link to="/" className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const profile = data.steps?.risk_schema_design?.result?.risk_schema?.company_profile;
  const methodology = data.steps?.validated_risk_report?.result?.methodology;
  const researchedSections = data.researched_sections || [];
  const schema = data.steps?.risk_schema_design?.result?.risk_schema?.schema;
  const assessmentResult = data.steps?.risk_assessment?.result;

  let highRisks = 0;
  let mediumRisks = 0;
  let totalRisks = 0;
  if (assessmentResult?.assessment) {
    const items = Object.values(assessmentResult.assessment) as AssessmentItem[];
    totalRisks = items.length;
    highRisks = items.filter(i => i.rating === 'HIGH').length;
    mediumRisks = items.filter(i => i.rating === 'MEDIUM').length;
  }

  const tabs = [
    { id: 'overview', label: 'Strategic Overview', icon: Layout },
    { id: 'analysis', label: 'Deep Dive Analytics', icon: Activity },
    { id: 'report', label: 'Full Intelligence Report', icon: FileText },
  ];

  let references: {url: string, text: string}[] = [];
  if (data.steps?.finalizer?.result?.references) {
    const rawReferenceBlock = data.steps.finalizer.result.references[0] || ""; 
    references = rawReferenceBlock
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => {
        const urlMatch = line.match(/\((https?:\/\/[^)]+)\)/);
        const url = urlMatch ? urlMatch[1] : '#';
        let text = line
          .replace(/^\*\s*/, '')
          .replace(/\s*\(https?:\/\/.*\)/, '') 
          .replace(/\[|\]/g, '') 
          .trim();
          
        if (text.length > 80) text = text.substring(0, 80) + '...';
        return { url, text };
      });
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-10 pt-24 overflow-y-auto custom-scrollbar flex flex-col">
      {schema && (
        <FactorsModal 
          isOpen={isFactorsOpen} 
          onClose={() => setIsFactorsOpen(false)}
          schema={schema}
        />
      )}
      
      {profile && (
        <CompanyProfileModal 
           isOpen={isProfileOpen}
           onClose={() => setIsProfileOpen(false)}
           profile={profile}
           companyName={data.company_name}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 border-b border-white/5 pb-8 shrink-0">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-violet-400 mb-4 transition-colors group font-medium">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-5 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 border border-white/10 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-500/20">
                 {data.company_name.substring(0, 1)}
              </div>
              <div>
                 <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
                    {data.company_name}
                 </h1>
                 <div className="flex items-center gap-3 text-sm text-slate-400 font-light">
                    {profile && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">{profile.sector}</span>}
                    <span>•</span>
                    <span className="flex items-center gap-1"><Globe size={12}/> Global Enterprise</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-4 text-right">
               <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">AI Status</span>
               <div className="flex items-center gap-2 mt-1">
                 <span className={`w-2 h-2 rounded-full ${data.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'} `}></span>
                 <span className="text-sm text-white font-medium capitalize">{data.status === 'completed' ? 'Analysis Complete' : 'Processing Data...'}</span>
               </div>
               <span className="text-[10px] text-slate-600 font-mono mt-1">Run ID: {data.run_id.substring(0, 8)}</span>
            </div>
            <div className="h-10 w-px bg-white/10 mx-2"></div>
            
            <button 
              onClick={() => setIsProfileOpen(true)}
              disabled={!profile}
              className="flex items-center gap-2 px-5 py-3 bg-[#0B1121] border border-white/10 hover:border-violet-500/50 text-slate-300 hover:text-white rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/10 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Building size={18} className="text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="font-medium text-sm hidden sm:inline">Company Profile</span>
            </button>
            
            <button 
              onClick={() => setIsFactorsOpen(true)}
              disabled={!schema}
              className="flex items-center gap-2 px-5 py-3 bg-[#0B1121] border border-white/10 hover:border-violet-500/50 text-slate-300 hover:text-white rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/10 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Code2 size={18} className="text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="font-medium text-sm hidden sm:inline">Risk Schema</span>
            </button>
          </div>
        </div>

        {assessmentResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
            <div className="bg-[#0B1121] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Target size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Analyzed Risks</p>
                <p className="text-xl font-bold text-white">{totalRisks}</p>
              </div>
            </div>
            <div className="bg-[#0B1121] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Critical Threats</p>
                <p className="text-xl font-bold text-white">{highRisks}</p>
              </div>
            </div>
            <div className="bg-[#0B1121] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Moderate Risks</p>
                <p className="text-xl font-bold text-white">{mediumRisks}</p>
              </div>
            </div>
            <div className="bg-[#0B1121] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">AI Confidence</p>
                <p className="text-xl font-bold text-white">High</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
          <div className="flex p-1.5 bg-[#0B1121] rounded-2xl border border-white/5 w-fit shadow-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative overflow-hidden
                    ${isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {activeTab === 'report' && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-sm font-medium transition-all group"
            >
              <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
              Download Report
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10 h-full overflow-visible">
                <div className="xl:col-span-2 flex flex-col gap-8">
                  <div className="p-8 rounded-[2rem] bg-[#0B1121] border border-white/5 shadow-sm relative overflow-hidden group hover:border-violet-500/20 transition-colors flex-1 min-h-[500px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50"></div>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-500/10 blur-[50px] rounded-full group-hover:bg-violet-500/20 transition-all duration-500"></div>
                    
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Briefcase className="text-violet-400" size={24} />
                      Executive Summary
                    </h2>
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light">
                       <ReactMarkdown 
                        components={{
                          h1: MarkdownComponents.h2,
                          h2: MarkdownComponents.h3,
                          strong: MarkdownComponents.strong
                        }}
                       >
                        {data.steps.finalizer?.result?.conclusion || "Executive summary not yet generated."}
                       </ReactMarkdown>
                    </div>
                  </div>

                  {methodology && profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-[#0B1121] border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Target size={16} className="text-cyan-400" />
                            Methodology
                          </h3>
                          <span className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {methodology.llm_model}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-1">
                          {methodology.notes}
                        </p>
                        <div className="mt-auto pt-4 border-t border-white/5">
                           <span className="text-xs text-slate-500">Tools: {methodology.web_search_tool?.toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-[#0B1121] border border-white/5 hover:border-white/10 transition-colors flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Cpu size={16} className="text-emerald-500" />
                          Business Logic
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-6 flex-1">
                           {profile.business_model_notes}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-8">
                   {assessmentResult && (
                     <>
                        <RiskRadar assessment={assessmentResult} />
                        <RiskWordCloud assessment={assessmentResult} />
                        <RiskDistributionChart assessment={assessmentResult} />
                     </>
                   )}
                   
                   <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                           <BookOpen size={18} className="text-slate-400" />
                           References
                        </h2>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">{references.length} Sources</span>
                     </div>
                     
                     <div className="grid gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {references.length > 0 ? references.map((ref, idx) => (
                           <a 
                              key={idx}
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group p-4 rounded-xl bg-[#0f1629] border border-slate-800 hover:border-violet-500/30 hover:bg-[#131c33] transition-all duration-300 flex items-start justify-between gap-4"
                           >
                              <div className="flex flex-col gap-1 flex-1 min-w-0">
                                 <span className="text-[13px] text-violet-300 font-medium group-hover:text-violet-200 leading-tight line-clamp-2">
                                    {ref.text}
                                 </span>
                                 <span className="text-[10px] text-slate-600 group-hover:text-slate-500 font-mono truncate block">
                                    {ref.url}
                                 </span>
                              </div>
                              <ExternalLink size={14} className="text-slate-600 group-hover:text-violet-400 shrink-0 mt-1 transition-colors" />
                           </a>
                        )) : (
                           <div className="text-sm text-slate-500 p-4">No references available yet.</div>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10 h-full overflow-visible">
                <div className="space-y-6">
                   <div className="flex items-center gap-4 mb-4 px-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 shadow-lg shadow-violet-500/5">
                        <Activity size={20} className="text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Internal Risks</h3>
                        <p className="text-xs text-slate-400">Operational, Human Capital, Strategic</p>
                      </div>
                   </div>
                   {assessmentResult && schema ? (
                     <AssessmentAccordion 
                        assessment={assessmentResult} 
                        schema={schema}
                        type="internal"
                     />
                   ) : <div className="text-slate-500">Analysis data pending...</div>}
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 mb-4 px-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5">
                        <Globe size={20} className="text-fuchsia-400" />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-white">External Risks</h3>
                         <p className="text-xs text-slate-400">Market, Regulatory, Technology</p>
                      </div>
                   </div>
                   {assessmentResult && schema ? (
                     <AssessmentAccordion 
                        assessment={assessmentResult} 
                        schema={schema}
                        type="external"
                     />
                   ) : <div className="text-slate-500">Analysis data pending...</div>}
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <div className="flex flex-col md:flex-row gap-8 pb-8 h-[calc(100vh-240px)] flex-1">
                 
                 {/* Left Sidebar TOC */}
                 <div className="hidden md:block w-64 shrink-0 h-full overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-[#0B1121] rounded-2xl border border-white/5 p-4 sticky top-0">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <List size={14} /> Table of Contents
                      </h3>
                      <div className="space-y-1">
                        {researchedSections.map((section, idx) => (
                          <button
                            key={idx}
                            onClick={() => setReportStep(idx)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all border border-transparent ${
                              reportStep === idx 
                                ? 'bg-violet-500/10 text-violet-300 border-violet-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="flex gap-2">
                              <span className="opacity-50 font-mono">{idx + 1}.</span>
                              <span className="line-clamp-1">{section.section_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>

                 {/* Main Content Area - Now Full Height */}
                 <div className="flex-1 flex flex-col h-full bg-[#0B1121] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    
                    {/* Top Navigation Bar inside Report */}
                    <div className="h-16 border-b border-white/5 bg-[#0B1121]/90 backdrop-blur z-20 flex items-center justify-between px-6 shrink-0">
                      <div className="flex items-center gap-4">
                        <button 
                           onClick={() => setReportStep(prev => Math.max(0, prev - 1))}
                           disabled={reportStep === 0}
                           className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                        >
                           <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">
                           {researchedSections[reportStep]?.section_name || "Loading..."}
                        </span>
                        <button 
                           onClick={() => setReportStep(prev => Math.min(researchedSections.length - 1, prev + 1))}
                           disabled={reportStep === researchedSections.length - 1}
                           className="p-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                        >
                           <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        Page {reportStep + 1} / {researchedSections.length}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-900">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((reportStep + 1) / researchedSections.length) * 100}%` }}
                        transition={{ type: "spring", bounce: 0 }}
                      />
                    </div>

                    {/* Scrollable Content */}
                    <div 
                      ref={reportContentRef}
                      className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative"
                    >
                       <AnimatePresence mode="wait">
                          <motion.div
                             key={reportStep}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             transition={{ duration: 0.3 }}
                          >
                             {researchedSections.length > 0 ? (
                               <>
                                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                                  
                                  <div className="relative z-10 max-w-4xl mx-auto">
                                     <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-6">
                                        Chapter {reportStep + 1}
                                     </span>
                                     
                                     <ReactMarkdown components={MarkdownComponents}>
                                        {researchedSections[reportStep].content}
                                     </ReactMarkdown>

                                     <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-mono">
                                        <span>Generated by RiskAnalyzer AI</span>
                                        <span>{new Date(researchedSections[reportStep].completed_at.$date).toLocaleString()}</span>
                                     </div>
                                  </div>
                               </>
                             ) : (
                               <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                 <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
                                 <p>Generating intelligence report...</p>
                               </div>
                             )}
                          </motion.div>
                       </AnimatePresence>
                    </div>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};