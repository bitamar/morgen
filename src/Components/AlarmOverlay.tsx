import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Text } from '@radix-ui/themes';
import { AlarmClock, Bus, Clock, AlertTriangle } from 'lucide-react';
import { useAlarm } from '../context/alarm.ts';

interface AlarmContent {
  icon: React.ElementType;
  title: string;
  message: string;
  bgColor: string;
  buttonClass: string;
  action: string;
  isUrgent?: boolean;
}

export default function AlarmOverlay() {
  const { currentAlarm, dismissAlarm } = useAlarm();

  if (!currentAlarm) return null;

  const getAlarmContent = (): AlarmContent => {
    switch (currentAlarm.type) {
      case 'wakeup':
        return {
          icon: AlarmClock,
          title: 'Good Morning!',
          message: `Time to wake up, ${currentAlarm.child.name}! 🌅`,
          bgColor: 'from-orange-400 to-yellow-500',
          buttonClass:
            'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700',
          action: 'Start My Day',
        };
      case 'warning':
        return {
          icon: Clock,
          title: 'Almost Time!',
          message: `5 minutes until bus time, ${currentAlarm.child.name}! 🚌`,
          bgColor: 'from-yellow-400 to-orange-500',
          buttonClass:
            'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
          action: 'Check Tasks',
        };
      case 'departure':
        return {
          icon: Bus,
          title: 'BUS TIME!',
          message: `Hurry, ${currentAlarm.child.name}! The bus is here! 🏃💨`,
          bgColor: 'from-red-500 to-pink-600',
          buttonClass:
            'bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 animate-pulse',
          action: "I'M GOING!",
          isUrgent: true,
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Attention!',
          message: 'An alarm is sounding.',
          bgColor: 'from-gray-400 to-gray-500',
          buttonClass:
            'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
          action: 'Dismiss',
        };
    }
  };

  const alarmContent = getAlarmContent();
  const IconComponent = alarmContent.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 flex items-center justify-center z-[100] ${
        alarmContent.isUrgent ? 'alarm-pulse-bg' : 'bg-black/80'
      }`}
      onClick={dismissAlarm}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{
          scale: 1,
          y: 0,
          rotate: alarmContent.isUrgent ? [0, 0.5, -0.5, 0.5, -0.5, 0] : 0,
        }}
        transition={{
          type: 'spring',
          damping: 15,
          rotate: { repeat: Infinity, duration: 0.3, ease: 'easeInOut' },
        }}
        className="max-w-md mx-4 w-full"
        onClick={e => e.stopPropagation()}
      >
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className={`p-8 bg-gradient-to-br ${alarmContent.bgColor} text-white text-center`}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: alarmContent.isUrgent ? [0, 5, -5, 0] : [0, 2, -2, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: alarmContent.isUrgent ? 0.7 : 1.5,
                ease: 'easeInOut',
              }}
              className="mb-4"
            >
              <IconComponent className="w-16 h-16 mx-auto" />
            </motion.div>

            <Text size="6" weight="bold" className="mb-2">
              {alarmContent.title}
            </Text>
            <Text size="4" className="text-white/90">
              {alarmContent.message}
            </Text>
          </div>

          <div className="p-6 text-center bg-white">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={dismissAlarm}
                size="3"
                className={`w-full text-lg py-6 text-white ${alarmContent.buttonClass}`}
              >
                {alarmContent.action}
              </Button>
            </motion.div>

            <Text size="1" className="text-gray-500 mt-4">
              Tap the button to dismiss this alert.
            </Text>
          </div>
        </Card>
      </motion.div>

      {alarmContent.isUrgent && (
        <style>{`
                    @keyframes alarmPulseBackground {
                        0%, 100% { background-color: rgba(150, 0, 0, 0.7); }
                        50% { background-color: rgba(220, 38, 38, 0.9); }
                    }
                    .alarm-pulse-bg {
                        animation: alarmPulseBackground 0.7s infinite alternate;
                    }
                `}</style>
      )}
    </motion.div>
  );
}
