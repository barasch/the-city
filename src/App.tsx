import { useEffect, useState } from "react";
import {
  Action,
  BOROUGHS,
  BoroughId,
  currentBorough,
  GameState,
  inventoryUnits,
  inventoryValue,
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

const cash = (n: number) => `$${Math.round(n).toLocaleString()}`;
const boroughName = (id: BoroughId) =>
  BOROUGHS.find((b) => b.id === id)?.name ?? id;

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
      <p className="eyebrow">A 30-day trading game</p>
      <h1>The City</h1>
      <p className="lede">
        Five places. Twelve products. One month to learn the city before it
        learns you.
      </p>
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
          <small className="home-summary">
            {selectedHome?.summary} Your bank, loan shark, and gear contact will
            be here.
          </small>
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

function Market({
  state,
  act,
}: {
  state: GameState;
  act: (a: Action) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const getQ = (id: string) => quantities[id] ?? 1;
  const setQ = (id: string, value: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.floor(value)) }));
  return (
    <section className="market panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            Day {state.day} · {boroughName(state.current)}
          </p>
          <h2>Market board</h2>
        </div>
        <p className="bulletin">{state.market.bulletin}</p>
      </div>
      {state.market.condition && (
        <div className="condition">
          <span>LOCAL CONDITION</span>
          {state.market.condition.label}{" "}
          <b>{state.market.condition.daysLeft} days left</b>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>You carry</th>
              <th>Trade</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const listed = state.market.listed.includes(p.id);
              const item = state.inventory[p.id];
              const q = getQ(p.id);
              const maxBuy = listed
                ? Math.floor(
                    Math.min(
                      state.cash / state.market.prices[p.id],
                      state.capacity - inventoryUnits(state),
                    ),
                  )
                : 0;
              return (
                <tr key={p.id} className={!listed ? "unlisted" : ""}>
                  <td>
                    <span className="dot" style={{ background: p.color }} />
                    {p.name}
                    <small>{p.role}</small>
                  </td>
                  <td>{listed ? cash(state.market.prices[p.id]) : "—"}</td>
                  <td>
                    {item.quantity}
                    {item.quantity > 0 && (
                      <small>avg {cash(item.avgCost)}</small>
                    )}
                  </td>
                  <td>
                    {listed && (
                      <div className="trade">
                        <input
                          aria-label={`${p.name} quantity`}
                          type="number"
                          min="1"
                          value={q}
                          onChange={(e) => setQ(p.id, Number(e.target.value))}
                        />
                        <button
                          onClick={() =>
                            act({ type: "buy", product: p.id, quantity: q })
                          }
                          disabled={maxBuy < q}
                        >
                          Buy
                        </button>
                        <button
                          onClick={() =>
                            act({ type: "sell", product: p.id, quantity: q })
                          }
                          disabled={item.quantity < q}
                        >
                          Sell
                        </button>
                        <button
                          className="mini"
                          onClick={() =>
                            act({
                              type: "buy",
                              product: p.id,
                              quantity: maxBuy,
                            })
                          }
                          disabled={maxBuy < 1}
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="hint">
        Markets have no artificial quantity cap. Your cash, carry space, and the
        current listing are the limits.
      </p>
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
  const [amount, setAmount] = useState(500);
  if (state.current !== state.home)
    return (
      <section className="panel services unavailable">
        <h3>Home services</h3>
        <p>
          Bank and loan shark are only available in {boroughName(state.home)}.
        </p>
      </section>
    );
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
        <div className="service-actions">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button onClick={() => act({ type: "deposit", amount })}>
            Deposit
          </button>
          <button onClick={() => act({ type: "withdraw", amount })}>
            Withdraw
          </button>
        </div>
      </div>
      <div className="service-row">
        <div>
          <b>Loan shark</b>
          <small>Debt: {cash(state.debt)}</small>
        </div>
        <div className="service-actions">
          <button onClick={() => act({ type: "borrow", amount })}>
            Borrow
          </button>
          <button onClick={() => act({ type: "repay", amount })}>Repay</button>
        </div>
      </div>
      <div className="service-row">
        <div>
          <b>Gear contact</b>
          <small>
            Raw guns improve fight odds; a gun costs more each time.
          </small>
        </div>
        <div className="service-actions">
          <button onClick={() => act({ type: "buy-gun" })}>Buy a gun</button>
        </div>
      </div>
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
  return (
    <section className="panel travel">
      <div className="panel-heading">
        <div>
          <h3>Move through the city</h3>
          <p className="muted">
            Travel costs one day. Familiarity makes old observations more
            useful.
          </p>
        </div>
        <button className="secondary" onClick={() => act({ type: "lay-low" })}>
          Lay low <span>+health · −heat · 1 day</span>
        </button>
      </div>
      <div className="borough-grid">
        {BOROUGHS.map((b) => {
          const profile = state.boroughs[b.id];
          const isHere = state.current === b.id;
          const note = profile.ledger.lastVisitDay
            ? `seen Day ${profile.ledger.lastVisitDay} · ${profile.familiarity}/6 familiarity`
            : "unvisited";
          const observations = Object.entries(profile.ledger.observations)
            .slice(0, 2)
            .map(
              ([id, seen]) =>
                `${PRODUCTS.find((p) => p.id === id)?.name} ${cash(seen.price)}`,
            )
            .join(" · ");
          return (
            <button
              key={b.id}
              className={`borough ${isHere ? "here" : ""}`}
              disabled={isHere || state.day >= 30}
              onClick={() => act({ type: "travel", destination: b.id })}
            >
              <span className="borough-name">{b.name}</span>
              <small className="borough-summary">{b.summary}</small>
              <small>{isHere ? "You are here" : note}</small>
              {observations && (
                <small className="observation">{observations}</small>
              )}
              {profile.condition && <em>{profile.condition.label}</em>}
            </button>
          );
        })}
      </div>
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
  if (state.phase !== "encounter") return null;
  return (
    <div className="encounter-backdrop">
      <section className="encounter" role="dialog" aria-modal="true">
        <p className="eyebrow">POLICE ENCOUNTER</p>
        <h2>They want to search the bag.</h2>
        <p>
          Route risk is{" "}
          {Math.round((state.pendingEncounter?.routeRisk ?? 0) * 100)}%. You
          have {state.guns} gun{state.guns === 1 ? "" : "s"} and {state.health}{" "}
          health.
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
        <p className="hint">
          Escape is safer but can cost part of the bag. Guns materially improve
          a fight, and one may be lost.
        </p>
      </section>
    </div>
  );
}

function Game({ initial, onNew }: { initial: GameState; onNew: () => void }) {
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
      if (event.key.toLowerCase() === "l") act({ type: "lay-low" });
      if (state.phase === "encounter" && event.key.toLowerCase() === "e")
        act({ type: "resolve-encounter", choice: "escape" });
      if (state.phase === "encounter" && event.key.toLowerCase() === "f")
        act({ type: "resolve-encounter", choice: "fight" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase]);
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
          <Stat label="Debt" value={cash(state.debt)} />
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
          <p className="eyebrow">THE CITY · {state.name}</p>
          <h1>{boroughName(state.current)}</h1>
        </div>
        <div className="day-track">
          <span>DAY</span>
          <strong>{state.day}</strong>
          <small>of 30</small>
          <div className="track">
            <i style={{ width: `${(state.day / 30) * 100}%` }} />
          </div>
        </div>
      </header>
      <section className="stats">
        <Stat label="Cash" value={cash(state.cash)} />
        <Stat label="Bank" value={cash(state.bank)} />
        <Stat label="Debt" value={cash(state.debt)} tone="debt" />
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
      <div className="lower-grid">
        <div>
          <Services state={state} act={act} />
          <Travel state={state} act={act} />
        </div>
        <Ledger state={state} />
      </div>
      <div className="day-actions">
        <span>When you are ready:</span>
        {state.day === 30 ? (
          <button
            className="primary"
            onClick={() => act({ type: "finish-day" })}
          >
            Settle Day 30
          </button>
        ) : (
          <span className="muted">Travel or lay low to advance the day.</span>
        )}
      </div>
      <Encounter state={state} act={act} />
    </main>
  );
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  return game ? (
    <Game
      initial={game}
      onNew={() => {
        localStorage.removeItem(SAVE_KEY);
        setGame(null);
      }}
    />
  ) : (
    <StartScreen onStart={setGame} />
  );
}
