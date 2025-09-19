
import React from 'react';
import { Recommendation } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResultsDisplayProps {
    recommendations: Recommendation[];
    onReset: () => void;
}

const rankColors = [
    'border-cyan-400', // Rank 1
    'border-teal-400',  // Rank 2
    'border-sky-500',   // Rank 3
    'border-slate-500', // Rank 4
    'border-slate-600'  // Rank 5
];
const rankBgColors = [
    'bg-cyan-400/10', // Rank 1
    'bg-teal-400/10',  // Rank 2
    'bg-sky-500/10',   // Rank 3
    'bg-slate-500/10', // Rank 4
    'bg-slate-600/10'  // Rank 5
]


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ recommendations, onReset }) => {
    
    const chartData = recommendations[0]?.employabilityTrend.map((value, index) => ({
        year: 2019 + index,
        ...recommendations.reduce((acc, rec) => {
            acc[rec.courseName] = rec.employabilityTrend[index];
            return acc;
        }, {} as Record<string, number>)
    }));

    const chartColors = ['#22d3ee', '#2dd4bf', '#0ea5e9', '#64748b', '#475569'];

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center sm:text-left text-cyan-300">
                    Your Personalised AI Recommendations
                </h2>
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-lg shadow-md hover:shadow-slate-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <i className="fas fa-arrow-left mr-2"></i> Start Over
                </button>
            </header>
            
             <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 p-6 md:p-8 rounded-2xl shadow-2xl">
                <h3 className="text-xl font-bold text-cyan-300 mb-4">Employability Trend Comparison (2019-2023)</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" unit="%" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                    borderColor: '#64748b',
                                    color: '#e2e8f0'
                                }}
                            />
                            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                            {recommendations.map((rec, index) => (
                                <Line key={rec.rank} type="monotone" dataKey={rec.courseName} stroke={chartColors[index]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {recommendations.map((rec, index) => (
                <div key={rec.rank} className={`bg-slate-800/30 backdrop-blur-sm border-l-4 ${rankColors[index]} ${rankBgColors[index]} p-6 rounded-lg shadow-lg`}>
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <h3 className="text-2xl font-bold text-cyan-300">{rec.rank}. {rec.courseName}</h3>
                        <p className="text-lg text-slate-300 md:text-right">{rec.university}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-center">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="text-3xl font-bold text-cyan-400">{rec.matchScore}%</div>
                            <div className="text-sm text-slate-400">Profile Match</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="text-3xl font-bold text-teal-400">{rec.sectorGrowth.toFixed(1)}%</div>
                            <div className="text-sm text-slate-400">Sector Growth (YoY)</div>
                        </div>
                         <div className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="text-3xl font-bold text-sky-400">{rec.employabilityTrend[4]}%</div>
                            <div className="text-sm text-slate-400">Latest Employability</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-lg text-slate-200 mb-2">AI Rationale:</h4>
                        <p className="text-slate-300 mb-6">{rec.rationale}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 className="font-semibold text-lg text-green-400 mb-2"><i className="fas fa-check-circle mr-2"></i>Pros</h4>
                            <ul className="list-disc list-inside space-y-1 text-green-300/90">
                                {rec.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg text-amber-400 mb-2"><i className="fas fa-exclamation-triangle mr-2"></i>Cons</h4>
                            <ul className="list-disc list-inside space-y-1 text-amber-300/90">
                                {rec.cons.map((con, i) => <li key={i}>{con}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-slate-200 mb-2"><i className="fas fa-briefcase mr-2"></i>Career Prospects</h4>
                        <p className="text-slate-300">{rec.careerProspects}</p>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default ResultsDisplay;
