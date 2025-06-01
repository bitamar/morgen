import { createContext, useContext } from 'react';
import { Child } from '../Components/AlarmSystem.tsx';

export interface Alarm {
  type: string;
  child: Child;
}

export interface AlarmContextType {
  currentAlarm: Alarm | null;
  dismissAlarm: () => void;
  triggerAlarm: (type: string, child: Child) => void;
}

export const AlarmContext = createContext<AlarmContextType | null>(null);

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
};
