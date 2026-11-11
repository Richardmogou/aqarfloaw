"use client";
import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, dictionaries, translate, type Locale, type Vars } from "./dictionaries";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);

export function useT() {
  const dict = dictionaries[useContext(LocaleContext)];
  return (key: string, vars?: Vars) => translate(dict, key, vars);
}

/** Texte bilingue en ligne : anglais d'abord, français ensuite. */
export function useL() {
  const locale = useContext(LocaleContext);
  return (en: string, fr: string) => (locale === "fr" ? fr : en);
}