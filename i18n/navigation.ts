// Locale-aware navigation: use these instead of `next/link` and `next/navigation`.
import { createAbNavigation } from 'ab-nextjs-i18n/navigation';
import abI18nConfig from './config';

export const { AbLink, Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createAbNavigation(abI18nConfig);
