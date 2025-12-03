
import { BehaviorLog, IncidentType } from '../types';

const mockLogs: BehaviorLog[] = [
  { 
    id: '1', 
    studentId: 'Alice Johnson', 
    timestamp: new Date(Date.now() - 86400000).toISOString(), 
    type: IncidentType.POSITIVE, 
    description: 'Helped a peer troubleshoot their 3D print settings without being asked.', 
    loggedBy: 'Mr. Thompson' 
  },
  { 
    id: '2', 
    studentId: 'Bob Smith', 
    timestamp: new Date(Date.now() - 172800000).toISOString(), 
    type: IncidentType.SAFETY, 
    description: 'Left soldering iron on unattended.', 
    loggedBy: 'Ms. Chen' 
  },
  {
    id: '3',
    studentId: 'Charlie Davis',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    type: IncidentType.PREPAREDNESS,
    description: 'Forgot design journal for the third time this week.',
    loggedBy: 'Mr. Thompson'
  }
];

export const getBehaviorLogs = (studentName: string) => {
  // In a real app, this would query the backend DB
  return mockLogs.filter(log => log.studentId === studentName || studentName === 'Alice Johnson'); // Fallback for demo
};

export const logBehaviorIncident = (studentName: string, type: IncidentType, description: string, loggedBy: string): BehaviorLog => {
  const newLog: BehaviorLog = {
    id: Date.now().toString(),
    studentId: studentName,
    timestamp: new Date().toISOString(),
    type,
    description,
    loggedBy
  };
  // In a real app, send to backend
  return newLog;
};
