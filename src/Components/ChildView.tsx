import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Text, Badge } from '@radix-ui/themes';
import { Clock, Settings, CheckCircle2, Target } from 'lucide-react';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  emoji: string;
  done: boolean;
}

interface Child {
  id: string;
  name: string;
  avatar: string;
  wakeUpTime: string;
  busTime: string;
  tasks: Task[];
}

interface ChildViewProps {
  child: Child;
  onUpdateChild: (child: Child) => void;
  onEditMode: () => void;
}

export default function ChildView({ child, onUpdateChild, onEditMode }: ChildViewProps) {
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [busCountdown, setBusCountdown] = useState('');
  const [pageCurrentTime, setPageCurrentTime] = useState(new Date());

  useEffect(() => {
    const tick = () => setPageCurrentTime(new Date());
    tick(); // fire once immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const completed = child.tasks?.filter(t => t.done).length ?? 0;
    const total = child.tasks?.length ?? 0;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (total > 0 && completed === total) {
      setShowCompletionCelebration(true);
      timeoutId = setTimeout(() => setShowCompletionCelebration(false), 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [child.tasks]);

  useEffect(() => {
    if (!child.busTime) {
      setBusCountdown('');
      return;
    }

    const [h, m] = child.busTime.split(':').map(Number);
    const busTimeToday = new Date(pageCurrentTime);
    busTimeToday.setHours(h, m, 0, 0);

    const diff = busTimeToday.getTime() - pageCurrentTime.getTime();

    if (diff <= -30 * 60_000) setBusCountdown('Bus has left');
    else if (diff <= 0) setBusCountdown('Bus time!');
    else {
      const totalSeconds = Math.floor(diff / 1_000);
      const s = totalSeconds % 60;
      const mm = Math.floor(totalSeconds / 60) % 60;
      const hh = Math.floor(totalSeconds / 3_600);

      if (hh > 0) setBusCountdown(`Bus in ${hh}h ${mm}m`);
      else if (mm > 0) setBusCountdown(`Bus in ${mm}m ${s}s`);
      else setBusCountdown(`Bus in ${s}s`);
    }
  }, [child.busTime, pageCurrentTime]);

  // --- task toggle handler ---------------------------------------------------
  const handleTaskToggle = (taskId: string) => {
    const updatedTasks =
      child.tasks?.map(t => (t.id === taskId ? { ...t, done: !t.done } : t)) ?? [];
    onUpdateChild({ ...child, tasks: updatedTasks });
  };

  // --- progress & formatted clock -------------------------------------------
  const completedTasks = child.tasks?.filter(t => t.done).length ?? 0;
  const totalTasks = child.tasks?.length ?? 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const displayTime = pageCurrentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                  >
                    {child.avatar || child.name?.[0]?.toUpperCase() || '?'}
                  </motion.div>
                  <div>
                    <Text size="6" weight="bold" className="text-gray-800">
                      {child.name || 'Kiddo'}'s Morning! 🌅
                    </Text>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {displayTime}
                      </Badge>
                      {child.busTime && (
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 ${
                            busCountdown.includes('Bus time!') ||
                            busCountdown.includes('Bus has left')
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : ''
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
                  variant="ghost"
                  onClick={onEditMode}
                  className="text-gray-600 hover:text-gray-800"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Bar */}
              {totalTasks > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Text size="2" className="text-gray-600">
                      Progress: {completedTasks}/{totalTasks} tasks
                    </Text>
                    <Text size="2" weight="bold" className="text-blue-600">
                      {Math.round(progressPercentage)}%
                    </Text>
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
            </div>
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
                <TaskCard task={task} onToggle={handleTaskToggle} />
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
              <Text size="5" weight="bold" className="text-gray-600 mb-2">
                No tasks yet!
              </Text>
              <Text size="2" className="text-gray-500">
                Tap the <Settings className="inline w-4 h-4" /> icon to add some morning tasks.
              </Text>
              <Button onClick={onEditMode} className="mt-4">
                Add Tasks
              </Button>
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
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4"
              >
                <div className="text-8xl mb-4">🎉</div>
                <Text size="6" weight="bold" className="text-green-600 mb-2">
                  All Done, {child.name}!
                </Text>
                <Text size="3" className="text-gray-600">
                  Fantastic work! You're ready for an amazing day! 🚌
                </Text>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
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
