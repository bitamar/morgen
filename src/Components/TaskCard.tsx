import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Text, Flex, Box } from '@radix-ui/themes';
import { Check, Star } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    emoji: string;
    done: boolean;
}

interface TaskCardProps {
    task: Task;
    onToggle: (id: string) => void;
    disabled?: boolean;
}

const celebrationSounds = [
    '🎉', '✨', '🌟', '🎊', '💫', '🎈'
];

const celebrationAnimations = [
    'confetti', 'bounce', 'sparkle', 'flip', 'glow', 'pulse'
];

export default function TaskCard({ task, onToggle, disabled = false }: TaskCardProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [celebrationEmoji, setCelebrationEmoji] = useState('');

    const handleToggle = () => {
        if (disabled) return;

        if (!task.done) {
            // Trigger celebration
            const randomEmoji = celebrationSounds[Math.floor(Math.random() * celebrationSounds.length)];
            setCelebrationEmoji(randomEmoji);
            setIsAnimating(true);

            // Play a simple beep sound
            const AudioContext = (window.AudioContext || (window as any).webkitAudioContext) as typeof window.AudioContext;
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            setTimeout(() => {
                setIsAnimating(false);
                setCelebrationEmoji('');
            }, 1000);
        }

        onToggle(task.id);
    };

    return (
        <div className="relative">
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                className="relative"
            >
                <Card
                    className={`
                        cursor-pointer transition-all duration-300 border-2 min-h-[120px] relative overflow-hidden
                        ${task.done
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-lg'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:shadow-md'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={handleToggle}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>

                    <Flex p="6" align="center" justify="between" className="relative z-10">
                        <Flex gap="4" align="center">
                            {task.emoji && (
                                <Text size="6" className="text-4xl">
                                    {task.emoji}
                                </Text>
                            )}
                            <Box>
                                <Text size="5" weight="bold" className={`transition-all duration-300 ${
                                    task.done ? 'text-green-800 line-through' : 'text-gray-800'
                                }`}>
                                    {task.title}
                                </Text>
                                {task.done && (
                                    <Text size="2" color="green" className="mt-1">
                                        Great job! ✨
                                    </Text>
                                )}
                            </Box>
                        </Flex>

                        <motion.div
                            animate={{
                                scale: task.done ? 1.2 : 1,
                                rotate: task.done ? 360 : 0
                            }}
                            transition={{ duration: 0.5 }}
                            className={`
                                w-12 h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300
                                ${task.done
                                    ? 'bg-green-500 border-green-600 text-white'
                                    : 'bg-white border-blue-300 text-blue-500'
                                }
                            `}
                        >
                            {task.done ? (
                                <Check className="w-6 h-6" data-testid="check-icon" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-current" data-testid="empty-circle" />
                            )}
                        </motion.div>
                    </Flex>
                </Card>
            </motion.div>

            {/* Celebration Overlay */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                        <motion.div
                            animate={{
                                y: [0, -30, 0],
                                rotate: [0, 360],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{ duration: 0.8 }}
                            className="text-6xl"
                        >
                            {celebrationEmoji}
                        </motion.div>

                        {/* Confetti Effect */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0.5],
                                    x: [(Math.random() - 0.5) * 200],
                                    y: [(Math.random() - 0.5) * 200]
                                }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="absolute text-2xl"
                            >
                                ⭐
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}