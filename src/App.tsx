import { type ReactNode, useEffect, useState } from "react";
import {
  Action,
  BOROUGHS,
  BoroughId,
  currentBorough,
  GameState,
  inventoryUnits,
  inventoryValue,
  ProductId,
  PRODUCTS,
  startGame,
  applyAction,
} from "./game/engine";
import {
  loadGame,
  loadScores,
  SAVE_KEY,
  saveGame,
  saveScore,
} from "./game/storage";
import { normalizeTradeQuantity } from "./game/tradeControls";
import {
  maximumServiceAmount,
  serviceAmountError,
  type ServiceAction,
} from "./game/serviceControls";

const cash = (n: number) => `$${Math.round(n).toLocaleString()}`;
const BRAND_MARK = "./sb-a1.png";
const boroughName = (id: BoroughId) =>
  BOROUGHS.find((b) => b.id === id)?.name ?? id;

function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="info-button" onClick={onClick} aria-label="How to play">
      <span aria-hidden="true">i</span>
    </button>
  );
}

function Instructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section
        className="instructions-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
      >
        <p className="eyebrow">THE CITY</p>
        <h2 id="instructions-title">How to play</h2>
        <div className="instructions-grid">
          <article>
            <h3>Thirty days</h3>
            <p>
              Build net worth by trading across five boroughs. Remaining stock
              is sold at a discount after Day 30.
            </p>
          </article>
          <article>
            <h3>Trade</h3>
            <p>
              Select a product, enter a quantity, then buy or sell. Max fills
              the largest current buy or sell quantity without completing a
              transaction.
            </p>
          </article>
          <article>
            <h3>Move</h3>
            <p>
              Travel and laying low each use a day. Revisit boroughs to turn
              recorded prices and local conditions into useful knowledge.
            </p>
          </article>
          <article>
            <h3>Home</h3>
            <p>
              The bank, loan shark, and gear contact operate only in your home
              borough. Your opening $5,000 comes with $10,000 debt. Bank
              balances grow and debt compounds each day.
            </p>
          </article>
          <article>
            <h3>Risk</h3>
            <p>
              Cargo, heat, routes, and local enforcement affect police risk.
              Escape or fight through a chase one round at a time. High debt can
              also bring the loan shark's enforcers. Guns survive fights, but
              one can be lost during an escape.
            </p>
          </article>
          <article>
            <h3>Lay low</h3>
            <p>
              Laying low restores health and reduces heat. Markets have no
              quantity cap beyond cash, bag space, and the day’s listings.
            </p>
          </article>
        </div>
        <button className="primary" onClick={onClose}>
          Minimize
        </button>
      </section>
    </div>
  );
}

