# The City design notes

## Travel events

- Travel pauses for acknowledged event dialogs. The player taps or clicks
  **Continue** before play resumes.
- One mandatory, mechanically neutral event is exactly:

  > An old lady on the subway says, "Would you like a jelly, baby?"

- The first event set also includes menacing, strange, and useful signals. Some
  foreshadow market events; others reflect current heat or loan-shark pressure.
- Later passes should expand this set carefully and test event frequency,
  mechanical effects, repetition, and tone rather than treating event volume as
  an end in itself.

## Borough identity

The bank and loan shark are available only in the chosen home borough. Fixed
local services are:

- Manhattan: a $25,000 plastic surgeon consumes five days and clears heat.
- Brooklyn: $1,500 private treatment consumes one day and restores full health.
- Queens: the coat factory sells $4,000 upgrades through capacities of 25, 50,
  100, 150, and 200 spaces. New players begin with the 25-space coat.
- The Bronx: its gun shop gives access to the six-model catalog.
- Staten Island: a persistent storage unit can hold or return stock, and a fence
  buys everything currently in the coat for 70% of that day's local prices,
  including products absent from the market listing.

The identities and tradeoffs are structural; names and numerical tuning remain
provisional until repeated full-run playtests establish their actual value.

## Market scale

- Normal prices span cheap entry products through cocaine around $20,000 and
  heroin around $10,000. These premium products are usually out of reach on Day 1.
- A local shipment can cut one product to 10–32% of its ordinary price; a
  shortage can raise it to 2.8–6 times its ordinary price. Shocked products are
  always listed, last two to four days, and are announced in a dialog and the
  field notes.
- Cocaine and heroin are capped at $100,000 per unit. A 200-space coat can
  therefore gross $20 million on a perfect premium sale, preserving the classic
  late-run scale without imposing market-depth limits.
- Displayed net worth is cash plus bank balance minus debt. Unsold stock—whether
  carried or stored—does not count until it is sold. Day 30 liquidates all
  remaining stock at 72% before calculating the final score.

## Heat

- Every market purchase and sale adds heat according to the logarithm of its
  dollar value. Larger deals therefore matter substantially without making the
  difference between $1 million and $2 million mechanically linear.
- New heat is multiplied by a convex function of existing heat. Small-time
  activity accumulates slowly; conspicuous dealing makes each further exposure
  more costly. The composite exposure function has separate inputs for gun
  purchases, failed escapes, police shootouts, and officers killed. A successful
  fight round counts as both a shootout and one officer killed, so a multi-round
  fight compounds rapidly.
- Lay Low removes more heat when the starting level is low and progressively
  less when it is high. Heat 35 clears in two days; heat 90 remains above zero
  after five. Plastic surgery clears it completely in five days for $25,000.
- Police risk is gated by a convex function of heat. At heat below 10, even the
  worst route and cargo modifiers leave the per-trip encounter chance below 1%.
  Route conditions, local enforcement, and cargo value modify the heat signal;
  they do not create a large independent encounter floor.
- Patrol size also follows heat. Heat 0–9 permits 1–2 officers and heat 10–19
  permits 1–3. The range rises in steps until heat 100 permits 5–12 officers, so
  a large chase reflects accumulated exposure rather than coat contents alone.

## Guns

The catalog contains one each of Taurus G3C ($500), SIG Sauer P365 ($650), Glock
19 ($800), Beretta 92FS ($950), Colt 1911 ($1,200), and Colt Python ($1,500).
The player can carry all six but cannot buy duplicates. Fighting never consumes
a gun; an unsuccessful or successful escape can cause one named gun to be
dropped, reopening that catalog slot. At full health, one through six guns give
approximately 53%, 62%, 70%, 78%, 87%, and 95% chances of killing one officer
in a fight round. Every catalog slot therefore improves the odds, but none makes
a fight certain.
