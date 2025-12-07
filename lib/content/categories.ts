import type {Category} from '@/lib/schema';
import type {Locale} from '@/lib/i18n/config';

export const CATEGORY_METADATA: Record<
  Category,
  {icon: string; label: Record<Locale, string>}
> = {
  pueblo: {
    icon: '🏘️',
    label: {es: 'Pueblos', en: 'Villages'}
  },
  mirador: {
    icon: '🌄',
    label: {es: 'Miradores', en: 'Viewpoints'}
  },
  ruta: {
    icon: '🧭',
    label: {es: 'Rutas', en: 'Routes'}
  },
  fiesta: {
    icon: '🎉',
    label: {es: 'Fiestas', en: 'Festivals'}
  },
  museo: {
    icon: '🏛️',
    label: {es: 'Museos', en: 'Museums'}
  },
  gastronomia: {
    icon: '🍽️',
    label: {es: 'Gastronomía', en: 'Food'}
  },
  sendero: {
    icon: '🥾',
    label: {es: 'Senderos', en: 'Trails'}
  },
  patrimonio: {
    icon: '🏺',
    label: {es: 'Patrimonio', en: 'Heritage'}
  },
  paisaje: {
    icon: '🏞️',
    label: {es: 'Paisajes', en: 'Landscapes'}
  }
};

export function getCategoryLabel(category: Category, locale: Locale): string {
  return CATEGORY_METADATA[category].label[locale];
}
