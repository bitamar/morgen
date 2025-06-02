import React, { useEffect, useState, useCallback } from 'react';
import { AlarmContext, Alarm } from '../context/alarm';
import { soundService } from '../services/SoundService';

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface Child {
  id: string;
  name: string;
  wakeUpTime?: string;
  busTime?: string;
  tasks?: Task[];
}

interface AlarmProviderProps {
  children: React.ReactNode;
  childData?: Child[];
}

export const AlarmProvider = ({ children, childData = [] }: AlarmProviderProps) => {
  const [currentAlarm, setCurrentAlarm] = useState<Alarm | null>(null);

  const triggerAlarm = useCallback(async (type: string, child: Child) => {
    setCurrentAlarm({ type, child });
    try {
      await soundService.playAlarm(true);
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  }, []);

  const checkAlarms = useCallback(() => {
    if (!childData || childData.length === 0) {
      return;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let alarmToPlay = null;

    for (const child of childData) {
      if (!child || !child.wakeUpTime || !child.busTime) continue; // Skip if child data is incomplete

      // Check wake-up alarm
      if (child.wakeUpTime === currentTime) {
        alarmToPlay = { type: 'wakeup', child };
        break;
      }

      // Check bus warning (5 min before busTime)
      const [busHours, busMinutes] = child.busTime.split(':').map(Number);
      if (!isNaN(busHours) && !isNaN(busMinutes)) {
        const busTimeDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          busHours,
          busMinutes
        );
        const warningTime = new Date(busTimeDate.getTime() - 5 * 60 * 1000);
        const warningTimeStr = `${warningTime.getHours().toString().padStart(2, '0')}:${warningTime.getMinutes().toString().padStart(2, '0')}`;
        if (warningTimeStr === currentTime) {
          alarmToPlay = { type: 'warning', child };
          break;
        }
      }

      // Check bus departure alarm
      const incompleteTasks = child.tasks?.filter(task => !task.done)?.length || 0;
      if (child.busTime === currentTime && incompleteTasks > 0) {
        alarmToPlay = { type: 'departure', child };
        break;
      }
    }

    if (alarmToPlay) {
      if (
        !currentAlarm ||
        currentAlarm.type !== alarmToPlay.type ||
        currentAlarm.child.id !== alarmToPlay.child.id
      ) {
        triggerAlarm(alarmToPlay.type, alarmToPlay.child);
      }
    }
  }, [childData, currentAlarm, triggerAlarm]);

  const dismissAlarm = () => {
    soundService.stopAlarm();
    setCurrentAlarm(null);
  };

  useEffect(() => {
    // Initial check for alarms when component mounts or childData changes
    checkAlarms();
    const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds for better responsiveness
    return () => {
      clearInterval(interval);
      // Clean up any playing alarm when component unmounts
      soundService.stopAlarm();
    };
  }, [checkAlarms]);

  return (
    <AlarmContext.Provider
      value={{
        currentAlarm,
        dismissAlarm,
        triggerAlarm,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};
