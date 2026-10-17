// node --test
// Every Kalshi number here was checked against a real Kalshi order ticket or
// Kalshi's published schedule. The Polymarket numbers follow each venue's
// published formula and rates.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { kalshiFee, polymarketFee, polymarketUsFee, allInCents, breakEvenProbability } from './fees.js'

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)

test('Kalshi: real order tickets (2026-10-15)', () => {
  // ticket: 16.88 contracts at 25¢ → "Includes a fee of $0.23"
  assert.equal(kalshiFee(16.88, 25), 0.23)
  // ticket: 4.27 contracts at 22¢ → "Includes a fee of $0.06"
  assert.equal(kalshiFee(4.27, 22), 0.06)
})

test("Kalshi: published schedule, 100 contracts", () => {
  assert.equal(kalshiFee(100, 50), 1.75)
  assert.equal(kalshiFee(100, 10), 0.63)
  assert.equal(kalshiFee(100, 90), 0.63)
})

test('Kalshi: raw amount without rounding', () => {
  near(kalshiFee(16.88, 25, { roundUp: false }), 0.07 * 16.88 * 0.25 * 0.75)
})

test('Polymarket: 100 shares at 50¢ by category', () => {
  near(polymarketFee(100, 50, { category: 'sports' }), 1.25)
  near(polymarketFee(100, 50, { category: 'politics' }), 1.0)
  near(polymarketFee(100, 50, { category: 'crypto' }), 1.75)
  near(polymarketFee(100, 50, { category: 'geopolitics' }), 0)
})

test("Polymarket: a market's own rate wins over the category", () => {
  near(polymarketFee(100, 50, { rate: 0.03, category: 'sports' }), 0.75)
})

test('Polymarket US: 100 shares at 50¢', () => {
  near(polymarketUsFee(100, 50), 1.7375)
})

test('all-in price and break-even', () => {
  const fee = kalshiFee(100, 50) // $1.75
  near(allInCents(50, fee, 100), 51.75)
  near(breakEvenProbability(50, fee, 100), 0.5175)
})

test('bad input throws', () => {
  assert.throws(() => kalshiFee(0, 50))
  assert.throws(() => kalshiFee(10, 100))
  assert.throws(() => polymarketFee(10, 50, { category: 'nope' }))
})
