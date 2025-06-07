import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Text, Flex } from '@radix-ui/themes';
import { X, Plus, Trash2, Clock, Bus, User } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  avatar: string;
  wakeUpTime: string;
  busTime: string;
  tasks: Array<{
    id: string;
    title: string;
    emoji: string;
    done: boolean;
  }>;
}

interface ChildManagerProps {
  childList: Child[];
  onSave: (children: Child[]) => void;
  onClose: () => void;
}

export default function ChildManager({ childList, onSave, onClose }: ChildManagerProps) {
  const [editedChildren, setEditedChildren] = useState<Child[]>(childList);

  const addChild = () => {
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: '',
      avatar: '👦',
      wakeUpTime: '07:00',
      busTime: '08:00',
      tasks: [],
    };
    setEditedChildren(prev => [...prev, newChild]);
  };

  const removeChild = (childId: string) => {
    setEditedChildren(prev => prev.filter(c => c.id !== childId));
  };

  const updateChild = (childId: string, field: keyof Child, value: string) => {
    setEditedChildren(prev =>
      prev.map(child => (child.id === childId ? { ...child, [field]: value } : child))
    );
  };

  return (
    <motion.div
      role="dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <Text size="5" weight="bold">
              Manage Children
            </Text>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {editedChildren.map(child => (
              <Card key={child.id} className="p-4">
                <Flex gap="4" align="center">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateChild(child.id, 'name', e.target.value)
                        }
                        placeholder="Child's name"
                        className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        value={child.wakeUpTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateChild(child.id, 'wakeUpTime', e.target.value)
                        }
                        className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Bus className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        value={child.busTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateChild(child.id, 'busTime', e.target.value)
                        }
                        className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <Button variant="ghost" color="red" onClick={() => removeChild(child.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Flex>
              </Card>
            ))}

            <Button variant="outline" onClick={addChild} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedChildren)}>Save Changes</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
