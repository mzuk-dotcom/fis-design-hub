
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Layers, CheckCircle, Lock, ArrowRight, AlertCircle, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Access Control Rules
const TEACHER_WHITELIST = ['teacher@fis.ed.jp', 'mzuk@fis.ed.jp'];
const STUDENT_DOMAIN = '@fis.ed.jp';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'student' | 'teacher'>('student');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
        setError("Please enter an email address.");
        return;
    }

    const emailLower = email.trim().toLowerCase();

    if (mode === 'teacher') {
        // Strict Check: Must be in whitelist
        if (!TEACHER_WHITELIST.includes(emailLower)) {
            setError("Access Denied. Only authorized teacher accounts (teacher@fis.ed.jp) can access this dashboard.");
            return;
        }
        
        onLogin({
            id: 'teacher-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            role: UserRole.TEACHER
        });
    } else {
        // Student Domain Check
        if (!emailLower.endsWith(STUDENT_DOMAIN)) {
            setError(`Access is restricted. Please log in using your FIS school email (${STUDENT_DOMAIN}).`);
            return;
        }

        onLogin({
            id: 'student-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            role: UserRole.STUDENT
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
               <Layers className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">FIS Design Hub</h1>
          <p className="text-indigo-200 text-sm font-medium">Include • Empower • Impact</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
           <button 
             onClick={() => { setMode('student'); setError(null); }}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'student' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Student Login
           </button>
           <button 
             onClick={() => { setMode('teacher'); setError(null); }}
             className={`flex-1 py-4 text-sm font-bold transition-colors ${mode === 'teacher' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Teacher Access
           </button>
        </div>

        {/* Form */}
        <div className="p-8">
           <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {mode === 'teacher' ? 'School Email Address' : 'Student Email Address'}
                </label>
                <div className="relative">
                   <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                   <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={mode === 'teacher' ? 'teacher@fis.ed.jp' : 'student123@fis.ed.jp'}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                   />
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                   <AlertCircle className="w-5 h-5 flex-shrink-0" />
                   <span>{error}</span>
                </div>
              )}

              {mode === 'teacher' && (
                 <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>Restricted Area: Requires authorized faculty account.</span>
                 </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center"
              >
                {mode === 'teacher' ? 'Verify & Login' : 'Start Designing'} <ArrowRight className="w-5 h-5 ml-2" />
              </button>
           </form>
           
           <div className="mt-6 text-center">
             <p className="text-xs text-slate-400">
               &copy; {new Date().getFullYear()} FIS Design Department. All rights reserved.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
