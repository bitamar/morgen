export const STORAGE_KEY = 'morningRoutine.v1';

export interface Task {
  id: string;
  title: string;
  emoji: string;
  done: boolean;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
  wakeUpTime: string;
  busTime: string;
  tasks: Task[];
}

export const getDefaultChildren = (): Child[] => [
  {
    id: 'maya',
    name: 'Maya',
    avatar: 'cat.png',
    wakeUpTime: '07:00',
    busTime: '07:45',
    tasks: [
      { id: 'brush', title: 'Brush teeth', emoji: 'toothbrush.png', done: false },
      { id: 'dress', title: 'Get dressed', emoji: 'shirt.png', done: false },
      { id: 'breakfast', title: 'Eat breakfast', emoji: 'sandwich.png', done: false },
      { id: 'backpack', title: 'Pack backpack', emoji: 'backpack.png', done: false },
    ],
  },
  {
    id: 'alex',
    name: 'Alex',
    avatar: 'dog.png',
    wakeUpTime: '07:15',
    busTime: '08:00',
    tasks: [
      { id: 'wash', title: 'Wash face', emoji: '🧼', done: false },
      { id: 'dress2', title: 'Get dressed', emoji: 'shirt.png', done: false },
      { id: 'breakfast2', title: 'Eat breakfast', emoji: 'sandwich.png', done: false },
      { id: 'shoes', title: 'Put on shoes', emoji: 'shoe.png', done: false },
    ],
  },
];

/** Read children list (with safe fallbacks). */
export function loadChildren(): Child[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultChildren();

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.children) && parsed.children.length) {
      return parsed.children as Child[];
    }
  } catch (err) {
    console.error('loadChildren:', err);
  }
  return getDefaultChildren();
}

/** Persist children list with timestamp. */
export function saveChildren(children: Child[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ children, lastUpdated: new Date().toISOString() })
    );
  } catch (err) {
    console.error('saveChildren:', err);
  }
}
