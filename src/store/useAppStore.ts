// ============================================================
// YieldPulse — Zustand Global Store
// Manages: filters, view mode, compare selection, UI state
// ============================================================

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Alert,
  AlertHistoryEntry,
  CompareSelection,
  FilterState,
  MinTvlOption,
  SortDirection,
  SortField,
  TrackedWallet,
  ViewMode,
  WatchlistEntry,
} from "@/types"
import { DEFAULT_MIN_TVL, LS_KEYS } from "@/lib/constants"

// ------ Defaults ------

const DEFAULT_FILTERS: FilterState = {
  chains: [],
  protocols: [],
  tokenSearch: "",
  stablecoinOnly: false,
  singleExposureOnly: false,
  apyMin: 0,
  apyMax: 300,
  minTvl: DEFAULT_MIN_TVL,
  excludeOutliers: true,
  search: "",
}

// ------ Store Types ------

interface SortState {
  field: SortField
  direction: SortDirection
}

interface AppState {
  // Filters
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void

  // Sort
  sort: SortState
  setSort: (field: SortField) => void

  // View mode
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Compare selection (up to 4 pool UUIDs)
  compareSelection: CompareSelection
  addToCompare: (poolId: string) => void
  removeFromCompare: (poolId: string) => void
  clearCompare: () => void

  // Watchlist
  watchlist: WatchlistEntry[]
  addToWatchlist: (poolId: string) => void
  removeFromWatchlist: (poolId: string) => void
  isWatchlisted: (poolId: string) => boolean

  // Alerts CRUD
  alerts: Alert[]
  addAlert: (alert: Alert) => void
  updateAlert: (id: string, patch: Partial<Omit<Alert, "id">>) => void
  removeAlert: (id: string) => void
  toggleAlert: (id: string) => void

  // Alert history (last 50)
  alertHistory: AlertHistoryEntry[]
  addAlertHistory: (entry: AlertHistoryEntry) => void
  clearAlertHistory: () => void

  // Global search
  globalSearch: string
  setGlobalSearch: (q: string) => void

  // Last data refresh timestamp
  lastRefreshedAt: number | null
  setLastRefreshedAt: (ts: number) => void

  // Wallets
  wallets: TrackedWallet[]
  addWallet: (wallet: TrackedWallet) => void
  removeWallet: (id: string) => void
  updateWallet: (id: string, patch: Partial<Omit<TrackedWallet, "id">>) => void
}

// ------ Store Implementation ------

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Filters ─────────────────────────────────────────────
      filters: DEFAULT_FILTERS,
      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // ── Sort ────────────────────────────────────────────────
      sort: { field: "apy", direction: "desc" },
      setSort: (field) =>
        set((state) => ({
          sort: {
            field,
            direction:
              state.sort.field === field && state.sort.direction === "desc"
                ? "asc"
                : "desc",
          },
        })),

      // ── View mode ───────────────────────────────────────────
      viewMode: "table",
      setViewMode: (mode) => set({ viewMode: mode }),

      // ── Compare ─────────────────────────────────────────────
      compareSelection: [],
      addToCompare: (poolId) =>
        set((state) => {
          if (state.compareSelection.includes(poolId) || state.compareSelection.length >= 4)
            return state
          return { compareSelection: [...state.compareSelection, poolId] }
        }),
      removeFromCompare: (poolId) =>
        set((state) => ({
          compareSelection: state.compareSelection.filter((id) => id !== poolId),
        })),
      clearCompare: () => set({ compareSelection: [] }),

      // ── Watchlist ────────────────────────────────────────────
      watchlist: [],
      addToWatchlist: (poolId) =>
        set((state) => {
          if (state.watchlist.includes(poolId)) return state
          return { watchlist: [...state.watchlist, poolId] }
        }),
      removeFromWatchlist: (poolId) =>
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== poolId),
        })),
      isWatchlisted: (poolId) => get().watchlist.includes(poolId),

      // ── Alerts ───────────────────────────────────────────────
      alerts: [],
      addAlert: (alert) =>
        set((state) => ({ alerts: [alert, ...state.alerts] })),
      updateAlert: (id, patch) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAlert: (id) =>
        set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      // ── Alert history ────────────────────────────────────────
      alertHistory: [],
      addAlertHistory: (entry) =>
        set((state) => ({
          alertHistory: [entry, ...state.alertHistory].slice(0, 50),
        })),
      clearAlertHistory: () => set({ alertHistory: [] }),

      // ── Global search ────────────────────────────────────────
      globalSearch: "",
      setGlobalSearch: (q) => set({ globalSearch: q }),

      // ── Refresh timestamp ────────────────────────────────────
      lastRefreshedAt: null,
      setLastRefreshedAt: (ts) => set({ lastRefreshedAt: ts }),

      // ── Wallets ──────────────────────────────────────────────
      wallets: [],
      addWallet: (wallet) =>
        set((state) => ({ wallets: [...state.wallets, wallet] })),
      removeWallet: (id) =>
        set((state) => ({ wallets: state.wallets.filter((w) => w.id !== id) })),
      updateWallet: (id, patch) =>
        set((state) => ({
          wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
        })),
    }),
    {
      name: LS_KEYS.filters,
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
        watchlist: state.watchlist,
        alerts: state.alerts,
        alertHistory: state.alertHistory,
        wallets: state.wallets,
      }),
    }
  )
)

// ------ Selectors ------

export const selectFilters = (state: AppState) => state.filters
export const selectSort = (state: AppState) => state.sort
export const selectViewMode = (state: AppState) => state.viewMode
export const selectCompare = (state: AppState) => state.compareSelection
export const selectWatchlist = (state: AppState) => state.watchlist
export const selectAlerts = (state: AppState) => state.alerts
export const selectAlertHistory = (state: AppState) => state.alertHistory

export const selectIsInCompare =
  (poolId: string) => (state: AppState) =>
    state.compareSelection.includes(poolId)
