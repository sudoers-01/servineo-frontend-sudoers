'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// ============================================
// MAPEO DE VALORES DE BD A KEYS DE TRADUCCIÓN
// ============================================
const DB_TO_TRANSLATION_KEY: Record<string, string> = {
  // Rangos de nombres
  'De (A-C)': 'fixerName.ranges.ac',
  'De (D-F)': 'fixerName.ranges.df',
  'De (G-I)': 'fixerName.ranges.gi',
  'De (J-L)': 'fixerName.ranges.jl',
  'De (M-Ñ)': 'fixerName.ranges.mn',
  'De (O-Q)': 'fixerName.ranges.oq',
  'De (R-T)': 'fixerName.ranges.rt',
  'De (U-W)': 'fixerName.ranges.uw',
  'De (X-Z)': 'fixerName.ranges.xz',

  // Ciudades
  Beni: 'city.options.beni',
  Chuquisaca: 'city.options.chuquisaca',
  Cochabamba: 'city.options.cochabamba',
  'La Paz': 'city.options.laPaz',
  Oruro: 'city.options.oruro',
  Pando: 'city.options.pando',
  Potosí: 'city.options.potosi',
  'Santa Cruz': 'city.options.santaCruz',
  Tarija: 'city.options.tarija',

  // Tipos de trabajo
  Albañil: 'jobType.options.mason',
  Carpintero: 'jobType.options.carpenter',
  Cerrajero: 'jobType.options.locksmith',
  Decorador: 'jobType.options.decorator',
  Electricista: 'jobType.options.electrician',
  Fontanero: 'jobType.options.plumber',
  Fumigador: 'jobType.options.fumigator',
  Instalador: 'jobType.options.installer',
  Jardinero: 'jobType.options.gardener',
  Limpiador: 'jobType.options.cleaner',
  Mecánico: 'jobType.options.mechanic',
  Montador: 'jobType.options.assembler',
  Pintor: 'jobType.options.painter',
  Pulidor: 'jobType.options.polisher',
  Soldador: 'jobType.options.welder',
  Techador: 'jobType.options.roofer',
  Vidriero: 'jobType.options.glazier',
  Yesero: 'jobType.options.plasterer',
};

type NoResultsMessageProps = {
  search: string;
};

export const NoResultsMessage: React.FC<NoResultsMessageProps> = ({ search }) => {
  const t = useTranslations('search');
  const trimmed = search?.trim();

  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-xl font-roboto font-normal">
        {t('noResults')}
        {trimmed && (
          <>
            {' '}
            {t('for')} <span className="font-bold">"{trimmed}"</span>
          </>
        )}
      </p>
    </div>
  );
};

type FilterParamValue = string | string[] | number | boolean | null;

interface Props {
  params: Record<string, FilterParamValue>;
  onModify?: () => void;
}

function formatPriceString(s: string) {
  if (!s) return s;
  return s.replace(/\$\s*([0-9]+(?:\.\d+)?)/g, '$1bs');
}

export default function AppliedFilters({ params, onModify }: Props) {
  const router = useRouter();
  const t = useTranslations('search');
  const tAdv = useTranslations('advancedSearch');

  // Función para traducir valores de BD
  const translateDbValue = (value: string): string => {
    const translationKey = DB_TO_TRANSLATION_KEY[value];
    if (translationKey) {
      return tAdv(translationKey as any);
    }
    return value; // Si no hay traducción, mostrar el valor original
  };

  const handleModify = () => {
    if (onModify) return onModify();
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, val]) => {
      if (val == null) return;
      if (Array.isArray(val)) {
        val.forEach((v) => sp.append(k, String(v)));
      } else {
        sp.set(k, String(val));
      }
    });
    router.push(`/adv-search?${sp.toString()}`);
  };

  // Función mejorada para renderizar valores con traducción
  const renderTranslatedValue = (v: FilterParamValue): string | null => {
    if (v == null) return null;

    if (Array.isArray(v)) {
      // Traducir cada elemento del array
      const translated = v.map((item) => translateDbValue(String(item)));
      return translated.join(', ');
    }

    // Traducir valor individual
    return translateDbValue(String(v));
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 px-4">
      <div className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between font-['Roboto'] text-sm">
        <div>
          <p className="text-sm font-semibold text-gray-700">{t('searchPlaceholder')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(() => {
              const minRaw = params['minPrice'] as FilterParamValue;
              const maxRaw = params['maxPrice'] as FilterParamValue;
              const tags: React.ReactNode[] = [];

              const hasMin = minRaw != null && minRaw !== '';
              const hasMax = maxRaw != null && maxRaw !== '';

              // Tag de precio
              if (hasMin || hasMax) {
                const minN = Number(minRaw);
                const maxN = Number(maxRaw);
                const minValid = !Number.isNaN(minN);
                const maxValid = !Number.isNaN(maxN);
                let text = '';
                if (minValid && maxValid) {
                  text = `${t('price')}: ${minN}bs - ${maxN}bs`;
                } else if (minValid && !maxValid) {
                  text = `${t('price')}: ${t('moreThan')} ${minN}bs`;
                } else if (!minValid && maxValid) {
                  text = `${t('price')}: ${t('lessThan')} ${maxN}bs`;
                }

                tags.push(
                  <span
                    key="price"
                    className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                  >
                    {text}
                  </span>,
                );
              }

              // Procesar otros parámetros
              Object.entries(params).forEach(([k, v]) => {
                if (k === 'minPrice' || k === 'maxPrice') return;

                // SortBy
                if (k === 'sortBy' && typeof v === 'string') {
                  const txt =
                    v === 'recent' ? t('mostRecent') : v === 'oldest' ? t('oldest') : String(v);
                  tags.push(
                    <span
                      key={k}
                      className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                    >
                      {txt}
                    </span>,
                  );
                  return;
                }

                // Title Only
                if (k === 'titleOnly' && v === true) {
                  tags.push(
                    <span
                      key={k}
                      className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                    >
                      {t('titleOnly')}
                    </span>,
                  );
                  return;
                }

                // Exact Words
                if (k === 'exact' && v === true) {
                  tags.push(
                    <span
                      key={k}
                      className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                    >
                      {t('exactWords')}
                    </span>,
                  );
                  return;
                }

                // Date
                if (k === 'date' && typeof v === 'string') {
                  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                  const dateLabel = m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
                  tags.push(
                    <span
                      key={k}
                      className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                    >
                      {`${t('date')}: ${dateLabel}`}
                    </span>,
                  );
                  return;
                }

                // Rating
                if (k === 'rating' && typeof v === 'number') {
                  tags.push(
                    <span
                      key={k}
                      className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                    >
                      {`⭐ ${v}+`}
                    </span>,
                  );
                  return;
                }

                // Otros valores (range, city, category, tags) - TRADUCIR
                let value = renderTranslatedValue(v as FilterParamValue);
                if (!value) return;
                if (value.includes('$')) value = formatPriceString(value);

                tags.push(
                  <span
                    key={k}
                    className="inline-block bg-sky-50 text-sky-500 text-sm px-3 py-1 rounded"
                  >
                    {value}
                  </span>,
                );
              });

              return tags;
            })()}
          </div>
        </div>

        <div className="flex items-center mt-3">
          <button
            type="button"
            onClick={handleModify}
            className="bg-[#2B6AE0] text-white hover:bg-[#2B6AE0]/90 px-4 py-2 text-sm sm:text-base font-roboto font-semibold rounded shadow transition-all duration-200"
          >
            {t('modify')}
          </button>
        </div>
      </div>
    </div>
  );
}