function StartScreen({ onStart }: { onStart: (state: GameState) => void }) {
  const [name, setName] = useState("");
  const [home, setHome] = useState<BoroughId>("brooklyn");
  const [seed, setSeed] = useState(() =>
    Math.floor(Math.random() * 0xffffffff),
  );
  const saved = loadGame();
  const scores = loadScores();
  const selectedHome = BOROUGHS.find((borough) => borough.id === home);
  return (
    <main className="start shell">
      <div className="brand-title">
        <img src={BRAND_MARK} alt="" />
        <h1>The City</h1>
      </div>
      <section className="start-card">
        <label>
          Runner name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Choose a name"
            maxLength={24}
          />
        </label>
        <label>
          Home borough
          <select
            value={home}
            onChange={(e) => setHome(e.target.value as BoroughId)}
          >
            {BOROUGHS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <small className="home-summary">{selectedHome?.summary}</small>
        </label>
        <button
          className="primary big"
          onClick={() => onStart(startGame(name, home, seed))}
        >
          Start Day 1
        </button>
        {saved && saved.phase !== "gameover" && (
          <button className="secondary big" onClick={() => onStart(saved)}>
            Resume {saved.name} · Day {saved.day}
          </button>
        )}
        <button
          className="text-button"
          onClick={() => setSeed(Math.floor(Math.random() * 0xffffffff))}
        >
          Shuffle city
        </button>
      </section>
      <section className="scores">
        <h2>Personal scores</h2>
        {scores.length === 0 ? (
          <p className="muted">No completed runs on this device yet.</p>
        ) : (
          <ol>
            {scores.slice(0, 5).map((s) => (
              <li key={`${s.date}-${s.value}`}>
                <span>{s.name}</span>
                <strong>{cash(s.value)}</strong>
                <small>
                  Day {s.day} · {s.reason}
                </small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={`stat ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Dialog({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const titleId = `dialog-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="action-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={titleId}>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function Market({
  state,
  act,
}: {
  state: GameState;
  act: (a: Action) => void;
}) {
  const [productId, setProductId] = useState<ProductId | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");
  const product = productId
    ? PRODUCTS.find((item) => item.id === productId)
    : undefined;
  const held = product ? state.inventory[product.id].quantity : 0;
  const price = product ? state.market.prices[product.id] : 0;
  const listed = product ? state.market.listed.includes(product.id) : false;
  const maxBuy =
    product && listed
      ? Math.floor(
          Math.min(state.cash / price, state.capacity - inventoryUnits(state)),
        )
      : 0;
  const maxTrade = Math.max(maxBuy, held);
  const closeProduct = () => {
    setProductId(null);
    setQuantity(0);
    setError("");
  };
  const openProduct = (id: ProductId) => {
    setProductId(id);
    setQuantity(0);
    setError("");
  };
  const transact = (type: "buy" | "sell") => {
    const q = normalizeTradeQuantity(quantity);
    if (q < 1) return setError("Enter a quantity greater than zero.");
    if (!listed) return setError(`${product?.name} is not listed here today.`);
    if (type === "buy" && q > maxBuy)
      return setError(
        `You can afford ${maxBuy} ${product?.name ?? "units"} at this price.`,
      );
    if (type === "sell" && q > held)
      return setError(`You only carry ${held} ${product?.name ?? "units"}.`);
    act({ type, product: productId as ProductId, quantity: q });
    setQuantity(0);
    setError("");
  };
  useEffect(() => {
    if (state.phase !== "market") closeProduct();
  }, [state.phase, state.day, state.current]);
  return (
    <section className="market panel">
      <div className="panel-heading">
        <h2>Market board</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const listed = state.market.listed.includes(p.id);
              return (
                <tr key={p.id} className={!listed ? "unlisted" : ""}>
                  <td>
                    <button
                      className="market-product"
                      onClick={() => openProduct(p.id)}
                    >
                      <span className="dot" style={{ background: p.color }} />
                      {p.name}
                    </button>
                  </td>
                  <td>{listed ? cash(state.market.prices[p.id]) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {product && (
        <Dialog title={product.name} eyebrow="MARKET" onClose={closeProduct}>
          <div className="dialog-facts">
            <span>
              Price <b>{listed ? cash(price) : "Not listed"}</b>
            </span>
            <span>
              Held <b>{held}</b>
            </span>
            <span>
              Average cost{" "}
              <b>{held ? cash(state.inventory[product.id].avgCost) : "—"}</b>
            </span>
          </div>
          {!listed && (
            <p className="muted">
              This product is not listed in this market today.
            </p>
          )}
          <label className="dialog-quantity">
            Quantity
            <input
              autoFocus
              type="number"
              min="0"
              value={quantity}
              disabled={!listed}
              onChange={(event) => {
                setQuantity(normalizeTradeQuantity(Number(event.target.value)));
                setError("");
              }}
            />
          </label>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="primary"
              disabled={!listed}
              onClick={() => transact("buy")}
            >
              Buy
            </button>
            <button disabled={!listed} onClick={() => transact("sell")}>
              Sell
            </button>
            <button
              className="mini"
              onClick={() => {
                setQuantity(maxTrade);
                setError("");
              }}
              disabled={!listed || maxTrade < 1}
            >
              Max
            </button>
            <button className="text-button" onClick={closeProduct}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}

function Services({
  state,
  act,
}: {
  state: GameState;
  act: (a: Action) => void;
}) {
  const [dialog, setDialog] = useState<"bank" | "loan" | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceAction, setServiceAction] = useState<ServiceAction | null>(
    null,
  );
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const close = () => {
    setDialog(null);
    setStep(1);
    setServiceAction(null);
    setAmount(0);
    setError("");
  };
  const open = (which: "bank" | "loan") => {
    setDialog(which);
    setStep(1);
    setServiceAction(null);
    setAmount(0);
    setError("");
  };
  const choose = (action: ServiceAction) => {
    setServiceAction(action);
    setStep(2);
    setAmount(0);
    setError("");
  };
  const balances = { cash: state.cash, bank: state.bank, debt: state.debt };
  const maxAmount = serviceAction
    ? maximumServiceAmount(serviceAction, balances)
    : 0;
  const runService = () => {
    if (!serviceAction) return;
    const value = normalizeTradeQuantity(amount);
    const amountError = serviceAmountError(serviceAction, value, balances);
    if (amountError) return setError(amountError);
    act({ type: serviceAction, amount: value });
    setAmount(0);
    setError("");
  };
  useEffect(() => {
    if (state.current !== state.home || state.phase !== "market") close();
  }, [state.current, state.home, state.phase]);
  if (state.current !== state.home) return null;
  return (
    <section className="panel services">
      <div className="panel-heading">
        <h3>Home services</h3>
        <span className="tag">HOME</span>
      </div>
      <div className="service-row">
        <div>
          <b>Bank</b>
          <small>Protected cash: {cash(state.bank)}</small>
        </div>
        <button onClick={() => open("bank")}>Open bank</button>
      </div>
      <div className="service-row">
        <div>
          <b>Loan shark</b>
          {state.debt > 0 && <small>Debt: {cash(state.debt)}</small>}
        </div>
        <button onClick={() => open("loan")}>Open loan shark</button>
      </div>
      <div className="service-row">
        <div>
          <b>Gear contact</b>
          <small>Next gun: {cash(900 + state.guns * 180)}</small>
        </div>
        <div className="service-actions">
          <button onClick={() => act({ type: "buy-gun" })}>Buy a gun</button>
        </div>
      </div>
      {dialog && (
        <Dialog
          title={dialog === "bank" ? "Bank" : "Loan shark"}
          eyebrow={step === 1 ? "HOME SERVICE" : "SET AMOUNT"}
          onClose={close}
        >
          {step === 1 ? (
            <div className="choice-actions">
              {dialog === "bank" ? (
                <>
                  <button className="primary" onClick={() => choose("deposit")}>
                    Deposit
                  </button>
                  <button onClick={() => choose("withdraw")}>Withdraw</button>
                </>
              ) : (
                <>
                  <button className="primary" onClick={() => choose("borrow")}>
                    Borrow
                  </button>
                  <button
                    disabled={state.debt < 1}
                    onClick={() => choose("repay")}
                  >
                    Repay
                  </button>
                </>
              )}
              <button className="text-button" onClick={close}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p className="dialog-context">
                {serviceAction === "deposit" &&
                  `Cash available: ${cash(state.cash)}`}
                {serviceAction === "withdraw" &&
                  `Bank balance: ${cash(state.bank)}`}
                {serviceAction === "borrow" &&
                  `Credit remaining: ${cash(maxAmount)}`}
                {serviceAction === "repay" &&
                  `Debt outstanding: ${cash(state.debt)}`}
              </p>
              <label className="dialog-quantity">
                Amount
                <input
                  autoFocus
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => {
                    const next = normalizeTradeQuantity(
                      Number(event.target.value),
                    );
                    setAmount(next);
                    setError(
                      serviceAmountError(
                        serviceAction ?? "deposit",
                        next,
                        balances,
                      ) ?? "",
                    );
                  }}
                />
              </label>
              {error && (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              )}
              <div className="dialog-actions">
                <button className="primary" onClick={runService}>
                  {serviceAction === "deposit"
                    ? "Deposit"
                    : serviceAction === "withdraw"
                      ? "Withdraw"
                      : serviceAction === "borrow"
                        ? "Borrow"
                        : "Repay"}
                </button>
                <button
                  className="mini"
                  onClick={() => {
                    setAmount(maxAmount);
                    setError("");
                  }}
                  disabled={maxAmount < 1}
                >
                  Max
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setServiceAction(null);
                    setError("");
                  }}
                >
                  Back
                </button>
                <button className="text-button" onClick={close}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </Dialog>
      )}
    </section>
  );
}

function Inventory({ state }: { state: GameState }) {
  const carried = PRODUCTS.filter((p) => state.inventory[p.id].quantity > 0);
  return (
    <section className="panel inventory-panel">
      <div className="panel-heading">
        <h3>Inventory</h3>
        <span className="tag">
          Trenchcoat · {inventoryUnits(state)} / {state.capacity}
        </span>
      </div>
      {carried.length === 0 ? (
        <p className="empty-inventory">Nothing carried yet.</p>
      ) : (
        <div className="inventory-list">
          {carried.map((p) => {
            const item = state.inventory[p.id];
            return (
              <div className="inventory-item" key={p.id}>
                <span>
                  <i className="dot" style={{ background: p.color }} />
                  {p.name}
                </span>
                <b>{item.quantity}</b>
                <small>avg {cash(item.avgCost)}</small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Travel({
  state,
  act,
}: {
  state: GameState;
  act: (a: Action) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const travelTo = (destination: BoroughId) => {
    act({ type: "travel", destination });
    close();
  };
  return (
    <section className="panel travel">
      <div className="panel-heading">
        <h3>Travel</h3>
        <button className="secondary" onClick={() => setOpen(true)}>
          Travel
        </button>
      </div>
      {open && (
        <Dialog title="Travel" eyebrow="MOVE" onClose={close}>
          <div className="destination-list">
            {BOROUGHS.map((b) => {
              const isHere = state.current === b.id;
              return (
                <button
                  key={b.id}
                  disabled={isHere || state.day >= 30}
                  onClick={() => travelTo(b.id)}
                >
                  {b.name}
                  {isHere ? " · here" : ""}
                </button>
              );
            })}
          </div>
          <div className="dialog-actions">
            <button
              className="secondary"
              disabled={state.day >= 30}
              onClick={() => {
                act({ type: "lay-low" });
                close();
              }}
            >
              Lay low
            </button>
            <button className="text-button" onClick={close}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}

function Ledger({ state }: { state: GameState }) {
  const here = currentBorough(state);
  const familiarity =
    here.familiarity >= 5
      ? "Your contact here is reliable and knows the local pattern."
      : here.familiarity >= 3
        ? "A local contact is starting to share useful reports."
        : here.familiarity === 2
          ? "You are becoming a familiar face."
          : "First impressions are all you have.";
  return (
    <aside className="panel journal">
      <div className="panel-heading">
        <h3>Field notes</h3>
        <span className="tag">LEDGER</span>
      </div>
      <p className="familiarity">{familiarity}</p>
      <div className="field-note-list">
        {BOROUGHS.flatMap((b) =>
          state.boroughs[b.id].ledger.notes.map((note, i) => (
            <p key={`${b.id}-${i}-${note}`}>
              <b>{b.name}</b> {note}
            </p>
          )),
        )}
        {BOROUGHS.every(
          (b) => state.boroughs[b.id].ledger.notes.length === 0,
        ) && <p className="muted">No notes yet. Travel and pay attention.</p>}
      </div>
      <details className="ledger-details">
        <summary>All borough observations</summary>
        <div className="ledger-boroughs">
          {BOROUGHS.map((b) => {
            const entry = state.boroughs[b.id].ledger;
            const observations = Object.entries(entry.observations).sort(
              ([, a], [, z]) => z.day - a.day,
            );
            return (
              <article key={b.id}>
                <h4>{b.name}</h4>
                <p>
                  {entry.lastVisitDay
                    ? `Last seen Day ${entry.lastVisitDay} · ${entry.visits} visit${entry.visits === 1 ? "" : "s"}`
                    : "Not yet visited"}
                </p>
                {observations.length > 0 && (
                  <div className="ledger-prices">
                    {observations.map(([id, seen]) => (
                      <span key={id}>
                        <b>{PRODUCTS.find((p) => p.id === id)?.name}</b>
                        {cash(seen.price)} <i>D{seen.day}</i>
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </details>
      <h4 className="recent-heading">Recent events</h4>
      <ul>
        {state.log.map((line, i) => (
          <li key={`${line}-${i}`}>{line}</li>
        ))}
      </ul>
    </aside>
  );
}

function Encounter({
  state,
  act,
}: {
  state: GameState;
  act: (a: Action) => void;
}) {
  if (state.phase === "notice" && state.pendingNotices?.[0]) {
    const notice = state.pendingNotices[0];
    return (
      <div className="encounter-backdrop">
        <section
          className="encounter"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-title"
        >
          <p className="eyebrow">
            {notice.kind === "travel" ? "ON THE ROAD" : "MARKET NOTE"}
          </p>
          <h2 id="notice-title">{notice.title}</h2>
          <p>{notice.message}</p>
          <div className="encounter-actions">
            <button
              className="primary"
              onClick={() => act({ type: "continue-notice" })}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    );
  }
  if (state.phase === "outcome" && state.pendingOutcome) {
    const outcome = state.pendingOutcome;
    return (
      <div className="encounter-backdrop">
        <section className="encounter" role="dialog" aria-modal="true">
          <p className="eyebrow">
            {outcome.kind === "police" ? "POLICE ENCOUNTER" : "LOAN SHARK"}
          </p>
          <h2>{outcome.title}</h2>
          <p>{outcome.message}</p>
          <div className="encounter-actions">
            <button
              className="primary"
              onClick={() => act({ type: "continue" })}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    );
  }
  if (state.phase === "loan-shark" && state.pendingLoanSharkEncounter) {
    return (
      <div className="encounter-backdrop">
        <section className="encounter" role="dialog" aria-modal="true">
          <p className="eyebrow">LOAN SHARK</p>
          <h2>Someone taps you on the shoulder...</h2>
          <p>The loan shark's enforcers found you.</p>
          <div className="encounter-actions">
            <button
              className="primary"
              onClick={() => act({ type: "resolve-loan-shark" })}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    );
  }
  if (state.phase !== "encounter") return null;
  const officers = Math.max(1, state.pendingEncounter?.officers ?? 1);
  return (
    <div className="encounter-backdrop">
      <section className="encounter" role="dialog" aria-modal="true">
        <p className="eyebrow">POLICE ENCOUNTER</p>
        <h2>They want to search the bag.</h2>
        <p>
          {officers} {officers === 1 ? "officer is" : "officers are"} chasing
          you. You have {state.guns} gun{state.guns === 1 ? "" : "s"} and{" "}
          {state.health} health.
        </p>
        <div className="encounter-actions">
          <button
            className="primary"
            onClick={() => act({ type: "resolve-encounter", choice: "escape" })}
          >
            E — Try to escape
          </button>
          <button
            className="danger"
            disabled={state.guns < 1}
            onClick={() => act({ type: "resolve-encounter", choice: "fight" })}
          >
            F — Fight{state.guns < 1 ? " (no guns)" : ""}
          </button>
        </div>
      </section>
    </div>
  );
}

function Game({
  initial,
  onNew,
  onLeave,
  instructionsOpen,
}: {
  initial: GameState;
  onNew: () => void;
  onLeave: () => void;
  instructionsOpen: boolean;
}) {
  const [state, setState] = useState(initial);
  const [scoresWritten, setScoresWritten] = useState(false);
  const act = (action: Action) =>
    setState((before) => applyAction(before, action));
  useEffect(() => {
    if (state.phase !== "gameover") saveGame(state);
  }, [state]);
  useEffect(() => {
    if (state.phase === "gameover" && state.score && !scoresWritten) {
      saveScore(state.score);
      setScoresWritten(true);
      localStorage.removeItem(SAVE_KEY);
    }
  }, [state, scoresWritten]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (instructionsOpen) return;
      if (state.phase === "notice" && event.key === "Enter")
        act({ type: "continue-notice" });
      else if (state.phase === "outcome" && event.key === "Enter")
        act({ type: "continue" });
      else if (state.phase === "loan-shark" && event.key === "Enter")
        act({ type: "resolve-loan-shark" });
      else if (state.phase === "encounter" && event.key.toLowerCase() === "e")
        act({ type: "resolve-encounter", choice: "escape" });
      else if (state.phase === "encounter" && event.key.toLowerCase() === "f")
        act({ type: "resolve-encounter", choice: "fight" });
      else if (state.phase === "market" && event.key.toLowerCase() === "l")
        act({ type: "lay-low" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, instructionsOpen]);
  const net = state.cash + state.bank + inventoryValue(state) - state.debt;
  if (state.phase === "gameover")
    return (
      <main className="shell end">
        <p className="eyebrow">Run complete</p>
        <h1>
          {state.score && state.score.value >= 0
            ? "You made it."
            : "The city won this round."}
        </h1>
        <div className="final-score">{cash(state.score?.value ?? net)}</div>
        <p>{state.score?.reason}</p>
        <div className="final-grid">
          <Stat label="Days" value={`${state.day} / 30`} />
          <Stat label="Cash + bank" value={cash(state.cash + state.bank)} />
          {state.debt > 0 && <Stat label="Debt" value={cash(state.debt)} />}
        </div>
        <button className="primary big" onClick={onNew}>
          Start another run
        </button>
      </main>
    );
  return (
    <main className="shell game">
      <header className="topbar">
        <div>
          <p className="eyebrow game-brand">
            <img src={BRAND_MARK} alt="" />
            <span>THE CITY · {state.name}</span>
          </p>
          <h1>{boroughName(state.current)}</h1>
        </div>
        <div className="topbar-actions">
          <div className="day-track">
            <span>DAY</span>
            <strong>{state.day}</strong>
            <small>of 30</small>
            <div className="track">
              <i style={{ width: `${(state.day / 30) * 100}%` }} />
            </div>
          </div>
          <button
            className="text-button leave-button"
            onClick={() => {
              saveGame(state);
              onLeave();
            }}
          >
            Start screen
          </button>
        </div>
      </header>
      <section className="stats">
        <Stat label="Cash" value={cash(state.cash)} />
        <Stat label="Bank" value={cash(state.bank)} />
        {state.debt > 0 && (
          <Stat label="Debt" value={cash(state.debt)} tone="debt" />
        )}
        <Stat
          label="Health"
          value={`${state.health}%`}
          tone={state.health < 35 ? "danger-text" : ""}
        />
        <Stat
          label="Heat"
          value={`${state.heat}%`}
          tone={state.heat > 60 ? "danger-text" : ""}
        />
        <Stat label="Guns" value={`${state.guns}`} />
        <Stat
          label="Bag"
          value={`${inventoryUnits(state)} / ${state.capacity}`}
        />
        <Stat label="Net worth" value={cash(net)} />
      </section>
      <Market state={state} act={act} />
      <Inventory state={state} />
      <div className="lower-grid">
        <div>
          <Services state={state} act={act} />
          <Travel state={state} act={act} />
        </div>
        <Ledger state={state} />
      </div>
      {state.day === 30 && (
        <div className="day-actions">
          <button
            className="primary"
            onClick={() => act({ type: "finish-day" })}
          >
            Settle Day 30
          </button>
        </div>
      )}
      <Encounter state={state} act={act} />
    </main>
  );
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  useEffect(() => {
    if (!instructionsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInstructionsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [instructionsOpen]);
  return (
    <>
      <InfoButton onClick={() => setInstructionsOpen(true)} />
      {game ? (
        <Game
          initial={game}
          instructionsOpen={instructionsOpen}
          onLeave={() => setGame(null)}
          onNew={() => {
            localStorage.removeItem(SAVE_KEY);
            setGame(null);
          }}
        />
      ) : (
        <StartScreen onStart={setGame} />
      )}
      {instructionsOpen && (
        <Instructions onClose={() => setInstructionsOpen(false)} />
      )}
    </>
  );
}
