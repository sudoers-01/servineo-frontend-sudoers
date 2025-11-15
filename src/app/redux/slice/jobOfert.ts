import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, ApiResponse } from '@/app/lib/api';
import { JOBOFERT_ALLOWED_LIMITS } from '../../lib/validations/pagination.validator';

export interface OfferData {
  _id: string;
  fixerId: string;
  fixerName: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  city: string;
  contactPhone: string;
  createdAt: string;
  rating: number;
}

interface OfferResponse {
  total: number;
  count: number;
  data: OfferData[];
  currentPage?: number;
}

interface PaginationState {
  paginaActual: number;
  registrosPorPagina: number;
  totalRegistros: number;
  totalPages: number;
}

interface FetchOffersResult {
  listKey: string;
  data: OfferData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  requestedPage: number;
  isInitialSearch?: boolean;
}

export interface FilterState {
  range: string[];
  city: string;
  category: string[];
  tags?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
}

interface JobOffersState {
  trabajos: OfferData[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  sortBy: string;
  search: string;
  date?: string | null;
  rating?: number | null;
  titleOnly?: boolean;
  exact?: boolean;
  paginaActual: number;
  registrosPorPagina: number;
  totalRegistros: number;
  preservedTotalRegistros: number;
  totalPages: number;
  paginaciones: Record<string, PaginationState>;
  shouldPersist: boolean; // Nueva flag para controlar persistencia
}

const STORAGE_KEYS = {
  PAGE: 'jobOffers_paginaActual',
  PAGE_SIZE: 'jobOffers_registrosPorPagina',
  SEARCH: 'jobOffers_search',
  FILTERS: 'jobOffers_filters',
  SORT: 'jobOffers_sortBy',
} as const;

// Helper para leer localStorage de forma segura
const getStoredValue = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Helper para guardar en localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }
};

