import React, { useState } from 'react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  Radar, Tooltip, PolarRadiusAxis, Legend 
} from 'recharts';
import { RiskAssessmentResult, AssessmentItem } from '../types';
import { Eye, Layers } from 'lucide-react';

interface RiskRadarProps {
  assessment: RiskAssessmentResult;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ assessment }) => {
  const [viewMode, setViewMode] = useState<'holistic' | 'split'>('holistic');

  // Process data
  const categoryScores: Record<string, { total: number; count: number; type: 'Internal' | 'External' }> = {};

  Object.entries(assessment.assessment).forEach(([key, value]) => {
    const item = value as AssessmentItem;
    const parts = key.split('.');
    if (parts.length < 2) return;
    
    const rootType = parts[0] === 'internal' ? 'Internal' : 'External';
    const category = parts[1].replace(/&/g, '&').trim(); 
    
    let score = 0;
    if (item.rating === 'HIGH') score = 9; 
    else if (item.rating === 'MEDIUM') score = 6;
    else if (item.rating === 'LOW') score = 3;
    else score = 2; 

    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, type: rootType };
    }
    categoryScores[category].total += score;
    categoryScores[category].count += 1;
  });

  const data = Object.entries(categoryScores).map(([cat, val]) => ({
    subject: cat,
    score: Math.round(val.total / val.count),
    fullMark: 10,
    type: val.type
  }));

  const splitChartData = data.map(d => ({
      subject: d.subject,
      Internal: d.type === 'Internal' ? d.score : 0,
      External: d.type === 'External' ? d.score : 0,
      fullMark: 10
  }));

  return (
    <div className="h-[350px] w-full bg-[#0B1121] rounded-[2rem] border border-white/5 p-6 flex flex-col shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            Risk Radar 360°
          </h3>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
            <button 
                onClick={() => setViewMode('holistic')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'holistic' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-500 hover:text-white'}`}
                title="Holistic View"
            >
                <Eye size={14} />
            </button>
            <button 
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'split' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-500 hover:text-white'}`}
                title="Internal vs External"
            >
                <Layers size={14} />
            </button>
        </div>
      </div>

      <div className="flex-1 -ml-2 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={viewMode === 'holistic' ? data : splitChartData}>
            <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            
            <Radar name="Critical Zone" dataKey="fullMark" stroke="none" fill="#f43f5e" fillOpacity={0.05} radius={[0, 10]} />
            
            {viewMode === 'holistic' && (
                <Radar
                name="Risk Intensity"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="#8b5cf6"
                fillOpacity={0.3}
                />
            )}

            {viewMode === 'split' && (
                <>
                    <Radar
                    name="Internal Factors"
                    dataKey="Internal"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    />
                    <Radar
                    name="External Factors"
                    dataKey="External"
                    stroke="#ec4899"
                    strokeWidth={2}
                    fill="#ec4899"
                    fillOpacity={0.3}
                    />
                    <Legend 
                        wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} 
                        iconType="circle"
                    />
                </>
            )}

            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px', 
                color: '#f1f5f9',
                fontSize: '11px',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                padding: '8px 12px'
              }}
              itemStyle={{ color: '#fff', fontWeight: 600 }}
              cursor={{ stroke: '#475569', strokeWidth: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};