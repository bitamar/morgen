import { useLanguage } from '../context/language';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  const translations: Record<string, Record<string, string>> = {
    en: {
      // General
      goodMorning: 'Good Morning!',
      selectLanguage: 'Select Language',
      settings: 'Settings',
      done: 'Done',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',

      // Loading
      loadingMorningRoutine: 'Loading Morning Routine...',
      settingUpYourDay: 'Setting up your day!',

      // Child View
      morningTitle: "{name}'s Morning!",
      progress: 'Progress: {completed}/{total} tasks',
      busTimeNow: 'Bus time!',
      busHasLeft: 'Bus has left',
      busIn: 'Bus in {time}',
      busInHours: 'Bus in {hours}h {minutes}m',
      busInMinutes: 'Bus in {minutes}m {seconds}s',
      busInSeconds: 'Bus in {seconds}s',

      // Edit Mode
      editRoutine: "Edit {name}'s Routine",
      childInfo: 'Child Info',
      name: 'Name',
      enterChildName: "Enter child's name",
      avatar: 'Avatar',
      wakeUpTime: 'Wake-up Time',
      busTime: 'Bus Time',
      tasks: 'Tasks',
      addTask: 'Add Task',
      quickAddTasks: 'Quick Add Tasks',
      morningTasks: 'Morning Tasks',
      newTaskPlaceholder: 'New task...',
      taskTitle: 'Task Title',
      taskEmoji: 'Task Emoji',
      presetTasks: 'Preset Tasks',
      customTask: 'Custom Task',
      reorderTasks: 'Drag to reorder tasks',
      tapSettingsToAddTasks: 'Tap the settings icon to add some morning tasks.',

      // Empty state
      noTasksYet: 'No tasks yet!',
      addTasks: 'Add Tasks',

      // Completion celebration
      allDone: 'All Done, {name}!',
      fantasticWork: "Fantastic work! You're ready for an amazing day! 🚌",
      greatJob: 'Great job! ✨',

      // Child Manager
      manageChildren: 'Manage Children',
      addChild: 'Add Child',
      childName: "Child's name",

      // Task Presets
      brushTeeth: 'Brush teeth',
      getDressed: 'Get dressed',
      eatBreakfast: 'Eat breakfast',
      packBackpack: 'Pack backpack',
      putOnShoes: 'Put on shoes',
      washFace: 'Wash face',
      combHair: 'Comb hair',
      makeBed: 'Make bed',

      // Accessibility
      previousChild: 'Previous child',
      nextChild: 'Next child',

      // Time format
      timeFormat: 'en-US',
    },
    he: {
      // General
      goodMorning: 'בוקר טוב!',
      selectLanguage: 'בחר שפה',
      settings: 'הגדרות',
      done: 'סיום',
      cancel: 'ביטול',
      saveChanges: 'שמור שינויים',

      // Loading
      loadingMorningRoutine: 'טוען שגרת בוקר...',
      settingUpYourDay: 'מכין את היום שלך!',

      // Child View
      morningTitle: 'בוקר טוב {name}!',
      progress: 'התקדמות: {completed}/{total} משימות',
      busTimeNow: 'זמן האוטובוס!',
      busHasLeft: 'האוטובוס יצא',
      busIn: 'האוטובוס בעוד {time}',
      busInHours: 'האוטובוס בעוד {hours}ש {minutes}ד',
      busInMinutes: 'האוטובוס בעוד {minutes}ד {seconds}ש',
      busInSeconds: 'האוטובוס בעוד {seconds}ש',

      // Edit Mode
      editRoutine: 'ערוך שגרה של {name}',
      childInfo: 'פרטי הילד',
      name: 'שם',
      enterChildName: 'הכנס שם הילד',
      avatar: 'אווטר',
      wakeUpTime: 'שעת השכמה',
      busTime: 'שעת האוטובוס',
      tasks: 'משימות',
      addTask: 'הוסף משימה',
      quickAddTasks: 'הוספה מהירה של משימות',
      morningTasks: 'משימות בוקר',
      newTaskPlaceholder: 'משימה חדשה...',
      taskTitle: 'כותרת המשימה',
      taskEmoji: "אימוג'י המשימה",
      presetTasks: 'משימות מוכנות',
      customTask: 'משימה מותאמת',
      reorderTasks: 'גרור לסידור המשימות',
      tapSettingsToAddTasks: 'לחץ על סמל ההגדרות כדי להוסיף משימות בוקר.',

      // Empty state
      noTasksYet: 'עדיין אין משימות!',
      addTasks: 'הוסף משימות',

      // Completion celebration
      allDone: 'סיימת הכל, {name}!',
      fantasticWork: 'עבודה מעולה! אתה מוכן ליום נפלא! 🚌',
      greatJob: 'כל הכבוד! ✨',

      // Child Manager
      manageChildren: 'ניהול ילדים',
      addChild: 'הוסף ילד',
      childName: 'שם הילד',

      // Task Presets
      brushTeeth: 'צחצוח שיניים',
      getDressed: 'להתלבש',
      eatBreakfast: 'לאכול ארוחת בוקר',
      packBackpack: 'לארוז תיק',
      putOnShoes: 'לנעול נעליים',
      washFace: 'לשטוף פנים',
      combHair: 'לסרק שיער',
      makeBed: 'לסדר מיטה',

      // Accessibility
      previousChild: 'ילד קודם',
      nextChild: 'ילד הבא',

      // Time format
      timeFormat: 'he-IL',
    },
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[currentLanguage]?.[key] || translations.en[key] || key;

    // Simple parameter replacement
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }

    return text;
  };

  return { t, currentLanguage };
};
