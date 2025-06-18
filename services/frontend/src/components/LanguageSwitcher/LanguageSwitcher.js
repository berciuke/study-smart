import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage('pl')}
        disabled={i18n.resolvedLanguage === 'pl'}
      >
        PL
      </button>
      <button
        onClick={() => changeLanguage('en')}
        disabled={i18n.resolvedLanguage === 'en'}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher; 