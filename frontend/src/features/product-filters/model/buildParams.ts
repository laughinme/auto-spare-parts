import type { FilterState } from "./types"
import type { CatalogParams } from "@/entities/product/api"

const DEFAULT_LIMIT = 20

const stripEmpty = (o: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

export function buildParams(state: FilterState): CatalogParams {
  const q = state.q?.trim()

  const toNumOrNull = (v: unknown) =>
    v === "" || v === null || v === undefined ? null : Number(v)

  let priceMin = toNumOrNull(state.price_min)
  let priceMax = toNumOrNull(state.price_max)

  if (Number.isNaN(priceMin)) priceMin = null
  if (Number.isNaN(priceMax)) priceMax = null

  if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
    ;[priceMin, priceMax] = [priceMax, priceMin]
  }

  const params: CatalogParams = {
    q: q ? q : null,
    make_id: state.make_id ?? null,
    condition: state.condition ?? null,
    originality: state.originality ?? null,
    price_min: priceMin,
    price_max: priceMax,
    limit: DEFAULT_LIMIT,
  }

  return stripEmpty(params) as CatalogParams
}
