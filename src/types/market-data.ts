import type { DataSourceMeta } from '../indicator/types.js'

export type AssetClass = 'equity' | 'crypto' | 'forex' | 'commodity' | 'index'

export interface Bar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface GetBarsOpts {
  interval?: string
  count?: number
  from?: string
  to?: string
}

export interface BarsResult {
  bars: Bar[]
  meta: DataSourceMeta & {
    barId?: string
    provider?: string
    barCapability?: string
  }
}

export interface BarService {
  searchBarSources?: (query: string) => Promise<unknown[]>
  getBars: (ref: unknown, opts: GetBarsOpts) => Promise<BarsResult>
}
