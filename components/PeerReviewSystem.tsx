
import React, { useState, useEffect } from 'react';
import { GradeLevel, SkillDomain, Submission, RubricItem } from '../types';
import { validateFeedbackTone } from '../services/geminiService';
import { MessageCircle, CheckCircle, AlertTriangle, ArrowRight, User, ThumbsUp, Star, ImageIcon, Award } from 'lucide-react';

// Mock Data for Peer Reviews
const mockSubmissions: Submission[] = [
  {
    id: 'sub-1', // Original mock ID
    challengeId: 'c1',
    studentName: 'Student #4092', // Anonymous
    grade: GradeLevel.G6,
    domain: SkillDomain.WOODWORK,
    title: 'Basic Box Joint',
    content: "I created a simple box using pine wood. I used a tenon saw to cut the joints. It was hard to get them straight, so there are some gaps. I sanded it down to make it smooth.",
    fileUrls: ['https://placehold.co/400x400/e2e8f0/64748b?text=Box+Joint\\nPhoto+1', 'https://placehold.co/400x400/e2e8f0/64748b?text=Box+Joint\\nPhoto+2'],
    rubric: [
        { criterion: "C.2", points: 8, description: "Demonstrate excellent technical skills (CS.1.2a)." },
        { criterion: "D.1", points: 8, description: "Outline simple testing methods (E1.1a)." }
    ]
  },
  {
    id: 'p1', // ID matching teacher dashboard pending mock
    challengeId: 'c1-dup',
    studentName: 'Alice Johnson', 
    grade: GradeLevel.G6,
    domain: SkillDomain.WOODWORK,
    title: 'Box Joint Submission',
    content: "Box joint holds weight. I focused heavily on safety and precision.",
    fileUrls: ['https://placehold.co/400x400/e2e8f0/64748b?text=Box+Joint\\nPhoto+1'],
    rubric: [
        { criterion: "C.2", points: 8, description: "Demonstrate excellent technical skills (CS.1.2a)." }
    ]
  },
  {
    id: 'p2', // ID matching teacher dashboard pending mock
    challengeId: 'c2-dup',
    studentName: 'Bob Smith',
    grade: GradeLevel.G8,
    domain: SkillDomain.LASER_CUTTER,
    title: 'Laser Cut Puzzle',
    content: "Precision cut is excellent. The kerf was calculated correctly.",
    fileUrls: ['https://placehold.co/400x400/e0f2fe/0891b2?text=Laser+Cut\\nPhoto'],
    rubric: [
        { criterion: "C.2", points: 8, description: "Demonstrate excellent technical skills (CS.1.2a)." }
    ]
  },
  {
    id: 'sub-2',
    challengeId: 'c2',
    studentName: 'Student #8821',
    grade: GradeLevel.G8,
    domain: SkillDomain.THREE_D_PRINTING,
    title: 'Phone Stand Prototype',
    content: "My design is a phone stand that amplifies sound. I used Tinkercad. The first print failed because I didn't use supports. The second one works but the angle is a bit too steep.",
    fileUrls: ['https://placehold.co/400x400/e0f2fe/0891b2?text=Phone+Stand\\nCAD+Model', 'https://placehold.co/400x400/e0f2fe/0891b2?text=Phone+Stand\\nFinal+Print', 'https://placehold.co/400x400/e0f2fe/0891b2?text=Phone+Stand\\nIn+Use'],
    rubric: [
        { criterion: "B.2", points: 8, description: "Develop feasible design ideas (DI.3.2a)." },
        { criterion: "C.4", points: 8, description: "Explain changes made (CS.3.4a)." }
    ]
  }
];

interface PeerReviewSystemProps {
    sharedSubmissions: Submission[];
    initialSubmissionId?: string | null;
}

