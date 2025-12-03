
import React, { useState } from 'react';
import { GradeLevel, SkillDomain, ChallengeStatus, Challenge, DifficultyLevel } from '../types';
import { generateChallengeDetails, generatePracticeChallenge } from '../services/geminiService';
import { Lock, CheckCircle, Circle, PlayCircle, ChevronDown, ChevronUp, Info, Clock, X, Wand2, PenTool, CheckSquare, ArrowRight, Loader2, Dumbbell, Star, BookOpen, Video, Signal } from 'lucide-react';

interface SkillMatrixProps {
  statusMap: Record<string, ChallengeStatus>;
  onSelectCell: (domain: SkillDomain, grade: GradeLevel) => void;
  onCompletePractice?: (xp: number) => void;
}

const domainDescriptions: Record<SkillDomain, string> = {
  [SkillDomain.SKETCHING]: "The art of drawing ideas quickly. Learn to create 2D and 3D sketches to communicate your vision.",
  [SkillDomain.WOODWORK]: "Crafting with timber. Learn to measure, cut, join, and finish wood to build functional objects.",
  [SkillDomain.POWER_TOOLS]: "Safely operate machinery like drills, saws, and sanders to work with materials efficiently and precisely.",
  [SkillDomain.THREE_D_PRINTING]: "Turn digital models into physical objects. Learn CAD software and operate 3D printers.",
  [SkillDomain.LASER_CUTTER]: "Use a high-power laser to precisely cut and engrave materials like wood, acrylic, and cardboard.",
  [SkillDomain.MICROBITS]: "Code a mini-computer! Learn to program with Micro:bits to create interactive electronic projects.",
  [SkillDomain.DIGITAL_DESIGN]: "Create stunning visuals. Learn to use software like Canva or Illustrator for graphic design, logos, and presentations.",
  [SkillDomain.TEXTILES]: "Working with fabrics. Learn sewing, stitching, and fabric manipulation to create wearables and other soft goods.",
  [SkillDomain.ROBOTICS]: "Build and program robots. Learn mechanics, electronics, and coding to make machines that can perform tasks.",
  [SkillDomain.VIDEO_PRODUCTION]: "Tell stories through film. Learn shooting, editing, and sound design to create compelling videos.",
  [SkillDomain.SUSTAINABLE_DESIGN]: "Design for the planet. Learn to use eco-friendly materials and processes to create sustainable solutions.",
  [SkillDomain.PROGRAMMING]: "The language of computers. Learn text-based coding (like Python) to build software and solve problems.",
  [SkillDomain.AI_LITERACY]: "Understand and use Artificial Intelligence. Learn how AI works, its ethics, and how to use it as a creative tool.",
  [SkillDomain.ENTREPRENEURSHIP]: "Turn ideas into reality. Learn how to develop a product, understand users, and pitch your vision.",
};


