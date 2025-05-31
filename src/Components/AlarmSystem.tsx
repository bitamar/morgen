import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AlarmContext = createContext();

export const useAlarm = () => {
    const context = useContext(AlarmContext);
    if (!context) {
        throw new Error('useAlarm must be used within an AlarmProvider');
    }
    return context;
};

export const AlarmProvider = ({ children, childData = [] }) => {
    const [currentAlarm, setCurrentAlarm] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [alarmAudio, setAlarmAudio] = useState(null);

    const initAudio = useCallback(() => {
        if (audioContext) return; // Initialize only once

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioContext(ctx);

            const audio = new Audio();
            // Using a more distinct alarm sound (simple tone sequence)
            audio.src = 'data:audio/wav;base64,UklGRlRaAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU5aAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxO0FARUdJTE5QU1VXX2RlZ2lrbG9wcXN0dnZ4eHl6e3x9fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn2Ag'; // Placeholder, replace with actual sound file path logic
            audio.loop = true;
            audio.volume = 0.8; // Set a default volume
            setAlarmAudio(audio);
            console.log("Alarm audio initialized");
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    }, [audioContext]);

    useEffect(() => {
        // Add event listeners to initialize audio on user interaction
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });

        return () => {
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
    }, [initAudio]);

    const checkAlarms = useCallback(() => {
        if (!audioContext || !alarmAudio || !childData || childData.length === 0) {
            // console.log("Alarm check skipped: audio not ready or no child data.");
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
                // console.log(`Wake-up alarm condition met for ${child.name} at ${currentTime}`);
                break;
            }

            // Check bus warning (5 min before busTime)
            const [busHours, busMinutes] = child.busTime.split(':').map(Number);
            if (!isNaN(busHours) && !isNaN(busMinutes)) {
                const busTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), busHours, busMinutes);
                const warningTime = new Date(busTimeDate.getTime() - 5 * 60 * 1000);
                const warningTimeStr = `${warningTime.getHours().toString().padStart(2, '0')}:${warningTime.getMinutes().toString().padStart(2, '0')}`;
                if (warningTimeStr === currentTime) {
                    alarmToPlay = { type: 'warning', child };
                    // console.log(`Bus warning alarm condition met for ${child.name} at ${currentTime} (bus at ${child.busTime})`);
                    break;
                }
            }

            // Check bus departure alarm
            const incompleteTasks = child.tasks?.filter(task => !task.done)?.length || 0;
            if (child.busTime === currentTime && incompleteTasks > 0) {
                alarmToPlay = { type: 'departure', child };
                // console.log(`Bus departure alarm condition met for ${child.name} at ${currentTime}`);
                break;
            }
        }

        if (alarmToPlay) {
            if (!currentAlarm || currentAlarm.type !== alarmToPlay.type || currentAlarm.child.id !== alarmToPlay.child.id) {
                // console.log("Triggering alarm:", alarmToPlay);
                triggerAlarm(alarmToPlay.type, alarmToPlay.child);
            }
        } else if (currentAlarm && (currentAlarm.type === 'wakeup' || currentAlarm.type === 'warning')) {
            // If no new alarm should play and a non-departure alarm is active, check if its condition passed
            const activeAlarmChild = childData.find(c => c.id === currentAlarm.child.id);
            if (activeAlarmChild) {
                let conditionPassed = false;
                if (currentAlarm.type === 'wakeup' && activeAlarmChild.wakeUpTime !== currentTime) {
                    conditionPassed = true;
                } else if (currentAlarm.type === 'warning') {
                    const [busHours, busMinutes] = activeAlarmChild.busTime.split(':').map(Number);
                    if (!isNaN(busHours) && !isNaN(busMinutes)) {
                        const busTimeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), busHours, busMinutes);
                        const warningTime = new Date(busTimeDate.getTime() - 5 * 60 * 1000);
                        const warningTimeStr = `${warningTime.getHours().toString().padStart(2, '0')}:${warningTime.getMinutes().toString().padStart(2, '0')}`;
                        if (warningTimeStr !== currentTime) conditionPassed = true;
                    }
                }
                // Departure alarms are dismissed manually or by completing tasks.
                // if (conditionPassed) dismissAlarm(); // Auto-dismiss non-departure alarms if their time passed - maybe not desired.
            }
        }
    }, [audioContext, alarmAudio, childData, currentAlarm]);


    const triggerAlarm = (type, child) => {
        // console.log(`Attempting to trigger alarm: ${type} for ${child.name}`);
        setCurrentAlarm({ type, child });
        if (alarmAudio && audioContext && audioContext.state === 'running') {
            alarmAudio.currentTime = 0; // Reset audio to start
            alarmAudio.play().catch(error => console.error("Error playing alarm audio:", error));
            // console.log("Alarm audio playing.");
        } else if (audioContext && audioContext.state !== 'running') {
            // console.warn("AudioContext not running. User interaction might be needed to resume it.");
            // Attempt to resume, though this might not work outside a direct user gesture
            audioContext.resume().then(() => {
                if(alarmAudio) {
                    alarmAudio.currentTime = 0;
                    alarmAudio.play().catch(error => console.error("Error playing alarm audio after resume:", error));
                    // console.log("Alarm audio playing after resume.");
                }
            }).catch(e => console.error("Error resuming AudioContext:", e));
        } else if (!alarmAudio) {
            // console.warn("Alarm audio object not ready.");
        }
    };

    const dismissAlarm = () => {
        // console.log("Dismissing alarm");
        setCurrentAlarm(null);
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }
    };

    useEffect(() => {
        // Initial check for alarms when component mounts or childData changes
        checkAlarms();
        const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds for better responsiveness
        return () => clearInterval(interval);
    }, [checkAlarms]); // checkAlarms is memoized with useCallback

    return (
        <AlarmContext.Provider value={{
            currentAlarm,
            dismissAlarm,
            triggerAlarm // Exposing triggerAlarm might be useful for testing or manual triggers
        }}>
            {children}
        </AlarmContext.Provider>
    );
};