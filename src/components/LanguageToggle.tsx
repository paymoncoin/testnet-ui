import { Button } from './ui/button'
import { Globe } from 'lucide-react'
import i18next from "i18next";
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const [t, i18n] = useTranslation("global");

  const switchLocale = () => {
    if (i18next.language == "fa") {
      i18n.changeLanguage("en")
    }
    else {
      i18n.changeLanguage("fa");
    }
  }

  return (
    <Button onClick={switchLocale} variant="outline" className="text-xs font-bold">
      <Globe className="mr-1" />
      {t(i18next.language)}
    </Button>
  )
}

export default LanguageToggle