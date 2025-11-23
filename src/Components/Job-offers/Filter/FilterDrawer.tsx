'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { roboto } from '@/app/fonts';
import { validateFilters } from '@/app/lib/validations/filter.validator';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/app/redux/hooks';
import { mockJobOffers } from '@/app/lib/mock-data';
import { DB_VALUES } from '@/app/redux/contants';

interface FilterState {
  range: string[];
  city: string;
  category: string[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersApply?: (filters: FilterState) => void;
  onReset?: () => void;
}

export function FilterDrawer({ isOpen, onClose, onFiltersApply, onReset }: FilterDrawerProps) {
  const filtersFromStore = useAppSelector((state) => state.jobOfert.filters);

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    fixer: false,
    ciudad: false,
    trabajo: false,
  });

  const t = useTranslations('filtersPanel');
  const tName = useTranslations('advancedSearch.fixerName');
  const tCity = useTranslations('advancedSearch.city');
  const tJob = useTranslations('advancedSearch.jobType');

  const [selectedRanges, setSelectedRanges] = useState<string[]>(filtersFromStore.range || []);
  const [selectedCity, setSelectedCity] = useState<string>(filtersFromStore.city || '');
  const [selectedJobs, setSelectedJobs] = useState<string[]>(filtersFromStore.category || []);

  useEffect(() => {
    setSelectedRanges(filtersFromStore.range || []);
    setSelectedCity(filtersFromStore.city || '');
    setSelectedJobs(filtersFromStore.category || []);
  }, [filtersFromStore]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = 'scroll';
    } else {
      document.body.style.overflowY = 'unset';
    }
    return () => {
      document.body.style.overflowY = 'unset';
    };
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRangeChange = (dbValue: string) => {
    const newRanges = selectedRanges.includes(dbValue)
      ? selectedRanges.filter((r) => r !== dbValue)
      : [...selectedRanges, dbValue];

    setSelectedRanges(newRanges);
    applyFilters(newRanges, selectedCity, selectedJobs);
  };

  const handleCityChange = (dbValue: string) => {
    const newCity = selectedCity === dbValue ? '' : dbValue;
    setSelectedCity(newCity);
    applyFilters(selectedRanges, newCity, selectedJobs);
  };

  const handleJobChange = (dbValue: string) => {
    const newJobs = selectedJobs.includes(dbValue)
      ? selectedJobs.filter((j) => j !== dbValue)
      : [...selectedJobs, dbValue];

    setSelectedJobs(newJobs);
    applyFilters(selectedRanges, selectedCity, newJobs);
  };

  const applyFilters = (ranges: string[], city: string, jobs: string[]) => {
    const filtersToValidate = { range: ranges, city, category: jobs };
    const { isValid, data } = validateFilters(filtersToValidate);

    if (!isValid || !data) return;

    if (onFiltersApply) {
      onFiltersApply({
        ...data,
        city: data.city || '',
      });
    }
  };

  const handleReset = () => {
    setSelectedRanges([]);
    setSelectedCity('');
    setSelectedJobs([]);

    if (onReset) {
      onReset();
    } else if (onFiltersApply) {
      onFiltersApply({
        range: [],
        city: '',
        category: [],
      });
    }
  };

  const nameRanges = [
    [
      { dbValue: DB_VALUES.ranges[0], label: tName('ranges.ac') },
      { dbValue: DB_VALUES.ranges[1], label: tName('ranges.df') },
      { dbValue: DB_VALUES.ranges[2], label: tName('ranges.gi') },
      { dbValue: DB_VALUES.ranges[3], label: tName('ranges.jl') },
      { dbValue: DB_VALUES.ranges[4], label: tName('ranges.mn') },
    ],
    [
      { dbValue: DB_VALUES.ranges[5], label: tName('ranges.oq') },
      { dbValue: DB_VALUES.ranges[6], label: tName('ranges.rt') },
      { dbValue: DB_VALUES.ranges[7], label: tName('ranges.uw') },
      { dbValue: DB_VALUES.ranges[8], label: tName('ranges.xz') },
    ],
  ];

  // Flatten the name ranges into a single list to render as a vertical list
  const nameOptions = nameRanges.flat();

  // Compute demo counts from local mock data (frontend-only visual counts)
  const demoCounts = useMemo(() => {
    const cities: Record<string, number> = {};
    const jobTypes: Record<string, number> = {};
    const ranges: Record<string, number> = {};

    // init keys
    DB_VALUES.cities.forEach((c) => (cities[c] = 0));
    DB_VALUES.jobTypes.forEach((j) => (jobTypes[j] = 0));
    DB_VALUES.ranges.forEach((r) => (ranges[r] = 0));

    const letterToRangeIndex = (letter: string) => {
      const l = letter.toUpperCase();
      if ('A' <= l && l <= 'C') return 0;
      if ('D' <= l && l <= 'F') return 1;
      if ('G' <= l && l <= 'I') return 2;
      if ('J' <= l && l <= 'L') return 3;
      if ('M' <= l && l <= 'Ñ') return 4;
      if ('O' <= l && l <= 'Q') return 5;
      if ('R' <= l && l <= 'T') return 6;
      if ('U' <= l && l <= 'W') return 7;
      return 8; // X-Z and others
    };

    for (const o of mockJobOffers) {
      // cities
      if (o.city && cities[o.city] !== undefined) cities[o.city]++;

      // job types: match by presence in services, tags or title (case-insensitive)
      const haystack = `${(o.services || []).join(' ')} ${(o.tags || []).join(' ')} ${o.title || ''}`.toLowerCase();
      DB_VALUES.jobTypes.forEach((jt) => {
        if (haystack.includes(jt.toLowerCase())) {
          jobTypes[jt] = (jobTypes[jt] || 0) + 1;
        }
      });

      // ranges: use fixerName first letter
      const first = o.fixerName ? o.fixerName.trim().charAt(0) : '';
      if (first) {
        const idx = letterToRangeIndex(first);
        const key = DB_VALUES.ranges[idx] || DB_VALUES.ranges[DB_VALUES.ranges.length - 1];
        ranges[key] = (ranges[key] || 0) + 1;
      }
    }

    return { cities, jobTypes, ranges } as {
      cities: Record<string, number>;
      jobTypes: Record<string, number>;
      ranges: Record<string, number>;
    };
  }, []);

  const cities = DB_VALUES.cities.map((dbValue, index) => ({
    dbValue,
    label: tCity(
      `options.${['beni', 'chuquisaca', 'cochabamba', 'laPaz', 'oruro', 'pando', 'potosi', 'santaCruz', 'tarija'][index]}`,
    ),
  }));

  const jobTypes = DB_VALUES.jobTypes.map((dbValue, index) => ({
    dbValue,
    label: tJob(
      `options.${['mason', 'carpenter', 'locksmith', 'decorator', 'electrician', 'plumber', 'fumigator', 'installer', 'gardener', 'cleaner', 'mechanic', 'assembler', 'painter', 'polisher', 'welder', 'roofer', 'glazier', 'plasterer'][index]}`,
    ),
  }));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black duration-300 z-40 ${
          isOpen ? 'opacity-0' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`${roboto.variable} font-sans fixed top-0 left-0 h-full w-full max-w-[265px] md:w-63 md:max-w-none bg-white shadow-xl z-80 transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>

        <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-base sm:text-lg font-bold">{t('filters')}</h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="bg-[#2B6AE0] text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2B31E0] transition-colors"
              >
                {t('resetButton.desktop')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Filtro: Nombre de Fixer */}
            <div className="mb-6">
              <div
                className="bg-[#2B6AE0] text-white px-4 py-2 text-sm font-semibold mb-3 cursor-pointer hover:bg-[#2B31E0] rounded-none transition-colors"
                onClick={() => toggleSection('fixer')}
              >
                <span className="truncate">{t('fixerName')}</span>
              </div>
              {openSections.fixer && (
                <div className="bg-white border border-gray-200 p-4 rounded max-h-[130px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {nameOptions.map((range) => {
                      const count = demoCounts.ranges?.[range.dbValue] ?? 0;
                      const disabled = count === 0;
                      return (
                        <label
                          key={range.dbValue}
                          className={`flex items-center justify-between gap-2 text-xs min-w-0 transition-colors ${
                            disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:text-[#2B31E0]'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${disabled ? 'pointer-events-none' : ''}`}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer flex-shrink-0"
                              checked={selectedRanges.includes(range.dbValue)}
                              onChange={() => handleRangeChange(range.dbValue)}
                              disabled={disabled}
                            />
                            <span className="truncate">{range.label}</span>
                          </div>
                          <span className={`${count > 0 ? 'text-[#2B6AE0]' : 'text-gray-400'} text-xs`}>({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro: Ciudad */}
            <div className="mb-6">
              <div
                className="bg-[#2B6AE0] text-white px-4 py-2 text-sm font-semibold mb-3 cursor-pointer hover:bg-[#2B31E0] rounded-none transition-colors"
                onClick={() => toggleSection('ciudad')}
              >
                <span className="truncate">{t('city')}</span>
              </div>
              {openSections.ciudad && (
                <div className="bg-white border border-gray-200 p-4 rounded max-h-[130px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {cities.map((city) => {
                      const count = demoCounts.cities?.[city.dbValue] ?? 0;
                      const disabled = count === 0;
                      return (
                        <label
                          key={city.dbValue}
                          className={`flex items-center justify-between gap-2 text-xs min-w-0 transition-colors ${
                            disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:text-[#2B31E0]'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${disabled ? 'pointer-events-none' : ''}`}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer flex-shrink-0"
                              checked={selectedCity === city.dbValue}
                              onChange={() => handleCityChange(city.dbValue)}
                              disabled={disabled}
                            />
                            <span className="truncate">{city.label}</span>
                          </div>
                          <span className={`${count > 0 ? 'text-[#2B6AE0]' : 'text-gray-400'} text-xs`}>({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro: Tipo de Trabajo */}
            <div className="mb-6">
              <div
                className="bg-[#2B6AE0] text-white px-4 py-2 text-sm font-semibold mb-3 cursor-pointer hover:bg-[#2B31E0] rounded-none transition-colors"
                onClick={() => toggleSection('trabajo')}
              >
                <span className="truncate">{t('jobCategory')}</span>
              </div>
              {openSections.trabajo && (
                <div className="bg-white border border-gray-200 p-4 rounded max-h-[130px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {jobTypes.map((job) => {
                      const count = demoCounts.jobTypes?.[job.dbValue] ?? 0;
                      const disabled = count === 0;
                      return (
                        <label
                          key={job.dbValue}
                          className={`flex items-center justify-between gap-2 text-xs min-w-0 transition-colors ${
                            disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:text-[#2B31E0]'
                          }`}
                        >
                          <div className={`flex items-center gap-2 ${disabled ? 'pointer-events-none' : ''}`}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 cursor-pointer flex-shrink-0"
                              checked={selectedJobs.includes(job.dbValue)}
                              onChange={() => handleJobChange(job.dbValue)}
                              disabled={disabled}
                            />
                            <span className="truncate">{job.label}</span>
                          </div>
                          <span className={`${count > 0 ? 'text-[#2B6AE0]' : 'text-gray-400'} text-xs`}>({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