const PeerReviewSystem: React.FC<PeerReviewSystemProps> = ({ sharedSubmissions, initialSubmissionId }) => {
  const [view, setView] = useState<'list' | 'reviewing'>('list');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Review Form State
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [isNominated, setIsNominated] = useState(false);
  
  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean, message?: string} | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Combine mock and shared
  // De-duplicate if sharedSubmissions contains items with same IDs as mocks
  const displaySubmissions = [...mockSubmissions, ...sharedSubmissions.filter(s => !mockSubmissions.find(m => m.id === s.id))];

  // Auto-open effect for Teacher navigation
  useEffect(() => {
      if (initialSubmissionId) {
          const found = displaySubmissions.find(s => s.id === initialSubmissionId);
          if (found) {
              handleStartReview(found);
          }
      }
  }, [initialSubmissionId]);

  const handleStartReview = (sub: Submission) => {
    setSelectedSubmission(sub);
    setRatings({});
    setComments({});
    setGeneralFeedback('');
    setValidationResult(null);
    setIsSubmitted(false);
    setIsNominated(false);
    setView('reviewing');
  };

  const handleRatingChange = (criterion: string, score: number) => {
    setRatings(prev => ({ ...prev, [criterion]: score }));
  };

  const handleCommentChange = (criterion: string, text: string) => {
    setComments(prev => ({ ...prev, [criterion]: text }));
  };

  const handleSubmitReview = async () => {
    if (!generalFeedback.trim()) return;

    setIsValidating(true);
    setValidationResult(null);
    
    // AI Tone Check
    const result = await validateFeedbackTone(generalFeedback);
    
    setIsValidating(false);

    if (!result.isConstructive) {
        setValidationResult({ 
            valid: false, 
            message: result.suggestion || "Please make your feedback more specific and kind." 
        });
        return;
    }

    // Success
    setIsSubmitted(true);
    setTimeout(() => {
       setView('list');
       setSelectedSubmission(null);
    }, 3500);
  };

  if (view === 'list') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
                <MessageCircle className="w-8 h-8 mr-3" /> Peer Review Center
            </h1>
            <p className="opacity-90 max-w-2xl">
                Help your classmates improve by providing constructive feedback. 
                Earn XP for every helpful review you submit!
            </p>
        </div>

        <h2 className="text-xl font-bold text-slate-800">Submissions Needing Review</h2>
        <div className="grid md:grid-cols-2 gap-6">
            {displaySubmissions.map(sub => (
                <div key={sub.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                               <User className="w-5 h-5" />
                           </div>
                           <div>
                               <h3 className="font-bold text-slate-800">{sub.title}</h3>
                               <p className="text-xs text-slate-500">{sub.domain} • {sub.grade}</p>
                           </div>
                        </div>
                        <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs font-bold">New</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">"{sub.content}"</p>
                    <button 
                        onClick={() => handleStartReview(sub)}
                        className="w-full py-2 bg-slate-50 text-slate-700 font-semibold rounded-lg hover:bg-teal-50 hover:text-teal-700 border border-slate-200 hover:border-teal-200 transition-colors flex items-center justify-center"
                    >
                        Start Review <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (selectedSubmission) {
      return (
          <div className="max-w-5xl mx-auto animate-fade-in grid lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
              {/* Left: Submission Content */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-6">
                  <div className="flex items-center space-x-2 mb-6">
                      <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
                          &larr; Back
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 text-sm font-bold uppercase tracking-wide">
                          Reviewing: {selectedSubmission.studentName}
                      </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedSubmission.title}</h2>
                  <div className="flex space-x-2 mb-6">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{selectedSubmission.grade}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{selectedSubmission.domain}</span>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
                      <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Student Reflection</h3>
                      <p className="text-slate-800 leading-relaxed italic">
                          "{selectedSubmission.content}"
                      </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Final Product Files</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(selectedSubmission.fileUrls && selectedSubmission.fileUrls.length > 0) ? (
                        selectedSubmission.fileUrls.map((url, i) => (
                           <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                             <img src={url} alt={`Submission file ${i+1}`} className="w-full h-full object-cover" />
                           </div>
                        ))
                      ) : (
                        <div className="col-span-2 aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                          <div className="text-center text-slate-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No files were uploaded.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              {/* Right: Rubric Form */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-6 flex flex-col">
                  {isSubmitted ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                              <ThumbsUp className="w-10 h-10" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Submitted!</h2>
                          <p className="text-slate-500">Thank you for helping your peer improve.</p>
                           {isNominated && (
                              <div className="mt-4 bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm font-medium flex items-center justify-center">
                                 <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                 Project Nominated for Award!
                              </div>
                           )}
                      </div>
                  ) : (
                      <>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-yellow-500" /> Assessment Rubric
                        </h2>
                        
                        <div className="space-y-8 flex-1">
                            {selectedSubmission.rubric.map((item, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="font-bold text-slate-700">{item.criterion}</h4>
                                        <span className="text-xs text-slate-400">Max: {item.points} pts</span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        {item.description}
                                    </p>
                                    
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max={item.points} 
                                            value={ratings[item.criterion] || 0}
                                            onChange={(e) => handleRatingChange(item.criterion, parseInt(e.target.value))}
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                        />
                                        <span className="font-bold text-teal-700 w-8 text-right">{ratings[item.criterion] || 0}</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Specific comment for this criterion..."
                                        value={comments[item.criterion] || ''}
                                        onChange={(e) => handleCommentChange(item.criterion, e.target.value)}
                                        className="w-full p-2 text-sm border-b border-slate-200 focus:border-teal-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            ))}

                            <div className="pt-6 border-t border-slate-200">
                                <h4 className="font-bold text-slate-700 mb-2">Constructive Feedback</h4>
                                <p className="text-xs text-slate-500 mb-2">Be kind, specific, and helpful. What is one thing they did well and one thing they can improve?</p>
                                <textarea 
                                    value={generalFeedback}
                                    onChange={(e) => setGeneralFeedback(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                                    placeholder="Write your review here..."
                                />
                                {validationResult && !validationResult.valid && (
                                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-sm text-red-700 animate-pulse">
                                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">AI Coach Says:</p>
                                            <p>{validationResult.message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                             <div className="mt-6 pt-6 border-t border-slate-200">
                                <h4 className="font-bold text-slate-700 mb-2">Award Nomination</h4>
                                <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                  <input
                                    id="nomination"
                                    type="checkbox"
                                    checked={isNominated}
                                    onChange={() => setIsNominated(!isNominated)}
                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                                  />
                                  <div>
                                    <label htmlFor="nomination" className="font-medium text-yellow-800">Nominate for 'Best Design of The Year'</label>
                                    <p className="text-xs text-yellow-700 mt-1">Select this if you believe the final product is exceptional in quality, creativity, and execution.</p>
                                  </div>
                                </div>
                              </div>

                        </div>

                        <button 
                            onClick={handleSubmitReview}
                            disabled={isValidating}
                            className="mt-6 w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 disabled:opacity-50"
                        >
                            {isValidating ? 'Checking Feedback Tone...' : 'Submit Peer Review'}
                        </button>
                      </>
                  )}
              </div>
          </div>
      );
  }

  return <div>Error</div>;
};

export default PeerReviewSystem;
