import React, { useState, useEffect, useRef } from 'react';
import { GradeLevel, SkillDomain, Challenge, ChallengeStatus, Submission, ATLSkill } from '../types';
import { generateChallengeDetails, analyzeSubmission } from '../services/geminiService';
import { submitToGoogleDrive, createChallengeDoc } from '../services/submissionService';
import { ArrowLeft, BookOpen, PenTool, CheckSquare, Wand2, Upload, AlertCircle, Video, MessageCircle, Paperclip, X, UploadCloud, BrainCircuit, GripVertical, ArrowRight, FileVideo, FileText, File, FileAudio, Image as ImageIcon, FilePlus, UserCircle, Send } from 'lucide-react';
import Confetti from 'react-confetti';

interface ChallengeViewProps {
  domain: SkillDomain;
  grade: GradeLevel;
  onBack: () => void;
  onStatusUpdate: (key: string, status: ChallengeStatus) => void;
  status: ChallengeStatus;
  onGlobalSubmit: (submission: Submission) => void;
}

const ChallengeView: React.FC<ChallengeViewProps> = ({ domain, grade, onBack, onStatusUpdate, status, onGlobalSubmit }) => {
  const [challenge, setChallenge] = useState<Partial<Challenge> | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [detectedATLs, setDetectedATLs] = useState<ATLSkill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Doc Export State
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  
  // Confetti State
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Supervisor Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('Mr. Mariano');
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string, time: string}[]>([
      { sender: 'System', text: 'Welcome to the Supervisor Chat. Select a teacher to ask for help.', time: new Date().toISOString() }
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Update window dimensions for confetti
  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate content on mount if not available
  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const data = await generateChallengeDetails(domain, grade);
        setChallenge(data);
        if (status === ChallengeStatus.AVAILABLE) {
          onStatusUpdate(`${domain}-${grade}`, ChallengeStatus.IN_PROGRESS);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, grade]);

  // Effect to manage preview URLs and memory
  useEffect(() => {
    const newPreviewUrls = uploadedFiles.map(file => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return ''; // Placeholder for non-image files
    });
    setPreviewUrls(newPreviewUrls);

    // Cleanup function to revoke object URLs
    return () => {
        newPreviewUrls.forEach(url => {
            if (url) URL.revokeObjectURL(url);
        });
    };
  }, [uploadedFiles]);

  useEffect(() => {
      if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [chatMessages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires data to be set to allow dragging
      e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = "move";
      
      if (draggedIndex === index) return; // Don't highlight if hovering over self
      
      if (dragOverIndex !== index) {
          setDragOverIndex(index);
      }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
     // Prevent flicker: only clear if we are actually leaving the container, not entering a child
     if (e.currentTarget.contains(e.relatedTarget as Node)) return;
     setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      setDragOverIndex(null);
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      const newFiles = [...uploadedFiles];
      const draggedFile = newFiles[draggedIndex];
      
      // Remove dragged item
      newFiles.splice(draggedIndex, 1);
      // Insert at new position
      newFiles.splice(dropIndex, 0, draggedFile);
      
      setUploadedFiles(newFiles);
      setDraggedIndex(null);
  };

  const handleDragEnd = () => {
      setDraggedIndex(null);
      setDragOverIndex(null);
  };

  const handleExportToDoc = async () => {
      if (!challenge) return;
      setIsCreatingDoc(true);
      try {
          const result = await createChallengeDoc(
              challenge, 
              'Student', // Real app would use currentUser.name
              grade, 
              domain
          );
          
          if (result.success && result.docUrl) {
              if (result.isFallback) {
                  // Fallback: Force download of text file
                  const link = document.createElement('a');
                  link.href = result.docUrl;
                  const safeTitle = (challenge.title || 'Challenge').replace(/[^a-z0-9]/gi, '_');
                  link.download = `${safeTitle}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // Inform user about fallback
                  alert("Google Drive access unavailable (Backend Permission Issue). Downloading offline copy instead.");
              } else {
                  // Success: Open Google Doc
                  window.open(result.docUrl, '_blank');
              }
          } else {
              alert(result.message || "Could not create document. Please check your connection.");
          }
      } catch (e) {
          console.error(e);
          alert("Error exporting document.");
      } finally {
          setIsCreatingDoc(false);
      }
  };

  const handleSubmit = async () => {
    if (!challenge || (!submissionText && uploadedFiles.length === 0)) return;
    setIsSubmitting(true);

    try {
        // 1. Analyze with AI
        const rubricSummary = challenge.rubric?.map(r => `${r.criterion}: ${r.description}`).join('; ') || '';
        const analysis = await analyzeSubmission(challenge.title || 'Challenge', submissionText, rubricSummary);
        
        setFeedback(analysis.feedback);
        setDetectedATLs(analysis.atlSkills);

        // 2. Submit to Backend (Google Drive/Sheets)
        const submissionPayload = {
            studentName: 'Student', // In real app, from Auth
            studentId: '123',
            grade,
            domain,
            challengeTitle: challenge.title || 'Untitled',
            submissionText,
            aiFeedback: analysis.feedback,
            atlSkills: analysis.atlSkills
        };

        await submitToGoogleDrive(submissionPayload, uploadedFiles);

        // 3. Update Local State
        onStatusUpdate(`${domain}-${grade}`, ChallengeStatus.SUBMITTED);
        
        // 4. Create Submission Object for Peer Review System
        const newSubmission: Submission = {
            id: Date.now().toString(),
            challengeId: 'generated',
            domain,
            grade,
            title: challenge.title || 'Untitled',
            studentName: 'You', // In real app, current user
            content: submissionText,
            fileUrls: previewUrls.filter(url => url !== ''), // Pass blob URLs for local preview (note: these expire, real app needs persistent URLs)
            rubric: challenge.rubric || [],
            feedback: analysis.feedback,
            atlSkills: analysis.atlSkills,
            score: 0 // Pending teacher/peer review
        };
        onGlobalSubmit(newSubmission);

        // 5. Trigger Confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000); // Stop after 8 seconds

    } catch (e) {
        console.error("Submission failed", e);
        alert("Something went wrong. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSendChatMessage = () => {
      if (!chatInput.trim()) return;
      
      const newMsg = { sender: 'You', text: chatInput, time: new Date().toISOString() };
      setChatMessages(prev => [...prev, newMsg]);
      setChatInput('');

      // Simulate Reply
      setTimeout(() => {
          setChatMessages(prev => [...prev, { 
              sender: selectedTeacher, 
              text: `Thanks for the question! I'll review your design concept shortly.`, 
              time: new Date().toISOString() 
          }]);
      }, 2000);
  };

  const getFileIcon = (type: string) => {
      if (type.startsWith('video/')) return <FileVideo className="w-5 h-5 text-rose-500" />;
      if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-amber-500" />;
      if (type.startsWith('text/') || type.includes('pdf') || type.includes('document') || type.includes('msword')) return <FileText className="w-5 h-5 text-blue-500" />;
      if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
      return <File className="w-5 h-5 text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <Wand2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="font-medium animate-pulse">Generating your personalized design challenge...</p>
      </div>
    );
  }

  if (!challenge) return <div className="text-red-500">Error loading challenge.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in relative">
      
      {showConfetti && (
          <Confetti 
            width={windowDimensions.width} 
            height={windowDimensions.height} 
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
          />
      )}

      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matrix
        </button>
        <div className="flex flex-col items-end">
          <button 
              onClick={handleExportToDoc}
              disabled={isCreatingDoc}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              title="Creates a copy in your FIS Google Drive"
          >
              {isCreatingDoc ? (
                  <span className="flex items-center"><Wand2 className="w-4 h-4 mr-2 animate-spin" /> Creating Doc...</span>
              ) : (
                  <span className="flex items-center"><FilePlus className="w-4 h-4 mr-2" /> Copy to Google Drive</span>
              )}
          </button>
          <span className="text-[10px] text-slate-400 mt-1">Requires FIS Login</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center space-x-2 text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">
                    <span>{grade}</span>
                    <span>•</span>
                    <span>{domain}</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{challenge.title}</h1>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">{challenge.description}</p>
            </div>
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                status === ChallengeStatus.SUBMITTED ? 'bg-yellow-100 text-yellow-700' :
                status === ChallengeStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
            }`}>
                {status}
            </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> The Scenario
            </h3>
            <p className="text-slate-600 italic">{challenge.scenario}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tools & Tutorials */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-pink-500" /> Tools & Resources
            </h3>
            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Required Tools</h4>
                    <div className="flex flex-wrap gap-2">
                        {challenge.tools?.map(tool => (
                            <span key={tool} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm border border-slate-200">
                                {tool}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Learning Resources</h4>
                    <ul className="space-y-2">
                        {challenge.tutorialLinks?.map((link, i) => (
                             <li key={i}>
                                <a 
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(link)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 hover:underline group"
                                >
                                    <Video className="w-4 h-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
                                    {link}
                                </a>
                             </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Rubric */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-green-500" /> Assessment Rubric
            </h3>
            <div className="space-y-3">
                {challenge.rubric?.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-sm p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="font-bold text-slate-50 min-w-[3rem]">{item.criterion}</div>
                        <div className="flex-1 text-slate-700">{item.description}</div>
                        <div className="font-bold text-slate-900">{item.points}pts</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Submission Area */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Upload className="w-6 h-6 mr-3 text-indigo-600" /> 
            Submit Your Work
        </h2>

        {!feedback ? (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reflection & Process</label>
                    <textarea 
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                        placeholder="Describe what you made. What went well? What would you change next time? (Reference Criterion C)"
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Evidence Upload</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="pointer-events-none">
                            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm text-slate-600 font-medium">Click or drag photos/videos here</p>
                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, MP4</p>
                        </div>
                    </div>

                    {/* Drag and Drop File List */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                             <p className="text-xs font-bold text-slate-400 uppercase">Files ({uploadedFiles.length}) - Drag to Reorder</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {uploadedFiles.map((file, index) => (
                                    <div 
                                        key={`${file.name}-${index}`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`
                                            group flex items-center p-3 rounded-xl border transition-all duration-200 ease-in-out cursor-move relative
                                            ${draggedIndex === index 
                                                ? 'opacity-40 border-dashed border-indigo-300 bg-indigo-50 grayscale scale-95' // Ghost State
                                                : 'bg-white'}
                                            ${dragOverIndex === index && draggedIndex !== index 
                                                ? 'border-2 border-indigo-500 bg-indigo-50 shadow-xl scale-105 z-10 ring-2 ring-indigo-200 ring-offset-2' // Drop Target State
                                                : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
                                        `}
                                    >
                                        <div className="mr-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-500">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        
                                        {/* Preview Thumbnail or Icon */}
                                        <div className="w-10 h-10 rounded bg-slate-100 mr-3 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
                                            {previewUrls[index] ? (
                                                <img src={previewUrls[index]} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                getFileIcon(file.type)
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                                            <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>

                                        <button 
                                            onClick={() => handleRemoveFile(index)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!submissionText && uploadedFiles.length === 0)}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <Wand2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
                            </>
                        ) : (
                            <>
                                Submit Challenge <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        ) : (
            <div className="animate-scale-in">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                            <CheckSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-800">Submission Received!</h3>
                            <p className="text-sm text-green-700">Great job completing this challenge.</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-lg border border-green-100 shadow-sm space-y-4">
                        <div>
                             <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                                <Wand2 className="w-3 h-3 mr-1" /> AI Feedback
                             </h4>
                             <p className="text-slate-700 leading-relaxed">{feedback}</p>
                        </div>
                        
                        {detectedATLs.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                                    <BrainCircuit className="w-3 h-3 mr-1" /> Skills Detected
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {detectedATLs.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded border border-indigo-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={onBack} className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Supervisor Chat Pane */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                 <UserCircle className="w-5 h-5 text-indigo-500" />
                 <h3 className="font-bold text-slate-800">Supervisor Chat</h3>
             </div>
             <select 
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="text-sm border border-slate-300 rounded-md p-1.5 focus:ring-indigo-500 focus:border-indigo-500"
             >
                 <option>Mr. Mariano</option>
                 <option>Mr. Mervin</option>
             </select>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 bg-slate-50/50 space-y-4" ref={chatScrollRef}>
              {chatMessages.map((msg, idx) => {
                  const isMe = msg.sender === 'You';
                  return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl p-3 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                              <p className="text-sm">{msg.text}</p>
                              <div className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {msg.sender} • {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
             <div className="flex items-center space-x-2">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this challenge..."
                    className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <button 
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
             </div>
          </div>
      </div>

    </div>
  );
};

export default ChallengeView;