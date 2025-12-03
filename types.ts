
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export enum DifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  widaOverall?: number; // 1.0 - 6.0 Scale
  widaReading?: number; // 1.0 - 6.0 Scale
}

export interface ActivityMetric {
  email: string;
  loginCount: number;
  totalMinutes: number;
  lastLogin: string;
}

export enum SkillDomain {
  SKETCHING = 'Sketching',
  WOODWORK = 'Woodwork',
  POWER_TOOLS = 'Power Tools',
  THREE_D_PRINTING = '3D Printing',
  LASER_CUTTER = 'Laser Cutter',
  MICROBITS = 'Microbits',
  DIGITAL_DESIGN = 'Digital Design',
  TEXTILES = 'Textiles',
  ROBOTICS = 'Robotics',
  VIDEO_PRODUCTION = 'Video Production',
  SUSTAINABLE_DESIGN = 'Sustainable Design',
  PROGRAMMING = 'Programming',
  AI_LITERACY = 'AI Literacy',
  ENTREPRENEURSHIP = 'Entrepreneurship',
}

export enum GradeLevel {
  G6 = 'G6',
  G7 = 'G7',
  G8 = 'G8',
  G9 = 'G9',
  G10 = 'G10',
}

export enum ChallengeStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
}

export enum ATLSkill {
  COMMUNICATION = 'Communication',
  SOCIAL = 'Social',
  SELF_MANAGEMENT = 'Self-Management',
  RESEARCH = 'Research',
  THINKING = 'Thinking'
}

export interface RubricItem {
  criterion: string;
  points: number;
  description: string;
}

export interface Challenge {
  id: string;
  domain: SkillDomain;
  grade: GradeLevel;
  title: string;
  description: string;
  scenario: string;
  tools: string[];
  tutorialLinks: string[];
  rubric: RubricItem[];
  xpReward: number;
  author?: string; // 'System' or Teacher Name
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  assignedStudentIds?: string[]; // IDs of assigned students
}

export interface StudentProgress {
  userId: string;
  xp: number;
  level: number;
  completedChallenges: string[];
  badges: string[];
  statusMap: Record<string, ChallengeStatus>;
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  submissionId: string;
  ratings: { criterion: string; score: number; comment: string }[];
  constructiveFeedback: string;
  timestamp: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  domain: SkillDomain;
  grade: GradeLevel;
  title: string;
  studentName: string;
  content: string;
  fileUrls?: string[];
  rubric: RubricItem[];
  peerReviews?: PeerReview[];
  feedback?: string;
  aiAnalysis?: string;
  atlSkills?: ATLSkill[];
  score?: number;
}

export type TeamRole = 'Project Manager' | 'Lead Researcher' | 'Prototyper' | 'Documentation Lead' | string;

export const StandardRoles = {
  PROJECT_MANAGER: 'Project Manager',
  LEAD_RESEARCHER: 'Lead Researcher',
  PROTOTYPER: 'Prototyper',
  DOCUMENTATION_LEAD: 'Documentation Lead',
};

export interface TeamMember {
  name: string;
  role: TeamRole;
  avatarColor: string;
}

export interface CollaborativeProject {
  title: string;
  theme: string;
  scenario: string;
  objectives: string[];
  deliverables: string[];
  teamRubric: RubricItem[];
  tutorialLinks?: string[];
}

export interface TeamLog {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  avatarColor: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  project?: CollaborativeProject;
  progress: number;
  logs: TeamLog[];
  chatMessages: ChatMessage[];
}

// --- NEW AWARD SYSTEM (2025) ---
export interface AwardDefinition {
  id: string;
  title: string;
  profile: string; // IB Learner Profile
  description: string; // Teacher view
  studentDescription: string; // Student view (First person)
  iconName: 'Palette' | 'Brain' | 'Handshake' | 'Wrench' | 'Lightbulb' | 'Globe' | 'Search' | 'Sparkles' | 'RefreshCw' | 'MessageSquareQuote';
}

