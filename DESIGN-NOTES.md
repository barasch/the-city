# The City — version-three rules

This is the rules contract for the deterministic browser game. Numeric constants
live in `src/game/engine.ts`; later playtesting may tune them without changing
the version-three state model.

## Run, interface, and settlement

- A run lasts 30 game days. Jet, Lay low, clinic treatment, and plastic surgery
  advance the clock.
- The game uses one main column. The market is a compact passive price list with
  global Buy and Sell controls. Jet and Stay local are the two city actions.
- Stay local opens one menu containing Lay low everywhere, the fixed services
  in the current borough, developed contacts, and Bank and Loan shark at home.
- Day 30 replaces Jet with Settle up but keeps Stay local. Zero-day banking,
  loan, market, fence, coat, gun, and storage actions remain usable; services
  that would overrun Day 30 are unavailable.
- Final net worth is cash + bank − debt. Carried and stored stock contributes
  nothing unless sold before settlement.
- Scores retain runner name, completion date, day, net worth, home borough, and
  lifetime police kills.

## Identity and persistence

- The runner name is stored separately from an active run. Blank names normalize
  to Runner.
- Active saves use schema version 3. Version-one and version-two runs, plus the
  obsolete pooled-storage version-three draft, are invalidated because their
  price, heat, storage, gun, and enforcement models are incompatible. Runner
  names and completed scores survive.
- The seeded engine remains independent of React so a future score service can
  replay actions instead of trusting a browser-calculated score.

## Products and markets

| Product | Long-run average |
| ------- | ---------------: |
| Pills   |             $100 |
| Speed   |             $200 |
| Green   |           $1,000 |
| Peyote  |           $1,000 |
| Hash    |           $2,000 |
| Shrooms |           $3,000 |
| Meth    |           $5,000 |
| Opioids |           $8,000 |
| Acid    |          $13,000 |
| Molly   |          $21,000 |
| Coke    |          $34,000 |
| Heroin  |          $55,000 |

The underlying values are calibrated so that daily noise, durable borough bias,
sparse listings, gluts, and shortages produce these event-inclusive long-run
averages. There is no market-depth limit and no $100,000 price ceiling.

Each of the five products from Opioids through Heroin has one fixed, undisclosed
natural borough. In that borough its normal prices skew cheapest, its listing
chance is 95%, and a one-day glut is generated on approximately 25% of days the
player is present. The pairing is deliberately absent from game views and
player-facing rules; repeated observation is how a player discovers it. Other
products continue to receive less frequent multi-day gluts and shortages.

The observations matrix places products on rows and boroughs on columns. Each
borough header reports visits and last observation day; each price reports its
own observation day.

## Coat and storage

The player begins with 10 coat spaces. Queens sells only the next larger coat:

| Capacity |  Price |
| -------: | -----: |
|       21 | $1,000 |
|       34 | $2,000 |
|       55 | $3,000 |
|       89 | $5,000 |

Brooklyn, Queens, and Staten Island each have an independent storage location:

- A player must physically visit a location to rent there.
- Up to three distinct units may be rented at each location. Each unit holds at
  most 200 units of exactly one product type; capacity is never pooled.
- Each unit costs $200 immediately and $200 on every subsequent game day.
- If rent cannot be taken from cash, the location becomes late. The next clock
  tick either takes the full current daily rent and cures the account or
  forfeits every unit and all stock there. Units cannot be added or released
  while late.
- A unit contract may be ended manually only when that exact unit is empty.

Once a location has been rented, the market can trade directly with it:

| Market action                  | Effective unit price |
| ------------------------------ | -------------------: |
| Buy into coat                  |                 100% |
| Buy into same-borough storage  |                 120% |
| Buy into remote storage        |                 140% |
| Sell from coat                 |                 100% |
| Sell from same-borough storage |                  70% |
| Sell from remote storage       |                  50% |

Each direct storage purchase targets one selected compatible unit, never splits
between units, and is bounded by 200 units or that unit's remaining capacity.
A direct storage sale always sells the entire selected unit and ends its
contract; it is unavailable unless that product is listed in the current
market. Coat sales may still sell any chosen quantity and also require a current
listing.

Moving stock between coat and storage is possible only while physically at that
storage location. Transfers remain zero-day and may be repeated without a visit
limit, always subject to coat and selected-unit capacity. This intentionally
allows a player to move successive coatloads into or out of storage instead of
paying the direct-market storage premium or discount.

## Fence

The Staten Island fence buys one selected inventory source at a time:

- coat inventory receives 30% of the latest local Staten Island price;
- Staten Island storage receives 70% of that fence rate, or 21%;
- Brooklyn or Queens storage receives 50% of that fence rate, or 15%.

The storage discounts therefore multiply with the 30-cents-on-the-dollar fence
rate. The latest observed local price is used even if a product is not listed
today; the current underlying local price is the fallback when no observation
exists. A storage fence sale takes one entire selected unit and ends its
contract; a coat fence sale takes the entire coat inventory. Fence proceeds
create trade exposure.

## Finance and loan enforcement

- The bank pays 0.5% each game day.
- The opening deal gives $5,000 cash and books $10,000 debt.
- Debt compounds at 6% daily.
- The opening loan is safe through Day 6; collection begins on Day 7.
- Full repayment closes the account. A closed account can borrow $25,000 cash
  for $40,000 debt and receives five additional safe days after the loan day.
