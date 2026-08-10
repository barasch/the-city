# The City — version-two rules

This document is the rules contract for the deterministic browser game. Numeric
constants are deliberately centralized in `src/game/engine.ts`; playtesting may
change them without changing the state model.

## Run and settlement

- A run lasts 30 game days. Travel, Lay low, clinic treatment, and plastic
  surgery advance the clock.
- On Day 30, **Settle up** replaces Travel and Lay low.
- Final net worth is `cash + bank - debt`. Carried and stored stock is not
  liquidated and contributes nothing unless the player sells it before
  settlement.
- Scores record runner name, real completion date, days survived, net worth,
  home borough, and total police killed.

## Identity and persistence

- The device retains the last runner name separately from the active run. Blank
  names normalize to `Runner`.
- Version-two saves use schema version 2. Version-one active runs are invalidated
  because storage, contacts, heat, and encounters now require incompatible
  state. The old run's name and old scores survive.

## Borough identities

| Borough       | Fixed services           | Structural market identity                                            |
| ------------- | ------------------------ | --------------------------------------------------------------------- |
| Manhattan     | Clinic; Plastic surgeon  | High prices; displayed heat counts double for police mechanics        |
| Brooklyn      | Plastic surgeon; Storage | Nightlife demand, especially Molly                                    |
| Queens        | Coat factory; Storage    | Import and logistics base; Coke and Heroin are reliably cheaper       |
| The Bronx     | Guns; Clinic             | Broad wholesale bargains, especially Pills, Opioids, Speed, and Green |
| Staten Island | Fence; Storage           | Sparse listings and scarcity premiums, especially Peyote and Shrooms  |

Bank and Loan shark are added only in the chosen home borough. A developed
contact is added by name to that contact's borough.

Product/borough multipliers create reliable interborough spreads. Daily noise
and gluts or shortages move prices around those durable means. Markets impose no
quantity-depth cap.

## Coat and local storage

The player starts with 10 spaces. Queens sells only the next coat:

| Capacity |  Price |
| -------: | -----: |
|       21 | $1,000 |
|       34 | $2,000 |
|       55 | $3,000 |
|       89 | $5,000 |

Brooklyn, Queens, and Staten Island offer separate physical storage units. Each
unit:

- holds 200 items;
- costs $200 when rented and $200 on each subsequent game day;
- remains rented until the player empties and closes it;
- produces a voicemail when rent cannot be taken from cash;
- gives one game day to cure the arrears; and
- is forfeited, with no proceeds, if the next charge still cannot be paid.

## Finance and the loan shark

- The bank pays 0.5% daily.
- The opening arrangement advances $5,000 and books $10,000 of debt.
- Debt compounds at 6% daily. The current bank rate, debt, and vig are displayed
  at their offices.
- The first loan is protected through Day 5. A successful later loan grants five
  days of grace counting the loan day.
- Full repayment closes the account. A closed account unlocks a fixed new offer:
  $25,000 cash for $40,000 booked debt.
- Asking for more money while any debt remains is an allowed mistake. It advances
  no cash and multiplies the current daily vig by 1.5. Repeated mistakes compound.
- A partial payment can be any positive amount up to cash and debt. If cash
  remains, there is a 50% chance the loan shark sees it. His men then inflict
  10–30 health damage, take all remaining cash, and credit only the portion
  needed against debt. Partial payment never raises the vig.
- **I need more time** inflicts the same 10–30 office damage and takes all cash,
  but credits none of it against debt. It does not raise the vig.

After grace expires, an outstanding debt creates a travel check before the
police check:

| Exposure since current loan began | Other borough | Home borough |
| --------------------------------- | ------------: | -----------: |
| Ordinary                          |           10% |          25% |
| Premium transaction               |           20% |          50% |

A premium transaction means cumulative same-day volume above $100,000, or more
than ten total units of Coke or Heroin. The flag persists until full repayment.
An enforcer result suppresses the police result for that trip.

