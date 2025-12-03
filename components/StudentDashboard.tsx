
import React from 'react';
import { GradeLevel, SkillDomain, ChallengeStatus, FIS_AWARDS } from '../types';
import { CheckCircle, Circle, PlayCircle, ArrowRight, ClipboardList, Trophy, Star, TrendingUp, Shield, Award, Palette, Brain, Handshake, Wrench, Lightbulb, Globe, Search, Sparkles, RefreshCw, MessageSquareQuote } from 'lucide-react';

interface StudentDashboardProps {
  grade: GradeLevel;
  statusMap: Record<string, ChallengeStatus>;
  onSelectChallenge: (domain: SkillDomain, grade: GradeLevel) => void;
}

// Static Core Curriculum Map - Ensures tasks don't "change" every time
const CORE_CURRICULUM: Record<GradeLevel, Record<SkillDomain, string>> = {
    [GradeLevel.G6]: {
        [SkillDomain.WOODWORK]: "Safety License & Box Build",
        [SkillDomain.SKETCHING]: "Iso-Sketching Basics",
        [SkillDomain.DIGITAL_DESIGN]: "Intro to Canva",
        [SkillDomain.THREE_D_PRINTING]: "Keychain Design",
        [SkillDomain.LASER_CUTTER]: "Simple Engraving",
        [SkillDomain.MICROBITS]: "Nametag LED",
        [SkillDomain.POWER_TOOLS]: "Drill Press Safety",
        [SkillDomain.TEXTILES]: "Hand Sewing Basics",
        [SkillDomain.ROBOTICS]: "Lego Spike Intro",
        [SkillDomain.VIDEO_PRODUCTION]: "Stop Motion Clip",
        [SkillDomain.SUSTAINABLE_DESIGN]: "Recycled Material Audit",
        [SkillDomain.PROGRAMMING]: "Block Coding Logic",
        [SkillDomain.AI_LITERACY]: "AI Ethics Intro",
        [SkillDomain.ENTREPRENEURSHIP]: "Lemonade Stand Plan"
    },
    [GradeLevel.G7]: { 
        [SkillDomain.WOODWORK]: "Phone Stand",
        [SkillDomain.SKETCHING]: "Perspective Drawing",
        [SkillDomain.DIGITAL_DESIGN]: "Vector Graphics",
        [SkillDomain.THREE_D_PRINTING]: "Cookie Cutter",
        [SkillDomain.LASER_CUTTER]: "Box Joint Box",
        [SkillDomain.MICROBITS]: "Digital Pet",
        [SkillDomain.POWER_TOOLS]: "Scroll Saw Puzzle",
        [SkillDomain.TEXTILES]: "Tote Bag",
        [SkillDomain.ROBOTICS]: "Line Follower",
        [SkillDomain.VIDEO_PRODUCTION]: "Interview Skills",
        [SkillDomain.SUSTAINABLE_DESIGN]: "Upcycling Project",
        [SkillDomain.PROGRAMMING]: "Python Turtle",
        [SkillDomain.AI_LITERACY]: "Prompt Engineering",
        [SkillDomain.ENTREPRENEURSHIP]: "Product Pitch"
    },
    [GradeLevel.G8]: { [SkillDomain.WOODWORK]: "Advanced Joinery" } as any,
    [GradeLevel.G9]: { [SkillDomain.WOODWORK]: "Furniture Design" } as any,
    [GradeLevel.G10]: { [SkillDomain.WOODWORK]: "Capstone Build" } as any
};

