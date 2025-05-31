
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    X, Plus, Trash2, GripVertical, Save, Clock,
    User, Smile, Heart, Star, Sun, Moon
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦄', '🌟', '🚀', '🎨'];

const TASK_PRESETS = [
    { title: 'Brush teeth', emoji: '🦷' },
    { title: 'Get dressed', emoji: '👕' },
    { title: 'Eat breakfast', emoji: '🥣' },
    { title: 'Pack backpack', emoji: '🎒' },
    { title: 'Put on shoes', emoji: '👟' },
    { title: 'Wash face', emoji: '🧼' },
    { title: 'Comb hair', emoji: '💇' },
    { title: 'Make bed', emoji: '🛏️' },
];

export default function EditMode({ child, onSave, onClose }) {
    const [editedChild, setEditedChild] = useState({
        id: child.id, // Ensure ID is preserved
        name: child.name || '',
        avatar: child.avatar || '👦',
        wakeUpTime: child.wakeUpTime || '07:00',
        busTime: child.busTime || '08:00',
        tasks: child.tasks || []
    });

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskEmoji, setNewTaskEmoji] = useState('✅');

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(editedChild.tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEditedChild(prev => ({ ...prev, tasks: items }));
    };

    const addTask = (preset = null) => {
        const title = preset?.title || newTaskTitle.trim();
        const emoji = preset?.emoji || newTaskEmoji;

        if (!title) return;

        const newTask = {
            id: `task-${Date.now()}`,
            title,
            emoji,
            done: false
        };

        setEditedChild(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask]
        }));

        if (!preset) {
            setNewTaskTitle('');
            setNewTaskEmoji('✅');
        }
    };

    const removeTask = (taskId) => {
        setEditedChild(prev => ({
            ...prev,
            tasks: prev.tasks.filter(task => task.id !== taskId)
        }));
    };

    const updateTask = (taskId, field, value) => {
        setEditedChild(prev => ({
            ...prev,
            tasks: prev.tasks.map(task =>
                task.id === taskId ? { ...task, [field]: value } : task
            )
        }));
    };

    const handleSave = () => {
        onSave(editedChild); // onSave now closes modal in parent
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            >
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl sm:text-2xl font-bold">Edit {editedChild.name || 'Child'}'s Routine</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                        {/* Child Settings */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <User className="w-5 h-5" />
                                        Child Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editedChild.name}
                                            onChange={(e) => setEditedChild(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter child's name"
                                            className="text-base sm:text-lg"
                                        />
                                    </div>

                                    <div>
                                        <Label>Avatar</Label>
                                        <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-2">
                                            {AVATAR_OPTIONS.map((emoji) => (
                                                <motion.button
                                                    key={emoji}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setEditedChild(prev => ({ ...prev, avatar: emoji }))}
                                                    className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 text-xl sm:text-2xl flex items-center justify-center transition-all
                            ${editedChild.avatar === emoji
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }
                          `}
                                                >
                                                    {emoji}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                        <div>
                                            <Label htmlFor="wakeup">Wake-up Time</Label>
                                            <Input
                                                id="wakeup"
                                                type="time"
                                                value={editedChild.wakeUpTime}
                                                onChange={(e) => setEditedChild(prev => ({ ...prev, wakeUpTime: e.target.value }))}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bus">Bus Time</Label>
                                            <Input
                                                id="bus"
                                                type="time"
                                                value={editedChild.busTime}
                                                onChange={(e) => setEditedChild(prev => ({ ...prev, busTime: e.target.value }))}
                                                className="text-sm sm:text-base"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Add Presets */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base sm:text-lg">Quick Add Tasks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {TASK_PRESETS.map((preset) => (
                                            <motion.button
                                                key={preset.title}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => addTask(preset)}
                                                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                                            >
                                                <span className="text-lg sm:text-xl">{preset.emoji}</span>
                                                <span className="text-xs sm:text-sm font-medium">{preset.title}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tasks */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <Star className="w-5 h-5" />
                                        Morning Tasks ({editedChild.tasks.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add New Task */}
                                    <div className="space-y-3 p-3 sm:p-4 border border-dashed border-gray-300 rounded-lg">
                                        <div className="grid grid-cols-4 gap-1 sm:gap-2 items-center">
                                            <Input
                                                value={newTaskEmoji}
                                                onChange={(e) => setNewTaskEmoji(e.target.value)}
                                                placeholder="📝"
                                                className="text-center text-sm sm:text-base"
                                                maxLength={2}
                                            />
                                            <Input
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                placeholder="New task..."
                                                className="col-span-2 text-sm sm:text-base"
                                                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                            />
                                            <Button onClick={() => addTask()} size="sm" className="p-2 sm:p-2.5">
                                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Task List */}
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="tasks">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                                                    {editedChild.tasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
