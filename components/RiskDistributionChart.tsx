import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RiskAssessmentResult, AssessmentItem } from '../types';

interface RiskDistributionChartProps {
  assessment: RiskAssessmentResult;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ assessment }) => {
  const dataMap: Record<string, { name: string; High: number; Medium: number; Low: number; Unknown: number }> = {};

  Object.entries(assessment.assessment).forEach(([key, value]) => {
    const item = value as AssessmentItem;
    const parts = key.split('.');
    if (parts.length < 2) return;
    
    const category = parts[1];

    if (!dataMap[category]) {
      dataMap[category] = { name: category, High: 0, Medium: 0, Low: 0, Unknown: 0 };
    }

    if (item.rating === 'HIGH') dataMap[category].High += 1;
    else if (item.rating === 'MEDIUM') dataMap[category].Medium += 1;
    else if (item.rating === 'LOW') dataMap[category].Low += 1;
    else dataMap[category].Unknown += 1;
  });

  const data = Object.values(dataMap);

  return (
    <div className="h-[300px] w-full bg-[#0B1121] rounded-[2rem] border border-white/5 p-6 flex flex-col shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-violet-500 via-fuchsia-500 to-violet-500 opacity-20"></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
          Risk Distribution by Category
        </h3>
      </div>
      
      <div className="flex-1 relative z-10 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tick={{fontSize: 10}} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              stroke="#94a3b8" 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                color: '#f1f5f9',
                fontSize: '11px'
              }}
              cursor={{fill: 'rgba(255,255,255,0.05)'}}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            <Bar dataKey="High" stackId="a" fill="#fb7185" radius={[0, 3, 3, 0]} barSize={12} />
            <Bar dataKey="Medium" stackId="a" fill="#fbbf24" barSize={12} />
            <Bar dataKey="Low" stackId="a" fill="#34d399" barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};