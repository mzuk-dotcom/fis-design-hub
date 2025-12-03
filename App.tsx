
import React, { useState, useRef } from 'react';
import { UserRole, SkillDomain, GradeLevel, ChallengeStatus, Submission, User, ActivityMetric } from './types';
import SkillMatrix from './components/SkillMatrix';
import ChallengeView from './components/ChallengeView';
import TeacherDashboard from './components/TeacherDashboard';
import CollaborationHub from './components/CollaborationHub';
import PeerReviewSystem from './components/PeerReviewSystem';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/StudentDashboard';
import SkillsLibrary from './components/SkillsLibrary';
import { Layers, LayoutDashboard, Trophy, Star, Users, MessageCircle, LogOut, ClipboardList, ArrowLeft, Library, GraduationCap } from 'lucide-react';

// Initial Status Map
const initialStatus: Record<string, ChallengeStatus> = {};
Object.values(SkillDomain).forEach(domain => {
  Object.values(GradeLevel).forEach((grade) => {
     // Unlock ALL grades for students to choose freely
     initialStatus[`${domain}-${grade}`] = ChallengeStatus.AVAILABLE;
  });
});

const METRICS_KEY = 'fis_activity_metrics';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Monitoring State
  const sessionStartTimeRef = useRef<number | null>(null);

  // View State
  const [view, setView] = useState<'dashboard' | 'matrix' | 'challenge' | 'collaboration' | 'peer-reviews'>('dashboard');
  const [selectedCell, setSelectedCell] = useState<{ domain: SkillDomain; grade: GradeLevel } | null>(null);
  const [statusMap, setStatusMap] = useState(initialStatus);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(4);
  
  // Teacher View State
  const [teacherView, setTeacherView] = useState<'dashboard' | 'review' | 'team' | 'library' | 'profiles'>('dashboard');
  const [selectedTeacherItemId, setSelectedTeacherItemId] = useState<string | null>(null);

  // Global State for Submissions (feeds Peer Review)
  const [sharedSubmissions, setSharedSubmissions] = useState<Submission[]>([]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    
    // --- BACKEND MONITOR: TRACK LOGIN ---
    if (user.role === UserRole.STUDENT) {
        sessionStartTimeRef.current = Date.now();
        
        try {
            const storedMetrics = localStorage.getItem(METRICS_KEY);
            const metrics: Record<string, ActivityMetric> = storedMetrics ? JSON.parse(storedMetrics) : {};
            
            const currentMetric = metrics[user.email] || { 
                email: user.email, 
                loginCount: 0, 
                totalMinutes: 0, 
                lastLogin: new Date().toISOString() 
            };

            metrics[user.email] = {
                ...currentMetric,
                loginCount: currentMetric.loginCount + 1,
                lastLogin: new Date().toISOString()
            };

            localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
        } catch (e) {
            console.error("Failed to update engagement metrics", e);
        }
    }
    
    if (user.role === UserRole.STUDENT) {
      setView('dashboard');
    } else {
        setTeacherView('dashboard');
    }
  };

  const handleLogout = () => {
    // --- BACKEND MONITOR: TRACK DURATION ---
    if (currentUser && currentUser.role === UserRole.STUDENT && sessionStartTimeRef.current) {
        const durationMinutes = (Date.now() - sessionStartTimeRef.current) / 60000;
        
        try {
            const storedMetrics = localStorage.getItem(METRICS_KEY);
            const metrics: Record<string, ActivityMetric> = storedMetrics ? JSON.parse(storedMetrics) : {};
            
            if (metrics[currentUser.email]) {
                metrics[currentUser.email].totalMinutes += durationMinutes;
                localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
            }
        } catch (e) {
            console.error("Failed to update session duration", e);
        }
    }

    sessionStartTimeRef.current = null;
    setCurrentUser(null);
    setView('dashboard');
    setTeacherView('dashboard');
  };

  const handleSelectCell = (domain: SkillDomain, grade: GradeLevel) => {
    setSelectedCell({ domain, grade });
    setView('challenge');
  };

  const handleGlobalSubmit = (newSubmission: Submission) => {
      setSharedSubmissions(prev => [newSubmission, ...prev]);
  };

  const handleStatusUpdate = (key: string, newStatus: ChallengeStatus) => {
    setStatusMap(prev => {
        // Only award XP if transitioning to SUBMITTED for the first time
        const oldStatus = prev[key];
        const isFirstSubmission = newStatus === ChallengeStatus.SUBMITTED && oldStatus !== ChallengeStatus.SUBMITTED && oldStatus !== ChallengeStatus.COMPLETED;
        
        if (isFirstSubmission) {
             handleXPUpdate(50); // Award 50 XP for main challenge submission
        }
        return { ...prev, [key]: newStatus };
    });
  };

  const handleXPUpdate = (amount: number) => {
      setXp(prevXp => {
          const newXp = prevXp + amount;
          // Level up logic: Level 1 starts at 0, Level 2 at 500, Level 3 at 1000...
          // Formula: Level = Floor(XP / 500) + 1
          const newLevel = Math.floor(newXp / 500) + 1;
          if (newLevel > level) {
              setLevel(newLevel);
              // In a real app, trigger a "Level Up" modal here
              alert(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
          }
          return newXp;
      });
  };

  const handleTeacherNavigate = (view: 'review' | 'team', id: string) => {
      setTeacherView(view);
      setSelectedTeacherItemId(id);
  };

  const calculateProgress = () => {
    // Determine progress for progress bar relative to current level bracket
    // e.g. if XP is 1250 (Level 3), range is 1000-1500. Progress is 250/500 = 50%
    const levelBase = (level - 1) * 500;
    const levelCeiling = level * 500;
    const progressInLevel = xp - levelBase;
    return (progressInLevel / 500) * 100;
  }

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                    {currentUser.name.charAt(0)}
                </div>
                <div>
                    <h2 className="font-bold text-sm">{currentUser.name}</h2>
                    <p className="text-xs text-slate-400">{currentUser.role}</p>
                </div>
            </div>

            {/* XP & Level Widget */}
            {currentUser.role === UserRole.STUDENT && (
                <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Level {level}</span>
                        <span className="text-indigo-400 font-bold text-sm">{xp} XP</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${calculateProgress()}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 text-right">Next: {level * 500} XP</p>
                </div>
            )}

            <nav className="space-y-2">
                {currentUser.role === UserRole.STUDENT ? (
                    <>
                        <button 
                            onClick={() => setView('dashboard')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button 
                            onClick={() => setView('matrix')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${view === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Layers className="w-5 h-5" />
                            <span className="font-medium">Skill Matrix</span>
                        </button>
                        <button 
                            onClick={() => setView('collaboration')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${view === 'collaboration' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Collaborate</span>
                        </button>
                        <button 
                            onClick={() => setView('peer-reviews')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${view === 'peer-reviews' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">Peer Review</span>
                        </button>
                    </>
                ) : (
                    // Teacher Nav
                    <>
                        <button 
                            onClick={() => setTeacherView('dashboard')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${teacherView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium">Command Center</span>
                        </button>
                        <button 
                            onClick={() => setTeacherView('library')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${teacherView === 'library' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Library className="w-5 h-5" />
                            <span className="font-medium">Library Skills</span>
                        </button>
                        <button 
                            onClick={() => setTeacherView('profiles')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${teacherView === 'profiles' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            <span className="font-medium">Student Profile</span>
                        </button>
                    </>
                )}
            </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center text-slate-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5 mr-3" />
                Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
         {currentUser.role === UserRole.TEACHER ? (
             <>
                {teacherView === 'dashboard' && (
                    <TeacherDashboard 
                        sharedSubmissions={sharedSubmissions} 
                        onNavigate={handleTeacherNavigate}
                    />
                )}
                {teacherView === 'review' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setTeacherView('dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </button>
                        <PeerReviewSystem 
                            sharedSubmissions={sharedSubmissions} 
                            initialSubmissionId={selectedTeacherItemId}
                        />
                    </div>
                )}
                {teacherView === 'team' && (
                    <CollaborationHub 
                        teacherMode={true} 
                        initialTeamName={selectedTeacherItemId || ''} 
                        onBack={() => setTeacherView('dashboard')}
                    />
                )}
                {teacherView === 'library' && (
                    <SkillsLibrary />
                )}
                {teacherView === 'profiles' && (
                    <TeacherDashboard 
                        sharedSubmissions={sharedSubmissions} 
                        onNavigate={handleTeacherNavigate}
                        initialTab="profiles"
                    />
                )}
             </>
         ) : (
             <>
                {view === 'dashboard' && (
                    <StudentDashboard 
                        grade={GradeLevel.G6} 
                        statusMap={statusMap} 
                        onSelectChallenge={handleSelectCell} 
                    />
                )}
                {view === 'matrix' && (
                    <div className="animate-fade-in">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-800">Skill Matrix</h1>
                            <p className="text-slate-500">Track your progress across all design domains.</p>
                        </div>
                        <SkillMatrix 
                            statusMap={statusMap} 
                            onSelectCell={handleSelectCell}
                            onCompletePractice={handleXPUpdate}
                        />
                    </div>
                )}
                {view === 'challenge' && selectedCell && (
                    <ChallengeView 
                        domain={selectedCell.domain} 
                        grade={selectedCell.grade} 
                        onBack={() => setView('matrix')}
                        onStatusUpdate={handleStatusUpdate}
                        status={statusMap[`${selectedCell.domain}-${selectedCell.grade}`] || ChallengeStatus.AVAILABLE}
                        onGlobalSubmit={handleGlobalSubmit}
                    />
                )}
                {view === 'collaboration' && <CollaborationHub />}
                {view === 'peer-reviews' && <PeerReviewSystem sharedSubmissions={sharedSubmissions} />}
             </>
         )}
      </main>
    </div>
  );
};

export default App;
