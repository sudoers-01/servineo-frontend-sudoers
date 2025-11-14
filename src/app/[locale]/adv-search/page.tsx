'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsCounter } from '@/Components/Adv-search/ResultsCounter';
import { InputOnlySearch } from '@/Components/Job-offers/Search/InputOnlySearch';
import { SearchCheckboxes } from '@/Components/Adv-search/SearchCheckboxes';
import { HelpButton } from '@/Components/Adv-search/HelpButton';
import DropdownList from '@/Components/Adv-search/DropdownList';
import useSyncUrlParamsAdv from '@/app/redux/adv-search-hooks/useSyncUrlParams';
import useAdvSearchLogic from '@/app/redux/adv-search-hooks/useAdvSearchLogic';
import PriceRangeList from '@/Components/Adv-search/PriceRangeList';
import DateFilterSelector from '@/Components/Adv-search/DateFilterSelector';
import CalificacionEstrella from '@/Components/Adv-search/CalificacionEstrella';
import ButtonAplicarBus from '@/Components/Adv-search/ButtonAplicarBus';
import ClearButton from '@/Components/Adv-search/ClearButton';
import { useTranslations } from 'next-intl';

// ============================================
// VALORES QUE SE ENVÍAN AL BACKEND (ESPAÑOL)
// ============================================
const DB_VALUES = {
  ranges: [
    'De (A-C)',
    'De (D-F)',
    'De (G-I)',
    'De (J-L)',
    'De (M-Ñ)',
    'De (O-Q)',
    'De (R-T)',
    'De (U-W)',
    'De (X-Z)',
  ],
  cities: [
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija',
  ],
  jobTypes: [
    'Albañil',
    'Carpintero',
    'Cerrajero',
    'Decorador',
    'Electricista',
    'Fontanero',
    'Fumigador',
    'Instalador',
    'Jardinero',
    'Limpiador',
    'Mecánico',
    'Montador',
    'Pintor',
    'Pulidor',
    'Soldador',
    'Techador',
    'Vidriero',
    'Yesero',
  ],
} as const;