const iconMap: Record<string, React.ElementType> = {
    'Palette': Palette,
    'Brain': Brain,
    'Handshake': Handshake,
    'Wrench': Wrench,
    'Lightbulb': Lightbulb,
    'Globe': Globe,
    'Search': Search,
    'Sparkles': Sparkles,
    'RefreshCw': RefreshCw,
    'MessageSquareQuote': MessageSquareQuote
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ grade, statusMap, onSelectChallenge }) => {
  const domains = Object.values(SkillDomain);
  const tasks = CORE_CURRICULUM[grade] || CORE_CURRICULUM[GradeLevel.G6]; // Fallback

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.COMPLETED: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ChallengeStatus.SUBMITTED: return <div className="w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] flex items-center justify-center font-bold">S</div>;
      case ChallengeStatus.IN_PROGRESS: return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusText = (status: ChallengeStatus) => {
      switch(status) {
          case ChallengeStatus.COMPLETED: return "Completed";
          case ChallengeStatus.SUBMITTED: return "Submitted";
          case ChallengeStatus.IN_PROGRESS: return "In Progress";
          default: return "To Do";
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
             <ClipboardList className="w-8 h-8 mr-3" />
             My Tasks: {grade}
        </h1>
        <p className="opacity-90">Your clear roadmap to design mastery. Complete these core challenges.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Task List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                        <th className="p-4">Status</th>
                        <th className="p-4">Skill Domain</th>
                        <th className="p-4">Challenge Name</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {domains.map(domain => {
                        const taskName = tasks[domain] || `${domain} Exploration`;
                        const status = statusMap[`${domain}-${grade}`] || ChallengeStatus.AVAILABLE;
                        
                        return (
                            <tr key={domain} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(status)}
                                        <span className={`text-xs font-medium ${
                                            status === ChallengeStatus.COMPLETED ? 'text-green-600' : 
                                            status === ChallengeStatus.IN_PROGRESS ? 'text-blue-600' : 'text-slate-400'
                                        }`}>
                                            {getStatusText(status)}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm font-medium text-slate-700">{domain}</td>
                                <td className="p-4 text-sm text-slate-600">{taskName}</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onSelectChallenge(domain, grade)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs inline-flex items-center"
                                    >
                                        {status === ChallengeStatus.COMPLETED ? 'Review' : 'Start'} <ArrowRight className="w-3 h-3 ml-1" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
          </div>

          {/* Gamification Sidebar */}
          <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                      Level & XP Guide
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <p className="text-sm text-slate-600 mb-2">
                              <strong>XP (Experience Points)</strong> are earned by completing challenges, submitting peer reviews, and demonstrating ATL skills.
                          </p>
                          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                              <Star className="w-3 h-3" />
                              <span>+50 XP per Submission</span>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase">Mastery Levels</h4>
                          
                          <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>Novice</span>
                                        <span>0 - 500 XP</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                        <div className="bg-slate-300 h-1.5 rounded-full w-full"></div>
                                    </div>
                                </div>
                          </div>

                          <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>Apprentice</span>
                                        <span>500 - 1500 XP</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                        <div className="bg-blue-400 h-1.5 rounded-full w-2/3"></div>
                                    </div>
                                </div>
                          </div>

                          <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                                    <Trophy className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>Expert</span>
                                        <span>1500+ XP</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                                        <div className="bg-yellow-400 h-1.5 rounded-full w-1/4"></div>
                                    </div>
                                </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* AWARDS & RECOGNITION SECTION */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-purple-500" />
                      Awards & Recognition
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                      Aim for these End-of-Year distinctions by demonstrating the IB Learner Profile.
                  </p>
                  
                  <div className="space-y-3 h-64 overflow-y-auto pr-1">
                      {FIS_AWARDS.map(award => {
                          const Icon = iconMap[award.iconName] || Trophy;
                          return (
                              <div key={award.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors group">
                                  <div className="flex items-start space-x-3">
                                      <div className="mt-1">
                                          <Icon className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div>
                                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-700">{award.title}</h4>
                                          <span className="text-[10px] font-bold uppercase text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 mb-1 inline-block">
                                              {award.profile}
                                          </span>
                                          <p className="text-xs text-slate-600 leading-snug italic">
                                              "{award.studentDescription}"
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                  <h3 className="font-bold mb-2">Pro Tip</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                      "Quality over quantity! You earn extra badges for thorough documentation and detailed reflections in your Design Journal."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
