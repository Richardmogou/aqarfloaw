import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, COOKIE, dictionaries, translate, type Locale, type Vars } from "./dictionaries";

export function getLocale(): Locale {
  const v = cookies().get(COOKIE)?.value;
  return LOCALES.includes(v as Locale) ? (v as Locale) : DEFAULT_LOCALE;
}

export async function getT() {
  const dict = dictionaries[getLocale()];
  return (key: string, vars?: Vars) => translate(dict, key, vars);
}

/** Texte bilingue en ligne (composants serveur) : anglais d'abord, français ensuite. */
export function getL() {
  const isFr = getLocale() === "fr";
  return (en: string, fr: string) => (isFr ? fr : en);
}