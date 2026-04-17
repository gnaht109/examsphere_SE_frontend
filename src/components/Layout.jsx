import React from 'react';
import { LayoutDashboard, BookOpen, Upload, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-indigo-600 tracking-tight">
            ExamSphere
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarItem icon={<BookOpen size={20} />} label="My Exams" />
          <SidebarItem icon={<Upload size={20} />} label="Upload Exam" />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
          <h2 className="font-semibold text-slate-700">Welcome back, Developer</h2>
        </header>
        
        <div className="p-8">
          {children} {/* This is where the specific page content will go */}
        </div>
      </main>
    </div>
  );
};

// A small sub-component for the sidebar buttons
const SidebarItem = ({ icon, label, active = false }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
    active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
  }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Layout;