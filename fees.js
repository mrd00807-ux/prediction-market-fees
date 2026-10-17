// Trading fees on Kalshi, Polymarket and Polymarket US.
//
// All three venues use the same shape of taker fee:
//
//   fee = rate × contracts × p × (1 − p)
//
// where p is the price as a fraction of $1 (0.50 for a 50¢ contract). The fee is
// largest at 50¢ and shrinks toward 0¢ and 100¢. What differs is the rate.
//
// Rates checked against each venue on 2026-10-15. Venues change their schedules,
// so check the market's own page before relying on a number here.

/** Kalshi's published taker rate for most markets. */
export const KALSHI_TAKER_RATE = 0.07

/**
 * Polymarket (international) taker rates by category. Polymarket sets the rate on
 * each market when it lists it and keeps older listings on their original rate,
 * so a market's own `feeSchedule.rate` (Gamma API) always wins over this table.
 * These are the rates on markets listed recently.
 */
export const POLYMARKET_RATES = {
  sports: 0.05,
  politics: 0.04,
  crypto: 0.07,
  finance: 0.04,
  tech: 0.04,
  economics: 0.05,
  culture: 0.05,
  weather: 0.05,
  geopolitics: 0, // most are fee-free; one with fees switched on charges 0.04, so pass its own rate
}

/** Polymarket US uses one coefficient for every market. */
export const POLYMARKET_US_RATE = 0.0695

const roundUpToCent = (usd) => Math.ceil(Math.round(usd * 1e8) / 1e6) / 100

function check(contracts, priceCents) {
  if (!(contracts > 0)) throw new RangeError('contracts must be > 0')
  if (!(priceCents > 0 && priceCents < 100)) throw new RangeError('priceCents must be between 0 and 100')
}

/**
 * Kalshi taker fee in dollars.
 * Kalshi's order ticket rounds the fee up to the next cent (16.88 contracts at 25¢
 * shows $0.23, from a raw $0.2216). Pass { roundUp: false } for the raw amount.
 */
export function kalshiFee(contracts, priceCents, { rate = KALSHI_TAKER_RATE, roundUp = true } = {}) {
  check(contracts, priceCents)
  const p = priceCents / 100
  const raw = rate * contracts * p * (1 - p)
  return roundUp ? roundUpToCent(raw) : raw
}

/**
 * Polymarket (international) taker fee in dollars.
 * Pass the market's own rate if you have it; otherwise a category from POLYMARKET_RATES.
 * Makers (resting limit orders) are not charged on Polymarket.
 */
export function polymarketFee(shares, priceCents, { rate, category = 'sports' } = {}) {
  check(shares, priceCents)
  const r = rate ?? POLYMARKET_RATES[category]
  if (r === undefined) throw new RangeError(`unknown category "${category}"; pass { rate } instead`)
  const p = priceCents / 100
  return r * shares * p * (1 - p)
}

/** Polymarket US taker fee in dollars. */
export function polymarketUsFee(shares, priceCents, { rate = POLYMARKET_US_RATE } = {}) {
  check(shares, priceCents)
  const p = priceCents / 100
  return rate * shares * p * (1 - p)
}

/**
 * All-in price per contract in cents, fee included. This is the price a bet has
 * to beat: buying at 50¢ on Kalshi really costs 51.75¢ a contract.
 */
export function allInCents(priceCents, feeDollars, contracts) {
  return priceCents + (feeDollars / contracts) * 100
}

/**
 * The win probability you need for a trade to break even after the fee.
 * Same number as allInCents, read as a percentage.
 */
export function breakEvenProbability(priceCents, feeDollars, contracts) {
  return allInCents(priceCents, feeDollars, contracts) / 100
}
