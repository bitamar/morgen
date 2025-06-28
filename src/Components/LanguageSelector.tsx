import { useState } from 'react';
import { Button, Popover, Text, Flex, Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/language';
import { SUPPORTED_LANGUAGES } from '../services/languageStorage';

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage, getLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangInfo = getLanguageInfo();

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Button
          variant="outline"
          size="2"
          className={`bg-white/80 backdrop-blur-sm border-white/50 shadow-lg cursor-pointer`}
        >
          <span>{currentLangInfo.flag}</span>
        </Button>
      </Popover.Trigger>

      <Popover.Content className="min-w-48 p-4" side="bottom" align="center">
        <Flex direction="column" gap="1">
          {SUPPORTED_LANGUAGES.map(language => (
            <motion.div key={language.code} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="2"
                onClick={() => {
                  setLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`w-full justify-start ${
                  currentLanguage === language.code
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Box className="flex items-center justify-between w-full">
                  <Box className="flex items-center gap-2">
                    <span className="text-sm">{language.flag}</span>
                    <Text size="2">{language.name}</Text>
                  </Box>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: currentLanguage === language.code ? 1 : 0 }}
                    className="text-green-500 text-sm w-4 flex justify-center"
                  >
                    ✓
                  </motion.span>
                </Box>
              </Button>
            </motion.div>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};
