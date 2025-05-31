
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Settings, CheckCircle2, Target } from 'lucide-react';
import TaskCard from './TaskCard';

export default function ChildView({
                                      child,
                                      onUpdateChild,
                                      onEditMode,
                                  }) {
    const [completedCount, setCompletedCount] = useState(0);
    const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
    const [busCountdown, setBusCountdown] = useState('');
    const [pageCurrentTime, setPageCurrentTime] = useState(new Date());

    // Effect to update current time every second
    useEffect(() => {
        const timerId = setInterval(() => {
            setPageCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    // Effect to check for task completion celebration
    useEffect(() => {
        const completed = child.tasks?.filter(task => task.done).length || 0;
        const total = child.tasks?.length || 0;

        // Trigger celebration only if all tasks are done and it's a new completion
        if (total > 0 && completed === total && completed > completedCount) {
            setShowCompletionCelebration(true);
            setTimeout(() => setShowCompletionCelebration(false), 3000);
        }

        setCompletedCount(completed);
    }, [child.tasks, completedCount]);

    // Effect to calculate bus countdown
    useEffect(() => {
        if (!child.busTime) {
            setBusCountdown('');
            return;
        }

        const [hours, minutes] = child.busTime.split(':').map(Number);
        const busTimeToday = new Date(pageCurrentTime); // Use pageCurrentTime for consistency
        busTimeToday.setHours(hours, minutes, 0, 0);

        const diff = busTimeToday.getTime() - pageCurrentTime.getTime();

        // Check if bus time is more than 30 minutes in the past
        if (diff <= -30 * 60 * 1000) {
            setBusCountdown("Bus has left");
        } else if (diff <= 0) { // Check if bus time is current or just past (within 30 mins)
            setBusCountdown("Bus time!");
        } else {
            const totalSeconds = Math.floor(diff / 1000);
            const s = totalSeconds % 60;
            const m = Math.floor(totalSeconds / 60) % 60;
            const h = Math.floor(totalSeconds / 3600);

            if (h > 0) {
                setBusCountdown(`Bus in ${h}h ${m}m`);
            } else if (m > 0) {
                setBusCountdown(`Bus in ${m}m ${s}s`);
            } else {
                setBusCountdown(`Bus in ${s}s`);
            }
        }
    }, [child.busTime, pageCurrentTime]);


    const handleTaskToggle = (taskId) => {
        const updatedTasks = child.tasks?.map(task =>
            task.id === taskId ? { ...task, done: !task.done } : task
        ) || [];

        onUpdateChild({ ...child, tasks: updatedTasks });
    };

    const completedTasks = child.tasks?.filter(task => task.done).length || 0;
    const totalTasks = child.tasks?.length || 0;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Format the internal pageCurrentTime for display
    const displayTime = pageCurrentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-20"> {/* Added pt-20 for top nav */}
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                                    >
                                        {child.avatar || child.name?.[0]?.toUpperCase() || '?'}
                                    </motion.div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">
                                            {child.name || 'Kiddo'}'s Morning! 🌅
                                        </h1>
                                        <div className="flex items-center gap-2 flex-wrap mt-2">
                                            <Badge variant="outline" className="flex items-center gap-1 text-sm">
                                                <Clock className="w-3 h-3" />
                                                {displayTime}
                                            </Badge>
                                            {child.busTime && (
                                                <Badge
                                                    variant="outline"
                                                    className={`flex items-center gap-1 text-sm ${
                                                        // Apply red styling if bus time is now or in the past
                                                        busCountdown.includes("Bus time!") || busCountdown.includes("Bus has left") ? "bg-red-100 text-red-700 border-red-300" : ""
                                                    }`}
                                                >
                                                    <Target className="w-3 h-3" />
                                                    {busCountdown}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={onEditMode}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Progress Bar */}
                            {totalTasks > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Progress: {completedTasks}/{totalTasks} tasks
                    </span>
                                        <span className="text-sm font-bold text-blue-600">
                      {Math.round(progressPercentage)}%
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercentage}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Task List */}
                <div className="space-y-4 pb-16">
                    <AnimatePresence>
                        {child.tasks?.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <TaskCard
                                    task={task}
                                    onToggle={handleTaskToggle}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {(!child.tasks || child.tasks.length === 0) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                No tasks yet!
                            </h3>
                            <p className="text-gray-500">
                                Tap the <Settings className="inline w-4 h-4" /> icon to add some morning tasks.
                            </p>
                            <Button onClick={onEditMode} className="mt-4">Add Tasks</Button>
                        </motion.div>
                    )}
                </div>

                {/* Completion Celebration */}
                <AnimatePresence>
                    {showCompletionCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                            onClick={() => setShowCompletionCelebration(false)}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 3, -3, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
                            >
                                <div className="text-8xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold text-green-600 mb-2">
                                    All Done, {child.name}!
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Fantastic work! You're ready for an amazing day! 🚌
                                </p>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="flex justify-center mt-6"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