- Asking for another advance while debt remains gives no cash and multiplies the
  current daily vig by 1.5.
- A partial payment may be any positive amount up to cash and debt. If any cash
  remains, there is a 50% chance that the loan shark detects withholding.
- Cumulative daily gross above $500,000, or more than ten cumulative same-day
  Coke or Heroin units, makes travel collection pressure persistently higher
  until the debt is cleared.

After grace, each Jet with debt checks enforcers before police:

| Pressure | Other borough | Home borough |
| -------- | ------------: | -----------: |
| Ordinary |           10% |          25% |
| Elevated |           20% |          50% |

Every enforcer intervention uses one collection calculation, whether it happens
on the street, after I need more time (Go back), or after detected withholding:

1. Take 100% of cash up to the current debt and credit every dollar taken.
2. If cash exceeds debt, take 90% of the excess and leave 10%, rounded down.
3. If the credited cash does not clear the debt, take all carried stock and any
   upgraded coat; capacity returns to 10.
4. If the debt is cleared, leave the coat and carried stock.
5. Never take guns, bank funds, or stored stock.

The selected partial payment is credited before detected-withholding collection
runs on the remaining cash and debt. Paying all available cash as a partial
payment cannot trigger detection.

Street collection deals 25–75 damage. Office collection deals 10–30. Office
refusal is titled “Wrong answer, [runner].” Enforcers “beat you down.” A fatal
beating has a separate “They wasted you!!!” step with no explanatory body.

## Heat and identity

The game displays current heat H. Two additional factors are intentionally
invisible in game views:

- E: cumulative raw exposure since the last plastic surgery;
- K: police kills since the last plastic surgery.

Lifetime police kills remain separate for scoring.

Trade exposure is split-proof within a day. For cumulative daily gross G, the
desired raw exposure is round(4 × log10(1 + G / 25,000)); only the increment not
already applied that day is added. Gun purchases add 2 raw exposure, failed
escapes add 6, shootouts add 6, and each police kill adds 2.

New exposure is multiplied by sensitivity:

1 + min(0.6, E / 200) + min(0.8, 0.1 × K).

Without a police kill, heat cannot exceed 85. Each identity kill raises the
ceiling by 5, up to 100. Kills therefore change future sensitivity, stickiness,
and the ceiling much more than their small immediate heat addition.

At each clock tick, heat cools only if no heat-producing event occurred during
the day that just ended. The reduction is:

round((10 + 0.1 × (100 − H)) /
(1 + min(1.25, E / 160) + min(1.4, 0.35 × K))),

with a minimum reduction of one. There is no notoriety floor. A successful Run
does not cool heat. Lay low advances a day without itself adding exposure and
restores 22 health. At a representative late-game H = 75, E = 100, K = 4,
falling below 25 takes about 13 clean days.

Plastic surgery costs $200,000, takes three days, and resets H, E, and K.
Lifetime kills remain.

Manhattan uses min(100, round(1.5 × displayed heat)) for every police mechanic:
encounter chance, patrol size, and the Give up threshold.

## Police encounters and guns

The encounter base is 0.5% plus 40% times squared effective heat, before bounded
route, cargo, and local-condition context. Patrol size follows a shallow S curve
with mean 15 × (3x² − 2x³), where x is effective heat divided by 100, bounded
from one to fifteen officers.

The Bronx gun shop:

- allows at most two owned guns;
- buys a gun back for 50% of its purchase price;
- does not reduce heat when a gun is sold;
- assigns the six increasingly expensive models hidden kill probabilities of
  44%, 51%, 58%, 66%, 73%, and 95%. These values and coefficients never appear
  in game views.

At each choice:

- Run may escape and may drop a gun. Failure can drop carried stock and a gun,
  adds exposure, and proceeds to police fire. Success does not cool heat.
- Fight uses both owned guns. Each fired gun independently rolls its hidden
  model-specific chance to kill one officer. Guns are not consumed.
- Give up below 33 effective heat causes a coat search. A player carrying no
  stock and no guns is released; otherwise the run ends in arrest. At 33 or
  more, police fire.

During police return fire, every surviving officer independently has a 30%
chance to hit. A volley can inflict at most one hit, for 10–25 damage. Survivors
return to the choice step. A fatal police hit retains its separate fatality
acknowledgement.

## Contacts, rumors, and field notes

- The opening borough counts as one visit. Lay low and medical recovery do not
  count as arrivals.
- A borough develops a contact on its third arrival while fewer than three
  contacts exist. Only the first three qualifying boroughs receive one.
- Three unique names are chosen deterministically from the bundled 1,200-name
  pool. Hidden reliability values are 0.50, 0.95, and one uniform draw from
  0.50–0.95, randomly assigned.
- Once per visit, a contact supplies one to four distinct two-day forecasts.
- Anonymous rumors remain separate from contact forecasts.
- Forecasts, later results, market observations, rumors, and service events feed
  one reverse-chronological Field notes sequence.

## Copy and flow rules

- Market-event narration uses present tense.
- The player explicitly acknowledges multi-step danger: player action, police
  warning, police result, and fatality are not collapsed.
- A loan dialog with outstanding debt has no close control, Escape dismissal, or
  backdrop dismissal. I need more time (Go back) is the only exit without a
  payment or borrowing choice and triggers office enforcement.
- Successful one-step market and service actions close their action dialog.
  Gun and storage management dialogs may remain open while the player continues
  managing the same service.
