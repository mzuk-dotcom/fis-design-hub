
import React, { useState, useEffect } from 'react';
import { Team, TeamRole, CollaborativeProject, TeamLog, ChatMessage, StandardRoles } from '../types';
import { generateTeamChallenge } from '../services/geminiService';
import { Users, UserPlus, Briefcase, Zap, Target, FileText, CheckCircle, Wand2, Send, MessageSquare, Video, Search, Lightbulb, PenTool, BarChart2, Layout, ArrowLeft, Eye, Filter, UserCircle } from 'lucide-react';

// --- ROSTER DATA (Centralized for Collaboration) ---
const ROSTER_DATA = [
  { id: '203045', name: 'Emily Arai', grade: 8 },
  { id: '203001', name: 'Soma Arioka', grade: 8 },
  { id: '203046', name: 'Aidan Augustine', grade: 8 },
  { id: '203047', name: 'Naomi Borg', grade: 8 },
  { id: '203055', name: 'Zion Hsu', grade: 8 },
  { id: '203029', name: 'Yena Huh', grade: 8 },
  { id: '203030', name: 'Juhyun Jang', grade: 8 },
  { id: '20250022', name: 'Gabin Kim', grade: 8 },
  { id: '203028', name: 'Xiangyi Li', grade: 8 },
  { id: '202918', name: 'Miya Bevan', grade: 9 },
  { id: '202903', name: 'Dahlia Hume', grade: 9 },
  { id: '202904', name: 'Sumire Inoue', grade: 9 },
  { id: '202922', name: 'George Ito', grade: 9 },
  { id: '202801', name: 'Takumi Abe', grade: 10 },
  { id: '202802', name: 'Shoichi Asano', grade: 10 },
  { id: '202829', name: 'Seunghu Ban', grade: 10 },
  { id: '202830', name: 'Matteo Bloise', grade: 10 },
  { id: 'Alice J.', name: 'Alice Johnson', grade: 6 }, // Mock extras
  { id: 'Bob S.', name: 'Bob Smith', grade: 7 },
  { id: 'Sam K.', name: 'Sam K.', grade: 8 },
];

// --- Keyword-based Log Analysis ---
const phaseKeywords = {
  inquiry: ['research', 'survey', 'interview', 'problem', 'specs', 'needs', 'analysis', 'investigate', 'plan', 'question', 'brief', 'context', 'explore', 'define', 'client', 'audience', 'requirements', 'inquire'],
  ideation: ['sketch', 'idea', 'brainstorm', 'concept', 'drawing', 'wireframe', 'mockup', 'design', 'mind map', 'decide', 'select', 'solution', 'diagram', 'alternative', 'chosen', 'think'],
  prototyping: ['build', 'prototype', 'create', 'cad', '3d print', 'model', 'assemble', 'fabricate', 'code', 'make', 'material', 'construct', 'implement', 'solder', 'cut', 'safety', 'tools', 'print'],
  testing: ['test', 'feedback', 'review', 'evaluate', 'iterate', 'refine', 'bug', 'issue', 'user testing', 'change', 'measure', 'data', 'check', 'reflect', 'success', 'fail', 'improve']
};

const calculatePhaseProgresses = (logs: TeamLog[]) => {
  const phaseCounts = { inquiry: 0, ideation: 0, prototyping: 0, testing: 0 };

  logs.forEach(log => {
    const message = log.message.toLowerCase();
    if (phaseKeywords.testing.some(keyword => message.includes(keyword))) {
      phaseCounts.testing++;
    } else if (phaseKeywords.prototyping.some(keyword => message.includes(keyword))) {
      phaseCounts.prototyping++;
    } else if (phaseKeywords.ideation.some(keyword => message.includes(keyword))) {
      phaseCounts.ideation++;
    } else if (phaseKeywords.inquiry.some(keyword => message.includes(keyword))) {
      phaseCounts.inquiry++;
    }
  });

  const LOGS_PER_PHASE_GOAL = 5;

  return {
    inquiry: Math.min(100, (phaseCounts.inquiry / LOGS_PER_PHASE_GOAL) * 100),
    ideation: Math.min(100, (phaseCounts.ideation / LOGS_PER_PHASE_GOAL) * 100),
    prototyping: Math.min(100, (phaseCounts.prototyping / LOGS_PER_PHASE_GOAL) * 100),
    testing: Math.min(100, (phaseCounts.testing / LOGS_PER_PHASE_GOAL) * 100),
  };
};