// Helper para limpiar TODO el localStorage relacionado
export const clearJobOffersStorage = (): void => {
  if (typeof window !== 'undefined') {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Estado inicial con valores por defecto (sin localStorage en inicio)
const getDefaultState = (): JobOffersState => ({
  trabajos: [],
  loading: true,
  error: null,
  filters: {
    range: [],
    city: '',
    category: [],
  },
  sortBy: 'recent',
  search: '',
  date: null,
  rating: null,
  titleOnly: false,
  exact: false,
  paginaActual: 1,
  registrosPorPagina: 10,
  totalRegistros: 0,
  preservedTotalRegistros: 0,
  totalPages: 0,
  paginaciones: {
    offers: {
      paginaActual: 1,
      registrosPorPagina: 10,
      totalRegistros: 0,
      totalPages: 0,
    },
  },
  shouldPersist: true,
});

const initialState: JobOffersState = getDefaultState();

interface FetchOffersParams {
  searchText: string;
  filters: FilterState;
  sortBy: string;
  page: number;
  limit: number;
  titleOnly?: boolean;
  exact?: boolean;
  date?: string;
  rating?: number;
  listKey?: string;
  isInitialSearch?: boolean;
}

export const fetchOffers = createAsyncThunk<FetchOffersResult, FetchOffersParams>(
  'jobOffers/fetchOffers',
  async (params, { rejectWithValue }) => {
    try {
      if (!JOBOFERT_ALLOWED_LIMITS.includes(params.limit)) {
        return rejectWithValue(
          `Límite no permitido. Valores permitidos: ${JOBOFERT_ALLOWED_LIMITS.join(', ')}`,
        );
      }

      const urlParams = new URLSearchParams();

      if (params.searchText.trim()) {
        urlParams.append('search', params.searchText);
      }

      if (params.filters.range && params.filters.range.length > 0) {
        params.filters.range.forEach((r) => {
          urlParams.append('range', r);
        });
      }
      if (params.filters.city) {
        urlParams.append('city', params.filters.city);
      }
      if (params.filters.category && params.filters.category.length > 0) {
        params.filters.category.forEach((c) => {
          urlParams.append('category', c);
        });
      }

      if (params.sortBy) {
        urlParams.append('sortBy', params.sortBy);
      }

      if (params.date) {
        urlParams.append('date', params.date);
      }

      if (params.rating != null) {
        urlParams.append('rating', String(params.rating));
      }

      if (params.titleOnly) {
        urlParams.append('titleOnly', 'true');
      }
      if (params.exact) {
        urlParams.append('exact', 'true');
      }

      if (params.filters.tags && params.filters.tags.length) {
        urlParams.append('tags', params.filters.tags.join(','));
      }
      if (params.filters.minPrice != null) {
        urlParams.append('minPrice', String(params.filters.minPrice));
      }
      if (params.filters.maxPrice != null) {
        urlParams.append('maxPrice', String(params.filters.maxPrice));
      }

      urlParams.append('page', params.page.toString());
      urlParams.append('limit', params.limit.toString());

      const url = `/api/devmaster/offers?${urlParams.toString()}`;
      const response: ApiResponse<OfferResponse> = await api.get(url);

      if (response.success && response.data) {
        const totalPages = Math.ceil(response.data.total / params.limit) || 1;
        const key = params.listKey || 'offers';
        
        console.warn(`Cantidad de trabajos cargados: ${response.data.data.length}`);
        
        return {
          listKey: key,
          data: response.data.data,
          total: response.data.total,
          page: params.page,
          limit: params.limit,
          totalPages: totalPages,
          requestedPage: params.page,
          isInitialSearch: params.isInitialSearch,
        };
      } else {
        return rejectWithValue(response.error || 'Error al cargar las ofertas');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      return rejectWithValue(errorMsg);
    }
  },
);

const jobOffersSlice = createSlice({
  name: 'jobOffers',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.SEARCH, action.payload);
      }
    },

    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.filters = action.payload;
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.FILTERS, action.payload);
      }
    },

    setTitleOnly: (state, action: PayloadAction<boolean>) => {
      state.titleOnly = action.payload;
    },

    setExact: (state, action: PayloadAction<boolean>) => {
      state.exact = action.payload;
    },

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.SORT, action.payload);
      }
    },

    setDate: (state, action: PayloadAction<string | null>) => {
      state.date = action.payload;
    },

    setRating: (state, action: PayloadAction<number | null>) => {
      state.rating = action.payload;
    },

    setRegistrosPorPagina: (state, action: PayloadAction<number>) => {
      if (!JOBOFERT_ALLOWED_LIMITS.includes(action.payload)) {
        return;
      }

      state.registrosPorPagina = action.payload;
      state.paginaActual = 1;
      
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.PAGE_SIZE, action.payload);
        saveToStorage(STORAGE_KEYS.PAGE, 1);
      }

      if (!state.paginaciones['offers']) {
        state.paginaciones['offers'] = {
          paginaActual: 1,
          registrosPorPagina: action.payload,
          totalRegistros: 0,
          totalPages: 0,
        };
      } else {
        state.paginaciones['offers'].registrosPorPagina = action.payload;
        state.paginaciones['offers'].paginaActual = 1;
      }
    },

    setPaginaActual: (state, action: PayloadAction<number>) => {
      state.paginaActual = action.payload;
      
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.PAGE, action.payload);
      }

      if (!state.paginaciones['offers']) {
        state.paginaciones['offers'] = {
          paginaActual: action.payload,
          registrosPorPagina: state.registrosPorPagina,
          totalRegistros: 0,
          totalPages: 0,
        };
      } else {
        state.paginaciones['offers'].paginaActual = action.payload;
      }
    },

    // Nueva acción para limpiar completamente sin guardar
    resetFilters: (state) => {
      const defaultState = getDefaultState();
      state.filters = defaultState.filters;
      state.sortBy = defaultState.sortBy;
      state.search = defaultState.search;
      state.paginaActual = 1;
      state.preservedTotalRegistros = 0;
      state.shouldPersist = false; // Desactivar persistencia temporalmente

      // Limpiar localStorage explícitamente
      clearJobOffersStorage();

      if (!state.paginaciones['offers']) {
        state.paginaciones['offers'] = {
          paginaActual: 1,
          registrosPorPagina: state.registrosPorPagina,
          totalRegistros: 0,
          totalPages: 0,
        };
      } else {
        state.paginaciones['offers'].paginaActual = 1;
      }
    },

    // Nueva acción para reactivar persistencia
    enablePersistence: (state) => {
      state.shouldPersist = true;
    },

    resetPagination: (state) => {
      state.paginaActual = 1;
      
      if (state.shouldPersist) {
        saveToStorage(STORAGE_KEYS.PAGE, 1);
      }

      if (!state.paginaciones['offers']) {
        state.paginaciones['offers'] = {
          paginaActual: 1,
          registrosPorPagina: state.registrosPorPagina,
          totalRegistros: 0,
          totalPages: 0,
        };
      } else {
        state.paginaciones['offers'].paginaActual = 1;
      }
    },

    restoreSavedState: (state) => {
      // Restaurar desde localStorage
      state.search = getStoredValue(STORAGE_KEYS.SEARCH, '');
      state.filters = getStoredValue(STORAGE_KEYS.FILTERS, { range: [], city: '', category: [] });
      state.sortBy = getStoredValue(STORAGE_KEYS.SORT, 'recent');
      state.paginaActual = getStoredValue(STORAGE_KEYS.PAGE, 1);
      state.registrosPorPagina = getStoredValue(STORAGE_KEYS.PAGE_SIZE, 10);
      state.shouldPersist = true; 

      if (!state.paginaciones['offers']) {
        state.paginaciones['offers'] = {
          paginaActual: state.paginaActual,
          registrosPorPagina: state.registrosPorPagina,
          totalRegistros: 0,
          totalPages: 0,
        };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as FetchOffersResult;
        const key = payload.listKey || 'offers';

        if (payload.page < 1) {
          state.error = `La página ${payload.page} no es válida. Debe ser mayor o igual a 1.`;
          state.paginaActual = 1;
          if (state.shouldPersist) {
            saveToStorage(STORAGE_KEYS.PAGE, 1);
          }
          return;
        }

        if (!state.paginaciones[key]) {
          state.paginaciones[key] = {
            paginaActual: 1,
            registrosPorPagina: 10,
            totalRegistros: 0,
            totalPages: 0,
          };
        }

        state.trabajos = payload.data;

        state.paginaciones[key].paginaActual = payload.page;
        state.paginaciones[key].registrosPorPagina = payload.limit;
        state.paginaciones[key].totalRegistros = payload.total;
        state.paginaciones[key].totalPages = payload.totalPages;

        if (payload.page === 1 && payload.isInitialSearch) {
          state.preservedTotalRegistros = payload.total;
        }
        const totalToUse = state.preservedTotalRegistros > 0 ? state.preservedTotalRegistros : payload.total;

        state.paginaActual = state.paginaciones[key].paginaActual;
        state.registrosPorPagina = state.paginaciones[key].registrosPorPagina;
        state.totalRegistros = totalToUse;
        state.totalPages = state.paginaciones[key].totalPages;

        if (state.shouldPersist) {
          saveToStorage(STORAGE_KEYS.PAGE, state.paginaActual);
        }

        if (
          action.payload.requestedPage > action.payload.totalPages &&
          action.payload.totalPages > 0
        ) {
          state.error = `Página ${action.payload.requestedPage} no existe. Total de páginas: ${action.payload.totalPages}. Ajustando a página 1.`;
          state.paginaActual = 1;
          if (state.shouldPersist) {
            saveToStorage(STORAGE_KEYS.PAGE, 1);
          }
        } else {
          state.error = null;
        }
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Error desconocido';
        state.trabajos = [];
      });
  },
});

export const {
  setSearch,
  setFilters,
  setTitleOnly,
  setExact,
  setSortBy,
  setDate,
  setRating,
  setRegistrosPorPagina,
  setPaginaActual,
  resetFilters,
  enablePersistence,
  resetPagination,
  restoreSavedState,
} = jobOffersSlice.actions;

export const selectPaginationByKey = (
  state: { jobOffers: JobOffersState },
  key: string = 'offers',
): PaginationState => {
  return (
    state.jobOffers.paginaciones[key] ?? {
      paginaActual: 1,
      registrosPorPagina: 10,
      totalRegistros: 0,
      totalPages: 0,
    }
  );
};

export default jobOffersSlice.reducer;