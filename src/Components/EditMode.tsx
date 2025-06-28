import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Text, Flex, Box } from '@radix-ui/themes';
import { X, Plus, Trash2, GripVertical, User, Star } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTranslation } from '../hooks/useTranslation';

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

interface EditModeProps {
  child: Child;
  onSave: (child: Child) => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦄', '🌟', '🚀', '🎨'];

// Task presets will be translated dynamically
const TASK_PRESET_KEYS = [
  { titleKey: 'brushTeeth', emoji: '🦷' },
  { titleKey: 'getDressed', emoji: '👕' },
  { titleKey: 'eatBreakfast', emoji: '🥣' },
  { titleKey: 'packBackpack', emoji: '🎒' },
  { titleKey: 'putOnShoes', emoji: '👟' },
  { titleKey: 'washFace', emoji: '🧼' },
  { titleKey: 'combHair', emoji: '💇' },
  { titleKey: 'makeBed', emoji: '🛏️' },
];

export default function EditMode({ child, onSave, onClose }: EditModeProps) {
  const { t } = useTranslation();
  const [editedChild, setEditedChild] = useState<Child>({
    id: child.id,
    name: child.name || '',
    avatar: child.avatar || '👦',
    wakeUpTime: child.wakeUpTime || '07:00',
    busTime: child.busTime || '08:00',
    tasks: child.tasks || [],
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('✅');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(editedChild.tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditedChild(prev => ({ ...prev, tasks: items }));
  };

  const addTask = (presetKey?: string) => {
    const title = presetKey ? t(presetKey) : newTaskTitle.trim();
    const emoji = presetKey
      ? TASK_PRESET_KEYS.find(p => p.titleKey === presetKey)?.emoji
      : newTaskEmoji;

    if (!title) return;

    const newTask: Task = { id: `task-${Date.now()}`, title, emoji: emoji || '✅', done: false };

    setEditedChild(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));

    if (!presetKey) {
      setNewTaskTitle('');
      setNewTaskEmoji('✅');
    }
  };

  const removeTask = (taskId: string) => {
    setEditedChild(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
  };

  const updateTask = (taskId: string, field: keyof Task, value: string | boolean) => {
    setEditedChild(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => (task.id === taskId ? { ...task, [field]: value } : task)),
    }));
  };

  const handleSave = () => {
    onSave(editedChild);
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
            <Text size="6" weight="bold">
              {t('editRoutine', { name: editedChild.name })}
            </Text>
            <Button
              variant="ghost"
              size="3"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Child Settings */}
            <div className="space-y-6">
              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Text size="5" weight="bold" className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('childInfo')}
                  </Text>
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text as="label" size="2" weight="medium" mb="2">
                        {t('name')}
                      </Text>
                      <input
                        value={editedChild.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setEditedChild(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder={t('enterChildName')}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </Box>

                    <Box>
                      <Text as="label" size="2" weight="medium" mb="2">
                        {t('avatar')}
                      </Text>
                      <div className="grid grid-cols-5 gap-1 sm:gap-2 mt-2">
                        {AVATAR_OPTIONS.map(emoji => (
                          <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditedChild(prev => ({ ...prev, avatar: emoji }))}
                            className={` w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 text-xl sm:text-2xl flex items-center justify-center transition-all ${
                              editedChild.avatar === emoji
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </Box>

                    <Flex gap="4">
                      <Box style={{ flex: 1 }}>
                        <Text as="label" size="2" weight="medium" mb="2">
                          {t('wakeUpTime')}
                        </Text>
                        <input
                          type="time"
                          value={editedChild.wakeUpTime}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEditedChild(prev => ({ ...prev, wakeUpTime: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text as="label" size="2" weight="medium" mb="2">
                          {t('busTime')}
                        </Text>
                        <input
                          type="time"
                          value={editedChild.busTime}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setEditedChild(prev => ({ ...prev, busTime: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>

              {/* Quick Add Presets */}
              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Text size="5" weight="bold">
                    {t('quickAddTasks')}
                  </Text>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TASK_PRESET_KEYS.map(preset => (
                      <motion.button
                        key={preset.titleKey}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addTask(preset.titleKey)}
                        className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                      >
                        <span className="text-lg sm:text-xl">{preset.emoji}</span>
                        <span className="text-xs sm:text-sm font-medium">{t(preset.titleKey)}</span>
                      </motion.button>
                    ))}
                  </div>
                </Flex>
              </Card>
            </div>

            {/* Tasks */}
            <div>
              <Card>
                <Flex direction="column" gap="4" p="4">
                  <Text size="5" weight="bold" className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {t('morningTasks')} ({editedChild.tasks.length})
                  </Text>
                  <Flex direction="column" gap="4">
                    {/* Add New Task */}
                    <Box className="space-y-3 p-3 sm:p-4 border border-dashed border-gray-300 rounded-lg">
                      <Flex gap="2" align="center">
                        <input
                          value={newTaskEmoji}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setNewTaskEmoji(e.target.value)
                          }
                          placeholder="📝"
                          className="w-16 px-3 py-2 rounded-md border border-gray-300 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={2}
                        />
                        <input
                          value={newTaskTitle}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setNewTaskTitle(e.target.value)
                          }
                          placeholder={t('newTaskPlaceholder')}
                          className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                            e.key === 'Enter' && addTask()
                          }
                        />
                        <Button onClick={() => addTask()} size="2">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </Flex>
                    </Box>

                    {/* Task List */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="tasks">
                        {provided => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1"
                          >
                            {editedChild.tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`
                                                                            flex items-center gap-2 p-2 sm:p-3 rounded-lg border
                                                                            ${snapshot.isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                                                            transition-all
                                                                        `}
                                  >
                                    <div {...provided.dragHandleProps} className="cursor-grab">
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <input
                                      value={task.title}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        updateTask(task.id, 'title', e.target.value)
                                      }
                                      className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                      value={task.emoji}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        updateTask(task.id, 'emoji', e.target.value)
                                      }
                                      className="w-16 px-3 py-2 rounded-md border border-gray-300 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      maxLength={2}
                                    />
                                    <Button
                                      variant="ghost"
                                      color="red"
                                      size="2"
                                      onClick={() => removeTask(task.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Flex>
                </Flex>
              </Card>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50">
          <Flex justify="end" gap="3">
            <Button variant="soft" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>{t('saveChanges')}</Button>
          </Flex>
        </div>
      </motion.div>
    </motion.div>
  );
}
