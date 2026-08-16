import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Action,
  BANK_DAILY_RATE,
  BOROUGHS,
  BoroughId,
  boroughServiceNames,
  currentBorough,
  fenceMultiplier,
  fenceValue,
  GameState,
  GUN_CATALOG,
  inventoryUnits,
  localServiceError,
  LOCAL_SERVICES,
  MAX_GUNS,
  MAX_STORAGE_UNITS,
  nextCoatOffer,
  REPEAT_LOAN_ADVANCE,
  REPEAT_LOAN_DEBT,
  STORAGE_CAPACITY,
  STORAGE_DAILY_RENT,
  isStorageBorough,
  storageUnitAt,
  storageSaleMultiplier,
  storageBuyMultiplier,
  type StorageSource,
  type StorageBoroughId,
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

const cash = (n: number) => {
  const rounded = Math.round(n);
  const amount = Math.abs(rounded).toLocaleString();
  return rounded < 0 ? `-$${amount}` : `$${amount}`;
};
const BRAND_MARK = "./sb-a1.png";
const boroughName = (id: BoroughId) =>
  BOROUGHS.find((b) => b.id === id)?.name ?? id;
const STORAGE_LOCATIONS: StorageBoroughId[] = ["brooklyn", "queens", "staten"];

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
              Choose Buy or Sell. Pick purchases up in your coat, or deliver up
              to 200 units into one compatible rented unit for a 20% local or
              40% remote premium. A market storage sale liquidates one complete
              unit and ends its contract, paying 70% locally or 50% remotely;
              its product must be listed.
            </p>
          </article>
          <article>
            <h3>Move</h3>
            <p>
              Jetting and laying low each use a day. Revisit boroughs to turn
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
              local enforcement modify the odds. Trade value builds heat on a
              gradual curve. You may own and fire up to two guns; more expensive
              models are more reliable. Police killings make future heat rise
              faster and fade more slowly until plastic surgery. The loan
              shark's enforcers begin looking after grace expires.
            </p>
          </article>
          <article>
            <h3>Cooling off</h3>
            <p>
              Heat falls when a day passes without new heat-producing activity.
              Laying low also restores health. Accumulated exposure and police
              killings make cooling slower. Markets have no quantity cap beyond
              cash, coat space, and the day’s listings.
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
      <div className="start-hero">
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
          <div className="start-actions">
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
          </div>
        </section>
      </div>
      <section className="scores">
        <h2>Personal scores</h2>
        {scores.length === 0 ? (
          <p className="muted">No completed runs on this device yet.</p>
        ) : (
          <ol>
            {scores.slice(0, 5).map((s, index) => (
              <li key={`${s.date}-${s.value}-${s.name}-${index}`}>
                <span className="score-identity">
                  <b>{s.name}</b>
                  <small>{s.date}</small>
                </span>
                <span className="score-value">
                  <strong>{cash(s.value)}</strong>
                  <small>Net worth</small>
                </span>
                <small className="score-meta">
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
  dismissible = true,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  dismissible?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!dismissible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [dismissible, onClose]);
  const titleId = `dialog-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
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
  const [tradeMode, setTradeMode] = useState<"buy" | "sell" | null>(null);
  const [productId, setProductId] = useState<ProductId | null>(null);
  const [buyDestination, setBuyDestination] = useState<"coat" | StorageSource>(
    "coat",
  );
  const [sellSource, setSellSource] = useState<"coat" | StorageSource | null>(
    null,
  );
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const product = productId
    ? PRODUCTS.find((item) => item.id === productId)
    : undefined;
  const allStorageUnits = STORAGE_LOCATIONS.flatMap((borough) =>
    state.storageUnits[borough].units.map((unit) => ({ borough, unit })),
  );
  const selectedBuyUnit =
    buyDestination === "coat"
      ? undefined
      : state.storageUnits[buyDestination.borough].units.find(
          (unit) => unit.slot === buyDestination.unit,
        );
  const selectedSellUnit =
    sellSource && sellSource !== "coat"
      ? state.storageUnits[sellSource.borough].units.find(
          (unit) => unit.slot === sellSource.unit,
        )
      : undefined;
  const held = product ? state.inventory[product.id].quantity : 0;
  const price = product ? state.market.prices[product.id] : 0;
  const listed = product ? state.market.listed.includes(product.id) : false;
  const buyMultiplier =
    buyDestination === "coat"
      ? 1
      : storageBuyMultiplier(state.current, buyDestination.borough);
  const tradePrice = Math.ceil(price * buyMultiplier);
  const destinationSpace =
    buyDestination === "coat"
      ? state.capacity - inventoryUnits(state)
      : STORAGE_CAPACITY - (selectedBuyUnit?.quantity ?? STORAGE_CAPACITY);
  const maxBuy =
    product && listed
      ? Math.floor(
          Math.min(state.cash / tradePrice, Math.max(0, destinationSpace)),
        )
      : 0;
  const compatibleStorage = productId
    ? allStorageUnits.filter(
        ({ unit }) =>
          unit.quantity < STORAGE_CAPACITY &&
          (unit.productId === undefined || unit.productId === productId),
      )
    : [];
  const closeTrade = () => {
    setTradeMode(null);
    setProductId(null);
    setBuyDestination("coat");
    setSellSource(null);
    setQuantity(0);
    setError("");
  };
  const openTrade = (mode: "buy" | "sell") => {
    setTradeMode(mode);
    setProductId(null);
    setBuyDestination("coat");
    setSellSource(null);
    setQuantity(0);
    setError("");
  };
  const chooseProduct = (id: ProductId) => {
    setProductId(id);
    setBuyDestination("coat");
    setQuantity(0);
    setError("");
  };
  const transact = () => {
    if (!tradeMode || !productId || !product) return;
    if (tradeMode === "sell" && sellSource !== "coat") {
      if (!sellSource || !selectedSellUnit)
        return setError("Choose a storage unit.");
      if (!listed) return setError(`${product.name} is not listed here today.`);
      act({
        type: "sell-storage",
        borough: sellSource.borough,
        unit: sellSource.unit,
      });
      closeTrade();
      return;
    }
    const q = normalizeTradeQuantity(quantity);
    if (q < 1) return setError("Enter a quantity greater than zero.");
    if (!listed) return setError(`${product.name} is not listed here today.`);
    if (tradeMode === "buy" && q > maxBuy)
      return setError(
        `You can buy at most ${maxBuy} ${product.name} with the available cash and space.`,
      );
    if (tradeMode === "sell" && q > held)
      return setError(`Only ${held} ${product.name} are in your coat.`);
    if (tradeMode === "buy" && buyDestination !== "coat")
      act({
        type: "buy-storage",
        borough: buyDestination.borough,
        unit: buyDestination.unit,
        product: productId,
        quantity: q,
      });
    else if (tradeMode === "buy")
      act({ type: "buy", product: productId, quantity: q });
    else act({ type: "sell", product: productId, quantity: q });
    closeTrade();
  };
  useEffect(() => {
    if (state.phase !== "market") {
      setTradeMode(null);
      setProductId(null);
      setBuyDestination("coat");
      setSellSource(null);
      setQuantity(0);
      setError("");
    }
  }, [state.phase, state.day, state.current]);
  const coatProducts = PRODUCTS.filter(
    (item) => state.inventory[item.id].quantity > 0,
  );
  const stockedStorage = allStorageUnits.filter(
    ({ unit }) => unit.productId !== undefined && unit.quantity > 0,
  );
  const storageSalePrice =
    sellSource && sellSource !== "coat" && product
      ? Math.floor(
          price * storageSaleMultiplier(state.current, sellSource.borough),
        )
      : 0;
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
          <div className="market-price-grid">
            {PRODUCTS.map((item) => {
              const available = state.market.listed.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`market-price ${available ? "" : "unlisted"}`}
                >
                  <span>
                    <i className="dot" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <b>{available ? cash(state.market.prices[item.id]) : "—"}</b>
                </div>
              );
            })}
          </div>
          <div className="market-actions">
            <button className="primary" onClick={() => openTrade("buy")}>
              Buy
            </button>
            <button onClick={() => openTrade("sell")}>Sell</button>
          </div>
        </div>
      )}
      {tradeMode && (
        <Dialog
          title={tradeMode === "buy" ? "Buy" : "Sell"}
          eyebrow="MARKET"
          onClose={closeTrade}
        >
          {tradeMode === "buy" && !product ? (
            <>
              <p className="dialog-context">Choose a listed product.</p>
              <div className="trade-product-list">
                {PRODUCTS.filter((item) =>
                  state.market.listed.includes(item.id),
                ).map((item) => (
                  <button key={item.id} onClick={() => chooseProduct(item.id)}>
                    <span>
                      <i className="dot" style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <b>{cash(state.market.prices[item.id])}</b>
                  </button>
                ))}
              </div>
              <div className="dialog-actions">
                <button className="text-button" onClick={closeTrade}>
                  Cancel
                </button>
              </div>
            </>
          ) : tradeMode === "sell" && !product ? (
            <>
              <h3 className="dialog-subheading">From coat</h3>
              {coatProducts.length > 0 ? (
                <div className="trade-product-list">
                  {coatProducts.map((item) => {
                    const available = state.market.listed.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        disabled={!available}
                        onClick={() => {
                          setSellSource("coat");
                          chooseProduct(item.id);
                        }}
                      >
                        <span>
                          <i
                            className="dot"
                            style={{ background: item.color }}
                          />
                          {item.name}
                          <small>
                            Held {state.inventory[item.id].quantity}
                          </small>
                        </span>
                        <b>
                          {available
                            ? cash(state.market.prices[item.id])
                            : "Not listed"}
                        </b>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">Your coat is empty.</p>
              )}
              <h3 className="dialog-subheading">From storage</h3>
              <p className="dialog-context">
                Storage sales liquidate one complete unit and end its contract.
              </p>
              {stockedStorage.length > 0 ? (
                <div className="trade-product-list storage-market-list">
                  {stockedStorage.map(({ borough, unit }) => {
                    const id = unit.productId as ProductId;
                    const item = PRODUCTS.find(
                      (candidate) => candidate.id === id,
                    );
                    const available = state.market.listed.includes(id);
                    const multiplier = storageSaleMultiplier(
                      state.current,
                      borough,
                    );
                    const unitPrice = Math.floor(
                      state.market.prices[id] * multiplier,
                    );
                    return (
                      <button
                        key={`${borough}-${unit.slot}`}
                        disabled={!available}
                        onClick={() => {
                          setSellSource({ borough, unit: unit.slot });
                          chooseProduct(id);
                        }}
                      >
                        <span>
                          {boroughName(borough)} · Unit {unit.slot}
                          <small>
                            {unit.quantity} {item?.name}
                          </small>
                        </span>
                        <b>
                          {available
                            ? `${cash(unitPrice * unit.quantity)} · ${Math.round(multiplier * 100)}%`
                            : "Not listed"}
                        </b>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">No storage unit contains stock.</p>
              )}
              <div className="dialog-actions">
                <button className="text-button" onClick={closeTrade}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dialog-facts">
                <span>
                  Product <b>{product?.name}</b>
                </span>
                <span>
                  {tradeMode === "sell" ? "Unit price" : "Price"}{" "}
                  <b>
                    {listed
                      ? cash(
                          tradeMode === "sell" && sellSource !== "coat"
                            ? storageSalePrice
                            : tradeMode === "sell"
                              ? price
                              : tradePrice,
                        )
                      : "Not listed"}
                  </b>
                </span>
                <span>
                  {tradeMode === "sell" ? "Available" : "Destination space"}{" "}
                  <b>
                    {tradeMode === "sell"
                      ? sellSource === "coat"
                        ? held
                        : (selectedSellUnit?.quantity ?? 0)
                      : destinationSpace}
                  </b>
                </span>
              </div>
              {tradeMode === "buy" && (
                <>
                  <div
                    className="fulfillment-toggle"
                    role="group"
                    aria-label="Delivery method"
                  >
                    <button
                      className={buyDestination === "coat" ? "selected" : ""}
                      onClick={() => {
                        setBuyDestination("coat");
                        setQuantity(0);
                        setError("");
                      }}
                    >
                      Pick up
                      <small>Market price · coat capacity</small>
                    </button>
                    <button
                      className={buyDestination !== "coat" ? "selected" : ""}
                      disabled={compatibleStorage.length < 1}
                      onClick={() => {
                        const first = compatibleStorage[0];
                        if (first)
                          setBuyDestination({
                            borough: first.borough,
                            unit: first.unit.slot,
                          });
                        setQuantity(0);
                        setError("");
                      }}
                    >
                      Deliver to storage
                      <small>20% local · 40% remote premium</small>
                    </button>
                  </div>
                  {buyDestination !== "coat" && (
                    <label className="dialog-select">
                      Destination unit
                      <select
                        value={`${buyDestination.borough}:${buyDestination.unit}`}
                        onChange={(event) => {
                          const [borough, unit] = event.target.value.split(":");
                          setBuyDestination({
                            borough: borough as StorageBoroughId,
                            unit: Number(unit),
                          });
                          setQuantity(0);
                          setError("");
                        }}
                      >
                        {compatibleStorage.map(({ borough, unit }) => (
                          <option
                            key={`${borough}-${unit.slot}`}
                            value={`${borough}:${unit.slot}`}
                          >
                            {boroughName(borough)} · Unit {unit.slot} ·{" "}
                            {STORAGE_CAPACITY - unit.quantity} spaces ·{" "}
                            {Math.round(
                              (storageBuyMultiplier(state.current, borough) -
                                1) *
                                100,
                            )}
                            % premium
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}
              {tradeMode === "sell" && sellSource !== "coat" && (
                <p className="storage-liquidation-note">
                  Entire unit: {selectedSellUnit?.quantity ?? 0} {product?.name}{" "}
                  · {cash((selectedSellUnit?.quantity ?? 0) * storageSalePrice)}{" "}
                  total. This ends the unit’s contract.
                </p>
              )}
              {(tradeMode === "buy" || sellSource === "coat") && (
                <label className="dialog-quantity">
                  Quantity
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    value={quantity}
                    disabled={!listed}
                    onChange={(event) => {
                      setQuantity(
                        normalizeTradeQuantity(Number(event.target.value)),
                      );
                      setError("");
                    }}
                  />
                </label>
              )}
              {error && (
                <p className="inline-error" role="alert">
                  {error}
                </p>
              )}
              <div className="dialog-actions">
                <button
                  className="primary"
                  disabled={!listed}
                  onClick={transact}
                >
                  {tradeMode === "buy"
                    ? buyDestination === "coat"
                      ? "Pick up"
                      : "Deliver to storage"
                    : sellSource === "coat"
                      ? "Sell"
                      : "Sell entire unit"}
                </button>
                {(tradeMode === "buy" || sellSource === "coat") && (
                  <button
                    className="mini"
                    onClick={() => {
                      setQuantity(tradeMode === "buy" ? maxBuy : held);
                      setError("");
                    }}
                    disabled={
                      !listed || (tradeMode === "buy" ? maxBuy : held) < 1
                    }
                  >
                    Max
                  </button>
                )}
                <button
                  onClick={() => {
                    setProductId(null);
                    setSellSource(null);
                    setBuyDestination("coat");
                    setQuantity(0);
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
  const [mode, setMode] = useState<"store" | "retrieve" | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductId | null>(
    null,
  );
  const [quantity, setQuantity] = useState(0);
  const storageBorough = isStorageBorough(state.current) ? state.current : null;
  const location = storageBorough
    ? state.storageUnits[storageBorough]
    : undefined;
  const unit = location?.units.find(
    (candidate) => candidate.slot === selectedSlot,
  );
  const stored =
    location?.units.reduce(
      (total, candidate) => total + candidate.quantity,
      0,
    ) ?? 0;
  const compatibleCoatProducts = PRODUCTS.filter(
    (item) =>
      state.inventory[item.id].quantity > 0 &&
      (unit?.productId === undefined || unit.productId === item.id),
  );
  const available =
    selectedProduct && unit
      ? mode === "store"
        ? Math.min(
            state.inventory[selectedProduct].quantity,
            STORAGE_CAPACITY - unit.quantity,
          )
        : Math.min(unit.quantity, state.capacity - inventoryUnits(state))
      : 0;
  const normalized = normalizeTradeQuantity(quantity);
  const quantityError =
    selectedProduct && available < 1
      ? mode === "store"
        ? "There is no compatible stock or room in this unit."
        : "There is no room in your coat."
      : normalized < 1
        ? "Enter a quantity."
        : normalized > available
          ? `Maximum: ${available}.`
          : "";
  const resetTransfer = () => {
    setMode(null);
    setSelectedProduct(null);
    setQuantity(0);
  };
  const run = () => {
    if (!mode || !selectedProduct || selectedSlot === null || quantityError)
      return;
    act({
      type: mode,
      unit: selectedSlot,
      product: selectedProduct,
      quantity: normalized,
    });
    resetTransfer();
  };
  useEffect(() => {
    if (selectedSlot !== null && !unit) {
      setSelectedSlot(null);
      resetTransfer();
    }
  }, [selectedSlot, unit]);
  if (!storageBorough || !location) return null;
  return (
    <Dialog title="Storage" onClose={onClose}>
      {selectedSlot === null ? (
        <>
          <p className="dialog-context">
            Each unit holds one product type and up to {STORAGE_CAPACITY} units.
            Rent is {cash(STORAGE_DAILY_RENT)} per unit now and on each new game
            day.
          </p>
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
                {stored} / {location.units.length * STORAGE_CAPACITY}
              </b>
            </span>
            <span>
              Contracts
              <b>
                {location.units.length} / {MAX_STORAGE_UNITS}
              </b>
            </span>
            <span>
              Daily rent
              <b>{cash(STORAGE_DAILY_RENT * location.units.length)}</b>
            </span>
            {location.lateSinceDay !== undefined && (
              <span>
                Status
                <b>Rent overdue</b>
              </span>
            )}
          </div>
          {location.units.length > 0 && (
            <div className="storage-unit-list">
              {location.units.map((candidate) => {
                const item = candidate.productId
                  ? PRODUCTS.find(
                      (product) => product.id === candidate.productId,
                    )
                  : undefined;
                return (
                  <button
                    key={candidate.slot}
                    onClick={() => setSelectedSlot(candidate.slot)}
                  >
                    <span>
                      <b>Unit {candidate.slot}</b>
                      <small>{item ? item.name : "Empty"}</small>
                    </span>
                    <strong>
                      {candidate.quantity} / {STORAGE_CAPACITY}
                    </strong>
                  </button>
                );
              })}
            </div>
          )}
          <div className="dialog-actions">
            <button
              className="primary"
              disabled={
                location.units.length >= MAX_STORAGE_UNITS ||
                state.cash < STORAGE_DAILY_RENT ||
                location.lateSinceDay !== undefined
              }
              onClick={() => act({ type: "rent-storage" })}
            >
              {location.units.length > 0 ? "Rent another unit" : "Rent unit"}
            </button>
            <button className="text-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      ) : !unit ? null : !mode ? (
        <>
          <p className="dialog-context">
            <b>Unit {unit.slot}</b> ·{" "}
            {unit.productId
              ? `${PRODUCTS.find((item) => item.id === unit.productId)?.name}: ${unit.quantity} / ${STORAGE_CAPACITY}`
              : `Empty: 0 / ${STORAGE_CAPACITY}`}
          </p>
          <div className="choice-actions">
            <button
              className="primary"
              disabled={
                unit.quantity >= STORAGE_CAPACITY ||
                compatibleCoatProducts.length < 1
              }
              onClick={() => {
                setMode("store");
                setSelectedProduct(unit.productId ?? null);
              }}
            >
              Store stock
            </button>
            <button
              disabled={
                unit.quantity < 1 || inventoryUnits(state) >= state.capacity
              }
              onClick={() => {
                setMode("retrieve");
                setSelectedProduct(unit.productId ?? null);
              }}
            >
              Withdraw stock
            </button>
            <button
              disabled={
                unit.quantity > 0 || location.lateSinceDay !== undefined
              }
              onClick={() => {
                act({ type: "close-storage", unit: unit.slot });
                setSelectedSlot(null);
                resetTransfer();
              }}
            >
              End contract
            </button>
            <button onClick={() => setSelectedSlot(null)}>Back</button>
          </div>
        </>
      ) : mode === "store" && !selectedProduct ? (
        <>
          <p className="dialog-context">
            Choose one product for Unit {unit.slot}.
          </p>
          {compatibleCoatProducts.length > 0 ? (
            <div className="storage-product-list">
              {compatibleCoatProducts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedProduct(item.id)}
                >
                  <span>
                    <i className="dot" style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <b>{state.inventory[item.id].quantity}</b>
                </button>
              ))}
            </div>
          ) : (
            <p className="inline-error">Your coat has no compatible stock.</p>
          )}
          <div className="dialog-actions">
            <button onClick={resetTransfer}>Back</button>
          </div>
        </>
      ) : (
        <>
          <p className="dialog-context">
            {PRODUCTS.find((item) => item.id === selectedProduct)?.name} ·{" "}
            {available} max
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
              {mode === "store" ? "Store" : "Withdraw"}
            </button>
            <button
              className="mini"
              disabled={available < 1}
              onClick={() => setQuantity(available)}
            >
              Max
            </button>
            <button onClick={resetTransfer}>Back</button>
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
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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
    setMenuOpen(false);
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
  const fenceSources: ("coat" | StorageSource)[] = [
    ...(inventoryUnits(state) > 0 ? (["coat"] as const) : []),
    ...STORAGE_LOCATIONS.flatMap((borough) =>
      state.storageUnits[borough].units
        .filter((unit) => unit.productId !== undefined && unit.quantity > 0)
        .map((unit) => ({ borough, unit: unit.slot })),
    ),
  ];
  const ownedWeapons = weaponIds(state);
  const openLocalOffer = (offer: LocalServiceOffer) => {
    setMenuOpen(false);
    if (offer.id === "arms-dealer") setGunDialog(true);
    else if (offer.id === "storage-unit") setStorageDialog(true);
    else setLocalService(offer);
  };
  return (
    <>
      <button className="secondary" onClick={() => setMenuOpen(true)}>
        Stay local
      </button>
      {menuOpen && (
        <Dialog title="Stay local" eyebrow="HERE" onClose={close}>
          <div className="choice-actions local-choice-list">
            {state.day < 30 && (
              <button
                onClick={() => {
                  act({ type: "lay-low" });
                  close();
                }}
              >
                <span>Lay low</span>
                <small>One day · recover health and avoid new exposure</small>
              </button>
            )}
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
              <button
                onClick={() => {
                  act({ type: "consult-contact" });
                  close();
                }}
              >
                Talk to {contact.name}
              </button>
            )}
            <button className="text-button" onClick={close}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
      {dialog && (
        <Dialog
          title={dialog === "bank" ? "BANK" : "LOAN SHARK"}
          onClose={close}
          dismissible={dialog !== "loan" || state.debt === 0}
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
                        I need more time (Go back)
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
        <Dialog title="Gun shop" onClose={close}>
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
                    <small>
                      {cash(gun.price)} · sell {cash(gun.price * 0.5)}
                    </small>
                  </span>
                  <button
                    className={owned ? "" : "primary"}
                    disabled={!owned && (full || short)}
                    onClick={() => {
                      if (owned) act({ type: "sell-gun", gun: gun.id });
                      else act({ type: "buy-gun", gun: gun.id });
                    }}
                  >
                    {owned
                      ? "Sell"
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
          </p>
          {localIssue && <p className="inline-error">{localIssue}</p>}
          {localService.id === "fence" ? (
            <>
              <div className="choice-actions sell-source-list">
                {fenceSources.map((source) => {
                  const storage =
                    source === "coat"
                      ? undefined
                      : storageUnitAt(state, source.borough, source.unit);
                  const count =
                    source === "coat"
                      ? inventoryUnits(state)
                      : (storage?.quantity ?? 0);
                  const label =
                    source === "coat"
                      ? "Coat"
                      : `${boroughName(source.borough)} storage · Unit ${source.unit}`;
                  return (
                    <button
                      key={
                        source === "coat"
                          ? source
                          : `${source.borough}-${source.unit}`
                      }
                      onClick={() => {
                        act({ type: "use-fence", source });
                        close();
                      }}
                    >
                      <span>{label}</span>
                      <small>
                        {count}{" "}
                        {storage?.productId
                          ? PRODUCTS.find(
                              (item) => item.id === storage.productId,
                            )?.name
                          : "units"}{" "}
                        · {Math.round(fenceMultiplier(source) * 100)}% of last
                        local price · {cash(fenceValue(state, source))}
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
            </>
          ) : (
            <div className="dialog-actions">
              <button
                className="primary"
                disabled={Boolean(localIssue)}
                onClick={() => {
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
          )}
        </Dialog>
      )}
    </>
  );
}

function InventoryPanel({ state }: { state: GameState }) {
  const [expanded, setExpanded] = useState(true);
  const carried = PRODUCTS.filter((p) => state.inventory[p.id].quantity > 0);
  const storage = STORAGE_LOCATIONS.flatMap((borough) =>
    state.storageUnits[borough].units.map((unit) => ({ borough, unit })),
  );
  return (
    <section className="panel inventory-panel">
      <SectionToggle
        label="Inventory"
        tag={`${inventoryUnits(state)} / ${state.capacity}`}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        controlsId="coat-content"
      />
      {expanded && (
        <div id="coat-content" className="section-content">
          <div className="inventory-subheading">
            <h3>Coat</h3>
            <span>
              {inventoryUnits(state)} / {state.capacity}
            </span>
          </div>
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
          {storage.length > 0 && (
            <div className="storage-inventory-subsection">
              <div className="inventory-subheading">
                <h3>Storage</h3>
                <span>{storedUnits(state)} stored</span>
              </div>
              <div className="storage-inventory-list">
                {storage.map(({ borough, unit }) => {
                  const product = unit.productId
                    ? PRODUCTS.find((item) => item.id === unit.productId)
                    : undefined;
                  return (
                    <div
                      className="storage-inventory-item"
                      key={`${borough}-${unit.slot}`}
                    >
                      <span>
                        <b>
                          {boroughName(borough)} · Unit {unit.slot}
                        </b>
                        <small>
                          {product?.name ?? "Empty"}
                          {state.storageUnits[borough].lateSinceDay !==
                          undefined
                            ? " · Rent overdue"
                            : ""}
                        </small>
                      </span>
                      <strong>
                        {unit.quantity} / {STORAGE_CAPACITY}
                      </strong>
                      {unit.quantity > 0 && (
                        <small>avg {cash(unit.avgCost)}</small>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
      <button
        className="primary settle-button"
        onClick={() => act({ type: "finish-day" })}
      >
        Settle up
      </button>
    );
  return (
    <>
      <button className="secondary" onClick={() => setOpen(true)}>
        Jet
      </button>
      {open && (
        <Dialog title="Jet" eyebrow="MOVE" onClose={close}>
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
    </>
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
              <p className="muted">No notes yet. Jet and pay attention.</p>
            )}
          </div>
          <details className="ledger-details">
            <summary>All borough observations</summary>
            <div className="price-matrix-wrap">
              <table className="price-matrix">
                <thead>
                  <tr>
                    <th>Product</th>
                    {BOROUGHS.map((borough) => {
                      const entry = state.boroughs[borough.id].ledger;
                      return (
                        <th key={borough.id}>
                          <b>{borough.name}</b>
                          <small>
                            {entry.lastVisitDay
                              ? `D${entry.lastVisitDay} · ${entry.visits} visit${entry.visits === 1 ? "" : "s"}`
                              : "Not visited"}
                          </small>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((product) => {
                    return (
                      <tr key={product.id}>
                        <th>
                          <i
                            className="dot"
                            style={{ background: product.color }}
                          />
                          <b>{product.name}</b>
                        </th>
                        {BOROUGHS.map((borough) => {
                          const seen =
                            state.boroughs[borough.id].ledger.observations[
                              product.id
                            ];
                          return (
                            <td key={borough.id}>
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
          {outcome.message && <p>{outcome.message}</p>}
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
          value={`${state.heat}%`}
          tone={state.heat > 60 ? "danger-text" : ""}
        />
        <Stat label="Guns" value={`${state.guns}`} />
      </section>
      <div className="game-layout">
        <InventoryPanel state={state} />
        <Market state={state} act={act} />
        <div className="city-actions">
          <Travel state={state} act={act} />
          <Services state={state} act={act} />
        </div>
        <Ledger state={state} />
      </div>
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