export const FIS_AWARDS: AwardDefinition[] = [
  {
    id: 'human-centered',
    title: 'The Human-Centered Visionary Award',
    profile: 'Caring',
    description: 'For a student who designed with empathy, focused on human-centered solutions, and considered the needs and experiences of others in their innovative ideas.',
    studentDescription: 'I design with empathy, creating solutions that consider the needs and experiences of others. I put people at the heart of my ideas.',
    iconName: 'Palette'
  },
  {
    id: 'thinker',
    title: 'The Thinker Award',
    profile: 'Thinker',
    description: 'For a student who demonstrated outstanding critical thinking, problem-solving, and iteration throughout the design cycle.',
    studentDescription: 'I approach problems critically, think deeply, and solve challenges through careful analysis and thoughtful iteration.',
    iconName: 'Brain'
  },
  {
    id: 'collaborator',
    title: 'The Collaborator Award',
    profile: 'Communicator',
    description: 'For a student who uplifted their team, shared ideas openly, supported peers, and embraced feedback.',
    studentDescription: 'I share my ideas openly, support my team, listen to others, and embrace feedback to help everyone succeed.',
    iconName: 'Handshake'
  },
  {
    id: 'solution-maker',
    title: 'The Solution Maker Award',
    profile: 'Principled',
    description: 'For designing a solution with a strong ethical foundation that meets a real need and makes a positive impact.',
    studentDescription: 'I design solutions that are ethical, responsible, and make a positive impact on the world around me.',
    iconName: 'Wrench'
  },
  {
    id: 'risk-taker',
    title: 'The Risk-Taker Award',
    profile: 'Risk-Taker',
    description: 'For a student who embraced challenge and uncertainty, tried something completely new, and learned from failures.',
    studentDescription: 'I embrace challenges, try new things, and learn from failures to grow and improve my designs.',
    iconName: 'Lightbulb'
  },
  {
    id: 'global-impact',
    title: 'The Global Impact Award',
    profile: 'Open-Minded',
    description: 'For a student whose project addressed a local or global issue thoughtfully, with empathy and cultural awareness.',
    studentDescription: 'I consider diverse perspectives, address local or global issues thoughtfully, and show empathy for different cultures and communities.',
    iconName: 'Globe'
  },
  {
    id: 'research-master',
    title: 'The Research Master Award',
    profile: 'Inquirer',
    description: 'For a student who showed outstanding inquiry and research, going above and beyond to understand their design context.',
    studentDescription: 'I seek out information, ask questions, and go beyond the basics to fully understand my design context.',
    iconName: 'Search'
  },
  {
    id: 'design-excellence',
    title: 'The Design Excellence Award',
    profile: 'Balanced',
    description: 'For excelling across all stages of the design cycle, maintaining quality, balance, and growth throughout the year.',
    studentDescription: 'I maintain quality and balance in my work, excelling across all stages of the design cycle and continually striving to improve.',
    iconName: 'Sparkles'
  },
  {
    id: 'iterative-learner',
    title: 'The Iterative Learner Award',
    profile: 'Reflective',
    description: 'For a student who demonstrated deep reflection, consistent improvement, and growth mindset across projects.',
    studentDescription: 'I reflect on my work, learn from my experiences, and consistently improve my skills and designs over time.',
    iconName: 'RefreshCw'
  },
  {
    id: 'ux-storyteller',
    title: 'The UX Storyteller Award',
    profile: 'Knowledgeable',
    description: 'For a student who communicated their design intent with clarity—through visuals, presentations, or portfolios.',
    studentDescription: 'I communicate my design ideas clearly and effectively, using visuals, presentations, and stories to make my thinking understood.',
    iconName: 'MessageSquareQuote'
  }
];

export interface Nomination {
  id: string;
  studentName: string;
  award: string; 
  justification: string;
  timestamp: string;
}

export enum IncidentType {
  POSITIVE = 'Positive Contribution',
  SAFETY = 'Safety Violation',
  DISRUPTION = 'Disruption',
  PREPAREDNESS = 'Unprepared',
  COLLABORATION = 'Team Conflict'
}

export interface BehaviorLog {
  id: string;
  studentId: string;
  timestamp: string;
  type: IncidentType;
  description: string;
  loggedBy: string;
}

export interface SupervisorMessage {
    id: string;
    sender: string; 
    text: string;
    timestamp: string;
    isTeacher: boolean;
    read: boolean;
}

export interface ChatSession {
    studentEmail: string;
    studentName: string;
    messages: SupervisorMessage[];
    lastUpdated: string;
}
