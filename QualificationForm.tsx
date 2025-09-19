
import React, { useState } from 'react';
import { Qualification } from '../types';

interface QualificationFormProps {
    onGetRecommendation: (qualifications: Qualification) => void;
}

const SPM_SUBJECTS = [
    'Bahasa Melayu', 'English', 'Mathematics', 'Additional Mathematics',
    'Physics', 'Chemistry', 'Biology', 'History', 'Pendidikan Islam',
    'Moral Education', 'Science', 'Economics', 'Accounting'
];
const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'C+', 'C', 'D', 'E', 'G'];

const QualificationForm: React.FC<QualificationFormProps> = ({ onGetRecommendation }) => {
    const [type, setType] = useState<'SPM' | 'STPM' | 'Diploma' | 'Matriculation'>('SPM');
    const [cgpa, setCgpa] = useState<string>('');
    const [spmSubjects, setSpmSubjects] = useState<{ name: string; grade: string }[]>([
        { name: 'Bahasa Melayu', grade: 'A' },
        { name: 'English', grade: 'A' },
        { name: 'Mathematics', grade: 'A' },
    ]);
    const [error, setError] = useState<string>('');

    const addSpmSubject = () => {
        if (spmSubjects.length < 10) {
            setSpmSubjects([...spmSubjects, { name: '', grade: 'A' }]);
        }
    };

    const handleSpmChange = (index: number, field: 'name' | 'grade', value: string) => {
        const newSubjects = [...spmSubjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setSpmSubjects(newSubjects);
    };

    const removeSpmSubject = (index: number) => {
        setSpmSubjects(spmSubjects.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (['STPM', 'Diploma', 'Matriculation'].includes(type)) {
            const cgpaValue = parseFloat(cgpa);
            if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 4.0) {
                setError('Please enter a valid CGPA between 0.0 and 4.0.');
                return;
            }
        }
        
        if (spmSubjects.some(s => s.name === '' || s.grade === '')) {
            setError('Please ensure all SPM subjects have a name and a grade selected.');
            return;
        }

        const qualifications: Qualification = {
            type,
            cgpa: type !== 'SPM' ? parseFloat(cgpa) : undefined,
            spmSubjects: spmSubjects.filter(s => s.name),
        };
        onGetRecommendation(qualifications);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 p-6 md:p-8 rounded-2xl shadow-2xl max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-cyan-300 mb-6">
                Enter Your Academic Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-cyan-200 mb-2">Highest Qualification</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                    >
                        <option>SPM</option>
                        <option>STPM</option>
                        <option>Diploma</option>
                        <option>Matriculation</option>
                    </select>
                </div>

                {type !== 'SPM' && (
                    <div>
                        <label htmlFor="cgpa" className="block text-sm font-medium text-cyan-200 mb-2">CGPA</label>
                        <input
                            type="number"
                            id="cgpa"
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            placeholder="e.g., 3.75"
                            step="0.01"
                            min="0"
                            max="4"
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
                        />
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold text-cyan-200 mb-3">SPM Results (Core Subjects)</h3>
                    <div className="space-y-3">
                        {spmSubjects.map((subject, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <select
                                    value={subject.name}
                                    onChange={(e) => handleSpmChange(index, 'name', e.target.value)}
                                    className="w-1/2 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                                >
                                    <option value="">Select Subject</option>
                                    {SPM_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select
                                    value={subject.grade}
                                    onChange={(e) => handleSpmChange(index, 'grade', e.target.value)}
                                    className="w-1/3 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-white"
                                >
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeSpmSubject(index)}
                                    className="text-red-400 hover:text-red-300 transition p-2"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addSpmSubject}
                        className="mt-4 text-cyan-300 hover:text-cyan-200 font-semibold text-sm"
                    >
                        + Add another SPM subject
                    </button>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full py-3 px-6 text-lg font-bold text-slate-900 bg-gradient-to-r from-cyan-300 to-teal-400 rounded-lg shadow-lg hover:shadow-cyan-400/40 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <i className="fas fa-microchip mr-2"></i> Analyze My Future
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QualificationForm;
