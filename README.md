# prediction-market-fees

Trading fees on Kalshi, Polymarket and Polymarket US, as plain JavaScript with no dependencies.

All three venues charge the same shape of taker fee:

```
fee = rate × contracts × p × (1 − p)
```

`p` is the price as a fraction of $1, so a 50¢ contract is `p = 0.50`. The fee is biggest at 50¢ and shrinks toward 0¢ and 100¢. What differs between venues is the rate.

## The rates (checked 2026-10-15)

| Venue | Rate | Fee on 100 contracts at 50¢ |
|---|---|---|
| Kalshi | 0.07 on most markets | $1.75 |
| Polymarket, sports | 0.05 | $1.25 |
| Polymarket, politics | 0.04 | $1.00 |
| Polymarket, crypto | 0.07 | $1.75 |
| Polymarket, geopolitics | 0 on most markets | $0.00 |
| Polymarket US | 0.0695 on every market | $1.74 |

A few things worth knowing:

- **These are taker fees**, what you pay when you buy at the ask. Polymarket charges makers (resting limit orders) nothing, Polymarket US pays makers a small rebate, and Kalshi charges resting orders nothing on most markets.
- **Polymarket sets the rate per market** when it lists it and keeps older listings on their original rate. A sports market listed in the spring can still carry 3%. If you have the market, use its own `feeSchedule.rate` from the Gamma API.
- **Kalshi rounds the fee up to the next cent** on its order ticket. A few markets carry different fees; the order ticket shows the real one.
- **Polymarket US is a separate exchange** from Polymarket international, with its own accounts and one fee rate for everything.

## Usage

```js
import { kalshiFee, polymarketFee, polymarketUsFee, allInCents } from './fees.js'

kalshiFee(100, 50)                                // 1.75
polymarketFee(100, 50, { category: 'politics' })  // 1.00
polymarketFee(100, 50, { rate: 0.03 })            // 0.75, using the market's own rate
polymarketUsFee(100, 50)                          // 1.7375

// What a 50¢ Kalshi contract really costs, fee included
allInCents(50, kalshiFee(100, 50), 100)          // 51.75
```

## Worked example

You buy 100 contracts at 50¢ on Kalshi.

- Cost: 100 × $0.50 = $50.00
- Fee: 0.07 × 100 × 0.50 × 0.50 = $1.75
- All-in: $51.75, or 51.75¢ a contract

So the bet only pays off if it wins more than 51.75% of the time, not 50%. The same trade on a Polymarket politics market costs $51.00 all-in.

## Checked against

- Two real Kalshi order tickets on 2026-10-15: 16.88 contracts at 25¢ showed a $0.23 fee, and 4.27 contracts at 22¢ showed $0.06. Both match `kalshiFee` with the round-up.
- Kalshi's published schedule: $1.75 per 100 contracts at 50¢, $0.63 at 10¢ and at 90¢.
- Polymarket's rates as served on live markets (`feeSchedule.rate`), and Polymarket US's `feeCoefficient`.

Run the tests with `node --test`.

## Sources

- Kalshi fee schedule: https://kalshi.com/docs/kalshi-fee-schedule.pdf
- Polymarket fees: https://docs.polymarket.com
- Polymarket US fees: https://docs.polymarket.us/fees

There's an interactive version at [thinblimp.com/tools/fee-calculator](https://thinblimp.com/tools/fee-calculator).

## License

MIT
