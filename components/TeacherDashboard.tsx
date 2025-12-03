
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  LayoutGrid, 
  MessageSquare, 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Activity,
  BrainCircuit,
  BookOpen,
  MessageCircle,
  Send,
  User,
  Plus,
  ArrowRight, 
  BarChart, 
  X, 
  Mail,
  CheckSquare,
  Square,
  Dumbbell,
  GraduationCap,
  Scroll,
  ClipboardList,
  Shield,
  Upload,
  Heart,
  Palette, Brain, Handshake, Wrench, Lightbulb, Globe, Sparkles, RefreshCw, MessageSquareQuote
} from 'lucide-react';
import { 
  GradeLevel, 
  SkillDomain, 
  TeamLog, 
  Submission, 
  Nomination,
  ActivityMetric,
  ATLSkill,
  ChatSession,
  SupervisorMessage,
  IncidentType,
  FIS_AWARDS
} from '../types';
import { assessTeamPerformance } from '../services/geminiService';

// ... (Existing Mock Data - Teams) ...
const mockActiveTeams = [ { id: 't1', name: 'The Eco-Bin Project', members: ['Alice J.', 'Bob S.', 'Charlie D.'], theme: 'Sustainable Design', status: 'Active', lastActivity: '10 mins ago', health: 'Healthy' }, { id: 't2', name: 'Mars Rover Alpha', members: ['Diana P.', 'Evan W.'], theme: 'Robotics', status: 'Stalled', lastActivity: '3 days ago', health: 'Needs Attention' }, { id: 't3', name: 'Smart Garden', members: ['Zion H.', 'Yena H.'], theme: 'Microbits', status: 'Active', lastActivity: '1 hour ago', health: 'Healthy' }, ];

// Enhanced Heatmap Data with Trends
const heatmapData: Record<SkillDomain, Record<GradeLevel, { score: number, trend: 'up' | 'down' | 'stable' }>> = { 
    [SkillDomain.SKETCHING]: { [GradeLevel.G6]: {score: 85, trend: 'up'}, [GradeLevel.G7]: {score: 88, trend: 'stable'}, [GradeLevel.G8]: {score: 92, trend: 'up'}, [GradeLevel.G9]: {score: 95, trend: 'stable'}, [GradeLevel.G10]: {score: 98, trend: 'up'} }, 
    [SkillDomain.WOODWORK]: { [GradeLevel.G6]: {score: 70, trend: 'down'}, [GradeLevel.G7]: {score: 75, trend: 'up'}, [GradeLevel.G8]: {score: 82, trend: 'stable'}, [GradeLevel.G9]: {score: 88, trend: 'up'}, [GradeLevel.G10]: {score: 92, trend: 'stable'} }, 
    [SkillDomain.POWER_TOOLS]: { [GradeLevel.G6]: {score: 40, trend: 'down'}, [GradeLevel.G7]: {score: 65, trend: 'up'}, [GradeLevel.G8]: {score: 78, trend: 'up'}, [GradeLevel.G9]: {score: 85, trend: 'stable'}, [GradeLevel.G10]: {score: 90, trend: 'stable'} }, 
    [SkillDomain.THREE_D_PRINTING]: { [GradeLevel.G6]: {score: 60, trend: 'stable'}, [GradeLevel.G7]: {score: 55, trend: 'down'}, [GradeLevel.G8]: {score: 85, trend: 'up'}, [GradeLevel.G9]: {score: 90, trend: 'up'}, [GradeLevel.G10]: {score: 95, trend: 'up'} }, 
    [SkillDomain.LASER_CUTTER]: { [GradeLevel.G6]: {score: 20, trend: 'stable'}, [GradeLevel.G7]: {score: 45, trend: 'up'}, [GradeLevel.G8]: {score: 70, trend: 'up'}, [GradeLevel.G9]: {score: 82, trend: 'stable'}, [GradeLevel.G10]: {score: 88, trend: 'stable'} }, 
    [SkillDomain.MICROBITS]: { [GradeLevel.G6]: {score: 80, trend: 'up'}, [GradeLevel.G7]: {score: 60, trend: 'down'}, [GradeLevel.G8]: {score: 55, trend: 'stable'}, [GradeLevel.G9]: {score: 75, trend: 'up'}, [GradeLevel.G10]: {score: 85, trend: 'up'} }, 
    [SkillDomain.DIGITAL_DESIGN]: { [GradeLevel.G6]: {score: 90, trend: 'stable'}, [GradeLevel.G7]: {score: 92, trend: 'stable'}, [GradeLevel.G8]: {score: 95, trend: 'up'}, [GradeLevel.G9]: {score: 96, trend: 'stable'}, [GradeLevel.G10]: {score: 98, trend: 'up'} }, 
    [SkillDomain.TEXTILES]: { [GradeLevel.G6]: {score: 75, trend: 'up'}, [GradeLevel.G7]: {score: 70, trend: 'down'}, [GradeLevel.G8]: {score: 65, trend: 'down'}, [GradeLevel.G9]: {score: 60, trend: 'stable'}, [GradeLevel.G10]: {score: 55, trend: 'down'} }, 
    [SkillDomain.ROBOTICS]: { [GradeLevel.G6]: {score: 50, trend: 'stable'}, [GradeLevel.G7]: {score: 65, trend: 'up'}, [GradeLevel.G8]: {score: 80, trend: 'up'}, [GradeLevel.G9]: {score: 85, trend: 'stable'}, [GradeLevel.G10]: {score: 90, trend: 'up'} }, 
    [SkillDomain.VIDEO_PRODUCTION]: { [GradeLevel.G6]: {score: 85, trend: 'up'}, [GradeLevel.G7]: {score: 88, trend: 'stable'}, [GradeLevel.G8]: {score: 80, trend: 'down'}, [GradeLevel.G9]: {score: 85, trend: 'up'}, [GradeLevel.G10]: {score: 90, trend: 'stable'} }, 
    [SkillDomain.SUSTAINABLE_DESIGN]: { [GradeLevel.G6]: {score: 65, trend: 'up'}, [GradeLevel.G7]: {score: 70, trend: 'up'}, [GradeLevel.G8]: {score: 75, trend: 'stable'}, [GradeLevel.G9]: {score: 80, trend: 'up'}, [GradeLevel.G10]: {score: 85, trend: 'up'} }, 
    [SkillDomain.PROGRAMMING]: { [GradeLevel.G6]: {score: 70, trend: 'stable'}, [GradeLevel.G7]: {score: 75, trend: 'up'}, [GradeLevel.G8]: {score: 80, trend: 'up'}, [GradeLevel.G9]: {score: 85, trend: 'stable'}, [GradeLevel.G10]: {score: 90, trend: 'up'} }, 
    [SkillDomain.AI_LITERACY]: { [GradeLevel.G6]: {score: 45, trend: 'stable'}, [GradeLevel.G7]: {score: 55, trend: 'up'}, [GradeLevel.G8]: {score: 70, trend: 'up'}, [GradeLevel.G9]: {score: 80, trend: 'up'}, [GradeLevel.G10]: {score: 90, trend: 'up'} }, 
    [SkillDomain.ENTREPRENEURSHIP]: { [GradeLevel.G6]: {score: 30, trend: 'stable'}, [GradeLevel.G7]: {score: 40, trend: 'up'}, [GradeLevel.G8]: {score: 60, trend: 'up'}, [GradeLevel.G9]: {score: 80, trend: 'up'}, [GradeLevel.G10]: {score: 95, trend: 'up'} }, 
};

