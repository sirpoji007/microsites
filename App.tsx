
import React, { useState, useCallback } from 'react';
import { Qualification, Recommendation } from './types';
import QualificationForm from './components/QualificationForm';
import ResultsDisplay from './components/ResultsDisplay';
import { fetchExternalData } from './services/dataService';
import { generateRecommendations } from './services/geminiService';

const App: React.FC = () => {
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async (qualifications: Qualification) => {
        setIsLoading(true);
        setError(null);
        setRecommendations(null);

        try {
            setLoadingMessage('Fetching university course data and live economic indicators...');
            const externalData = await fetchExternalData();

            setLoadingMessage('AI is analyzing your profile against market trends...');
            const aiRecommendations = await generateRecommendations(qualifications, externalData.courses, externalData.categories, externalData.gdpData, externalData.labourData);

            setRecommendations(aiRecommendations);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);
    
    const handleReset = () => {
        setRecommendations(null);
        setError(null);
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004e4e] via-[#003333] to-[#0b1a1a] text-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8 md:mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400">
                        EduMatch AI Malaysia
                    </h1>
                    <p className="mt-4 text-lg text-cyan-200/80 max-w-3xl mx-auto">
                        Your data-driven guide to choosing the right university program in Malaysia.
                    </p>
                </header>

                <main>
                    {!recommendations && !isLoading && !error && (
                        <QualificationForm onGetRecommendation={handleAnalysis} />
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-black/20 rounded-2xl shadow-xl border border-cyan-500/20">
                            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xl font-medium text-cyan-300">{loadingMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-8 bg-red-900/50 rounded-2xl shadow-xl border border-red-500/50">
                            <h2 className="text-2xl font-bold text-red-300 mb-4">Analysis Failed</h2>
                            <p className="text-red-200 mb-6">{error}</p>
                            <button
                                onClick={handleReset}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                    
                    {recommendations && (
                        <ResultsDisplay recommendations={recommendations} onReset={handleReset} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
