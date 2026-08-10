import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Action,
  BANK_DAILY_RATE,
  BOROUGHS,
  BoroughId,
  boroughServiceNames,
  currentBorough,
  fenceValue,
  GameState,
  GUN_CATALOG,
  inventoryUnits,
  localServiceError,
  LOCAL_SERVICES,
  MAX_GUNS,
  nextCoatOffer,
  REPEAT_LOAN_ADVANCE,
  REPEAT_LOAN_DEBT,
  STORAGE_CAPACITY,
  STORAGE_DAILY_RENT,
  isStorageBorough,
  storageUnitAt,
  type LocalServiceOffer,
  ProductId,
  PRODUCTS,
  startGame,
  storedUnits,
  applyAction,
  weaponIds,
} from "./game/engine";
import {
  loadGame,
  loadRunnerName,
  loadScores,
  SAVE_KEY,
  saveGame,
  saveRunnerName,
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
              Build net worth by trading across five boroughs. Sell what you can
              before settling on Day 30: unsold stock has no final value.
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
              The bank and loan shark operate only in your home borough. Guns
              are sold in The Bronx. Your opening $5,000 comes with $10,000 debt
              and five days before collection pressure begins.
            </p>
          </article>
          <article>
            <h3>Risk</h3>
            <p>
              Heat drives both police risk and patrol size; routes, cargo, and
              local enforcement modify the odds. Volume builds heat; large Coke
              and Heroin trades build it abruptly. Each gun fires independently
              in a fight. Police kills create a heat floor that only plastic
              surgery removes. The loan shark's enforcers begin looking after
              grace expires.
            </p>
          </article>
          <article>
            <h3>Lay low</h3>
            <p>
              Laying low restores health. Low heat disappears quickly; high heat
              is stubborn and cannot fall below notoriety. Markets have no
              quantity cap beyond cash, coat space, and the day’s listings.
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
  const saved = loadGame();
  const [name, setName] = useState(() => saved?.name ?? loadRunnerName());
  const [home, setHome] = useState<BoroughId>("brooklyn");
  const nameInput = useRef<HTMLInputElement>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 0xffffffff));
  const scores = loadScores();
  return (
    <main className="start shell">
      <div className="brand-title">
        <img src={BRAND_MARK} alt="" />
        <h1>THE CITY</h1>
      </div>
      <section className="start-card">
        <div className="runner-name-control">
          <input
            ref={nameInput}
            aria-label="Runner name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName(saveRunnerName(name))}
            placeholder="Runner"
            maxLength={24}
          />
          <button
            type="button"
            aria-label="Edit runner name"
            onClick={() => nameInput.current?.focus()}
          >
            ✎
          </button>
        </div>
        <label className="home-borough-control">
          <span>Home borough</span>
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
        </label>
        <button
          className="primary big"
          onClick={() => {
            const clean = saveRunnerName(name);
            setName(clean);
            onStart(startGame(clean, home, seed));
          }}
        >
          Start
        </button>
        {saved && saved.phase !== "gameover" && (
          <button className="secondary big" onClick={() => onStart(saved)}>
            Resume
          </button>
        )}
      </section>
      <section className="scores">
        <h2>Personal scores</h2>
        {scores.length === 0 ? (
          <p className="muted">No completed runs on this device yet.</p>
        ) : (
          <ol>
            {scores.slice(0, 5).map((s, index) => (
              <li key={`${s.date}-${s.value}-${s.name}-${index}`}>
                <span>
                  <b>{s.name}</b>
                  <small>{s.date}</small>
                </span>
                <strong>
                  {cash(s.value)} <small>net worth</small>
                </strong>
                <small>
                  {s.day} days · {s.home ? boroughName(s.home) : "Legacy run"} ·{" "}
                  {s.officersKilled ?? 0} cops killed
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

function SectionToggle({
  label,
  expanded,
  onToggle,
  controlsId,
  tag,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  controlsId: string;
  tag?: string;
}) {
  return (
    <div className="panel-heading">
      <button
        className="section-toggle"
        aria-expanded={expanded}
        aria-controls={controlsId}
        onClick={onToggle}
      >
        <span>{label}</span>
        <span className="section-toggle-icon" aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>
      {tag && <span className="tag">{tag}</span>}
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
  const [expanded, setExpanded] = useState(true);
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
    closeProduct();
  };
  useEffect(() => {
    if (state.phase !== "market") closeProduct();
  }, [state.phase, state.day, state.current]);
  return (
    <section className="market panel">
      <SectionToggle
        label="Market"
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        controlsId="market-board-content"
      />
      {expanded && (
        <div id="market-board-content" className="section-content">
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
                          <span
                            className="dot"
                            style={{ background: p.color }}
                          />
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
        </div>
      )}
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

function StorageDialog({
  state,
  act,
  onClose,
}: {
  state: GameState;
  act: (a: Action) => void;
  onClose: () => void;
}) {
  if (!isStorageBorough(state.current)) return null;
  const [mode, setMode] = useState<"store" | "retrieve" | null>(null);
  const [selected, setSelected] = useState<ProductId | null>(null);
  const [quantity, setQuantity] = useState(0);
  const unit = storageUnitAt(state, state.current);
  const storage = unit.inventory;
  const products = PRODUCTS.filter((item) =>
    mode === "store"
      ? state.inventory[item.id].quantity > 0
      : storage[item.id].quantity > 0,
  );
  const available = selected
    ? mode === "store"
      ? state.inventory[selected].quantity
      : Math.min(
          storage[selected].quantity,
          state.capacity - inventoryUnits(state),
        )
    : 0;
  const normalized = normalizeTradeQuantity(quantity);
  const quantityError =
    selected && available < 1
      ? "There is no room in your coat."
      : normalized < 1
        ? "Enter a quantity."
        : normalized > available
          ? `Maximum: ${available}.`
          : "";
  const back = () => {
    if (selected) {
      setSelected(null);
      setQuantity(0);
    } else {
      setMode(null);
    }
  };
  const run = () => {
    if (!mode || !selected || quantityError) return;
    act({ type: mode, product: selected, quantity: normalized });
    onClose();
  };
  return (
    <Dialog title="Storage unit" onClose={onClose}>
      {!unit.active ? (
        <>
          <p className="dialog-context">
            A local unit holds {STORAGE_CAPACITY} items. Rent is{" "}
            {cash(STORAGE_DAILY_RENT)} now and on each new game day.
          </p>
          <div className="dialog-actions">
            <button
              className="primary"
              disabled={state.cash < STORAGE_DAILY_RENT}
              onClick={() => {
                act({ type: "rent-storage" });
                onClose();
              }}
            >
              Rent unit
            </button>
            <button className="text-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : !mode ? (
        <>
          <div className="dialog-facts storage-facts">
            <span>
              Coat
              <b>
                {inventoryUnits(state)} / {state.capacity}
              </b>
            </span>
            <span>
              Stored
              <b>
                {storedUnits(state, state.current)} / {STORAGE_CAPACITY}
              </b>
            </span>
          </div>
          <div className="choice-actions">
            <button className="primary" onClick={() => setMode("store")}>
              Store stock
            </button>
            <button
              disabled={storedUnits(state, state.current) < 1}
              onClick={() => setMode("retrieve")}
            >
              Retrieve stock
            </button>
            <button className="text-button" onClick={onClose}>
              Cancel
            </button>
            {storedUnits(state, state.current) === 0 && (
              <button
                className="text-button"
                onClick={() => {
                  act({ type: "close-storage" });
                  onClose();
                }}
              >
                Close unit
              </button>
            )}
          </div>
        </>
      ) : !selected ? (
        <>
          <p className="dialog-context">
            {mode === "store"
              ? "Choose stock to store."
              : "Choose stock to retrieve."}
          </p>
          {products.length > 0 ? (
            <div className="storage-product-list">
              {products.map((item) => (
                <button key={item.id} onClick={() => setSelected(item.id)}>
                  <span>
                    <i className="dot" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <b>
                    {mode === "store"
                      ? state.inventory[item.id].quantity
                      : storage[item.id].quantity}
                  </b>
                </button>
              ))}
            </div>
          ) : (
            <p className="inline-error">
              {mode === "store" ? "Your coat is empty." : "The unit is empty."}
            </p>
          )}
          <div className="dialog-actions">
            <button onClick={back}>Back</button>
          </div>
        </>
      ) : (
        <>
          <p className="dialog-context">
            {PRODUCTS.find((item) => item.id === selected)?.name} · {available}{" "}
            max
          </p>
          <label className="dialog-quantity">
            Quantity
            <input
              autoFocus
              type="number"
              min="0"
              max={available}
              value={quantity}
              onChange={(event) =>
                setQuantity(normalizeTradeQuantity(Number(event.target.value)))
              }
            />
          </label>
          {quantityError && <p className="inline-error">{quantityError}</p>}
          <div className="dialog-actions">
            <button
              className="primary"
              disabled={Boolean(quantityError)}
              onClick={run}
            >
              {mode === "store" ? "Store" : "Retrieve"}
            </button>
            <button
              className="mini"
              disabled={available < 1}
              onClick={() => setQuantity(available)}
            >
              Max
            </button>
            <button onClick={back}>Back</button>
          </div>
        </>
      )}
    </Dialog>
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
  const [gunDialog, setGunDialog] = useState(false);
  const [storageDialog, setStorageDialog] = useState(false);
  const [localService, setLocalService] = useState<LocalServiceOffer | null>(
    null,
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceAction, setServiceAction] = useState<ServiceAction | null>(
    null,
  );
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const close = () => {
    setDialog(null);
    setGunDialog(false);
    setStorageDialog(false);
    setLocalService(null);
    setStep(1);
    setServiceAction(null);
    setAmount(0);
    setError("");
  };
  const open = (which: "bank" | "loan") => {
    setGunDialog(false);
    setStorageDialog(false);
    setLocalService(null);
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
    close();
  };
  useEffect(() => {
    if (state.phase !== "market") close();
  }, [state.current, state.home, state.phase]);
  const isHome = state.current === state.home;
  const localOffers = LOCAL_SERVICES[state.current];
  const contact = state.contacts.find(
    (candidate) => candidate.borough === state.current,
  );
  const localIssue = localService
    ? localServiceError(state, localService.id)
    : undefined;
  const ownedWeapons = weaponIds(state);
  const openLocalOffer = (offer: LocalServiceOffer) => {
    if (offer.id === "arms-dealer") setGunDialog(true);
    else if (offer.id === "storage-unit") setStorageDialog(true);
    else setLocalService(offer);
  };
  return (
    <section className="panel services">
      <div className="panel-heading">
        <h3>Local services</h3>
      </div>
      <div className="service-buttons">
        {isHome && (
          <>
            <button onClick={() => open("bank")}>Visit bank</button>
            <button onClick={() => open("loan")}>Visit loan shark</button>
          </>
        )}
        {localOffers.map((offer) => (
          <button
            key={offer.id}
            data-service-id={offer.id}
            onClick={() => openLocalOffer(offer)}
          >
            {offer.label}
          </button>
        ))}
        {contact && (
          <button onClick={() => act({ type: "consult-contact" })}>
            Talk to {contact.name}
          </button>
        )}
      </div>
      {dialog && (
        <Dialog
          title={dialog === "bank" ? "BANK" : "LOAN SHARK"}
          onClose={close}
        >
          <div className="rate-readout">
            {dialog === "bank" ? (
              <>
                <span>Balance {cash(state.bank)}</span>
                <span>
                  Interest {(BANK_DAILY_RATE * 100).toFixed(1)}% daily
                </span>
              </>
            ) : (
              <>
                <span>Debt {cash(state.debt)}</span>
                <span>Vig {(state.loanRate * 100).toFixed(1)}% daily</span>
                {state.debt === 0 && (
                  <span>
                    New credit {cash(REPEAT_LOAN_ADVANCE)} cash /{" "}
                    {cash(REPEAT_LOAN_DEBT)} debt
                  </span>
                )}
              </>
            )}
          </div>
          {step === 1 ? (
            <>
              {dialog === "loan" && (
                <p className="dialog-context">
                  The loan shark looks you over. “Whatchu got for me,{" "}
                  {state.name}?”
                </p>
              )}
              <div className="choice-actions loan-choices">
                {dialog === "bank" ? (
                  <>
                    <button
                      className="primary"
                      onClick={() => choose("deposit")}
                    >
                      Deposit
                    </button>
                    <button onClick={() => choose("withdraw")}>Withdraw</button>
                  </>
                ) : (
                  <>
                    <button
                      className="primary"
                      disabled={state.debt < 1 || state.cash < state.debt}
                      onClick={() => {
                        act({ type: "repay", amount: state.debt });
                        close();
                      }}
                    >
                      <span>I got your money</span>
                      <small>Full repayment</small>
                    </button>
                    <button
                      disabled={state.debt < 1}
                      onClick={() => choose("repay")}
                    >
                      <span>I have some of the money now</span>
                      <small>Partial repayment</small>
                    </button>
                    <button
                      onClick={() => {
                        act({ type: "borrow", amount: REPEAT_LOAN_ADVANCE });
                        close();
                      }}
                    >
                      <span>I need more help</span>
                      <small>Borrow</small>
                    </button>
                    {state.debt > 0 ? (
                      <button
                        className="danger"
                        onClick={() => {
                          act({ type: "loan-more-time" });
                          close();
                        }}
                      >
                        I need more time
                      </button>
                    ) : (
                      <button className="text-button" onClick={close}>
                        Cancel
                      </button>
                    )}
                  </>
                )}
                {dialog === "bank" && (
                  <button className="text-button" onClick={close}>
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="dialog-context">
                {serviceAction === "deposit" &&
                  `Cash available: ${cash(state.cash)}`}
                {serviceAction === "withdraw" &&
                  `Bank balance: ${cash(state.bank)}`}
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
              </div>
            </>
          )}
        </Dialog>
      )}
      {gunDialog && (
        <Dialog title="Buy a gun" onClose={close}>
          <p className="dialog-context">
            {state.guns} / {MAX_GUNS} guns
          </p>
          <div className="gun-catalog">
            {GUN_CATALOG.map((gun) => {
              const owned = ownedWeapons.includes(gun.id);
              const full = state.guns >= MAX_GUNS;
              const short = state.cash < gun.price;
              return (
                <div className="gun-option" key={gun.id}>
                  <span>
                    <b>{gun.name}</b>
                    <small>{cash(gun.price)}</small>
                  </span>
                  <button
                    className={owned ? "" : "primary"}
                    disabled={owned || full || short}
                    onClick={() => {
                      act({ type: "buy-gun", gun: gun.id });
                    }}
                  >
                    {owned
                      ? "Owned"
                      : full
                        ? "Full"
                        : short
                          ? "Need cash"
                          : "Buy"}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="dialog-actions gun-dialog-actions">
            <button className="text-button" onClick={close}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
      {storageDialog && (
        <StorageDialog state={state} act={act} onClose={close} />
      )}
      {localService && (
        <Dialog title={localService.title} onClose={close}>
          <p className="dialog-context">
            {localService.id === "coat-maker" && nextCoatOffer(state.capacity)
              ? `A ${nextCoatOffer(state.capacity)?.capacity}-space coat costs ${cash(nextCoatOffer(state.capacity)?.price ?? 0)}.`
              : localService.description}
            {localService.id === "fence" &&
              ` Today's offer is ${cash(fenceValue(state))}.`}
          </p>
          {localIssue && <p className="inline-error">{localIssue}</p>}
          <div className="dialog-actions">
            <button
              className="primary"
              disabled={Boolean(localIssue)}
              onClick={() => {
                if (localService.id === "fence") act({ type: "use-fence" });
                else
                  act({
                    type: "use-local-service",
                    service: localService.id,
                  });
                close();
              }}
            >
              {localService.confirmLabel}
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

function Coat({ state }: { state: GameState }) {
  const [expanded, setExpanded] = useState(true);
  const carried = PRODUCTS.filter((p) => state.inventory[p.id].quantity > 0);
  return (
    <section className="panel inventory-panel">
      <SectionToggle
        label="Coat"
        tag={`${inventoryUnits(state)} / ${state.capacity}`}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        controlsId="coat-content"
      />
      {expanded && (
        <div id="coat-content" className="section-content">
          {carried.length === 0 ? (
            <p className="empty-inventory">No stock carried.</p>
          ) : carried.length > 0 ? (
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
          ) : null}
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
  if (state.day === 30)
    return (
      <section className="panel travel settle-panel">
        <button
          className="primary big settle-button"
          onClick={() => act({ type: "finish-day" })}
        >
          Settle up
        </button>
      </section>
    );
  return (
    <section className="panel travel">
      <div className="travel-buttons">
        <button className="secondary" onClick={() => setOpen(true)}>
          Travel
        </button>
        <button
          className="secondary"
          disabled={state.day >= 30}
          onClick={() => act({ type: "lay-low" })}
        >
          Lay low
        </button>
      </div>
      {open && (
        <Dialog title="Travel" eyebrow="MOVE" onClose={close}>
          <div className="destination-list">
            {BOROUGHS.map((b) => {
              const isHere = state.current === b.id;
              const isHome = state.home === b.id;
              return (
                <button
                  key={b.id}
                  disabled={isHere || state.day >= 30}
                  onClick={() => travelTo(b.id)}
                  aria-current={isHere ? "location" : undefined}
                >
                  <span className="destination-heading">
                    <strong>{b.name}</strong>
                    {(isHome || isHere) && (
                      <span className="destination-status">
                        {[isHome ? "Home" : "", isHere ? "Here" : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </span>
                  <small>
                    {boroughServiceNames(b.id, state.home, state.contacts).join(
                      " · ",
                    )}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="dialog-actions">
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
  const [expanded, setExpanded] = useState(false);
  const here = currentBorough(state);
  const contact = state.contacts.find(
    (candidate) => candidate.borough === state.current,
  );
  const familiarity = contact
    ? `${contact.name} is your contact here.`
    : here.ledger.visits >= 2
      ? "You are becoming a familiar face."
      : "First impressions are all you have.";
  return (
    <aside className="panel journal">
      <SectionToggle
        label="Field notes"
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        controlsId="field-notes-content"
      />
      {expanded && (
        <div id="field-notes-content" className="section-content">
          <p className="familiarity">{familiarity}</p>
          <div className="field-note-list">
            {state.fieldNotes.map((note) => (
              <p key={note.id}>
                <b>Day {note.day}</b> {note.message}
              </p>
            ))}
            {state.fieldNotes.length === 0 && (
              <p className="muted">No notes yet. Travel and pay attention.</p>
            )}
          </div>
          <details className="ledger-details">
            <summary>All borough observations</summary>
            <div className="price-matrix-wrap">
              <table className="price-matrix">
                <thead>
                  <tr>
                    <th>Borough</th>
                    {PRODUCTS.map((product) => (
                      <th key={product.id}>{product.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOROUGHS.map((borough) => {
                    const entry = state.boroughs[borough.id].ledger;
                    return (
                      <tr key={borough.id}>
                        <th>
                          <b>{borough.name}</b>
                          <small>
                            {entry.lastVisitDay
                              ? `D${entry.lastVisitDay} · ${entry.visits} visit${entry.visits === 1 ? "" : "s"}`
                              : "Not visited"}
                          </small>
                        </th>
                        {PRODUCTS.map((product) => {
                          const seen = entry.observations[product.id];
                          return (
                            <td key={product.id}>
                              {seen ? (
                                <>
                                  <b>{cash(seen.price)}</b>
                                  <small>D{seen.day}</small>
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
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
            {outcome.kind === "police"
              ? "POLICE ENCOUNTER"
              : outcome.kind === "contact"
                ? "CONTACT"
                : outcome.kind === "storage"
                  ? "STORAGE"
                  : "LOAN SHARK"}
          </p>
          <h2>{outcome.title}</h2>
          <p>{outcome.message}</p>
          <div className="encounter-actions">
            <button
              className="primary"
              onClick={() => act({ type: "continue" })}
            >
              {outcome.buttonLabel ?? "Continue"}
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
  if (state.pendingEncounter?.stage === "police-fire")
    return (
      <div className="encounter-backdrop">
        <section className="encounter" role="dialog" aria-modal="true">
          <p className="eyebrow">POLICE ENCOUNTER</p>
          <h2>They're firing at you!</h2>
          <p>
            {officers} {officers === 1 ? "officer is" : "officers are"} still in
            the chase.
          </p>
          <div className="encounter-actions">
            <button
              className="primary"
              onClick={() => act({ type: "resolve-police-fire" })}
            >
              Continue
            </button>
          </div>
        </section>
      </div>
    );
  return (
    <div className="encounter-backdrop">
      <section className="encounter" role="dialog" aria-modal="true">
        <p className="eyebrow">POLICE ENCOUNTER</p>
        <h2>The police are on you.</h2>
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
            R — Run
          </button>
          {state.guns > 0 && (
            <button
              className="danger"
              onClick={() =>
                act({ type: "resolve-encounter", choice: "fight" })
              }
            >
              F — Fight
            </button>
          )}
          <button
            onClick={() =>
              act({ type: "resolve-encounter", choice: "give-up" })
            }
          >
            G — Give up
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
      else if (
        state.phase === "encounter" &&
        state.pendingEncounter?.stage === "police-fire" &&
        event.key === "Enter"
      )
        act({ type: "resolve-police-fire" });
      else if (state.phase === "encounter" && event.key.toLowerCase() === "r")
        act({ type: "resolve-encounter", choice: "escape" });
      else if (state.phase === "encounter" && event.key.toLowerCase() === "f")
        act({ type: "resolve-encounter", choice: "fight" });
      else if (state.phase === "encounter" && event.key.toLowerCase() === "g")
        act({ type: "resolve-encounter", choice: "give-up" });
      else if (state.phase === "market" && event.key.toLowerCase() === "l")
        act({ type: "lay-low" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.pendingEncounter?.stage, instructionsOpen]);
  const net = state.cash + state.bank - state.debt;
  if (state.phase === "gameover")
    return (
      <main className="shell end">
        <h1>GAME OVER</h1>
        <p className="final-score-label">Net Worth</p>
        <div className="final-score">{cash(state.score?.value ?? net)}</div>
        <div className="final-grid">
          <Stat label="Days" value={`${state.day} / 30`} />
        </div>
        <button className="primary big" onClick={onNew}>
          Back to Start
        </button>
      </main>
    );
  return (
    <main className="shell game">
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="game-home-link"
            aria-label="Return to start screen"
            onClick={() => {
              saveGame(state);
              onLeave();
            }}
          >
            <span className="game-brand">
              <img src={BRAND_MARK} alt="" />
              <span>THE CITY</span>
            </span>
          </button>
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
          value={
            state.heatFloor > 0
              ? `${state.heat}% · floor ${state.heatFloor}%`
              : `${state.heat}%`
          }
          tone={state.heat > 60 ? "danger-text" : ""}
        />
        <Stat label="Guns" value={`${state.guns}`} />
      </section>
      <Coat state={state} />
      <Market state={state} act={act} />
      <Services state={state} act={act} />
      <Travel state={state} act={act} />
      <Ledger state={state} />
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