const roleIcons: Record<string, React.ElementType> = {
  [StandardRoles.PROJECT_MANAGER]: Briefcase,
  [StandardRoles.LEAD_RESEARCHER]: Search,
  [StandardRoles.PROTOTYPER]: PenTool,
  [StandardRoles.DOCUMENTATION_LEAD]: FileText,
};

interface CollaborationHubProps {
    teacherMode?: boolean;
    initialTeamName?: string;
    onBack?: () => void;
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ teacherMode = false, initialTeamName, onBack }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('Sustainable Living');
  
  // New Peer Selector State
  // We maintain 4 slots for team members. Slot 0 is usually 'You'.
  const [teamSlots, setTeamSlots] = useState<{name: string, role: string, gradeFilter: number}[]>([
      { name: 'You', role: StandardRoles.PROJECT_MANAGER, gradeFilter: 0 },
      { name: '', role: StandardRoles.LEAD_RESEARCHER, gradeFilter: 8 },
      { name: '', role: StandardRoles.PROTOTYPER, gradeFilter: 8 },
      { name: '', role: StandardRoles.DOCUMENTATION_LEAD, gradeFilter: 8 },
  ]);

  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customThemeInput, setCustomThemeInput] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [logMessage, setLogMessage] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [teacherPersona, setTeacherPersona] = useState('Mr. Mariano');

  const themes = ['Sustainable Living', 'Smart Home Tech', 'Educational Toys', 'Assistive Devices', 'Future Food Systems'];
  const availableRoles = [...Object.values(StandardRoles), 'Custom Role'];

  // Enhanced Colors
  const phases = [
    { name: 'Inquiry', icon: Search, color: 'text-blue-600', bg: 'bg-blue-500', track: 'bg-blue-100' },
    { name: 'Ideation', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500', track: 'bg-amber-100' },
    { name: 'Prototyping', icon: PenTool, color: 'text-emerald-600', bg: 'bg-emerald-500', track: 'bg-emerald-100' },
    { name: 'Testing', icon: BarChart2, color: 'text-rose-600', bg: 'bg-rose-500', track: 'bg-rose-100' },
  ];

  // --- TEACHER MODE EFFECT ---
  useEffect(() => {
      if (teacherMode && initialTeamName) {
          setLoading(true);
          setTimeout(() => {
              setTeam({
                id: 'mock-team-1',
                name: initialTeamName,
                members: [
                  { name: 'Alice', role: StandardRoles.PROJECT_MANAGER, avatarColor: 'bg-indigo-500' },
                  { name: 'Bob', role: StandardRoles.PROTOTYPER, avatarColor: 'bg-green-500' },
                  { name: 'Charlie', role: StandardRoles.LEAD_RESEARCHER, avatarColor: 'bg-yellow-500' }
                ],
                project: {
                    title: `${initialTeamName} Design Brief`,
                    theme: 'Mock Theme',
                    scenario: 'This is a mocked project scenario for teacher review.',
                    objectives: ['Analyze user needs', 'Develop 3 prototypes'],
                    deliverables: ['CAD Model', 'Process Journal'],
                    teamRubric: []
                },
                progress: 65,
                logs: [
                    { id: 'l1', author: 'Alice', role: 'Project Manager', message: 'Assigned tasks for the week.', timestamp: new Date(Date.now() - 10000000).toISOString() },
                    { id: 'l2', author: 'Bob', role: 'Prototyper', message: '3D Printer is jammed, need help.', timestamp: new Date(Date.now() - 5000000).toISOString() }
                ],
                chatMessages: [
                    { id: 'c1', author: 'Charlie', text: 'I found some great research on similar products.', timestamp: new Date().toISOString(), avatarColor: 'bg-yellow-500' }
                ]
              });
              setLoading(false);
          }, 1000);
      }
  }, [teacherMode, initialTeamName]);

  const updateSlot = (index: number, field: keyof typeof teamSlots[0], value: any) => {
      setTeamSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = { ...newSlots[index], [field]: value };
          // Reset name if filter changes to avoid mismatch
          if (field === 'gradeFilter') {
               newSlots[index].name = ''; 
          }
          return newSlots;
      });
  };

  const getFilteredStudents = (grade: number) => {
      return ROSTER_DATA.filter(s => s.grade === grade);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    
    // Validation: Check if all slots have names
    if (teamSlots.some(s => !s.name)) {
        alert("Please assign a student to every role before starting.");
        return;
    }

    setLoading(true);
    
    try {
      const finalTheme = isCustomTheme ? customThemeInput : selectedTheme;
      const projectData = await generateTeamChallenge(finalTheme);
      
      const initialLogs: TeamLog[] = [
        {
          id: '1',
          author: 'System',
          role: 'Admin',
          message: `Team "${newTeamName}" formed. Project started. Begin with Inquiry and Research.`,
          timestamp: new Date().toISOString()
        }
      ];

      const initialProgresses = calculatePhaseProgresses(initialLogs);
      const initialTotalProgress = Math.round((initialProgresses.inquiry + initialProgresses.ideation + initialProgresses.prototyping + initialProgresses.testing) / 4);

      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName,
        members: teamSlots.map((slot, idx) => ({
            name: slot.name,
            role: slot.role,
            avatarColor: idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-green-500' : idx === 2 ? 'bg-yellow-500' : 'bg-red-500'
        })),
        project: {
            ...projectData as CollaborativeProject,
            theme: finalTheme
        },
        progress: initialTotalProgress,
        logs: initialLogs,
        chatMessages: [
           { id: 'c1', author: 'System', text: 'Welcome to the team chat! Use this space to discuss ideas.', timestamp: new Date().toISOString(), avatarColor: 'bg-gray-400' }
        ]
      };
      setTeam(newTeam);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostLog = () => {
    if (!logMessage.trim() || !team) return;
    const currentUserRole = team.members.find(m => m.name === 'You')?.role || 'Student';
    const newLog: TeamLog = {
      id: Date.now().toString(),
      author: 'You',
      role: currentUserRole,
      message: logMessage,
      timestamp: new Date().toISOString()
    };
    const newLogs = [newLog, ...team.logs];
    const newPhaseProgresses = calculatePhaseProgresses(newLogs);
    const newTotalProgress = Math.round((newPhaseProgresses.inquiry + newPhaseProgresses.ideation + newPhaseProgresses.prototyping + newPhaseProgresses.testing) / 4);

    setTeam(prev => prev ? ({ ...prev, logs: newLogs, progress: newTotalProgress }) : null);
    setLogMessage('');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !team) return;
    
    const authorName = teacherMode ? teacherPersona : 'You';
    const avatarColor = teacherMode ? 'bg-blue-600' : 'bg-indigo-500';

    const newMessage: ChatMessage = {
        id: Date.now().toString(),
        author: authorName,
        text: chatInput,
        timestamp: new Date().toISOString(),
        avatarColor: avatarColor
    };
    setTeam(prev => prev ? ({ ...prev, chatMessages: [...prev.chatMessages, newMessage] }) : null);
    setChatInput('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Wand2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">{teacherMode ? "Accessing team data..." : "Assembling team & generating project brief..."}</p>
      </div>
    );
  }

  if (!team) {
    if (teacherMode) return <div className="text-red-500">Team data not found.</div>;

    return (
      <div className="max-w-3xl mx-auto mt-10 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-bold mb-2">Collaborative Projects</h1>
            <p className="opacity-90">Form a squad, assign roles, and tackle complex design challenges together.</p>
          </div>
          
          <div className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
              <input 
                type="text" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. The Eco-Bin Project"
              />
            </div>

            {/* PEER SELECTOR & ROLE ASSIGNMENT */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-indigo-500" /> Assign Team Roles
              </h3>
              <div className="space-y-4">
                {teamSlots.map((slot, index) => {
                  const Icon = roleIcons[slot.role] || Briefcase;
                  
                  return (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                      <div className="grid md:grid-cols-2 gap-4 items-center">
                          {/* Left: Role Selection */}
                          <div>
                              <div className="flex items-center space-x-2 mb-2">
                                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200 text-purple-600">
                                      <Icon className="w-4 h-4" />
                                  </div>
                                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                              </div>
                              <select 
                                value={slot.role}
                                onChange={(e) => updateSlot(index, 'role', e.target.value)}
                                className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                              >
                                  {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                          </div>

                          {/* Right: Peer Selector */}
                          <div>
                              <div className="flex items-center space-x-2 mb-2">
                                  <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200 text-blue-600">
                                      <Filter className="w-4 h-4" />
                                  </div>
                                  <label className="text-xs font-bold text-slate-500 uppercase">Team Member</label>
                              </div>
                              
                              {index === 0 ? (
                                  // User is always locked to slot 0
                                  <div className="w-full p-2 text-sm bg-indigo-100 text-indigo-800 font-bold rounded-lg border border-indigo-200 text-center">
                                      You ({slot.name})
                                  </div>
                              ) : (
                                  <div className="flex space-x-2">
                                      {/* Grade Filter */}
                                      <select 
                                        className="w-1/3 p-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-purple-500"
                                        value={slot.gradeFilter}
                                        onChange={(e) => updateSlot(index, 'gradeFilter', parseInt(e.target.value))}
                                      >
                                          <option value={8}>Gr 8</option>
                                          <option value={9}>Gr 9</option>
                                          <option value={10}>Gr 10</option>
                                      </select>
                                      
                                      {/* Student Dropdown */}
                                      <select
                                        className="w-2/3 p-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-purple-500"
                                        value={slot.name}
                                        onChange={(e) => updateSlot(index, 'name', e.target.value)}
                                      >
                                          <option value="">Select Peer...</option>
                                          {getFilteredStudents(slot.gradeFilter).map(s => (
                                              <option key={s.id} value={s.name}>{s.name}</option>
                                          ))}
                                      </select>
                                  </div>
                              )}
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Theme</label>
              <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(t => (
                    <button 
                        key={t}
                        onClick={() => { setSelectedTheme(t); setIsCustomTheme(false); }}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${!isCustomTheme && selectedTheme === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                    >
                        {t}
                    </button>
                    ))}
                    <button 
                        onClick={() => setIsCustomTheme(true)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center ${isCustomTheme ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                    >
                        <PenTool className="w-4 h-4 mr-2" /> Custom Theme
                    </button>
                  </div>
                  
                  {isCustomTheme && (
                      <input 
                        type="text" 
                        value={customThemeInput}
                        onChange={(e) => setCustomThemeInput(e.target.value)}
                        placeholder="Enter your own project theme..."
                        className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50"
                      />
                  )}
              </div>
            </div>

            <button 
              onClick={handleCreateTeam}
              disabled={!newTeamName || (isCustomTheme && !customThemeInput)}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-200"
            >
              Start Team Challenge
            </button>
          </div>
        </div>
      </div>
    );
  }

  const phaseProgresses = calculatePhaseProgresses(team.logs);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Teacher Back Button */}
      {teacherMode && onBack && (
          <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
      )}

      {/* Teacher Overlay Banner */}
      {teacherMode && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg flex items-center mb-4">
              <Eye className="w-5 h-5 mr-2" />
              <span className="font-bold text-sm">Teacher View Mode: You can now reply to student chats below.</span>
          </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
             <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">Active</span>
          </div>
          <p className="text-slate-500 text-sm">Working on: <span className="font-semibold text-purple-600">{team.project?.theme}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center -space-x-2">
           {team.members.map((m, i) => (
             <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`} title={`${m.name} - ${m.role}`}>
                {m.name.charAt(0)}
             </div>
           ))}
           <button className="w-10 h-10 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
              <UserPlus className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tabbed Content (Brief vs Chat) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Switcher */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layout className="w-4 h-4 mr-2" /> Project Overview
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> Team Discussion
                </button>
            </div>

           {/* Content for Overview Tab */}
           {activeTab === 'overview' && (
               <>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-purple-500" /> Project Brief: {team.project?.title}
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-6">{team.project?.scenario}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-purple-500" /> Objectives
                        </h3>
                        <ul className="space-y-2">
                            {team.project?.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {obj}
                            </li>
                            ))}
                        </ul>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-purple-500" /> Deliverables
                        </h3>
                        <ul className="space-y-2">
                            {team.project?.deliverables.map((del, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                {del}
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div>

                    {team.project?.tutorialLinks && team.project.tutorialLinks.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                            <Video className="w-4 h-4 mr-2 text-purple-500" /> Team Learning Resources
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {team.project.tutorialLinks.map((term, i) => (
                                <a 
                                key={i}
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(term + ' tutorial')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                >
                                <span className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center mr-3 text-[10px] group-hover:bg-red-200">▶</span>
                                <span className="text-sm text-slate-600 group-hover:text-purple-700 font-medium">{term}</span>
                                </a>
                            ))}
                        </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Shared Progress Log
                    </h2>
                    
                    {!teacherMode && (
                        <div className="mb-6 flex space-x-2">
                        <input 
                            type="text" 
                            value={logMessage}
                            onChange={(e) => setLogMessage(e.target.value)}
                            placeholder="Log an activity (e.g., 'Completed survey')..."
                            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && handlePostLog()}
                        />
                        <button 
                            onClick={handlePostLog}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                        </div>
                    )}

                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {team.logs.map((log) => (
                        <div key={log.id} className="flex space-x-3">
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold ${log.author === 'You' ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                                {log.author.charAt(0)}
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg flex-1">
                                <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-slate-800">{log.author} <span className="text-xs font-normal text-slate-500">({log.role})</span></span>
                                <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-slate-700">{log.message}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
               </>
           )}

           {/* Content for Discussion Tab */}
           {activeTab === 'chat' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" /> Team Forum
                        </h2>
                        <p className="text-xs text-slate-500">Discuss ideas, share files, and plan your next steps.</p>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                        {team.chatMessages.map((msg) => {
                            const isMe = msg.author === 'You' || (teacherMode && (msg.author === 'Mr. Mariano' || msg.author === 'Mr. Mervin'));
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'} items-end space-x-2 max-w-[80%]`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${msg.avatarColor}`}>
                                            {msg.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className={`p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                            <p className={`text-[10px] mt-1 ${isMe ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                                                {msg.author} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-200 rounded-b-xl">
                        {teacherMode && (
                            <div className="flex items-center space-x-2 mb-2">
                                <UserCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">Posting as:</span>
                                <select 
                                    value={teacherPersona} 
                                    onChange={(e) => setTeacherPersona(e.target.value)}
                                    className="text-xs border border-slate-300 rounded p-1"
                                >
                                    <option value="Mr. Mariano">Mr. Mariano</option>
                                    <option value="Mr. Mervin">Mr. Mervin</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={teacherMode ? `Reply to team as ${teacherPersona}...` : "Type a message..."}
                                className="flex-1 p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
           )}

        </div>

        {/* Right Column: Progress & Roles (Always Visible) */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" /> Project Phase Progress
              </h2>
              <p className="text-xs text-slate-500 -mt-3 mb-4">Progress is estimated based on keywords in your <strong>Activity Log</strong>.</p>
              <div className="space-y-4">
                {phases.map((phase) => {
                  const phaseKey = phase.name.toLowerCase() as keyof typeof phaseProgresses;
                  const percentage = phaseProgresses[phaseKey];
                  
                  return (
                    <div key={phase.name}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-2">
                          <phase.icon className={`w-4 h-4 ${phase.color}`} />
                          <span className="text-sm font-medium text-slate-700">{phase.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${percentage > 0 ? phase.color : 'text-slate-400'}`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className={`w-full h-3 rounded-full ${phase.track}`}>
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ease-in-out ${phase.bg}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" /> Role Assignments
            </h2>
            <div className="space-y-4">
              {team.members.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                        {m.name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-800">{m.name}</p>
                       <p className="text-xs text-slate-500">{m.role}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub;
