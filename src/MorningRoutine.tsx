import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@radix-ui/themes';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { AlarmProvider } from './Components/AlarmSystem';
import AlarmOverlay from './Components/AlarmOverlay';
import ChildView from './Components/ChildView';
import EditMode from './Components/EditMode';
import ChildManager from './Components/ChildManager';
import { type Child, loadChildren, saveChildren } from './services/peopleStorage.ts';

export default function MorningRoutine() {
  const [children, setChildren] = useState<Child[]>(() => loadChildren());
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [editMode, setEditMode] = useState<Child | null>(null); // modal – single child
  const [showChildManager, setShowChildManager] = useState(false); // modal – all children
  const [swipeDirection, setSwipeDirection] = useState(0); // 1 → next, -1 → prev

  const handleChildUpdate = (updated: Child) => {
    setChildren(prev => {
      const next = prev.map(c => (c.id === updated.id ? updated : c));
      saveChildren(next);
      return next;
    });
  };

  const handleChildrenUpdate = (next: Child[]) => {
    setChildren(next);
    saveChildren(next);
    if (currentChildIndex >= next.length) {
      setCurrentChildIndex(Math.max(0, next.length - 1));
    }
  };

  const nextChild = () => {
    setSwipeDirection(1);
    setCurrentChildIndex(i => (i + 1) % children.length);
  };

  const prevChild = () => {
    setSwipeDirection(-1);
    setCurrentChildIndex(i => (i - 1 + children.length) % children.length);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (editMode || showChildManager) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (editMode || showChildManager) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (editMode || showChildManager || touchStart == null || touchEnd == null) return;
    const dist = touchStart - touchEnd;
    if (dist > minSwipeDistance && children.length > 1) nextChild();
    if (dist < -minSwipeDistance && children.length > 1) prevChild();
  };

  const currentChild = children[currentChildIndex];
  if (!currentChild) {
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
        {/* -------- child navigation dots & arrows -------- */}
        {children.length > 1 && (
          <div className="fixed top-4 left-0 right-0 px-4 z-40">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <Button
                variant="outline"
                size="2"
                onClick={prevChild}
                className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
                aria-label="Previous child"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex gap-2">
                {children.map((child, idx) => (
                  <motion.div
                    key={child.id || idx}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                      idx === currentChildIndex ? 'bg-blue-500 w-8' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentChildIndex(idx)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="2"
                onClick={nextChild}
                className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg"
                aria-label="Next child"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* -------- user / manager button -------- */}
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            variant="outline"
            size="2"
            onClick={() => setShowChildManager(true)}
            className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg ring-2 ring-purple-500 cursor-pointer"
          >
            <Users className="w-5 h-5" />
          </Button>
        </div>

        {/* -------- main child view -------- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChild.id}
            initial={{ opacity: 0, x: swipeDirection * 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: swipeDirection * -300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <ChildView
              child={currentChild}
              onUpdateChild={handleChildUpdate}
              onEditMode={() => setEditMode(currentChild)}
            />
          </motion.div>
        </AnimatePresence>

        {/* -------- modals -------- */}
        <AnimatePresence>
          {editMode && (
            <EditMode
              child={editMode}
              onSave={updated => {
                handleChildUpdate(updated);
                setEditMode(null);
              }}
              onClose={() => setEditMode(null)}
            />
          )}

          {showChildManager && (
            <ChildManager
              onSave={updated => {
                handleChildrenUpdate(updated);
                setShowChildManager(false);
              }}
              onClose={() => setShowChildManager(false)}
            >
              {children}
            </ChildManager>
          )}
        </AnimatePresence>

        {/* -------- alarms -------- */}
        <AlarmOverlay />
      </div>
    </AlarmProvider>
  );
}
