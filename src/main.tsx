import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import MorningRoutine from './MorningRoutine';
import { LanguageProvider } from './Components/LanguageProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <Theme appearance="light" accentColor="blue" grayColor="slate" scaling="100%">
        <MorningRoutine />
      </Theme>
    </LanguageProvider>
  </React.StrictMode>
);
