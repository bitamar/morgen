
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Settings, Users } from 'lucide-react';
import { AlarmProvider } from '../components/AlarmSystem';
import AlarmOverlay from '../components/AlarmOverlay';
import ChildView from '../components/ChildView';
import EditMode from '../components/EditMode';
import ChildManager from '../components/ChildManager';

// Local storage key
const STORAGE_KEY = 'morningRoutine.v1';

// Default data
const getDefaultChildren = () => [
    {
        id: 'maya',
        name: 'Maya',
        avatar: '👧',
        wakeUpTime: '07:00',
        busTime: '07:45',
        tasks: [
            { id: 'brush', title: 'Brush teeth', emoji: '🦷', done: false },
            { id: 'dress', title: 'Get dressed', emoji: '👕', done: false },
            { id: 'breakfast', title: 'Eat breakfast', emoji: '🥣', done: false },
            { id: 'backpack', title: 'Pack backpack', emoji: '🎒', done: false }
        ]
    },
    {
        id: 'alex',
        name: 'Alex',
        avatar: '👦',
        wakeUpTime: '07:15',
        busTime: '08:00',
        tasks: [
            { id: 'wash', title: 'Wash face', emoji: '🧼', done: false },
            { id: 'dress2', title: 'Get dressed', emoji: '👕', done: false },
            { id: 'breakfast2', title: 'Eat breakfast', emoji: '🥞', done: false },
            { id: 'shoes', title: 'Put on shoes', emoji: '👟', done: false }
        ]
    }
];

export default function MorningRoutine() {
    const [children, setChildren] = useState([]);
    const [currentChildIndex, setCurrentChildIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState('');
    const [editMode, setEditMode] = useState(null); // For individual child edit
    const [showChildManager, setShowChildManager] = useState(false); // For managing all children
    const [swipeDirection, setSwipeDirection] = useState(0); // 1 for next, -1 for prev

    useEffect(() => {
        loadChildren();
        updateTime();
        const timeInterval = setInterval(updateTime, 1000); // Updates time every second
        return () => clearInterval(timeInterval);
    }, []);

    const loadChildren = () => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Ensure children array exists and is an array, fallback to default if not
                const loadedChildren = Array.isArray(parsedData.children) && parsedData.children.length > 0
                    ? parsedData.children
                    : getDefaultChildren();
                setChildren(loadedChildren);
                if (!(Array.isArray(parsedData.children) && parsedData.children.length > 0)) {
                    saveChildren(loadedChildren); // Save defaults if loaded data was bad or empty
                }
            } else {
                const defaultChildren = getDefaultChildren();
                saveChildren(defaultChildren);
                setChildren(defaultChildren);
            }
        } catch (error) {
            console.error('Error loading children:', error);
            const defaultChildren = getDefaultChildren();
            setChildren(defaultChildren);
            saveChildren(defaultChildren);
        }
    };

    const saveChildren = (childrenData) => {
        try {
            const dataToSave = {
                children: childrenData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Error saving children:', error);
        }
    };

    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        setCurrentTime(timeString);
    };

    const handleChildUpdate = (updatedChild) => {
        const updatedChildren = children.map(child =>
            child.id === updatedChild.id ? updatedChild : child
        );
        setChildren(updatedChildren);
        saveChildren(updatedChildren);
    };

    const handleChildrenUpdate = (updatedChildren) => {
        setChildren(updatedChildren);
        saveChildren(updatedChildren);

        // Adjust current index if necessary
        if (currentChildIndex >= updatedChildren.length) {
            setCurrentChildIndex(Math.max(0, updatedChildren.length - 1));
        }
    };

    const nextChild = () => {
        setSwipeDirection(1);
        setCurrentChildIndex((prev) => (prev + 1) % children.length);
    };

    const prevChild = () => {
        setSwipeDirection(-1);
        setCurrentChildIndex((prev) => (prev - 1 + children.length) % children.length);
    };

    const handleUsersButtonClick = () => {
        setShowChildManager(true);
    };

    const currentChild = children[currentChildIndex];

    // Touch handling for swipe navigation
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        // Allow swipe only if no modal is open
        if (editMode || showChildManager) return;
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        if (editMode || showChildManager) return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (editMode || showChildManager) return;
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && children.length > 1) {
            nextChild();
        }
        if (isRightSwipe && children.length > 1) {
            prevChild();
        }
    };

    if (children.length === 0 || !currentChild) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🌅</div>
                    <h1 className="text-2xl font-bold text-gray-700 mb-2">Loading Morning Routine...</h1>
                    <p className="text-gray-500">Setting up your day!</p>
                </div>
            </div>
        );
    }

    return (
        <AlarmProvider childData={children}>
            <div
                className="min-h-screen relative overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Child Navigation */}
                {children.length > 1 && (
                    <div className="fixed top-4 left-0 right-0 px-4 z-40"> {/* Added px-4 for consistent padding */}
                        <div className="flex items-center justify-between max-w-md mx-auto"> {/* Centered nav for smaller screens */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prevChild}
                                className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="flex gap-2">
                                {children.map((child, index) => ( // Added child key
                                    <motion.div
                                        key={child.id || index} // Use child.id if available
                                        className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                                            index === currentChildIndex
                                                ? 'bg-blue-500 w-8'
                                                : 'bg-white/50'
                                        }`}
                                        onClick={() => setCurrentChildIndex(index)}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextChild}
                                className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Users Button (was Edit Mode Toggle) */}
                <div className="fixed bottom-4 right-4 z-40">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleUsersButtonClick}
                        className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg ring-2 ring-purple-500 cursor-pointer"
                    >
                        <Users className="w-5 h-5" />
                    </Button>
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentChild.id || currentChildIndex} // Use child.id for more stable key
                        initial={{ opacity: 0, x: swipeDirection * 300 }} // Animate based on swipe direction
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: swipeDirection * -300 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    >
                        <ChildView
                            child={currentChild}
                            onUpdateChild={handleChildUpdate}
                            onEditMode={() => setEditMode(currentChild)} // Directly pass function to open individual child edit
                            currentTime={currentTime}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Edit Mode Modal (for individual child) */}
                <AnimatePresence>
                    {editMode && (
                        <EditMode
                            child={editMode}
                            onSave={(updatedChildData) => {
                                handleChildUpdate(updatedChildData);
                                setEditMode(null); // Close modal on save
                            }}
                            onClose={() => setEditMode(null)}
                        />
                    )}
                </AnimatePresence>

                {/* Child Manager Modal (for all children) */}
                <AnimatePresence>
                    {showChildManager && (
                        <ChildManager
                            children={children}
                            onSave={(updatedChildrenData) => {
                                handleChildrenUpdate(updatedChildrenData);
                                setShowChildManager(false); // Close modal on save
                            }}
                            onClose={() => setShowChildManager(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Alarm Overlay */}
                <AlarmOverlay />
            </div>
        </AlarmProvider>
    );
}
