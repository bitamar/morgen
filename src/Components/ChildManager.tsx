
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    X, Plus, Trash2, Edit3, Save, Users,
    Clock, AlarmClock, Bus
} from 'lucide-react';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦄', '🌟', '🚀', '🎨'];

export default function ChildManager({ children, onSave, onClose }) {
    // Ensure deep copy for local edits and add temporary input fields
    const [editedChildren, setEditedChildren] = useState(
        children.map(c => ({
            ...c,
            tempNewTaskTitle: '',
            tempNewTaskEmoji: '✅'
        }))
    );
    // Select first child by default
    const [editingChildId, setEditingChildId] = useState(children.length > 0 ? children[0].id : null);
    const [newChildName, setNewChildName] = useState('');

    const addNewChild = () => {
        if (!newChildName.trim()) return;

        const newChild = {
            id: `child-${Date.now()}`,
            name: newChildName.trim(),
            avatar: '👦',
            wakeUpTime: '07:00',
            busTime: '08:00',
            tasks: [],
            tempNewTaskTitle: '', // Initialize temp fields for new child
            tempNewTaskEmoji: '✅'
        };

        setEditedChildren(prev => [...prev, newChild]);
        setNewChildName('');
        setEditingChildId(newChild.id); // Select the newly added child for editing
    };

    const removeChild = (childId) => {
        setEditedChildren(prev => prev.filter(child => child.id !== childId));
        if (editingChildId === childId) {
            // If the removed child was being edited, clear the editor or select another
            setEditingChildId(null);
        }
    };

    // Function to update a top-level property of a child
    const updateChildProperty = (childId, property, value) => {
        setEditedChildren(prev => prev.map(child =>
            child.id === childId ? { ...child, [property]: value } : child
        ));
    };

    // Function to update a property of a specific task for a child
    const updateChildTaskProperty = (childId, taskId, property, value) => {
        setEditedChildren(prev => prev.map(child => {
            if (child.id === childId) {
                return {
                    ...child,
                    tasks: child.tasks.map(task =>
                        task.id === taskId ? { ...task, [property]: value } : task
                    )
                };
            }
            return child;
        }));
    };

    // Function to add a new task for a specific child
    const addChildTask = (childId, preset = null) => {
        const currentChild = editedChildren.find(c => c.id === childId);
        if (!currentChild) return;

        const title = preset?.title || currentChild.tempNewTaskTitle?.trim();
        const emoji = preset?.emoji || currentChild.tempNewTaskEmoji;

        if (!title) return;

        const newTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // More unique ID
            title,
            emoji,
            done: false
        };

        updateChildProperty(childId, 'tasks', [...(currentChild.tasks || []), newTask]);
        // Clear temporary input fields for that child after adding
        updateChildProperty(childId, 'tempNewTaskTitle', '');
        updateChildProperty(childId, 'tempNewTaskEmoji', '✅');
    };

    // Function to remove a task from a specific child
    const removeChildTask = (childId, taskId) => {
        const currentChild = editedChildren.find(c => c.id === childId);
        if (!currentChild) return;
        updateChildProperty(childId, 'tasks', currentChild.tasks.filter(task => task.id !== taskId));
    };

    const handleSave = () => {
        // Trim temp fields before saving
        const childrenToSave = editedChildren.map(child => {
            const { tempNewTaskTitle, tempNewTaskEmoji, ...rest } = child;
            return rest;
        });
        onSave(childrenToSave); // onSave now expects to handle closing the modal in the parent component
    };

    const editingChildData = editedChildren.find(child => child.id === editingChildId);

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
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col" // Use flex-col for structure
            >
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Manage Children</h2>
                                <p className="text-purple-100 text-xs sm:text-sm">Add, remove, and edit routines</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-0 flex-1 overflow-hidden"> {/* Adjusted grid for 1/3 and 2/3 approx */}
                    {/* Children List Column */}
                    <div className="md:col-span-1 border-r border-gray-200 p-3 sm:p-4 overflow-y-auto">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold mb-2">Children ({editedChildren.length})</h3>

                            {/* Add New Child */}
                            <Card className="border-dashed border-gray-300">
                                <CardContent className="p-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="New child's name..."
                                            value={newChildName}
                                            onChange={(e) => setNewChildName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addNewChild()}
                                            className="flex-1 text-sm"
                                        />
                                        <Button onClick={addNewChild} disabled={!newChildName.trim()} size="sm" className="p-2">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Children List */}
                            <div className="space-y-3">
                                {editedChildren.map((child) => (
                                    <motion.div
                                        key={child.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card
                                            className={`cursor-pointer transition-all p-3 ${ // Reduced padding
                                                editingChildId === child.id
                                                    ? 'ring-2 ring-purple-500 bg-purple-50'
                                                    : 'hover:shadow-md'
                                            }`}
                                            onClick={() => setEditingChildId(child.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg">
                                                        {child.avatar}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">{child.name}</h4>
                                                        <Badge variant="outline" className="text-xs mt-0.5">
                                                            {child.tasks?.length || 0} tasks
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeChild(child.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7" // Smaller delete button
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}

                                {editedChildren.length === 0 && (
                                    <div className="text-center py-6 text-gray-500 text-sm">
                                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        <p>No children yet. Add one above!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Child Editor Column */}
                    <div className="md:col-span-2 p-3 sm:p-4 overflow-y-auto bg-gray-50">
                        {editingChildData ? (
                            <ChildEditor
                                key={editingChildData.id} // Add key to force re-render on child change
                                child={editingChildData}
                                onUpdate={(property, value) => updateChildProperty(editingChildData.id, property, value)}
                                onUpdateTask={(taskId, property, value) => updateChildTaskProperty(editingChildData.id, taskId, property, value)}
                                onAddTask={(preset) => addChildTask(editingChildData.id, preset)}
                                onRemoveTask={(taskId) => removeChildTask(editingChildData.id, taskId)}
                            />
                        ) : (
                            <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center h-full">
                                <Edit3 className="w-12 h-12 mb-3 text-gray-300" />
                                <h3 className="font-semibold mb-1 text-base">Select a child to edit</h3>
                                <p className="text-xs">Click on a child from the list to edit their details and tasks.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="text-sm sm:text-base">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
                        <Save className="w-4 h-4 mr-2" />
                        Save All Changes
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ChildEditor component, adapted for use within ChildManager
function ChildEditor({ child, onUpdate, onUpdateTask, onAddTask, onRemoveTask }) {

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
    const AVATAR_OPTIONS_EDITOR = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦄', '🌟', '🚀', '🎨'];


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <span className="text-xl sm:text-2xl">{child.avatar}</span>
                        Editing: {child.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-3 sm:p-4">
                    <div>
                        <Label htmlFor={`name-${child.id}`} className="text-xs">Name</Label>
                        <Input
                            id={`name-${child.id}`}
                            value={child.name}
                            onChange={(e) => onUpdate('name', e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <div>
                        <Label className="text-xs">Avatar</Label>
                        <div className="grid grid-cols-5 gap-1 mt-1">
                            {AVATAR_OPTIONS_EDITOR.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onUpdate('avatar', emoji)}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md border-2 text-lg sm:text-xl flex items-center justify-center transition-all ${
                                        child.avatar === emoji ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor={`wakeup-${child.id}`} className="text-xs">Wake-up</Label>
                            <Input
                                id={`wakeup-${child.id}`}
                                type="time"
                                value={child.wakeUpTime}
                                onChange={(e) => onUpdate('wakeUpTime', e.target.value)}
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`bus-${child.id}`} className="text-xs">Bus Time</Label>
                            <Input
                                id={`bus-${child.id}`}
                                type="time"
                                value={child.busTime}
                                onChange={(e) => onUpdate('busTime', e.target.value)}
                                className="text-xs"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="text-base sm:text-lg">Tasks ({child.tasks?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 sm:p-4">
                    {/* Quick Add Tasks */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {TASK_PRESETS.map((preset) => (
                            <motion.button
                                key={preset.title}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onAddTask(preset)}
                                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                            >
                                <span className="text-lg sm:text-xl">{preset.emoji}</span>
                                <span className="text-xs sm:text-sm font-medium">{preset.title}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Add Custom Task */}
                    <div className="space-y-2 p-2 border border-dashed rounded-md">
                        <Label className="text-xs">Add Custom Task</Label>
                        <div className="grid grid-cols-4 gap-1 items-center">
                            <Input
                                value={child.tempNewTaskEmoji || '✅'}
                                onChange={(e) => onUpdate('tempNewTaskEmoji', e.target.value)}
                                className="w-10 text-center text-xs"
                                maxLength={2}
                            />
                            <Input
                                value={child.tempNewTaskTitle || ''}
                                onChange={(e) => onUpdate('tempNewTaskTitle', e.target.value)}
                                placeholder="Task title"
                                className="col-span-2 text-xs"
                                onKeyPress={(e) => e.key === 'Enter' && onAddTask()}
                            />
                            <Button onClick={() => onAddTask()} size="sm" className="p-1.5">
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable task list */}
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 mt-3">
                        {child.tasks?.map((task) => (
                            <div key={task.id} className="flex items-center gap-1 p-1.5 bg-white rounded border">
                                <Input
                                    value={task.emoji}
                                    onChange={(e) => onUpdateTask(task.id, 'emoji', e.target.value)}
                                    className="w-10 text-center text-xs"
                                    maxLength={2}
                                />
                                <Input
                                    value={task.title}
                                    onChange={(e) => onUpdateTask(task.id, 'title', e.target.value)}
                                    className="flex-1 text-xs"
                                />
                                <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} className="text-red-500 w-6 h-6">
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}

                        {(!child.tasks || child.tasks.length === 0) && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <div className="text-4xl mb-2">📝</div>
                                <p>No tasks yet. Add some tasks above!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
