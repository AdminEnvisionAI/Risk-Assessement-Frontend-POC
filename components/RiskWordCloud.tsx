import React from 'react';
import { AssessmentItem, RiskAssessmentResult } from '../types';
import { Cloud } from 'lucide-react';

interface RiskWordCloudProps {
    assessment: RiskAssessmentResult;
}

export const RiskWordCloud: React.FC<RiskWordCloudProps> = ({ assessment }) => {
    const extractKeywords = () => {
        const text = Object.values(assessment.assessment)
            .map((item: AssessmentItem) => `${item.reasoning} ${item.evidence}`)
            .join(' ')
            .toLowerCase();

        const stopWords = new Set(['the', 'and', 'is', 'of', 'to', 'in', 'a', 'for', 'that', 'on', 'with', 'as', 'are', 'it', 'from', 'by', 'this', 'not', 'be', 'or', 'at', 'an', 'has', 'have', 'but', 'which', 'their', 'its', 'can', 'may', 'could', 'would', 'risk', 'risks', 'zomato', 'tcs', 'lenskart', 'company']);
        
        const words = text.match(/\b[a-z]{4,}\b/g) || [];
        const freq: Record<string, number> = {};

        words.forEach(word => {
            if (!stopWords.has(word)) {
                freq[word] = (freq[word] || 0) + 1;
            }
        });

        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); 
    };

    const keywords = extractKeywords();

    return (
        <div className="h-[300px] bg-[#0B1121] rounded-[2rem] border border-white/5 p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Cloud size={16} className="text-cyan-400" />
                    Risk Topic Cloud
                </h3>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center h-full content-center overflow-hidden">
                {keywords.map(([word, count], idx) => {
                    const fontSize = Math.max(0.7, Math.min(1.4, 0.7 + (count * 0.08))) + 'rem';
                    const opacity = Math.max(0.5, Math.min(1, 0.5 + (count * 0.1)));
                    const colors = ['text-violet-400', 'text-cyan-400', 'text-fuchsia-400', 'text-emerald-400', 'text-amber-400'];
                    
                    return (
                        <span 
                            key={word}
                            className={`font-mono font-medium transition-all hover:scale-110 cursor-default ${colors[idx % colors.length]}`}
                            style={{ fontSize: fontSize, opacity: opacity }}
                        >
                            #{word}
                        </span>
                    );
                })}
                {keywords.length === 0 && (
                    <span className="text-slate-600 text-sm">No keywords analyzed.</span>
                )}
            </div>
        </div>
    );
};