Wild enforcers first present “Someone taps you on the shoulder...” After
acknowledgement, they inflict 25–75 health damage and take all carried cash,
stock, guns, and any upgraded coat. Capacity returns to 10; stored stock and
bank balance remain; seized property is not credited toward debt. The result
uses “f***ed you up.” A fatal result then presents “They wasted you!!!” as its
own acknowledged step.

## Trade heat and notoriety

- Trade heat uses cumulative daily gross volume, so splitting a transaction does
  not avoid thresholds.
- Ordinary products add heat slowly on a logarithmic volume curve. Sufficient
  ordinary volume still matters.
- Once same-day Coke or Heroin volume crosses ten units, that product adds a
  deterministic 30–50 heat. At 25 units or $500,000 gross value, heat becomes 100.
- Buying a gun adds substantial heat. A failed Run, a shootout, and each police
  kill add separate exposure.
- Existing heat accelerates new exposure.
- Each police kill since the last plastic surgery raises the heat floor by 12,
  capped at 90. Lay low cannot cool below that visible floor.
- Plastic surgery costs $200,000, takes three days, and resets current heat, the
  floor, and the post-surgery kill count. Lifetime police kills remain in the
  score.

Manhattan keeps the displayed heat number but uses
`min(100, displayed heat × 2)` for encounter probability, patrol size, and the
search-versus-fire Give up branch.

## Police encounters

Heat gates both encounter probability and officer count. Below heat 10, even
worst-case route and cargo modifiers leave encounter probability below about 1%,
and patrols contain no more than two officers. Heat 15 permits at most three;
heat 100 permits five to twelve.

At each choice the player may:

- **Run**. Success ends the chase and may drop a gun. Failure may drop stock and
  a gun, then moves to police return fire.
- **Fight**, shown only when armed. Every gun independently has a two-thirds
  chance to kill one officer, so six guns can kill up to six officers in one
  volley. Guns are not consumed. If officers remain, the player acknowledges the
  result and then police return fire.
- **Give up**. Below 33 effective heat, police detain the player and search the
  coat. A player carrying neither stock nor guns is released; otherwise arrest
  ends the run. At 33 or more effective heat, the player merely stands “looking
  like an idiot” and police fire.

Police return fire is a distinct acknowledged step. Hit probability rises with
officers remaining and effective heat. A hit costs 10–30 health; survivors return
to Run/Fight/Give up. A fatal hit is followed by “They wasted you!!!” and a
**Game over** button.

## Contacts, rumors, and field notes

- The opening borough counts as one visit. Lay low and medical recovery do not
  count as new visits.
- On the third arrival, a borough creates a contact if fewer than three contacts
  exist. Only the first three boroughs to reach three arrivals qualify.
- Three unique contact names are selected deterministically for each run from a
  shuffled, bundled pool of 1,200 names.
- Hidden reliability values are 0.50, 0.95, and one uniform draw from 0.50–0.95,
  randomly assigned to those three names.
- Once per visit, the local contact supplies one to four forecasts about distinct
  products in that borough, two days ahead. Reliability is the probability that
  the forecasted direction is correct.
- Anonymous rumors remain separate. They concern a non-premium product event on
  the following day.
- Forecasts and later correctness results enter one structured, global,
  reverse-chronological Field notes sequence.
- The observation view is one scrollable matrix: boroughs are rows, products are
  columns, and each observed price carries its observation day. Each borough row
  displays last visit and visit count.

## Copy and dialog rules

- Market-event narration uses the present tense.
- Machine responses such as “Debt reduced” are replaced by loan-shark dialogue.
- Successful market, bank, repayment, coat, clinic, fence, and storage actions
  close their action dialog when no immediate follow-up choice remains. The gun
  shop stays open after a purchase.
- Multistep danger is never collapsed: player result, police fire, damage, and
  fatality each appear in their proper sequence.
