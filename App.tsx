import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { CompanyCard } from './components/CompanyCard';
import { ReportDashboard } from './components/ReportDashboard';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { Plus, Loader2, RefreshCw, AlertCircle, Database, BarChart3, Shield, Activity } from 'lucide-react';
import { RiskData, AssessmentItem } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { SAMPLE_RISK_DATA } from './constants';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-all-reports`,{method:"POST"});
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      
      const reportsList = data.reports ? data.reports : (Array.isArray(data) ? data : []);

      if (Array.isArray(reportsList)) {
        setReports(reportsList);
        setIsDemoMode(false);
      } else {
        console.error('API response is not an array or valid object:', data);
        setReports([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching reports, falling back to sample data:', err);
      setReports([SAMPLE_RISK_DATA]);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Initial fetch on component mount
  fetchReports();
}, []); // Empty dependency - runs only once on mount

useEffect(() => {
  // Check if any report is currently running
  const isAnyReportRunning = reports.some(
    r => r.status === 'in_progress' || r.status === 'pending'
  );
    
  if (!isDemoMode && isAnyReportRunning) {
    const intervalId = setInterval(() => {
      fetchReports();
    }, 15000);
        
    return () => clearInterval(intervalId);
  }
  
}, [reports, isDemoMode]); 

  const handleDeleteReport = async (runId: string, companyName: string) => {
    try {
      if (isDemoMode) {
        toast.error("Cannot delete reports in Demo Mode (Server Offline)");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/files/${runId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {      
        const errorText = await response.text();
        throw new Error(`Failed to delete report: ${response.status} - ${errorText}`);
      }

      toast.success(`Deleted assessment for ${companyName}`);
      fetchReports();
      
    } catch (err) {
      console.error('Error deleting report:', err);      
      toast.error(`Failed to delete assessment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGenerateReport = async (companyName: string) => {
    try {
      if (isDemoMode) {
          toast.error("Cannot generate reports in Demo Mode (Server Offline)");
          return;
      }

      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate report generation');
      }

      const result = await response.json();
      console.log(result.message);
      
      toast.success(`Assessment initiated for ${companyName}`);
      fetchReports();
      
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to start assessment');
    }
  };

  const currentRunningReport = reports.find(r => r.status === 'in_progress' || r.status === 'pending');

  const handleAddNewClick = () => {
    // FIX: Allow user to bypass a stuck report via confirmation
    if (currentRunningReport) {
      const confirmForce = window.confirm(
        `A report for "${currentRunningReport.company_name}" appears to be running or stuck.\n\nDo you want to force start a new assessment anyway?`
      );
      if (!confirmForce) return;
    }
    setIsModalOpen(true);
  };

  // Global Stats Logic
  const totalEntities = reports.length;
  let totalHighRisks = 0;
  let totalAssessed = 0;
  let avgRiskScore = 0;

  reports.forEach(report => {
    if (report.status === 'completed' && report.steps?.risk_assessment?.result?.assessment) {
      totalAssessed++;
      const items = Object.values(report.steps.risk_assessment.result.assessment) as AssessmentItem[];
      totalHighRisks += items.filter(i => i.rating === 'HIGH').length;
      
      let score = 0;
      items.forEach(i => {
        if(i.rating === 'HIGH') score += 10;
        if(i.rating === 'MEDIUM') score += 6;
        if(i.rating === 'LOW') score += 2;
      });
      const max = items.length * 10;
      if(max > 0) avgRiskScore += (score / max) * 100;
    }
  });
  const globalAvg = totalAssessed > 0 ? Math.round(avgRiskScore / totalAssessed) : 0;

  return (
    <div className="min-h-screen bg-slate-950 pt-28 px-4 pb-20 overflow-y-auto custom-scrollbar">
      <NewAssessmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateReport}
      />

      <div className="max-w-7xl mx-auto">
        
        {/* Global Dashboard Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-[#0B1121] border border-white/10 rounded-[2rem] p-6 flex items-center gap-5 shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors"></div>
              <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                 <BarChart3 size={28} />
              </div>
              <div className="relative z-10">
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Entities</p>
                 <p className="text-3xl font-bold text-white">{totalEntities}</p>
              </div>
           </div>
           
           <div className="bg-[#0B1121] border border-white/10 rounded-[2rem] p-6 flex items-center gap-5 shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-colors"></div>
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                 <Shield size={28} />
              </div>
              <div className="relative z-10">
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Critical Alerts</p>
                 <p className="text-3xl font-bold text-white">{totalHighRisks}</p>
              </div>
           </div>

           <div className="bg-[#0B1121] border border-white/10 rounded-[2rem] p-6 flex items-center gap-5 shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                 <Activity size={28} />
              </div>
              <div className="relative z-10">
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Avg Risk Score</p>
                 <p className="text-3xl font-bold text-white">{globalAvg}<span className="text-sm text-slate-500 ml-1 font-medium">/100</span></p>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Active Monitoring</h2>
            <p className="text-slate-400 text-sm font-light max-w-xl">
              Real-time analysis of corporate risk profiles generated by our advanced AI agents.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {loading && <Loader2 className="animate-spin text-violet-500 mr-2" size={20} />}
             
             {isDemoMode && (
                 <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
                     <Database size={14} />
                     <span className="font-bold">Demo Mode</span>
                 </div>
             )}

             <button 
                onClick={() => fetchReports()}
                className="p-2.5 rounded-xl bg-[#0B1121] border border-white/10 text-slate-400 hover:text-white transition-colors hover:bg-white/5 hover:border-white/20"
                title="Refresh Data"
             >
                <RefreshCw size={18} />
             </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {loading && reports.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {[1, 2, 3].map((i) => (
               <div key={i} className="h-[450px] rounded-[2rem] bg-[#0B1121] border border-white/5 animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reports.map((report) => (
              <CompanyCard 
                key={report._id?.$oid || report.run_id} 
                data={report}
                onDelete={handleDeleteReport}
              />
            ))}
            
            {/* Add New Card - FIX: Removed disabled status to allow force start */}
            <div 
              onClick={handleAddNewClick}
              className={`group relative overflow-hidden rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center text-center transition-all h-full min-h-[450px] cursor-pointer
                ${currentRunningReport 
                  ? 'hover:bg-rose-500/5 hover:border-rose-500/30' 
                  : 'hover:bg-white/[0.04] hover:border-violet-500/30'
                }
              `}
            >
               <div className={`w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 text-slate-600 transition-all shadow-2xl duration-500
                  ${currentRunningReport 
                    ? 'group-hover:text-rose-400 group-hover:scale-110' 
                    : 'group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-violet-500/40 group-hover:scale-110 group-hover:rotate-3'
                  }
               `}>
                  {currentRunningReport ? <Loader2 size={40} className="animate-spin" /> : <Plus size={40} />}
               </div>
               <h3 className={`text-2xl font-bold transition-colors mb-3 ${currentRunningReport ? 'text-slate-400' : 'text-slate-400 group-hover:text-white'}`}>
                 New Assessment
               </h3>
               <p className="text-sm text-slate-500 mt-2 max-w-[220px] font-light leading-relaxed">
                 {currentRunningReport 
                   ? `Analysis for "${currentRunningReport.company_name}" pending. Click to force new run.` 
                   : "Initialize a deep-dive AI risk analysis run for a new entity."
                 }
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="antialiased selection:bg-violet-500/30 bg-slate-950 min-h-screen text-slate-50 font-sans">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#8b5cf6',
                secondary: '#fff',
              },
            },
          }}
        />
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report/:id" element={<ReportDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;