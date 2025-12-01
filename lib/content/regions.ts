import type {Locale} from '@/lib/i18n/config';
import type {RegionId, Translated} from '@/lib/schema';

const REGION_LABELS: Record<RegionId, Translated<string>> = {
  valles: {
    es: 'Valles Calchaquíes',
    en: 'Calchaquí Valleys'
  },
  puna: {
    es: 'Puna andina',
    en: 'Andean Puna'
  },
  yungas: {
    es: 'Yungas',
    en: 'Yungas'
  },
  ciudad: {
    es: 'Ciudad de Salta',
    en: 'City of Salta'
  },
  lerma: {
    es: 'Valle de Lerma',
    en: 'Lerma Valley'
  },
  anta: {
    es: 'Anta',
    en: 'Anta'
  },
  orán: {
    es: 'Orán',
    en: 'Orán'
  }
};

export function getRegionLabel(region: RegionId, locale: Locale) {
  return REGION_LABELS[region]?.[locale] ?? region;
}

export {REGION_LABELS};
