// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { examService } from '../services/examService';
import { Clock, BookOpen, User } from 'lucide-react';

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examService.getAllExams()
      .then(data => setExams(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading exams...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <div key={exam.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
              {exam.status}
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Clock size={14} /> {exam.duration}m
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{exam.title}</h3>
          <p className="text-slate-500 text-sm mb-6">{exam.description || "No description provided."}</p>
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-slate-600">
              <User size={16} />
              <span className="text-xs font-medium">{exam.createdByUsername}</span>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Take Exam
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;