function AdvancedSearchPage() {
  const t = useTranslations('advancedSearch');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Configuración de UI: dbValue en español, label traducido
  const FIXER_RANGES = [
    [
      { dbValue: DB_VALUES.ranges[0], label: t('fixerName.ranges.ac') },
      { dbValue: DB_VALUES.ranges[1], label: t('fixerName.ranges.df') },
      { dbValue: DB_VALUES.ranges[2], label: t('fixerName.ranges.gi') },
      { dbValue: DB_VALUES.ranges[3], label: t('fixerName.ranges.jl') },
      { dbValue: DB_VALUES.ranges[4], label: t('fixerName.ranges.mn') },
    ],
    [
      { dbValue: DB_VALUES.ranges[5], label: t('fixerName.ranges.oq') },
      { dbValue: DB_VALUES.ranges[6], label: t('fixerName.ranges.rt') },
      { dbValue: DB_VALUES.ranges[7], label: t('fixerName.ranges.uw') },
      { dbValue: DB_VALUES.ranges[8], label: t('fixerName.ranges.xz') },
    ],
  ];

  const CITIES = [
    { dbValue: DB_VALUES.cities[0], label: t('city.options.beni') },
    { dbValue: DB_VALUES.cities[1], label: t('city.options.chuquisaca') },
    { dbValue: DB_VALUES.cities[2], label: t('city.options.cochabamba') },
    { dbValue: DB_VALUES.cities[3], label: t('city.options.laPaz') },
    { dbValue: DB_VALUES.cities[4], label: t('city.options.oruro') },
    { dbValue: DB_VALUES.cities[5], label: t('city.options.pando') },
    { dbValue: DB_VALUES.cities[6], label: t('city.options.potosi') },
    { dbValue: DB_VALUES.cities[7], label: t('city.options.santaCruz') },
    { dbValue: DB_VALUES.cities[8], label: t('city.options.tarija') },
  ];

  const JOBS = [
    { dbValue: DB_VALUES.jobTypes[0], label: t('jobType.options.mason') },
    { dbValue: DB_VALUES.jobTypes[1], label: t('jobType.options.carpenter') },
    { dbValue: DB_VALUES.jobTypes[2], label: t('jobType.options.locksmith') },
    { dbValue: DB_VALUES.jobTypes[3], label: t('jobType.options.decorator') },
    { dbValue: DB_VALUES.jobTypes[4], label: t('jobType.options.electrician') },
    { dbValue: DB_VALUES.jobTypes[5], label: t('jobType.options.plumber') },
    { dbValue: DB_VALUES.jobTypes[6], label: t('jobType.options.fumigator') },
    { dbValue: DB_VALUES.jobTypes[7], label: t('jobType.options.installer') },
    { dbValue: DB_VALUES.jobTypes[8], label: t('jobType.options.gardener') },
    { dbValue: DB_VALUES.jobTypes[9], label: t('jobType.options.cleaner') },
    { dbValue: DB_VALUES.jobTypes[10], label: t('jobType.options.mechanic') },
    { dbValue: DB_VALUES.jobTypes[11], label: t('jobType.options.assembler') },
    { dbValue: DB_VALUES.jobTypes[12], label: t('jobType.options.painter') },
    { dbValue: DB_VALUES.jobTypes[13], label: t('jobType.options.polisher') },
    { dbValue: DB_VALUES.jobTypes[14], label: t('jobType.options.welder') },
    { dbValue: DB_VALUES.jobTypes[15], label: t('jobType.options.roofer') },
    { dbValue: DB_VALUES.jobTypes[16], label: t('jobType.options.glazier') },
    { dbValue: DB_VALUES.jobTypes[17], label: t('jobType.options.plasterer') },
  ];

  const {
    // state
    searchQuery,
    titleOnly,
    exactWords,
    openSections,
    selectedRanges,
    selectedCity,
    selectedJobs,
    selectedTags,
    selectedPriceKey,
    loading,
    totalRegistros,
    storeLoading,
    clearSignal,
    skipSyncRef,
    // handlers
    setSearchQuery,
    setTitleOnly,
    setExactWords,
    toggleSection,
    handleRangeChange,
    handleCityChange,
    handleJobChange,
    handleDropdownChange,
    handlePriceRangeChange,
    handleSearch,
    setClearSignal,
    updateSearchOnStateChange,
    setSelectedRanges,
    setSelectedCity,
    setSelectedJobs,
    setSelectedCategories,
    setSelectedPriceRanges,
    setResultsCount,
    // date filter state from hook
    selectedDateFilter,
    setSelectedDateFilter,
    selectedSpecificDate,
    setSelectedSpecificDate,
    // rating
    selectedRating,
    setSelectedRating,
    fetchGlobalTotal,
  } = useAdvSearchLogic();

  const router = useRouter();

  // Close advanced search and go back to jobOfert when user presses Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/jobOfert');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  // compute min/max from selectedPriceKey (kept local for URL sync)
  const _priceNormalized = (selectedPriceKey || '').replace(/[$€£,]/g, '');
  const _priceMatches = _priceNormalized.match(/-?\d+(?:\.\d+)?/g) || [];
  const _minPrice = _priceMatches[0] ? Number(_priceMatches[0]) : null;
  const _maxPrice = _priceMatches[1] ? Number(_priceMatches[1]) : null;

  // include date and sort selection so the URL keeps the date param set by the selector
  let advDate: string | null = null;
  if (selectedDateFilter === 'specific' && selectedSpecificDate) {
    const y = selectedSpecificDate.getFullYear();
    const m = String(selectedSpecificDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedSpecificDate.getDate()).padStart(2, '0');
    advDate = `${y}-${m}-${d}`;
  }
  const advSort =
    selectedDateFilter === 'recent' ? 'recent' : selectedDateFilter === 'oldest' ? 'oldest' : null;

  useSyncUrlParamsAdv({
    search: searchQuery,
    filters: {
      range: selectedRanges,
      city: selectedCity,
      category: selectedJobs,
      tags: selectedTags,
      minPrice: _minPrice,
      maxPrice: _maxPrice,
    },
    date: advDate,
    rating: selectedRating,
    sortBy: advSort,
    titleOnly,
    exact: exactWords,
    skipSyncRef,
  });

  return (
    <>
      <HelpButton />

      <main
        className={`pt-20 lg:pt-24 px-4 sm:px-6 md:px-12 lg:px-24 transition-all duration-300 ${isCalendarOpen ? 'pb-96' : 'pb-12'}`}
      >
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-8 mt-4">
          {t('pageTitle')}
        </h1>

        <div className="max-w-7xl mx-auto">
          <div className="w-full sm:w-[700px] mx-auto">
            <div className="mb-3">
              <ResultsCounter total={totalRegistros ?? 0} loading={storeLoading ?? loading} />
            </div>

            <div className="mb-4">
              <InputOnlySearch onSearch={handleSearch} onValueChange={(v) => setSearchQuery(v)} />
            </div>

            <div className="mb-6">
              <SearchCheckboxes
                titleOnly={titleOnly}
                setTitleOnly={(val) => {
                  setTitleOnly(val);
                  setTimeout(() => updateSearchOnStateChange({ newTitleOnly: val }), 0);
                }}
                exactWords={exactWords}
                setExactWords={(val) => {
                  setExactWords(val);
                  setTimeout(() => updateSearchOnStateChange({ newExactWords: val }), 0);
                }}
              />
            </div>

            <div className="bg-[#2B6AE0] text-white px-4 py-2 text-sm font-bold mb-6 rounded-lg text-left">
              {t('selectableParams')}
            </div>

            {/* Filtro: Nombre de Fixer */}
            <div className="mb-6">
              <h3 className="text-base mb-2">{t('fixerName.label')}</h3>
              <div
                className={`bg-gray-100 text-gray-500 px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center 
                  ${
                    openSections.fixer
                      ? 'rounded-t-lg border border-b-0 border-gray-300'
                      : 'rounded-lg border border-gray-300'
                  }`}
                onClick={() => toggleSection('fixer')}
              >
                <span className="truncate">{t('fixerName.placeholder')}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${openSections.fixer ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {openSections.fixer && (
                <div className="bg-white border border-t-0 border-gray-300 p-4 rounded-b-lg shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {FIXER_RANGES.flat().map((range) => (
                      <label
                        key={range.dbValue}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#2B31E0] transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer flex-shrink-0 text-[#2B6AE0] rounded border-gray-300 focus:ring-[#2B6AE0]"
                          checked={selectedRanges.includes(range.dbValue)}
                          onChange={() => handleRangeChange(range.dbValue)}
                        />
                        <span className="truncate">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro: Ciudad */}
            <div className="mb-6">
              <h3 className="text-base mb-2">{t('city.label')}</h3>
              <div
                className={`bg-gray-100 text-gray-500 px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center 
                  ${
                    openSections.ciudad
                      ? 'rounded-t-lg border border-b-0 border-gray-300'
                      : 'rounded-lg border border-gray-300'
                  }`}
                onClick={() => toggleSection('ciudad')}
              >
                <span className="truncate">{t('city.placeholder')}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${openSections.ciudad ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {openSections.ciudad && (
                <div className="bg-white border border-t-0 border-gray-300 p-4 rounded-b-lg shadow-sm max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {CITIES.map((city) => (
                      <label
                        key={city.dbValue}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#2B31E0] transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer flex-shrink-0 text-[#2B6AE0] rounded border-gray-300 focus:ring-[#2B6AE0]"
                          checked={selectedCity === city.dbValue}
                          onChange={() => handleCityChange(city.dbValue)}
                        />
                        <span className="truncate">{city.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro: Tipo de Trabajo */}
            <div className="mb-6">
              <h3 className="text-base mb-2">{t('jobType.label')}</h3>
              <div
                className={`bg-gray-100 text-gray-500 px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center 
                  ${
                    openSections.trabajo
                      ? 'rounded-t-lg border border-b-0 border-gray-300'
                      : 'rounded-lg border border-gray-300'
                  }`}
                onClick={() => toggleSection('trabajo')}
              >
                <span className="truncate">{t('jobType.placeholder')}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${openSections.trabajo ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {openSections.trabajo && (
                <div className="bg-white border border-t-0 border-gray-300 p-4 rounded-b-lg shadow-sm max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {JOBS.map((job) => (
                      <label
                        key={job.dbValue}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#2B31E0] transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer flex-shrink-0 text-[#2B6AE0] rounded border-gray-300 focus:ring-[#2B6AE0]"
                          checked={selectedJobs.includes(job.dbValue)}
                          onChange={() => handleJobChange(job.dbValue)}
                        />
                        <span className="truncate">{job.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro: Etiquetas */}
            <div className="mb-6">
              <h3 className="text-base mb-2">{t('tags.label')}</h3>

              <div
                className={`bg-gray-100 text-gray-500 px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center 
                  ${
                    openSections.categorias
                      ? 'rounded-t-lg border border-b-0 border-gray-300'
                      : 'rounded-lg border border-gray-300'
                  }`}
                onClick={() => toggleSection('categorias')}
              >
                <span className="truncate">{t('tags.placeholder')}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${openSections.categorias ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {openSections.categorias && (
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-sm">
                  <DropdownList
                    onFilterChange={handleDropdownChange}
                    clearSignal={clearSignal}
                    searchQuery={searchQuery}
                    categoryFilters={selectedJobs}
                  />
                </div>
              )}
            </div>

            {/* Filtro: Precio */}
            <div className="mb-6">
              <h3 className="text-base mb-2">{t('price.label')}</h3>

              <div
                className={`bg-gray-100 text-gray-500 px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center 
                  ${
                    openSections.precio
                      ? 'rounded-t-lg border border-b-0 border-gray-300'
                      : 'rounded-lg border border-gray-300'
                  }`}
                onClick={() => toggleSection('precio')}
              >
                <span className="truncate">{t('price.placeholder')}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transform transition-transform duration-200 ${openSections.precio ? 'rotate-180' : 'rotate-0'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {openSections.precio && (
                <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-sm">
                  <PriceRangeList
                    onFilterChange={handlePriceRangeChange}
                    clearSignal={clearSignal}
                  />
                </div>
              )}
            </div>

            {/* Filtro de Fecha y Calificación */}
            <div className="mb-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 order-2 md:order-1 w-full md:w-auto">
                <DateFilterSelector
                  selectedFilter={selectedDateFilter}
                  selectedDate={selectedSpecificDate}
                  onChange={(f, d) => {
                    setSelectedDateFilter(f);
                    setSelectedSpecificDate(d ?? null);
                  }}
                  onCalendarToggle={setIsCalendarOpen}
                />
              </div>
              <div className="flex-shrink-0 order-1 md:order-2 w-full md:w-auto">
                <CalificacionEstrella value={selectedRating} onChange={setSelectedRating} />
              </div>
            </div>

            {/* Botones: Aplicar Búsqueda y Limpiar Datos */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <ButtonAplicarBus
                onClick={() => handleSearch(searchQuery)}
                loading={storeLoading ?? loading}
              />
              <ClearButton
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRanges([]);
                  setSelectedCity('');
                  setSelectedJobs([]);
                  setSelectedCategories([]);
                  setSelectedPriceRanges([]);
                  setTitleOnly(false);
                  setExactWords(false);
                  setResultsCount(null);
                  setSelectedDateFilter('specific');
                  setSelectedSpecificDate(null);
                  setSelectedRating(null);
                  setClearSignal((s) => s + 1);
                  try {
                    window.sessionStorage.removeItem('advSearch_state');
                    window.sessionStorage.removeItem('fromAdv');
                    window.sessionStorage.removeItem('appliedFilters');
                  } catch {
                    /* noop */
                  }
                  fetchGlobalTotal();
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default AdvancedSearchPage;
