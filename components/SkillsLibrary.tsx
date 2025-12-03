
import React, { useState } from 'react';
import { Challenge, SkillDomain, GradeLevel } from '../types';
import { BookOpen, Plus, Save, Trash2, Link as LinkIcon, Edit3, Search, Filter, CheckCircle, UserPlus, X, CheckSquare, Square, BadgeAlert, Hammer, PenTool, Cpu, Scissors, Video, Code, Box, Zap, Monitor, Leaf } from 'lucide-react';

// Mock Data for Existing Library (Core + Custom)
const MOCK_LIBRARY: Challenge[] = [
    {
        id: 'lib-1',
        title: 'Safety License & Box Build',
        domain: SkillDomain.WOODWORK,
        grade: GradeLevel.G6,
        description: 'Learn the basics of workshop safety and construct a simple wooden box.',
        scenario: 'You need a durable storage solution for your desk or locker.',
        tools: ['Tenon Saw', 'Bench Hook', 'Sandpaper', 'PVA Glue'],
        tutorialLinks: ['https://youtu.be/woodwork-basics', 'https://youtu.be/safety-first'],
        rubric: [],
        xpReward: 100,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-2',
        title: 'Iso-Sketching Basics',
        domain: SkillDomain.SKETCHING,
        grade: GradeLevel.G6,
        description: 'Master the art of 3D sketching using isometric paper techniques.',
        scenario: 'An architect needs a quick concept sketch of a building block.',
        tools: ['Pencil', 'Iso Paper', 'Ruler'],
        tutorialLinks: ['https://youtu.be/iso-sketching'],
        rubric: [],
        xpReward: 50,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-3',
        title: 'Laser Cut Name Tag',
        domain: SkillDomain.LASER_CUTTER,
        grade: GradeLevel.G7,
        description: 'Design a vector file for a personalized name tag and cut it out using the laser cutter.',
        scenario: 'Create a custom ID badge for a school event or club.',
        tools: ['Adobe Illustrator', 'Laser Cutter', 'Acrylic'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 75,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: ['203045']
    },
    {
        id: 'lib-4',
        title: 'Arduino Traffic Light',
        domain: SkillDomain.MICROBITS,
        grade: GradeLevel.G8,
        description: 'Program a Microbit or Arduino to simulate a traffic light sequence with LEDs.',
        scenario: 'Design a safety system for a busy intersection model.',
        tools: ['Micro:bit', 'LEDs', 'Wires', 'Breadboard'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 120,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-5',
        title: 'Sustainable Lunchbox Audit',
        domain: SkillDomain.SUSTAINABLE_DESIGN,
        grade: GradeLevel.G7,
        description: 'Analyze the material footprint of a standard lunchbox and propose eco-friendly alternatives.',
        scenario: 'The school wants to reduce plastic waste in the cafeteria.',
        tools: ['Weighing Scale', 'Research Laptop'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 80,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-6',
        title: 'Tote Bag Sewing',
        domain: SkillDomain.TEXTILES,
        grade: GradeLevel.G7,
        description: 'Learn to use a sewing machine to stitch a durable canvas tote bag.',
        scenario: 'Design a reusable shopping bag to replace plastic ones.',
        tools: ['Sewing Machine', 'Fabric Shears', 'Canvas', 'Pins'],
        tutorialLinks: ['https://youtu.be/sewing-machine-101'],
        rubric: [],
        xpReward: 110,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-7',
        title: 'Stop Motion Animation',
        domain: SkillDomain.VIDEO_PRODUCTION,
        grade: GradeLevel.G6,
        description: 'Create a 15-second stop motion clip using found objects.',
        scenario: 'Produce a short intro sequence for the school news channel.',
        tools: ['Camera/Phone', 'Tripod', 'Stop Motion App'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 90,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-8',
        title: 'Python Turtle Graphics',
        domain: SkillDomain.PROGRAMMING,
        grade: GradeLevel.G7,
        description: 'Use Python code to draw complex geometric patterns.',
        scenario: 'Generate digital art for a math department poster.',
        tools: ['Python IDLE', 'Laptop'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 100,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-9',
        title: '3D Printed Phone Stand',
        domain: SkillDomain.THREE_D_PRINTING,
        grade: GradeLevel.G8,
        description: 'Model and print a functional stand for a mobile device.',
        scenario: 'Design a desk accessory that holds a phone at a viewable angle.',
        tools: ['Tinkercad', '3D Printer (PLA)', 'Calipers'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 130,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-10',
        title: 'Lego Spike Line Follower',
        domain: SkillDomain.ROBOTICS,
        grade: GradeLevel.G7,
        description: 'Build and code a robot that follows a black line on a white background.',
        scenario: 'Create an automated delivery bot for a warehouse floor.',
        tools: ['Lego Spike Prime Kit', 'Laptop'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 115,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-11',
        title: 'Vector Logo Design',
        domain: SkillDomain.DIGITAL_DESIGN,
        grade: GradeLevel.G8,
        description: 'Create a scalable vector logo for a personal brand.',
        scenario: 'You are launching a small business and need a professional identity.',
        tools: ['Adobe Illustrator', 'Pen Tool'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 95,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-12',
        title: 'AI Ethics Case Study',
        domain: SkillDomain.AI_LITERACY,
        grade: GradeLevel.G9,
        description: 'Analyze a real-world scenario involving AI bias and present findings.',
        scenario: 'Prepare a debate argument on facial recognition technology.',
        tools: ['Research Database', 'Presentation Software'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 85,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    },
    {
        id: 'lib-13',
        title: 'Advanced Joinery (Dovetails)',
        domain: SkillDomain.WOODWORK,
        grade: GradeLevel.G10,
        description: 'Execute hand-cut dovetail joints for a fine furniture component.',
        scenario: 'Demonstrate master craftsmanship for your final portfolio.',
        tools: ['Dovetail Saw', 'Chisels', 'Marking Gauge'],
        tutorialLinks: [],
        rubric: [],
        xpReward: 200,
        author: 'System',
        status: 'PUBLISHED',
        assignedStudentIds: []
    }
];

// Simplified Roster for Assignment
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
  { id: '202801', name: 'Takumi Abe', grade: 10 },
  { id: '202802', name: 'Shoichi Asano', grade: 10 },
];

const DOMAIN_STYLES: Record<SkillDomain, { icon: React.ElementType, color: string, bg: string, border: string }> = {
    [SkillDomain.WOODWORK]: { icon: Hammer, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-l-amber-500' },
    [SkillDomain.SKETCHING]: { icon: PenTool, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-l-slate-500' },
    [SkillDomain.MICROBITS]: { icon: Cpu, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
    [SkillDomain.LASER_CUTTER]: { icon: Scissors, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-l-rose-500' },
    [SkillDomain.THREE_D_PRINTING]: { icon: Box, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-l-blue-500' },
    [SkillDomain.DIGITAL_DESIGN]: { icon: Monitor, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-l-purple-500' },
    [SkillDomain.TEXTILES]: { icon: Scissors, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-l-pink-500' },
    [SkillDomain.ROBOTICS]: { icon: Zap, color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-l-cyan-500' },
    [SkillDomain.VIDEO_PRODUCTION]: { icon: Video, color: 'text-red-700', bg: 'bg-red-50', border: 'border-l-red-500' },
    [SkillDomain.SUSTAINABLE_DESIGN]: { icon: Leaf, color: 'text-green-700', bg: 'bg-green-50', border: 'border-l-green-500' },
    [SkillDomain.PROGRAMMING]: { icon: Code, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
    [SkillDomain.AI_LITERACY]: { icon: Cpu, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-l-violet-500' },
    [SkillDomain.POWER_TOOLS]: { icon: Hammer, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-l-orange-500' },
    [SkillDomain.ENTREPRENEURSHIP]: { icon: Zap, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-l-yellow-500' },
};

const SkillsLibrary: React.FC = () => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [challenges, setChallenges] = useState<Challenge[]>(MOCK_LIBRARY);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Assignment State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedChallengeForAssign, setSelectedChallengeForAssign] = useState<Challenge | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // Create/Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Challenge>>({
        title: '',
        domain: SkillDomain.WOODWORK,
        grade: GradeLevel.G6,
        description: '',
        scenario: '',
        tools: [],
        tutorialLinks: [],
        rubric: [],
        author: 'Mr. Mariano',
        status: 'DRAFT',
        assignedStudentIds: []
    });
    
    const [newLink, setNewLink] = useState('');
    const [newTool, setNewTool] = useState('');

    const handleEdit = (challenge: Challenge) => {
        setFormData({
            title: challenge.title,
            domain: challenge.domain,
            grade: challenge.grade,
            description: challenge.description,
            scenario: challenge.scenario,
            tools: challenge.tools,
            tutorialLinks: challenge.tutorialLinks,
            rubric: challenge.rubric,
            author: challenge.author,
            status: challenge.status,
            assignedStudentIds: challenge.assignedStudentIds
        });
        setEditingId(challenge.id);
        setIsEditing(true);
        setView('create');
    };

    const handleSave = () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in the title and description.");
            return;
        }

        if (isEditing && editingId) {
            // Update existing
            setChallenges(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Challenge : c));
            alert("Challenge updated successfully!");
        } else {
            // Create new
            const newChallenge: Challenge = {
                ...formData as Challenge,
                id: `custom-${Date.now()}`,
                xpReward: 100,
                status: 'PUBLISHED',
                rubric: [], // Simplified for MVP
                assignedStudentIds: []
            };
            setChallenges([newChallenge, ...challenges]);
            alert("Challenge created successfully!");
        }

        resetForm();
    };

    const resetForm = () => {
        setView('list');
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            domain: SkillDomain.WOODWORK,
            grade: GradeLevel.G6,
            description: '',
            scenario: '',
            tools: [],
            tutorialLinks: [],
            rubric: [],
            author: 'Mr. Mariano',
            status: 'DRAFT',
            assignedStudentIds: []
        });
    };

    const addLink = () => {
        if (newLink) {
            setFormData(prev => ({ ...prev, tutorialLinks: [...(prev.tutorialLinks || []), newLink] }));
            setNewLink('');
        }
    };

    const addTool = () => {
        if (newTool) {
            setFormData(prev => ({ ...prev, tools: [...(prev.tools || []), newTool] }));
            setNewTool('');
        }
    };

    // Assignment Handlers
    const openAssignModal = (challenge: Challenge) => {
        setSelectedChallengeForAssign(challenge);
        setSelectedStudentIds(challenge.assignedStudentIds || []);
        setAssignModalOpen(true);
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const confirmAssignment = () => {
        if (!selectedChallengeForAssign) return;
        
        setChallenges(prev => prev.map(c => 
            c.id === selectedChallengeForAssign.id 
                ? { ...c, assignedStudentIds: selectedStudentIds } 
                : c
        ));
        
        setAssignModalOpen(false);
        setSelectedChallengeForAssign(null);
        setSelectedStudentIds([]);
    };

    // Enhanced Filter Logic
    const filteredChallenges = challenges.filter(c => {
        const search = searchTerm.toLowerCase();
        return (
            (c.title?.toLowerCase() || '').includes(search) || 
            (c.domain?.toLowerCase() || '').includes(search) ||
            (c.grade?.toLowerCase() || '').includes(search) ||
            (c.description?.toLowerCase() || '').includes(search)
        );
    });

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto relative">
            {view === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                                <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
                                Skills Library
                            </h1>
                            <p className="text-slate-500">Manage curriculum, track completion, and create custom challenges.</p>
                        </div>
                        <button 
                            onClick={() => { resetForm(); setView('create'); }}
                            className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Create New Challenge
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search challenges by title, domain, description or grade..." 
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChallenges.map(challenge => {
                            const style = DOMAIN_STYLES[challenge.domain] || { icon: Box, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-l-slate-400' };
                            const DomainIcon = style.icon;
                            
                            return (
                                <div key={challenge.id} className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border-l-4 ${style.border}`}>
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex space-x-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${challenge.author === 'System' ? 'bg-slate-100 text-slate-500' : 'bg-purple-100 text-purple-700'}`}>
                                                    {challenge.author === 'System' ? 'Core Curriculum' : 'Custom Content'}
                                                </span>
                                                {challenge.author === 'System' && (
                                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 flex items-center">
                                                        <BadgeAlert className="w-3 h-3 mr-1" /> Must Complete
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">{challenge.grade}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">{challenge.title}</h3>
                                        
                                        {/* Distinct Domain Badge */}
                                        <div className={`flex items-center text-xs font-bold uppercase mb-3 px-2 py-1 rounded-md w-fit ${style.color} ${style.bg}`}>
                                            <DomainIcon className="w-3 h-3 mr-1.5" />
                                            {challenge.domain}
                                        </div>
                                        
                                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{challenge.description}</p>
                                        
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {challenge.tools?.slice(0, 3).map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] rounded">
                                                    {t}
                                                </span>
                                            ))}
                                            {(challenge.tools?.length || 0) > 3 && (
                                                <span className="px-2 py-0.5 text-slate-400 text-[10px]">+{(challenge.tools?.length || 0) - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => openAssignModal(challenge)}
                                                className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center"
                                            >
                                                <UserPlus className="w-3 h-3 mr-1" />
                                                {(challenge.assignedStudentIds?.length || 0) > 0 
                                                    ? `Assigned (${challenge.assignedStudentIds?.length})` 
                                                    : 'Assign'}
                                            </button>
                                            <div className="text-[10px] text-slate-400">
                                                {(challenge.assignedStudentIds?.length || 0) > 0 && <span>• 24% Done</span>}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleEdit(challenge)}
                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center px-2 py-1 rounded hover:bg-indigo-50"
                                        >
                                            <Edit3 className="w-3 h-3 mr-1" /> Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {view === 'create' && (
                <div className="max-w-3xl mx-auto">
                    <button 
                        onClick={resetForm}
                        className="mb-6 text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center"
                    >
                        &larr; Back to Library
                    </button>

                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="bg-indigo-600 p-6 text-white">
                            <h2 className="text-xl font-bold flex items-center">
                                {isEditing ? <Edit3 className="w-6 h-6 mr-2" /> : <Plus className="w-6 h-6 mr-2" />} 
                                {isEditing ? 'Edit Challenge' : 'Create Custom Challenge'}
                            </h2>
                            <p className="text-indigo-200 text-sm">{isEditing ? 'Update curriculum content.' : 'Design a new task for your students.'}</p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Advanced joinery test"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Skill Domain</label>
                                    <select 
                                        value={formData.domain}
                                        onChange={(e) => setFormData({...formData, domain: e.target.value as SkillDomain})}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {Object.values(SkillDomain).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Grade Level</label>
                                    <select 
                                        value={formData.grade}
                                        onChange={(e) => setFormData({...formData, grade: e.target.value as GradeLevel})}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Author</label>
                                    <input 
                                        type="text" 
                                        value={formData.author}
                                        disabled
                                        className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Scenario / Problem</label>
                                <textarea 
                                    value={formData.scenario}
                                    onChange={(e) => setFormData({...formData, scenario: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                                    placeholder="Describe the context. Why are they doing this?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Task Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                                    placeholder="What exactly do they need to do?"
                                />
                            </div>

                            {/* Resource Manager */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                                    <LinkIcon className="w-4 h-4 mr-2 text-indigo-500" /> Learning Resources
                                </h3>
                                <div className="flex space-x-2 mb-3">
                                    <input 
                                        type="text" 
                                        value={newLink}
                                        onChange={(e) => setNewLink(e.target.value)}
                                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="Paste YouTube or Doc URL..."
                                    />
                                    <button 
                                        onClick={addLink}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.tutorialLinks?.map((link, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                                            <span className="truncate flex-1 text-slate-600">{link}</span>
                                            <button 
                                                onClick={() => setFormData(prev => ({...prev, tutorialLinks: prev.tutorialLinks?.filter((_, idx) => idx !== i)}))}
                                                className="text-red-400 hover:text-red-600 ml-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.tutorialLinks || formData.tutorialLinks.length === 0) && (
                                        <p className="text-xs text-slate-400 italic">No links added yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center shadow-lg shadow-green-200"
                                >
                                    <Save className="w-5 h-5 mr-2" /> {isEditing ? 'Update Challenge' : 'Save to Library'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {assignModalOpen && selectedChallengeForAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col animate-scale-in">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Assign Challenge</h3>
                                <p className="text-sm text-slate-500">{selectedChallengeForAssign.title}</p>
                            </div>
                            <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="mb-4">
                            <input type="text" placeholder="Search students..." className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 mb-4">
                            {ROSTER_DATA.map(student => (
                                <div 
                                    key={student.id} 
                                    onClick={() => toggleStudentSelection(student.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedStudentIds.includes(student.id) ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${selectedStudentIds.includes(student.id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${selectedStudentIds.includes(student.id) ? 'text-indigo-900' : 'text-slate-700'}`}>{student.name}</p>
                                            <p className="text-xs text-slate-400">Grade {student.grade}</p>
                                        </div>
                                    </div>
                                    {selectedStudentIds.includes(student.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                            <span className="text-sm font-bold text-slate-600">{selectedStudentIds.length} students selected</span>
                            <button 
                                onClick={confirmAssignment}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-colors"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsLibrary;