const SkillMatrix: React.FC<SkillMatrixProps> = ({ statusMap, onSelectCell, onCompletePractice }) => {
  const grades = Object.values(GradeLevel);
  const domains = Object.values(SkillDomain);
  const [expandedDomain, setExpandedDomain] = useState<SkillDomain | null>(null);
  
  // Preview State
  const [previewChallenge, setPreviewChallenge] = useState<Partial<Challenge> | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedPreviewKey, setSelectedPreviewKey] = useState<{domain: SkillDomain, grade: GradeLevel} | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);

  const handleToggleDomain = (domain: SkillDomain) => {
    setExpandedDomain(prev => (prev === domain ? null : domain));
  };

  const handleCellClick = async (domain: SkillDomain, grade: GradeLevel) => {
    setSelectedPreviewKey({ domain, grade });
    setLoadingPreview(true);
    setIsPracticeMode(false); // Reset to official mode by default
    setDifficulty(DifficultyLevel.MEDIUM); // Reset difficulty
    try {
        // Default to medium on first load
        const details = await generateChallengeDetails(domain, grade, DifficultyLevel.MEDIUM);
        setPreviewChallenge(details);
    } catch (error) {
        console.error("Failed to fetch details", error);
    } finally {
        setLoadingPreview(false);
    }
  };

  const handleDifficultyChange = async (newDifficulty: DifficultyLevel) => {
      if (!selectedPreviewKey) return;
      setDifficulty(newDifficulty);
      setLoadingPreview(true);
      setPreviewChallenge(null);
      try {
          const details = await generateChallengeDetails(selectedPreviewKey.domain, selectedPreviewKey.grade, newDifficulty);
          setPreviewChallenge(details);
      } catch (error) {
          console.error("Failed to regenerate with new difficulty", error);
      } finally {
          setLoadingPreview(false);
      }
  };

  const handleSwitchToPractice = async () => {
    if (!selectedPreviewKey) return;
    setLoadingPreview(true);
    setIsPracticeMode(true);
    setPreviewChallenge(null); // Clear previous
    try {
        const details = await generatePracticeChallenge(selectedPreviewKey.domain, selectedPreviewKey.grade);
        setPreviewChallenge(details);
    } catch (error) {
        console.error("Failed to fetch practice details", error);
    } finally {
        setLoadingPreview(false);
    }
  };

  const handleSwitchToOfficial = async () => {
    if (!selectedPreviewKey) return;
    setLoadingPreview(true);
    setIsPracticeMode(false);
    setPreviewChallenge(null);
    try {
        const details = await generateChallengeDetails(selectedPreviewKey.domain, selectedPreviewKey.grade, difficulty);
        setPreviewChallenge(details);
    } catch (error) {
        console.error("Failed to fetch official details", error);
    } finally {
        setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewChallenge(null);
    setSelectedPreviewKey(null);
    setLoadingPreview(false);
    setIsPracticeMode(false);
  };

  const handleStartChallenge = () => {
    if (selectedPreviewKey && !isPracticeMode) {
        onSelectCell(selectedPreviewKey.domain, selectedPreviewKey.grade);
        closePreview();
    }
  };

  const handleMarkPracticeComplete = () => {
      // Award XP
      // Assuming generated practice challenges have a smaller XP reward, defaulting to 25 if not present.
      const xpAmount = previewChallenge?.xpReward || 25; 
      if (onCompletePractice) {
          onCompletePractice(xpAmount);
          alert(`Great job! You've earned +${xpAmount} XP for completing this practice drill.`);
      }
      closePreview();
  };

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status) {
      case ChallengeStatus.COMPLETED:
        return <CheckCircle className="w-6 h-6 text-green-500 fill-green-50" />;
      case ChallengeStatus.IN_PROGRESS:
        return <PlayCircle className="w-6 h-6 text-blue-600 fill-blue-50" />;
      case ChallengeStatus.AVAILABLE:
        return <Circle className="w-6 h-6 text-slate-300 hover:text-blue-400 transition-colors" />;
      case ChallengeStatus.LOCKED:
        return <Lock className="w-4 h-4 text-slate-300" />;
      case ChallengeStatus.SUBMITTED:
        return <Clock className="w-6 h-6 text-amber-500 fill-amber-50" />;
      default:
        return <Lock className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="overflow-x-auto pb-4 relative">
      <div className="min-w-[800px] bg-white rounded-xl shadow-sm border border-slate-200">
        
        {/* Phase Header Row - FIS Pathway */}
        <div className="grid grid-cols-6 bg-slate-50 border-b border-slate-200 rounded-t-xl">
           <div className="p-2 border-r border-slate-200 bg-white rounded-tl-xl"></div>
           <div className="col-span-2 p-2 text-center text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50/50 border-r border-slate-200">
              Include: Foundation
              <span className="block text-[10px] text-green-500 font-normal normal-case">Core Skills & Safety</span>
           </div>
           <div className="col-span-1 p-2 text-center text-xs font-bold text-yellow-600 uppercase tracking-widest bg-yellow-50/50 border-r border-slate-200">
              Empower: Exploration
              <span className="block text-[10px] text-yellow-500 font-normal normal-case">Real-world Application</span>
           </div>
           <div className="col-span-2 p-2 text-center text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-50/50 rounded-tr-xl">
              Impact: Innovation
              <span className="block text-[10px] text-purple-500 font-normal normal-case">Credit & Recognition</span>
           </div>
        </div>

        {/* Grade Header Row */}
        <div className="grid grid-cols-6 bg-white border-b border-slate-200 text-sm">
          <div className="p-4 font-semibold text-slate-600 uppercase text-xs tracking-wider border-r border-slate-100 flex items-center justify-between">
            <span>Skill Domain</span>
          </div>
          {grades.map((grade) => (
            <div key={grade} className="p-4 text-center font-bold text-slate-700 border-r border-slate-100 last:border-none">
              {grade}
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">MYP {grade === 'G6' ? '1' : grade === 'G7' ? '2' : grade === 'G8' ? '3' : grade === 'G9' ? '4' : '5'}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {domains.map((domain) => (
          <React.Fragment key={domain}>
            <div className="grid grid-cols-6 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors group">
              <div 
                onClick={() => handleToggleDomain(domain)}
                className="relative p-4 flex items-center justify-between font-medium text-slate-800 text-sm border-r border-slate-100 bg-white group-hover:bg-slate-50 cursor-pointer group/cell"
              >
                <div className="flex items-center space-x-2">
                  <span>{domain}</span>
                  <Info className="w-3 h-3 text-slate-300 opacity-0 group-hover/cell:opacity-100 transition-opacity" />
                </div>
                
                {/* Hover Tooltip - Enhanced */}
                <div className="absolute z-[100] left-4 top-3/4 mt-2 w-72 p-4 bg-white/95 backdrop-blur-sm text-slate-600 text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover/cell:opacity-100 group-hover/cell:visible transition-all duration-300 ease-out transform translate-y-2 group-hover/cell:translate-y-0 pointer-events-none border border-slate-200 ring-1 ring-slate-900/5">
                  <div className="font-bold mb-2 border-b border-slate-100 pb-2 text-indigo-600 uppercase tracking-wider text-[10px] flex items-center">
                    <Info className="w-3 h-3 mr-1.5" />
                    {domain} Context
                  </div>
                  <div className="leading-relaxed font-medium">{domainDescriptions[domain]}</div>
                  {/* Arrow */}
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"></div>
                </div>

                {expandedDomain === domain ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />}
              </div>
              {grades.map((grade) => {
                const key = `${domain}-${grade}`;
                const status = statusMap[key] || ChallengeStatus.LOCKED;
                const isInteractable = status !== ChallengeStatus.LOCKED;
                const isSelected = selectedPreviewKey?.domain === domain && selectedPreviewKey?.grade === grade;
                
                // Background color logic for better visibility
                let cellBgColor = '';
                if (status === ChallengeStatus.IN_PROGRESS) cellBgColor = 'bg-blue-50';
                else if (status === ChallengeStatus.SUBMITTED) cellBgColor = 'bg-amber-50';
                else if (status === ChallengeStatus.COMPLETED) cellBgColor = 'bg-green-50/20';
                else if (!isInteractable) cellBgColor = 'bg-slate-50/50';

                return (
                  <div 
                    key={key} 
                    onClick={() => isInteractable && handleCellClick(domain, grade)}
                    className={`
                      p-4 flex justify-center items-center border-r border-slate-100 last:border-r-0 transition-all duration-200 relative
                      ${isInteractable ? 'cursor-pointer hover:brightness-95' : 'cursor-not-allowed'}
                      ${cellBgColor}
                      ${isInteractable && !cellBgColor ? 'hover:bg-slate-50' : ''}
                      ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 z-20 scale-110 shadow-xl bg-white rounded-lg' : ''}
                    `}
                  >
                    {getStatusIcon(status)}
                  </div>
                );
              })}
            </div>
             {expandedDomain === domain && (
              <div className="grid grid-cols-6 border-b border-slate-200 animate-fade-in-down">
                  <div className="col-span-6 bg-slate-50 p-4 border-l-4 border-indigo-400">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {domainDescriptions[domain]}
                    </p>
                  </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Challenge Preview Side Panel */}
      {(previewChallenge || loadingPreview) && selectedPreviewKey && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={closePreview}></div>
            
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-scale-in border-l border-slate-200">
                
                {/* Header */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                {selectedPreviewKey.grade}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                {selectedPreviewKey.domain}
                            </span>
                            {isPracticeMode && (
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center">
                                    <Dumbbell className="w-3 h-3 mr-1" /> Practice
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 leading-snug">
                           {loadingPreview ? 'Loading Challenge...' : previewChallenge?.title}
                        </h2>
                    </div>
                    <button 
                        onClick={closePreview}
                        className="p-2 -mr-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="flex border-b border-slate-200 shrink-0">
                    <button 
                        onClick={handleSwitchToOfficial}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${!isPracticeMode ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
                    >
                        <span className="flex items-center justify-center">
                             <Star className="w-4 h-4 mr-2" /> Assessment
                        </span>
                    </button>
                    <button 
                         onClick={handleSwitchToPractice}
                         className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${isPracticeMode ? 'text-teal-600 border-teal-600 bg-teal-50/50' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
                    >
                         <span className="flex items-center justify-center">
                             <Dumbbell className="w-4 h-4 mr-2" /> Practice
                         </span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    
                    {/* Difficulty Selector (Only for Assessment Mode) */}
                    {!isPracticeMode && !loadingPreview && (
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                                <Signal className="w-3 h-3 mr-1" /> Difficulty Level
                            </h3>
                            <div className="flex rounded-lg bg-slate-100 p-1">
                                {Object.values(DifficultyLevel).map(level => {
                                    // Visual color coding for active state
                                    let activeClass = '';
                                    if (difficulty === level) {
                                        if (level === DifficultyLevel.EASY) activeClass = 'bg-white text-green-600 shadow-sm border-green-100';
                                        else if (level === DifficultyLevel.MEDIUM) activeClass = 'bg-white text-blue-600 shadow-sm border-blue-100';
                                        else if (level === DifficultyLevel.HARD) activeClass = 'bg-white text-orange-600 shadow-sm border-orange-100';
                                    } else {
                                        activeClass = 'text-slate-500 hover:text-slate-700';
                                    }

                                    return (
                                        <button
                                            key={level}
                                            onClick={() => handleDifficultyChange(level)}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all border border-transparent ${activeClass}`}
                                        >
                                            {level}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {loadingPreview ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Loader2 className={`w-10 h-10 animate-spin mb-4 ${isPracticeMode ? 'text-teal-500' : 'text-indigo-500'}`} />
                            <p className="font-medium animate-pulse">{isPracticeMode ? 'Generating drill...' : 'Fetching details...'}</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                             {/* Scenario */}
                             {previewChallenge?.scenario && (
                                 <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                     <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center">
                                         <BookOpen className="w-3 h-3 mr-1" /> The Scenario
                                     </h3>
                                     <p className="text-indigo-900 text-sm italic leading-relaxed">
                                         "{previewChallenge.scenario}"
                                     </p>
                                 </div>
                             )}

                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-slate-700 leading-relaxed text-sm">
                                    {previewChallenge?.description}
                                </p>
                             </div>

                             {/* Required Tools */}
                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                    <PenTool className="w-3 h-3 mr-1" /> Tools Needed
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {previewChallenge?.tools?.length ? (
                                        previewChallenge.tools.map(tool => (
                                            <span key={tool} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                                                {tool}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No specific tools required.</span>
                                    )}
                                </div>
                             </div>

                             {/* Learning Resources */}
                             {previewChallenge?.tutorialLinks && previewChallenge.tutorialLinks.length > 0 && (
                                 <div>
                                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                         <Video className="w-3 h-3 mr-1" /> Learning Resources
                                     </h3>
                                     <ul className="space-y-2">
                                         {previewChallenge.tutorialLinks.map((link, i) => (
                                             <li key={i}>
                                                 <a 
                                                     href={`https://www.youtube.com/results?search_query=${encodeURIComponent(link)}`} 
                                                     target="_blank" 
                                                     rel="noopener noreferrer"
                                                     className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline group bg-slate-50 p-2 rounded-lg"
                                                 >
                                                     <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2 text-[8px] text-red-600 group-hover:scale-110 transition-transform">▶</div>
                                                     {link}
                                                 </a>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )}

                             {/* Rubric Preview */}
                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                                    <CheckSquare className="w-3 h-3 mr-1" /> {isPracticeMode ? 'Success Criteria' : 'Evaluation Criteria'}
                                </h3>
                                <div className="space-y-3">
                                    {previewChallenge?.rubric?.map((item, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                                {item.points}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700 block text-xs mb-0.5">{item.criterion}</span>
                                                <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0 flex flex-col gap-3">
                    {!isPracticeMode ? (
                        <button 
                            onClick={handleStartChallenge}
                            disabled={loadingPreview}
                            className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            {loadingPreview ? 'Loading...' : 'Start Assessment'} <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleMarkPracticeComplete}
                            className="w-full py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center justify-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Practice Complete
                        </button>
                    )}
                    <button 
                        onClick={closePreview}
                        className="w-full py-2 text-slate-500 font-medium text-xs hover:text-slate-800 transition-colors"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SkillMatrix;