const mockPendingReviews = [ { id: 'pr1', author: 'Sam K.', target: 'Alice J.', content: 'This is okay I guess.', status: 'Pending', flags: ['Low Effort'] }, { id: 'pr2', author: 'Alex M.', target: 'Bob S.', content: 'Great job on the joints! Maybe sand the edges more next time.', status: 'Pending', flags: [] }, { id: 'pr3', author: 'Casey B.', target: 'Diana P.', content: 'Your project sucks and you should quit.', status: 'Flagged', flags: ['Inappropriate Language'] }, ];

// --- EXPANDED STUDENT PROFILE INTERFACE ---
interface ExtendedStudentProfile { 
    id: string; 
    name: string; 
    email: string; 
    grade: number; 
    wida: number; 
    dominantAtl: ATLSkill;
    // New Fields
    mapMath: number; // RIT Score
    mapReading: number; // RIT Score
    challengesCompleted: number;
    challengesAssigned: number;
    learnerProfile: string[];
    behaviorNotes: { date: string, type: IncidentType, note: string }[];
    empathyMapUrl?: string;
}

const mockStudentDatabase: ExtendedStudentProfile[] = [ 
    // Grade 8
    { id: '203045', name: 'Emily Arai', email: 'emily.arai30@fis.ed.jp', grade: 8, wida: 4.2, dominantAtl: ATLSkill.RESEARCH, mapMath: 235, mapReading: 228, challengesCompleted: 12, challengesAssigned: 15, learnerProfile: ['Inquirer', 'Knowledgeable'], behaviorNotes: [], empathyMapUrl: 'https://placehold.co/600x400/e0e7ff/4f46e5?text=Emily%27s+Empathy+Map' }, 
    { id: '203001', name: 'Soma Arioka', email: 'soma.arioka30@fis.ed.jp', grade: 8, wida: 3.5, dominantAtl: ATLSkill.SELF_MANAGEMENT, mapMath: 242, mapReading: 215, challengesCompleted: 8, challengesAssigned: 15, learnerProfile: ['Risk-Taker'], behaviorNotes: [{date: '2023-10-12', type: IncidentType.SAFETY, note: 'Forgot safety goggles during drill press usage.'}] }, 
    { id: '203046', name: 'Aidan Augustine', email: 'aidan.augustine30@fis.ed.jp', grade: 8, wida: 5.8, dominantAtl: ATLSkill.THINKING, mapMath: 250, mapReading: 245, challengesCompleted: 15, challengesAssigned: 15, learnerProfile: ['Thinker', 'Communicator'], behaviorNotes: [{date: '2023-11-05', type: IncidentType.POSITIVE, note: 'Excellent peer leadership in group project.'}], empathyMapUrl: 'https://placehold.co/600x400/f0f9ff/0284c7?text=Aidan%27s+Empathy+Map' }, 
    { id: '203047', name: 'Naomi Borg', email: 'naomi.borg30@fis.ed.jp', grade: 8, wida: 6.0, dominantAtl: ATLSkill.COMMUNICATION, mapMath: 230, mapReading: 255, challengesCompleted: 14, challengesAssigned: 15, learnerProfile: ['Communicator', 'Open-Minded'], behaviorNotes: [] }, 
    { id: '203055', name: 'Zion Hsu', email: 'zion.hsu30@fis.ed.jp', grade: 8, wida: 2.8, dominantAtl: ATLSkill.SOCIAL, mapMath: 210, mapReading: 205, challengesCompleted: 5, challengesAssigned: 15, learnerProfile: ['Caring'], behaviorNotes: [] }, 
    { id: '203029', name: 'Yena Huh', email: 'yena.huh30@fis.ed.jp', grade: 8, wida: 4.5, dominantAtl: ATLSkill.THINKING, mapMath: 240, mapReading: 235, challengesCompleted: 11, challengesAssigned: 15, learnerProfile: ['Reflective'], behaviorNotes: [] }, 
    { id: '203030', name: 'Juhyun Jang', email: 'juhyun.jang30@fis.ed.jp', grade: 8, wida: 3.9, dominantAtl: ATLSkill.RESEARCH, mapMath: 245, mapReading: 220, challengesCompleted: 9, challengesAssigned: 15, learnerProfile: ['Inquirer'], behaviorNotes: [] }, 
    { id: '20250022', name: 'Gabin Kim', email: 'gabin.kim30@fis.ed.jp', grade: 8, wida: 5.1, dominantAtl: ATLSkill.SELF_MANAGEMENT, mapMath: 255, mapReading: 240, challengesCompleted: 13, challengesAssigned: 15, learnerProfile: ['Principled'], behaviorNotes: [] }, 
    { id: '203028', name: 'Xiangyi Li', email: 'xiangyi.li30@fis.ed.jp', grade: 8, wida: 3.2, dominantAtl: ATLSkill.SOCIAL, mapMath: 225, mapReading: 210, challengesCompleted: 6, challengesAssigned: 15, learnerProfile: ['Balanced'], behaviorNotes: [] }, 
    // Grade 9
    { id: '202918', name: 'Miya Bevan', email: 'miya.bevan29@fis.ed.jp', grade: 9, wida: 5.5, dominantAtl: ATLSkill.COMMUNICATION, mapMath: 240, mapReading: 250, challengesCompleted: 18, challengesAssigned: 20, learnerProfile: ['Communicator'], behaviorNotes: [] }, 
    { id: '202903', name: 'Dahlia Hume', email: 'dahlia.hume29@fis.ed.jp', grade: 9, wida: 4.0, dominantAtl: ATLSkill.RESEARCH, mapMath: 230, mapReading: 230, challengesCompleted: 15, challengesAssigned: 20, learnerProfile: ['Inquirer'], behaviorNotes: [] }, 
    // Grade 10
    { id: '202801', name: 'Takumi Abe', email: 'takumi.abe28@fis.ed.jp', grade: 10, wida: 4.8, dominantAtl: ATLSkill.SELF_MANAGEMENT, mapMath: 260, mapReading: 245, challengesCompleted: 22, challengesAssigned: 25, learnerProfile: ['Thinker', 'Balanced'], behaviorNotes: [] },
    // Lower Grades
    { id: 'Alice J.', name: 'Alice Johnson', email: 'alice.johnson@fis.ed.jp', grade: 6, wida: 5.5, dominantAtl: ATLSkill.COMMUNICATION, mapMath: 215, mapReading: 220, challengesCompleted: 4, challengesAssigned: 5, learnerProfile: ['Risk-Taker'], behaviorNotes: [] }, 
    { id: 'Bob S.', name: 'Bob Smith', email: 'bob.smith@fis.ed.jp', grade: 7, wida: 4.0, dominantAtl: ATLSkill.RESEARCH, mapMath: 220, mapReading: 210, challengesCompleted: 3, challengesAssigned: 5, learnerProfile: ['Inquirer'], behaviorNotes: [] }, 
];
const initialNominations: Nomination[] = [ { id: 'nom-1', studentName: 'Diana Prince', award: 'The Human-Centered Visionary Award', justification: 'Developed a completely novel approach to sustainable packaging using mycelium composites.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() } ];

interface TeacherDashboardProps {
    sharedSubmissions?: Submission[]; 
    onNavigate?: (view: 'review' | 'team', id: string) => void;
    initialTab?: 'collaborate' | 'matrix' | 'moderation' | 'awards' | 'engagement' | 'messages' | 'profiles';
}

const CHAT_STORAGE_KEY = 'fis_supervisor_chat_history';

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ sharedSubmissions = [], onNavigate, initialTab = 'collaborate' }) => {
  const [activeTab, setActiveTab] = useState<'collaborate' | 'matrix' | 'moderation' | 'awards' | 'engagement' | 'messages' | 'profiles'>(initialTab);

  // Heatmap State
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{domain: SkillDomain, grade: GradeLevel} | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Action Modal State (Drill / Message)
  const [actionModal, setActionModal] = useState<{ type: 'drill' | 'message', targets: ExtendedStudentProfile[] } | null>(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  // Awards State
  const [nominations, setNominations] = useState<Nomination[]>(initialNominations);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAward, setSelectedAward] = useState<string>('The Human-Centered Visionary Award');
  const [isCustomAward, setIsCustomAward] = useState(false);
  const [customAwardTitle, setCustomAwardTitle] = useState('');
  const [justification, setJustification] = useState('');

  // Moderation State
  const [reviewQueue, setReviewQueue] = useState(mockPendingReviews);

  // Teams State
  const [assessingTeam, setAssessingTeam] = useState<string | null>(null);

  // Engagement State
  const [engagementMetrics, setEngagementMetrics] = useState<Record<string, ActivityMetric>>({});

  // Chat State
  const [chats, setChats] = useState<Record<string, ChatSession>>({});
  const [activeChatStudent, setActiveChatStudent] = useState<string | null>(null);
  const [teacherReply, setTeacherReply] = useState('');
  const [teacherPersona, setTeacherPersona] = useState('Mr. Mariano');
  
  // Profile Tab State
  const [profileSearch, setProfileSearch] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Load metrics
      try {
          const stored = localStorage.getItem('fis_activity_metrics');
          if (stored) setEngagementMetrics(JSON.parse(stored));
      } catch (e) { console.error("Error loading metrics", e); }
  }, [activeTab]);

  // Load Chats for Message Tab (Polling for real-time feel)
  useEffect(() => {
    const loadChats = () => {
        try {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            if (stored) setChats(JSON.parse(stored));
        } catch (e) { console.error("Chat load error", e); }
    };
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Scroll to bottom of chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatStudent, chats]);

  // Reset selection when cell changes
  useEffect(() => {
      setSelectedStudentIds([]);
      setActionModal(null);
  }, [selectedHeatmapCell]);

  // --- HANDLERS ---
  const handleAwardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'CUSTOM') {
          setIsCustomAward(true);
          setSelectedAward('');
      } else {
          setIsCustomAward(false);
          setSelectedAward(value);
      }
  };

  const handleNominate = () => {
      const finalAward = isCustomAward ? customAwardTitle : selectedAward;

      if (!selectedStudent || !justification || !finalAward) return;
      
      const newNomination: Nomination = { 
          id: Date.now().toString(), 
          studentName: selectedStudent, 
          award: finalAward, 
          justification: justification, 
          timestamp: new Date().toISOString() 
      };
      
      setNominations(prev => [newNomination, ...prev]); 
      setJustification(''); 
      setSelectedStudent('');
      setCustomAwardTitle('');
      setIsCustomAward(false);
      setSelectedAward(FIS_AWARDS[0].title);
      
      alert(`Nomination for ${selectedStudent} logged successfully.`);
  };

  const handleModerationAction = (id: string, action: 'approve' | 'reject') => {
      setReviewQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleAssessTeam = async (teamName: string) => {
    setAssessingTeam(teamName);
    setTimeout(() => { alert(`AI Assessment for ${teamName}: "Collaboration is strong."`); setAssessingTeam(null); }, 2000);
  };

  const handleSendReply = () => {
      if (!activeChatStudent || !teacherReply.trim()) return;
      
      const session = chats[activeChatStudent];
      if (!session) return;

      const newMsg: SupervisorMessage = {
          id: Date.now().toString(),
          sender: teacherPersona,
          text: teacherReply,
          timestamp: new Date().toISOString(),
          isTeacher: true,
          read: true
      };

      const updatedSession = { 
          ...session, 
          messages: [...session.messages, newMsg],
          lastUpdated: new Date().toISOString()
      };

      const updatedChats = { ...chats, [activeChatStudent]: updatedSession };
      setChats(updatedChats);
      setTeacherReply('');
      
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedChats));
  };

  // --- HEATMAP ACTIONS ---

  // Filter students based on the selected Grade in the Heatmap
  const getStudentsForCell = (domain: SkillDomain, grade: GradeLevel) => {
      const gradeNum = parseInt(grade.replace('G', ''));
      const relevantStudents = mockStudentDatabase.filter(s => s.grade === gradeNum);
      
      // Since we don't have real individual scores for every domain in the mock DB, 
      // we generate a consistent mock score based on the domain average.
      const avgScore = heatmapData[domain][grade].score;

      return relevantStudents.map((student, idx) => {
           // Create a pseudo-random variance based on student ID to keep it consistent
           const variance = (student.id.charCodeAt(0) % 30) - 15;
           let score = avgScore + variance;
           if (score > 100) score = 100;
           if (score < 0) score = 0;

           let status = 'Mastered';
           if (score < 60) status = 'Needs Support';
           else if (score < 85) status = 'Developing';

           return { ...student, score, status };
      }).sort((a,b) => a.score - b.score);
  };

  const handleToggleStudentSelection = (studentId: string) => {
      setSelectedStudentIds(prev => 
        prev.includes(studentId) 
            ? prev.filter(id => id !== studentId) 
            : [...prev, studentId]
      );
  };

  const handleOpenActionModal = (type: 'drill' | 'message', students: any[]) => {
      // If students are selected, only use those. Otherwise use all passed in (e.g. from the 'Struggling' group button)
      const targets = selectedStudentIds.length > 0 
        ? students.filter(s => selectedStudentIds.includes(s.id))
        : students;

      if (targets.length === 0) {
          alert("Please select at least one student.");
          return;
      }
      
      setActionModal({ type, targets });
      setActionMessage('');
      setActionSuccess(false);
  };

  const handleExecuteAction = () => {
      // Simulate API call
      setActionSuccess(true);
      setTimeout(() => {
          setActionModal(null);
          setSelectedStudentIds([]);
      }, 2000);
  };

  // Simulates uploading an empathy map
  const handleEmpathyMapUpload = () => {
      // In a real app, this would open a file picker and upload to server
      alert("Opening file picker... (Simulation: Empathy map updated)");
  };

  const getHeatmapColor = (score: number) => { if (score >= 85) return 'bg-green-500 text-white'; if (score >= 60) return 'bg-yellow-400 text-slate-800'; return 'bg-red-400 text-white'; };
  const getWidaColor = (level: number) => { if (level >= 5.0) return 'bg-green-100 text-green-700 border-green-200'; if (level >= 3.0) return 'bg-blue-100 text-blue-700 border-blue-200'; return 'bg-amber-100 text-amber-700 border-amber-200'; };

  const selectedProfile = mockStudentDatabase.find(s => s.id === selectedProfileId);
  const filteredProfiles = mockStudentDatabase.filter(s => 
      s.name.toLowerCase().includes(profileSearch.toLowerCase()) || 
      s.email.toLowerCase().includes(profileSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12 animate-fade-in relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Teacher Command Center</h1>
          <p className="text-slate-500 text-sm">Monitor, Moderate, and Motivate.</p>
          
          <div className="flex space-x-1 mt-6 bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto">
              <button onClick={() => setActiveTab('collaborate')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'collaborate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <Users className="w-4 h-4 mr-2" /> Collaborate </button>
              <button onClick={() => setActiveTab('matrix')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'matrix' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <LayoutGrid className="w-4 h-4 mr-2" /> Skill Matrix </button>
              <button onClick={() => setActiveTab('moderation')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'moderation' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <MessageSquare className="w-4 h-4 mr-2" /> Peer Review </button>
              <button onClick={() => setActiveTab('awards')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'awards' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <Award className="w-4 h-4 mr-2" /> Awards </button>
              <button onClick={() => setActiveTab('engagement')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'engagement' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <Activity className="w-4 h-4 mr-2" /> Engagement </button>
              <button onClick={() => setActiveTab('messages')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <MessageCircle className="w-4 h-4 mr-2" /> Messages </button>
              <button onClick={() => setActiveTab('profiles')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profiles' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}> <GraduationCap className="w-4 h-4 mr-2" /> Profiles </button>
          </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        
        {/* TAB 1: COLLABORATE */}
        {activeTab === 'collaborate' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center"><div><h2 className="text-lg font-bold text-slate-800">Active Group Projects</h2><p className="text-sm text-slate-500">Monitor team health and activity logs.</p></div><div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600">{mockActiveTeams.length} Active Groups</div></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockActiveTeams.map(team => (
                        <div key={team.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all">
                            <div className="p-5"><div className="flex justify-between items-start mb-4"><h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600">{team.name}</h3><span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${team.health === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{team.health}</span></div><p className="text-xs font-bold text-slate-400 uppercase mb-2">{team.theme}</p><div className="flex -space-x-2 mb-4">{team.members.map((m, i) => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={m}>{m.charAt(0)}</div>)}</div><div className="flex items-center text-xs text-slate-500 mb-4"><Clock className="w-3 h-3 mr-1" /> Last active: {team.lastActivity}</div></div>
                            <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center"><button onClick={() => onNavigate && onNavigate('team', team.name)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center"><Eye className="w-4 h-4 mr-1" /> Inspect Logs</button><button onClick={() => handleAssessTeam(team.name)} disabled={assessingTeam === team.name} className="text-xs font-bold text-slate-500 hover:text-slate-800">{assessingTeam === team.name ? 'Analyzing...' : 'Run AI Audit'}</button></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB 2: SKILL MATRIX (INTERACTIVE) */}
        {activeTab === 'matrix' && (
            <div className="space-y-6 animate-fade-in relative">
                 <div className="flex justify-between items-center">
                     <div>
                         <h2 className="text-lg font-bold text-slate-800">Class Proficiency Heatmap</h2>
                         <p className="text-sm text-slate-500">Click any cell to identify struggling students and assign support.</p>
                     </div>
                     <div className="flex items-center space-x-3 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> {'>'}85%</div>
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span> 60-85%</div>
                         <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span> {'<'}60%</div>
                     </div>
                 </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 z-10 border-r border-slate-100">Skill Domain</th>
                                {Object.values(GradeLevel).map(grade => (
                                    <th key={grade} className="p-4 bg-slate-50 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{grade}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(SkillDomain).map(domain => (
                                <tr key={domain} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-700 text-sm sticky left-0 bg-white border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{domain}</td>
                                    {Object.values(GradeLevel).map(grade => { 
                                        const data = heatmapData[domain][grade]; 
                                        return (
                                            <td key={`${domain}-${grade}`} className="p-2 text-center relative group cursor-pointer" onClick={() => setSelectedHeatmapCell({domain, grade})}>
                                                <div className={`
                                                    w-16 h-10 mx-auto rounded-lg flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110 
                                                    ${getHeatmapColor(data.score)}
                                                `}>
                                                    {data.score}%
                                                </div>
                                                {/* Trend Indicator */}
                                                <div className="absolute top-1 right-2">
                                                    {data.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600 bg-white rounded-full p-0.5" />}
                                                    {data.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600 bg-white rounded-full p-0.5" />}
                                                </div>
                                            </td>
                                        ); 
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Drill Down Slide-Over / Modal */}
                {selectedHeatmapCell && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm animate-fade-in">
                        <div className="absolute inset-0" onClick={() => setSelectedHeatmapCell(null)}></div>
                        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-slate-200">
                            
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{selectedHeatmapCell.domain}</h3>
                                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">
                                        {selectedHeatmapCell.grade} Performance Analysis
                                    </p>
                                </div>
                                <button onClick={() => setSelectedHeatmapCell(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                
                                {/* Summary Stats */}
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Class Average</p>
                                        <div className="text-3xl font-bold text-slate-800">{heatmapData[selectedHeatmapCell.domain][selectedHeatmapCell.grade].score}%</div>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-xs text-slate-500 uppercase font-bold">Trend</p>
                                         <div className={`flex items-center justify-end font-bold ${heatmapData[selectedHeatmapCell.domain][selectedHeatmapCell.grade].trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {heatmapData[selectedHeatmapCell.domain][selectedHeatmapCell.grade].trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                            {heatmapData[selectedHeatmapCell.domain][selectedHeatmapCell.grade].trend === 'up' ? 'Rising' : 'Falling'}
                                         </div>
                                    </div>
                                </div>

                                {/* Student Lists */}
                                {(() => {
                                    const students = getStudentsForCell(selectedHeatmapCell.domain, selectedHeatmapCell.grade);
                                    const struggling = students.filter(s => s.status === 'Needs Support');
                                    const developing = students.filter(s => s.status === 'Developing');
                                    const mastered = students.filter(s => s.status === 'Mastered');

                                    const renderStudentRow = (s: typeof students[0]) => (
                                        <div key={s.id} className="flex items-center p-2 rounded hover:bg-white transition-colors cursor-pointer" onClick={() => handleToggleStudentSelection(s.id)}>
                                             <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors ${selectedStudentIds.includes(s.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                                                 {selectedStudentIds.includes(s.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                             </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                                                <span className={`text-xs font-bold ${s.status === 'Needs Support' ? 'text-red-500' : s.status === 'Developing' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {Math.round(s.score)}%
                                                </span>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div className="space-y-6">
                                            {students.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400">
                                                    No students found in {selectedHeatmapCell.grade} for this domain.
                                                </div>
                                            ) : (
                                            <>
                                                {/* Struggling */}
                                                {struggling.length > 0 && (
                                                    <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                                                        <div className="bg-red-100 px-4 py-2 flex justify-between items-center">
                                                            <h4 className="text-xs font-bold text-red-700 uppercase flex items-center">
                                                                <AlertCircle className="w-4 h-4 mr-2" /> Needs Support ({struggling.length})
                                                            </h4>
                                                            <button 
                                                                onClick={() => handleOpenActionModal('drill', struggling)}
                                                                className="text-[10px] bg-white text-red-600 px-2 py-1 rounded font-bold border border-red-200 hover:bg-red-50"
                                                            >
                                                                Assign Drill to Group
                                                            </button>
                                                        </div>
                                                        <div className="p-2 space-y-1">
                                                            {struggling.map(renderStudentRow)}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Developing */}
                                                {developing.length > 0 && (
                                                    <div className="bg-yellow-50 rounded-xl border border-yellow-100 overflow-hidden">
                                                        <div className="bg-yellow-100 px-4 py-2">
                                                            <h4 className="text-xs font-bold text-yellow-700 uppercase flex items-center">
                                                                <Activity className="w-4 h-4 mr-2" /> Developing ({developing.length})
                                                            </h4>
                                                        </div>
                                                        <div className="p-2 space-y-1">
                                                            {developing.map(renderStudentRow)}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mastered */}
                                                {mastered.length > 0 && (
                                                    <div className="bg-green-50 rounded-xl border border-green-100 overflow-hidden">
                                                        <div className="bg-green-100 px-4 py-2">
                                                            <h4 className="text-xs font-bold text-green-700 uppercase flex items-center">
                                                                <CheckCircle className="w-4 h-4 mr-2" /> Mastered ({mastered.length})
                                                            </h4>
                                                        </div>
                                                        <div className="p-2 space-y-1">
                                                            {mastered.map(renderStudentRow)}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 bg-white border-t border-slate-200 flex space-x-3">
                                {(() => {
                                    const allStudents = getStudentsForCell(selectedHeatmapCell.domain, selectedHeatmapCell.grade);
                                    return (
                                        <>
                                            <button 
                                                onClick={() => handleOpenActionModal('message', allStudents)}
                                                className="flex-1 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center"
                                            >
                                                <Mail className="w-4 h-4 mr-2" /> 
                                                {selectedStudentIds.length > 0 ? `Message (${selectedStudentIds.length})` : 'Message Group'}
                                            </button>
                                            <button 
                                                onClick={() => handleOpenActionModal('drill', allStudents)}
                                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> 
                                                {selectedStudentIds.length > 0 ? `Assign Drill (${selectedStudentIds.length})` : 'Assign Drill'}
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Action Modal (Message / Drill) */}
        {actionModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                    {actionSuccess ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Success!</h3>
                            <p className="text-slate-600">
                                {actionModal.type === 'drill' ? 'Practice drill assigned.' : 'Messages sent successfully.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                    {actionModal.type === 'drill' ? <Dumbbell className="w-5 h-5 mr-2 text-indigo-500" /> : <Mail className="w-5 h-5 mr-2 text-blue-500" />}
                                    {actionModal.type === 'drill' ? 'Assign Practice Drill' : 'Message Students'}
                                </h3>
                                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-4">
                                You are about to {actionModal.type === 'drill' ? 'assign a drill' : 'send a message'} to <strong>{actionModal.targets.length} students</strong>.
                            </p>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    {actionModal.type === 'drill' ? 'Drill Topic' : 'Message Content'}
                                </label>
                                {actionModal.type === 'drill' ? (
                                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 font-medium text-sm flex items-center">
                                        <Dumbbell className="w-4 h-4 mr-2" />
                                        {selectedHeatmapCell?.domain} Basics & Safety Review
                                    </div>
                                ) : (
                                    <textarea 
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Type your message here..."
                                        value={actionMessage}
                                        onChange={(e) => setActionMessage(e.target.value)}
                                    ></textarea>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button onClick={() => setActionModal(null)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={handleExecuteAction} className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 shadow-lg">Confirm</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* TAB 3: MODERATION */}
        {activeTab === 'moderation' && (
            <div className="space-y-6 animate-fade-in">
                <div><h2 className="text-lg font-bold text-slate-800">Feedback Moderation Queue</h2><p className="text-sm text-slate-500">Approve or reject student peer reviews before they are published.</p></div>
                {reviewQueue.length === 0 ? <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" /><h3 className="text-lg font-bold text-green-800">All Caught Up!</h3><p className="text-green-700">No pending reviews require moderation.</p></div> : <div className="grid gap-4">{reviewQueue.map(review => (<div key={review.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6"><div className="flex-1"><div className="flex items-center space-x-2 mb-2"><span className="font-bold text-slate-800">{review.author}</span><span className="text-slate-400">&rarr;</span><span className="font-bold text-slate-800">{review.target}</span>{review.flags.length > 0 && (<span className="ml-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> {review.flags.join(', ')}</span>)}</div><div className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-slate-600 text-sm">"{review.content}"</div></div><div className="flex items-center space-x-3"><button onClick={() => handleModerationAction(review.id, 'approve')} className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Approve</button><button onClick={() => handleModerationAction(review.id, 'reject')} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center"><XCircle className="w-4 h-4 mr-2" /> Reject</button></div></div>))}</div>}
            </div>
        )}

        {/* TAB 4: AWARDS */}
        {activeTab === 'awards' && (
            <div className="space-y-6 animate-fade-in">
                <div><h2 className="text-lg font-bold text-slate-800">Excellence Awards</h2><p className="text-sm text-slate-500">Nominate students for specific design distinctions aligned with the IB Learner Profile.</p></div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-purple-500" /> New Nomination</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student</label>
                                <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}><option value="">Select a student...</option>{mockStudentDatabase.map(s => <option key={s.id} value={s.name}>{s.name} (G{s.grade})</option>)}</select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Award Category</label>
                                <select 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 mb-2" 
                                    value={isCustomAward ? 'CUSTOM' : selectedAward} 
                                    onChange={handleAwardChange}
                                >
                                    {FIS_AWARDS.map(a => <option key={a.id} value={a.title}>{a.title} ({a.profile})</option>)}
                                    <option value="CUSTOM">Create New Category...</option>
                                </select>
                                
                                {isCustomAward ? (
                                    <div className="animate-fade-in-down">
                                        <label className="block text-[10px] font-bold text-purple-600 uppercase mb-1">Custom Category Name</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={customAwardTitle}
                                                onChange={(e) => setCustomAwardTitle(e.target.value)}
                                                className="w-full p-2 pl-8 border border-purple-300 rounded-lg text-sm bg-purple-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                                placeholder="e.g. Most Improved Designer"
                                                autoFocus
                                            />
                                            <Plus className="w-4 h-4 text-purple-500 absolute left-2 top-2.5" />
                                        </div>
                                    </div>
                                ) : (
                                    // Award Preview Info
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
                                        {(() => {
                                            const award = FIS_AWARDS.find(a => a.title === selectedAward);
                                            return award ? (
                                                <>
                                                    <p className="text-xs font-bold text-purple-800 mb-1 flex items-center">
                                                        <span className="mr-1">IB Profile:</span> {award.profile}
                                                    </p>
                                                    <p className="text-xs text-purple-700 italic">{award.description}</p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Justification</label>
                                <textarea className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 h-32 resize-none" placeholder="Why does this student deserve this award?" value={justification} onChange={(e) => setJustification(e.target.value)}></textarea>
                            </div>
                            <button onClick={handleNominate} disabled={!selectedStudent || !justification || (isCustomAward && !customAwardTitle)} className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50">Submit Nomination</button>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4"><h3 className="font-bold text-slate-800 mb-2">Recent Nominations</h3>{nominations.length === 0 ? <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">No nominations yet.</div> : nominations.map(nom => (<div key={nom.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4"><div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Award className="w-6 h-6" /></div><div><div className="flex items-center space-x-2 mb-1"><h4 className="font-bold text-slate-800 text-lg">{nom.studentName}</h4><span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase">{nom.award}</span></div><p className="text-slate-600 text-sm leading-relaxed">"{nom.justification}"</p><p className="text-xs text-slate-400 mt-2">{new Date(nom.timestamp).toLocaleDateString()}</p></div></div>))}</div>
                </div>
            </div>
        )}

        {/* TAB 5: ENGAGEMENT */}
        {activeTab === 'engagement' && (
            <div className="space-y-6 animate-fade-in">
                <div><h2 className="text-lg font-bold text-slate-800">Engagement & Insights</h2><p className="text-sm text-slate-500">Live monitoring of student activity.</p></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold tracking-wider"><tr><th className="p-4">Student Profile</th><th className="p-4">WIDA Level</th><th className="p-4">Engagement Stats (Backend Monitor)</th><th className="p-4">Dominant ATL Skill</th><th className="p-4 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{mockStudentDatabase.map(student => { const activity = engagementMetrics[student.email] || { loginCount: 0, totalMinutes: 0, lastLogin: 'Never' }; const isOnline = activity.lastLogin !== 'Never' && (Date.now() - new Date(activity.lastLogin).getTime()) < 15 * 60 * 1000; return (<tr key={student.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-bold text-slate-800">{student.name}</div><div className="text-xs text-slate-400">{student.email}</div><div className="text-xs text-slate-500 mt-1">Grade {student.grade}</div></td><td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getWidaColor(student.wida)}`}>WIDA {student.wida.toFixed(1)}</span></td><td className="p-4"><div className="flex flex-col space-y-1"><div className="flex items-center text-xs text-slate-700"><Activity className="w-3 h-3 mr-1.5 text-blue-500" /><span className="font-semibold">{activity.loginCount} Logins</span></div><div className="flex items-center text-xs text-slate-700"><Clock className="w-3 h-3 mr-1.5 text-purple-500" /><span>{Math.round(activity.totalMinutes)} mins active</span></div><div className="text-[10px] text-slate-400 mt-1">Last: {activity.lastLogin === 'Never' ? 'Never' : new Date(activity.lastLogin).toLocaleDateString()}</div></div></td><td className="p-4"><div className="flex items-center space-x-2"><BrainCircuit className="w-4 h-4 text-indigo-400" /><span className="text-sm text-slate-700 font-medium">{student.dominantAtl}</span></div></td><td className="p-4 text-right"><div className="flex justify-end">{isOnline ? <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>Online</span> : <span className="text-xs text-slate-400">Offline</span>}</div></td></tr>); })}</tbody></table></div>
            </div>
        )}

        {/* TAB 6: MESSAGES (NEW) */}
        {activeTab === 'messages' && (
            <div className="grid grid-cols-3 gap-6 h-[70vh] animate-fade-in">
                
                {/* INBOX (Left) */}
                <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center">
                            <MessageCircle className="w-5 h-5 mr-2 text-blue-500" /> 
                            Student Inquiries
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {Object.keys(chats).length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">No active conversations.</div>
                        ) : (
                            (Object.values(chats) as ChatSession[]).sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(session => (
                                <div 
                                    key={session.studentEmail}
                                    onClick={() => setActiveChatStudent(session.studentEmail)}
                                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${activeChatStudent === session.studentEmail ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-slate-700 text-sm">{session.studentName}</h3>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(session.lastUpdated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {session.messages[session.messages.length - 1]?.text || 'No messages'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* CHAT WINDOW (Right) */}
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    {activeChatStudent && chats[activeChatStudent] ? (
                        <>
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-slate-800">{chats[activeChatStudent].studentName}</h3>
                                    <p className="text-xs text-slate-500">{activeChatStudent}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-slate-500">Replying as:</span>
                                    <select 
                                        value={teacherPersona} 
                                        onChange={(e) => setTeacherPersona(e.target.value)}
                                        className="text-xs p-1 border border-slate-300 rounded bg-white"
                                    >
                                        <option value="Mr. Mariano">Mr. Mariano</option>
                                        <option value="Mr. Mervin">Mr. Mervin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                {chats[activeChatStudent].messages.map(msg => {
                                    const isMe = msg.isTeacher; // In dashboard, "Me" is the teacher
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef}></div>
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-white">
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="text" 
                                        value={teacherReply}
                                        onChange={(e) => setTeacherReply(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        placeholder={`Reply as ${teacherPersona}...`}
                                        className="flex-1 p-3 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleSendReply}
                                        disabled={!teacherReply.trim()}
                                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a student from the inbox to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TAB 7: PROFILES (NEW) */}
        {activeTab === 'profiles' && (
            <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6 animate-fade-in">
                
                {/* Left: Searchable List */}
                <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h2 className="font-bold text-slate-800 mb-2">Student Directory</h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by name..."
                                value={profileSearch}
                                onChange={(e) => setProfileSearch(e.target.value)}
                                className="w-full pl-9 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredProfiles.map(student => (
                            <div 
                                key={student.id}
                                onClick={() => setSelectedProfileId(student.id)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedProfileId === student.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}
                            >
                                <div>
                                    <h3 className="font-bold text-slate-700 text-sm">{student.name}</h3>
                                    <p className="text-xs text-slate-500">{student.email}</p>
                                </div>
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">G{student.grade}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Detailed Profile */}
                <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-8">
                    {selectedProfile ? (
                        <div className="space-y-8">
                            {/* Profile Header */}
                            <div className="flex justify-between items-start pb-6 border-b border-slate-100">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold">
                                        {selectedProfile.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">{selectedProfile.name}</h2>
                                        <div className="flex items-center text-sm text-slate-500 space-x-3">
                                            <span>ID: {selectedProfile.id}</span>
                                            <span>•</span>
                                            <span>{selectedProfile.email}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-slate-700">Grade {selectedProfile.grade}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                                    Export Report
                                </button>
                            </div>

                            {/* Academic Snapshot */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center">
                                        <Scroll className="w-3 h-3 mr-1" /> WIDA Assessment
                                    </h4>
                                    <div className="flex items-end space-x-2">
                                        <span className="text-3xl font-bold text-slate-800">{selectedProfile.wida.toFixed(1)}</span>
                                        <span className="text-xs text-slate-500 mb-1">/ 6.0 Overall</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(selectedProfile.wida / 6) * 100}%`}}></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2 flex items-center">
                                        <BarChart className="w-3 h-3 mr-1" /> MAP Math (RIT)
                                    </h4>
                                    <div className="text-3xl font-bold text-slate-800">{selectedProfile.mapMath}</div>
                                    <p className="text-[10px] text-indigo-600 mt-1">Norm Grade Level Mean</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h4 className="text-xs font-bold text-purple-700 uppercase mb-2 flex items-center">
                                        <BookOpen className="w-3 h-3 mr-1" /> MAP Reading (RIT)
                                    </h4>
                                    <div className="text-3xl font-bold text-slate-800">{selectedProfile.mapReading}</div>
                                    <p className="text-[10px] text-purple-600 mt-1">Norm Grade Level Mean</p>
                                </div>
                            </div>

                            {/* Design Progress */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                    <ClipboardList className="w-5 h-5 mr-2 text-teal-500" /> Design Performance
                                </h3>
                                <div className="flex items-center space-x-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <div className="text-center">
                                        <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-teal-200 text-teal-700 font-bold text-xl">
                                            {Math.round((selectedProfile.challengesCompleted / selectedProfile.challengesAssigned) * 100)}%
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 mt-2">Completion</p>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                            <span className="text-sm text-slate-600">Challenges Completed</span>
                                            <span className="font-bold text-slate-800">{selectedProfile.challengesCompleted} / {selectedProfile.challengesAssigned}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                            <span className="text-sm text-slate-600">Dominant ATL Skill</span>
                                            <span className="font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded text-xs uppercase">{selectedProfile.dominantAtl}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">Learner Profile Traits</span>
                                            <div className="flex gap-1">
                                                {selectedProfile.learnerProfile.map(trait => (
                                                    <span key={trait} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">
                                                        {trait}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Split Row: Behavior & Empathy Map */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left: Behavior Timeline */}
                                <div className="col-span-1">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                        <Shield className="w-5 h-5 mr-2 text-slate-500" /> Behavioral Context
                                    </h3>
                                    {selectedProfile.behaviorNotes.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm h-full flex items-center justify-center">
                                            No behavioral incidents recorded.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedProfile.behaviorNotes.map((note, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${note.type === IncidentType.POSITIVE ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${note.type === IncidentType.POSITIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {note.type}
                                                            </span>
                                                            <span className="text-xs text-slate-400">{new Date(note.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-700">{note.note}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Empathy Map */}
                                <div className="col-span-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                            <Heart className="w-5 h-5 mr-2 text-rose-500" /> Empathy Map
                                        </h3>
                                        <button 
                                            onClick={handleEmpathyMapUpload}
                                            className="text-xs font-bold text-indigo-600 flex items-center hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg"
                                        >
                                            <Upload className="w-3 h-3 mr-1" /> Upload
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center min-h-[200px]">
                                        {selectedProfile.empathyMapUrl ? (
                                            <img 
                                                src={selectedProfile.empathyMapUrl} 
                                                alt={`${selectedProfile.name}'s Empathy Map`} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-6 text-slate-400">
                                                <Heart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">No empathy map uploaded.</p>
                                                <p className="text-xs mt-1">Upload a photo of the student's Design Journal (Inquiry Phase).</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <User className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a student to view their full profile.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;
