import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Armchair,
  ArrowUpRight,
  Bath,
  BedDouble,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Expand,
  Footprints,
  Heart,
  ImagePlus,
  Lamp,
  Leaf,
  Lightbulb,
  LockKeyhole,
  Maximize,
  Menu,
  MoveUpRight,
  Ruler,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, type DragEvent, type ReactNode } from "react";

import roomImage from "@/assets/decorhub-bedroom.jpg";
import chairImage from "@/assets/decorhub-chair.jpg";
import { Button } from "@/components/ui/button";

type AppScreen = "home" | "capture" | "wizard" | "plan";
type PlanTab = "layout" | "furniture" | "safety";
type RoomType = "Bedroom" | "Living room" | "Study space" | "Dining room";
type FormAnswers = {
  room: RoomType;
  width: string;
  length: string;
  activities: string[];
  style: string;
  budget: number;
  priorities: string[];
};

const roomChoices: { name: RoomType; icon: LucideIcon }[] = [
  { name: "Bedroom", icon: BedDouble },
  { name: "Living room", icon: Waves },
  { name: "Study space", icon: Armchair },
  { name: "Dining room", icon: Bath },
];
const activities = ["Work from home", "Hosting friends", "Quiet mornings", "Reading", "Kids at home", "Pets welcome"];
const styleChoices = [
  { name: "Japandi", note: "Clean lines, natural texture" },
  { name: "Scandinavian", note: "Airy, light-filled simplicity" },
  { name: "Minimalist", note: "Calm, considered essentials" },
  { name: "Bohemian", note: "Collected and full of life" },
  { name: "Modern industrial", note: "Honest materials, softened" },
];
const priorities = ["Clear, accessible pathways", "Child-safe finishes", "Pet-friendly fabrics", "Flexible, modular furniture"];
const products = [
  { type: "SEATING", name: "Haven lounge chair", price: 580, match: 97, description: "A quiet reading corner in responsibly sourced oak and soft boucle.", alternative: "Alder wood chair · 360 — save 220" },
  { type: "LIGHTING", name: "Form table lamp", price: 145, match: 95, description: "Warm, layered bedside light with a dimmable linen shade.", alternative: "Studio ceramic lamp · 85 — save 60" },
  { type: "TEXTILES", name: "Cloud woven rug", price: 390, match: 93, description: "A washable, softly textured landing that anchors the bed.", alternative: "Loop cotton rug · 240 — save 150" },
  { type: "STORAGE", name: "Morrow bedside table", price: 280, match: 92, description: "Compact solid oak, with storage for the things worth keeping.", alternative: "Little oak nightstand · 169 — save 111" },
];

const initialAnswers: FormAnswers = {
  room: "Bedroom",
  width: "3.8",
  length: "4.2",
  activities: ["Quiet mornings", "Reading"],
  style: "Japandi",
  budget: 2400,
  priorities: ["Clear, accessible pathways", "Pet-friendly fabrics"],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DecorHub — Your interior design studio" },
      { name: "description", content: "Make room for a more thoughtful home. Explore a personalized interior plan, grounded in your space, style, and everyday life." },
      { property: "og:title", content: "DecorHub — Your interior design studio" },
      { property: "og:description", content: "A thoughtful interior design studio for rooms that feel like you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DecorHub,
});

function DecorHub() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [roomPhoto, setRoomPhoto] = useState(roomImage);
  const [customPhoto, setCustomPhoto] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<PlanTab>("layout");
  const [floorView, setFloorView] = useState<"2D" | "3D">("2D");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>(["Bed", "Rug", "Side table", "Lamp", "Plant", "Dresser"]);
  const [message, setMessage] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  function changeAnswer<Key extends keyof FormAnswers>(key: Key, value: FormAnswers[Key]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function toggleAnswer(key: "activities" | "priorities", value: string) {
    setAnswers((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  }

  function selectPhoto(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setRoomPhoto(URL.createObjectURL(file));
    setCustomPhoto(true);
    setHasScanned(false);
    setMessage("Your room photo is ready. Computer-vision detection is simulated in this preview.");
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    selectPhoto(event.dataTransfer.files.item(0) ?? undefined);
  }

  function toggleFurniture(item: string) {
    setSelectedFurniture((current) =>
      current.includes(item) ? current.filter((piece) => piece !== item) : [...current, item],
    );
  }

  async function sharePlan() {
    const shareText = `My DecorHub ${answers.style} ${answers.room.toLowerCase()} plan — €${answers.budget.toLocaleString("en-IE")} total budget.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My DecorHub room plan", text: shareText });
        setMessage("Your room plan is ready to share.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setMessage("Room plan details copied to your clipboard.");
      } else {
        setMessage(shareText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setMessage("Sharing is not available in this browser. Try downloading the plan instead.");
    }
  }

  function downloadPlan() {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    const contents = [
      "DECORHUB · A THOUGHTFUL ROOM PLAN",
      `${answers.style} ${answers.room}`,
      `${answers.width} m × ${answers.length} m · Approx. ${(Number(answers.width) * Number(answers.length)).toFixed(1)} m²`,
      `Budget: €${answers.budget.toLocaleString("en-IE")}`,
      `Lifestyle: ${answers.activities.join(", ") || "Thoughtful everyday living"}`,
      `Priorities: ${answers.priorities.join(", ") || "Flexible room planning"}`,
      "",
      "FURNITURE SHORTLIST",
      ...products.map((item) => `${item.name} — €${item.price} · ${item.match}% match · Alternative: ${item.alternative}`),
      "",
      `Recommended furniture subtotal: €${total.toLocaleString("en-IE")}`,
      "",
      "SAFETY & FLOW",
      "Keep a clear, comfortable pathway from the doorway to the bed.",
      "Use warm, diffused lighting on both sides of the room.",
      "Anchor rugs securely and soften sharp furniture corners as needed.",
      "",
      "Sample furniture suggestions and room scan detections are illustrative and not live AI analysis.",
      "Prepared by DecorHub Studio.",
    ].join("\n");
    const file = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decorhub-room-plan.txt";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Your room plan has been downloaded.");
  }

  function startMakeover() {
    setMessage("");
    setHasScanned(false);
    setScreen("capture");
  }

  function exploreStyles() {
    setScreen("home");
    window.setTimeout(() => document.getElementById("design-styles")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  return (
    <div className="studio-shell">
      <Header screen={screen} navigate={setScreen} onStart={startMakeover} />
      <main className="page-wrap">
        {screen === "home" && (
          <HomeScreen onStart={startMakeover} onExploreStyles={exploreStyles} onResume={() => setScreen("plan")} />
        )}
        {screen === "capture" && (
          <CaptureScreen
            photo={roomPhoto}
            isCustomPhoto={customPhoto}
            hasScanned={hasScanned}
            inputRef={photoInput}
            cameraRef={cameraInput}
            message={message}
            onSelectPhoto={selectPhoto}
            onDrop={handleDrop}
            onScan={() => {
              setHasScanned(true);
              setMessage("Room scan simulation complete. Your sample furniture detections are ready.");
            }}
            onNext={() => { setStep(0); setScreen("wizard"); setMessage(""); }}
            onBack={() => { setScreen("home"); setMessage(""); }}
            onClear={() => { setRoomPhoto(roomImage); setCustomPhoto(false); setHasScanned(false); setMessage(""); }}
          />
        )}
        {screen === "wizard" && (
          <WizardScreen
            step={step}
            answers={answers}
            message={message}
            onBack={() => { setScreen("capture"); setMessage(""); }}
            onStepBack={() => setStep((current) => Math.max(0, current - 1))}
            onNext={() => { setStep((current) => Math.min(4, current + 1)); setMessage(""); }}
            onComplete={() => { setScreen("plan"); setActivePlanTab("layout"); setMessage(""); }}
            onAnswer={changeAnswer}
            onToggle={toggleAnswer}
          />
        )}
        {screen === "plan" && (
          <PlanScreen
            answers={answers}
            activeTab={activePlanTab}
            view={floorView}
            selectedFurniture={selectedFurniture}
            message={message}
            onTab={setActivePlanTab}
            onView={setFloorView}
            onToggleFurniture={toggleFurniture}
            onDownload={downloadPlan}
            onShare={() => void sharePlan()}
            onEdit={() => { setStep(0); setScreen("wizard"); setMessage(""); }}
          />
        )}
      </main>
      <footer className="footer-note page-wrap">Thoughtfully planned at home. <span>Room scan and sample recommendations are illustrative.</span></footer>
      <div className="sr-only" aria-live="polite">{message}</div>
    </div>
  );
}

function Header({ screen, navigate, onStart }: { screen: AppScreen; navigate: (screen: AppScreen) => void; onStart: () => void }) {
  return (
    <header className="topbar">
      <Button type="button" variant="ghost" className="brand-lockup" onClick={() => navigate("home")} aria-label="DecorHub home">
        <span className="brand-mark"><Leaf size={18} strokeWidth={1.8} /></span>
        <span className="brand-name">decorhub</span>
      </Button>
      <nav className="nav-links" aria-label="Main navigation">
        <Button type="button" variant="ghost" className="nav-item" data-active={screen === "home"} onClick={() => navigate("home")}>Studio</Button>
        <Button type="button" variant="ghost" className="nav-item" data-active={screen === "plan"} onClick={() => navigate("plan")}>My spaces</Button>
        <Button type="button" variant="ghost" className="nav-item" data-active={screen === "capture" || screen === "wizard"} onClick={() => navigate("capture")}>Explore</Button>
      </nav>
      <div className="topbar-actions">
        <span className="account-mark" aria-label="Guest profile">GH</span>
        <Button className="new-plan-button" size="sm" onClick={onStart}><Sparkles aria-hidden="true" /> New room plan</Button>
      </div>
    </header>
  );
}

function HomeScreen({ onStart, onExploreStyles, onResume }: { onStart: () => void; onExploreStyles: () => void; onResume: () => void }) {
  return (
    <>
      <div className="workspace-kicker"><Sparkles size={13} /> YOUR PERSONAL INTERIOR STUDIO</div>
      <section className="home-intro">
        <div>
          <h1 className="home-title">A home that feels like <em>you.</em></h1>
          <p className="home-copy">A little inspiration. A lot more room to live.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onResume}>Open your sample room <ArrowUpRight /></Button>
      </section>
      <section className="hero-room" aria-label="Discover thoughtful bedroom design">
        <img src={roomImage} alt="Sunlit, considered bedroom with an ivory upholstered bed, oak side tables, and soft terracotta linen" width={1024} height={1200} fetchPriority="high" />
        <div className="hero-copy">
          <div className="hero-label"><Sparkles size={13} /> DESIGNED AROUND YOUR LIFE</div>
          <h2 className="hero-title">Make room<br />for better days.</h2>
          <p className="hero-description">Your space, your rhythm, your version of home. Discover an interior plan that understands all three.</p>
          <div className="hero-cta"><Button onClick={onStart}>Start a room makeover <ArrowRight /></Button></div>
          <div className="hero-note"><LockKeyhole size={12} /> Your room photos stay yours. Plans begin privately.</div>
        </div>
        <div className="home-stats" aria-label="Room makeover process">
          <div className="stat-chip"><Ruler size={14} /> <strong>Made for your space</strong></div>
          <div className="stat-chip"><Heart size={14} /> <strong>Built around you</strong></div>
        </div>
      </section>
      <section aria-labelledby="rooms-heading">
        <div className="section-head">
          <div><h2 className="section-title" id="rooms-heading">Pick up where you left off</h2><p className="section-caption">Your ideas, just as you imagined them.</p></div>
          <Button type="button" variant="ghost" size="sm" onClick={onResume}>View your space <ChevronRight /></Button>
        </div>
        <div className="project-strip">
          <img className="project-strip-image" src={roomImage} alt="Sunlit Japandi bedroom project preview" width={1024} height={1200} loading="lazy" />
          <div className="project-strip-info">
            <h3 className="project-name">The slow morning room</h3>
            <p className="project-subtitle">Bedroom · Japandi · 15.9 m²</p>
            <span className="project-tagline"><CheckCircle2 size={13} /> YOUR SAMPLE PLAN IS READY</span>
          </div>
          <div className="project-strip-action"><Button type="button" variant="outline" size="sm" onClick={onResume}>View room plan <ArrowUpRight /></Button></div>
        </div>
      </section>
      <section id="design-styles" aria-labelledby="styles-heading" style={{ scrollMarginTop: "70px" }}>
        <div className="section-head">
          <div><h2 className="section-title" id="styles-heading">A feeling, before a floor plan</h2><p className="section-caption">Find the kind of calm that feels like home.</p></div>
          <Button type="button" variant="ghost" size="sm" onClick={onStart}>Find your style <ArrowRight /></Button>
        </div>
        <div className="style-row" aria-label="Interior design styles">
          <span className="style-pill"><span className="style-dot" /> Japandi <MoveUpRight size={12} /></span>
          <span className="style-pill"><span className="style-dot water" /> Scandinavian <MoveUpRight size={12} /></span>
          <span className="style-pill"><span className="style-dot terra" /> Warm minimalism <MoveUpRight size={12} /></span>
          <span className="style-pill"><span className="style-dot mist" /> Modern organic <MoveUpRight size={12} /></span>
        </div>
      </section>
      <div className="bottom-space" />
    </>
  );
}

function CaptureScreen({
  photo, isCustomPhoto, hasScanned, inputRef, cameraRef, message, onSelectPhoto, onDrop, onScan, onNext, onBack, onClear,
}: {
  photo: string; isCustomPhoto: boolean; hasScanned: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>; cameraRef: React.RefObject<HTMLInputElement | null>;
  message: string; onSelectPhoto: (file?: File) => void; onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onScan: () => void; onNext: () => void; onBack: () => void; onClear: () => void;
}) {
  return (
    <section aria-labelledby="capture-heading">
      <div className="flow-top">
        <Button type="button" variant="ghost" size="icon" className="flow-back" aria-label="Go back to your studio" onClick={onBack}><ArrowLeft /></Button>
        <div className="flow-top-copy"><span className="flow-top-title">A room of your own</span><span className="flow-top-caption">Step one of seven · Add a room photo</span></div>
      </div>
      <div className="capture-layout">
        <div>
          <div className="eyebrow"><span>01</span><span>/</span><span>YOUR SPACE</span></div>
          <h1 className="flow-heading" id="capture-heading">First, let's see<br />what we're working with.</h1>
          <p className="flow-subtitle">A room photo makes it easier to imagine what your space could be. Add your own photo, or explore the sample room.</p>
          <div className="capture-image-wrap" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
            <img className="capture-image" src={photo} alt={isCustomPhoto ? "Your selected room photo" : "A sunlit sample bedroom to explore room scanning"} width={1024} height={1200} />
            <div className="capture-tint" />
            <div className="capture-scan-badge"><ScanLine size={13} /> {isCustomPhoto ? "YOUR ROOM PHOTO" : "SAMPLE ROOM · FOR DEMONSTRATION"}</div>
            {(!isCustomPhoto || hasScanned) && <>
              <div className="scan-frame bed" data-name={`Bed · ${hasScanned ? "98%" : "98%"}`} />
              <div className="scan-frame lamp" data-name="Lighting · 91%" />
              <div className="scan-frame table" data-name="Nightstand · 96%" />
            </>}
            <div className="capture-actions">
              <span>{hasScanned ? "Scan simulation complete" : "Drop a photo anywhere to add your room"}</span>
              <Button type="button" size="sm" onClick={() => inputRef.current?.click()}><ImagePlus /> Add photo</Button>
            </div>
          </div>
          <input ref={inputRef} className="sr-only" type="file" accept="image/*" aria-label="Upload a room photo" onChange={(event) => onSelectPhoto(event.target.files?.[0])} />
          <input ref={cameraRef} className="sr-only" type="file" accept="image/*" capture="environment" aria-label="Take a room photo with your camera" onChange={(event) => onSelectPhoto(event.target.files?.[0])} />
        </div>
        <aside className="detection-panel" aria-labelledby="scan-heading">
          <div className="panel-eyebrow"><Sparkles size={13} /> {hasScanned ? "SAMPLE SCAN COMPLETE" : "SMART SPACE SCAN"}</div>
          <h2 className="panel-heading" id="scan-heading">A clearer picture.</h2>
          <p className="panel-description">{hasScanned ? "The scan preview found a few familiar pieces." : "See how a room scan preview might spot everyday furniture."}</p>
          <ul className="detection-list">
            <li className="detection-row"><span className="detection-name"><BedDouble size={14} /> Upholstered bed</span><span className="detection-confidence">98%</span></li>
            <li className="detection-row"><span className="detection-name"><Lamp size={14} /> Floor lighting</span><span className="detection-confidence">91%</span></li>
            <li className="detection-row"><span className="detection-name"><Armchair size={14} /> Side table</span><span className="detection-confidence">96%</span></li>
          </ul>
          <div className="photo-footer">{message || "Detection boxes and confidence scores are a visual simulation, not live computer-vision results."}</div>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => cameraRef.current?.click()}><ScanLine /> Take a photo</Button>
            <Button type="button" variant="ghost" size="sm" onClick={onScan}><Sparkles /> Preview scan</Button>
          </div>
          {isCustomPhoto && <div className="pt-2"><Button type="button" variant="link" size="sm" onClick={onClear}><X /> Use the sample room instead</Button></div>}
          <div className="pt-4"><Button type="button" className="w-full justify-between" onClick={onNext}>Continue to your preferences <ArrowRight /></Button></div>
          <div className="photo-footer"><LockKeyhole size={11} className="inline" /> Photos stay in this preview and are not uploaded to a server.</div>
        </aside>
      </div>
    </section>
  );
}

function WizardScreen({
  step, answers, message, onBack, onStepBack, onNext, onComplete, onAnswer, onToggle,
}: {
  step: number; answers: FormAnswers; message: string; onBack: () => void; onStepBack: () => void;
  onNext: () => void; onComplete: () => void;
  onAnswer: <Key extends keyof FormAnswers>(key: Key, value: FormAnswers[Key]) => void;
  onToggle: (key: "activities" | "priorities", value: string) => void;
}) {
  const stepNames = ["Your room", "Everyday life", "A sense of style", "Room budget", "Little details"];
  return (
    <section aria-labelledby="wizard-heading">
      <div className="flow-top">
        <Button type="button" variant="ghost" size="icon" className="flow-back" aria-label="Back to room photo" onClick={onBack}><ArrowLeft /></Button>
        <div className="flow-top-copy"><span className="flow-top-title">A room of your own</span><span className="flow-top-caption">Just five little things to make the plan yours.</span></div>
      </div>
      <div className="wizard-content">
        <div className="wizard-top">
          <div className="wizard-progress" role="progressbar" aria-label="Room preferences progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}>
            {stepNames.map((name, index) => <span key={name} className="wizard-progress-segment" data-complete={index <= step} />)}
          </div>
          <span className="wizard-step-label">{step + 1} of 5 · {stepNames[step]}</span>
        </div>
        <div className="eyebrow"><span>YOUR ROOM</span><span>/</span><span>YOUR RULES</span></div>
        {step === 0 && <>
          <h1 className="flow-heading" id="wizard-heading">Which space is<br />on your mind?</h1>
          <p className="flow-subtitle">A little about the room helps everything else fall into place.</p>
          <div className="choice-grid" role="group" aria-label="Room type">
            {roomChoices.map(({ name, icon: Icon }) => <Button key={name} type="button" variant="ghost" className="choice-tile" data-selected={answers.room === name} aria-pressed={answers.room === name} onClick={() => onAnswer("room", name)}><Icon size={19} /><span className="choice-tile-name">{name}</span></Button>)}
          </div>
          <div className="dimension-row">
            <label className="field-wrap"><span className="field-label">Width</span><span className="flex items-center gap-2"><input className="dimension-input" type="number" min="1" max="20" step="0.1" value={answers.width} aria-label="Room width in meters" onChange={(event) => onAnswer("width", event.target.value)} /><span className="field-unit">metres</span></span></label>
            <span className="field-unit pb-3">×</span>
            <label className="field-wrap"><span className="field-label">Length</span><span className="flex items-center gap-2"><input className="dimension-input" type="number" min="1" max="20" step="0.1" value={answers.length} aria-label="Room length in meters" onChange={(event) => onAnswer("length", event.target.value)} /><span className="field-unit">metres</span></span></label>
            <div className="field-wrap"><span className="field-label">Approx. floor area</span><span className="project-name">{areaSize(answers)} m²</span></div>
          </div>
        </>}
        {step === 1 && <>
          <h1 className="flow-heading" id="wizard-heading">A space to live<br />a little more.</h1>
          <p className="flow-subtitle">What do you love doing here? Pick as many as feel like your everyday.</p>
          <div className="activity-grid" role="group" aria-label="Things you do in this room">
            {activities.map((activity, index) => <Button key={activity} type="button" variant="ghost" className="activity-tile" data-selected={answers.activities.includes(activity)} aria-pressed={answers.activities.includes(activity)} onClick={() => onToggle("activities", activity)}><ActivityIcon index={index} />{activity}{answers.activities.includes(activity) && <Check size={14} className="ml-auto" />}</Button>)}
          </div>
        </>}
        {step === 2 && <>
          <h1 className="flow-heading" id="wizard-heading">How should<br />the room <em>feel?</em></h1>
          <p className="flow-subtitle">There are no right answers. Just the one that makes you exhale.</p>
          <div className="style-grid" role="group" aria-label="Interior design style">
            {styleChoices.map(({ name, note }) => <Button key={name} type="button" variant="ghost" className="style-choice" data-selected={answers.style === name} aria-pressed={answers.style === name} onClick={() => onAnswer("style", name)}><span><strong>{name}</strong><small>{note}</small></span>{answers.style === name ? <Check size={16} /> : <ChevronRight size={16} />}</Button>)}
          </div>
        </>}
        {step === 3 && <>
          <h1 className="flow-heading" id="wizard-heading">A number that<br />feels comfortable.</h1>
          <p className="flow-subtitle">A guiding budget for your furniture shortlist. Easy to adjust as plans take shape.</p>
          <div className="budget-amount"><span className="budget-number">€{answers.budget.toLocaleString("en-IE")}</span><span className="budget-caption">total room budget</span></div>
          <input className="budget-slider" type="range" min="400" max="6000" step="100" value={answers.budget} aria-label="Your total room budget in euros" aria-valuetext={`€${answers.budget.toLocaleString("en-IE")}`} onChange={(event) => onAnswer("budget", Number(event.target.value))} />
          <div className="budget-labels"><span>€400 · essentials</span><span>€6,000 · the whole room</span></div>
          <div className="budget-hint"><Sparkles size={14} className="mr-2 inline" />The current furniture shortlist adds up to €1,395. Good design isn't tied to a bigger budget.</div>
        </>}
        {step === 4 && <>
          <h1 className="flow-heading" id="wizard-heading">Thoughtful little<br />things matter.</h1>
          <p className="flow-subtitle">Anything you’d like your room to keep in mind as it comes together?</p>
          <div className="priority-grid" role="group" aria-label="Room safety and future priorities">
            {priorities.map((priority, index) => <Button key={priority} type="button" variant="ghost" className="priority-choice" data-selected={answers.priorities.includes(priority)} aria-pressed={answers.priorities.includes(priority)} onClick={() => onToggle("priorities", priority)}><ActivityIcon index={index + 1} />{priority}{answers.priorities.includes(priority) && <Check size={14} className="ml-auto" />}</Button>)}
          </div>
          <div className="budget-hint"><Footprints size={14} className="mr-2 inline" />We’ll leave room to move — clear, easy pathways matter every day.</div>
        </>}
        <div className="wizard-footer">
          <Button type="button" variant="outline" onClick={step === 0 ? onBack : onStepBack}><ArrowLeft /> Back</Button>
          {step < 4 ? <Button type="button" onClick={onNext}>Keep going <ArrowRight /></Button> : <Button type="button" onClick={onComplete}>See your room plan <Sparkles /></Button>}
        </div>
        {message && <p className="status-message">{message}</p>}
      </div>
    </section>
  );
}

function ActivityIcon({ index }: { index: number }) {
  const icons: LucideIcon[] = [Armchair, Heart, Waves, Lightbulb, ShieldCheck, Leaf];
  const Icon = icons[index % icons.length] ?? Armchair;
  return <Icon size={15} aria-hidden="true" />;
}

function PlanScreen({
  answers, activeTab, view, selectedFurniture, message, onTab, onView, onToggleFurniture, onDownload, onShare, onEdit,
}: {
  answers: FormAnswers; activeTab: PlanTab; view: "2D" | "3D"; selectedFurniture: string[]; message: string;
  onTab: (tab: PlanTab) => void; onView: (view: "2D" | "3D") => void;
  onToggleFurniture: (item: string) => void; onDownload: () => void; onShare: () => void; onEdit: () => void;
}) {
  return (
    <section aria-labelledby="plan-heading">
      <div className="plan-header">
        <div>
          <div className="eyebrow"><Sparkles size={12} /> A PLAN TAKING SHAPE</div>
          <h1 className="plan-title" id="plan-heading">The slow morning room.</h1>
          <div className="plan-meta">
            <span>{answers.room}</span><span className="plan-meta-dot" /><span>{answers.style}</span><span className="plan-meta-dot" />
            <span><Maximize size={11} /> {answers.width} × {answers.length} m · {areaSize(answers)} m²</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onShare}><ArrowUpRight /> Share</Button>
          <Button type="button" size="sm" onClick={onDownload}><ArrowDownToLine /> Save plan</Button>
        </div>
      </div>
      <div className="plan-tabs" role="tablist" aria-label="Room plan sections">
        <PlanTabButton id="layout" active={activeTab} onTab={onTab}><Ruler /> Layout</PlanTabButton>
        <PlanTabButton id="furniture" active={activeTab} onTab={onTab}><Armchair /> Furniture <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px]">4</span></PlanTabButton>
        <PlanTabButton id="safety" active={activeTab} onTab={onTab}><ShieldCheck /> Safety & flow</PlanTabButton>
      </div>
      {activeTab === "layout" && <div className="plan-layout" role="tabpanel">
        <div>
          <div className="plan-main-heading"><div><h2 className="plan-main-title">A room with room to breathe.</h2><p className="plan-main-caption">A considered layout with a little more open space.</p></div>
            <div className="plan-view-control" aria-label="Floor plan view">
              <Button type="button" variant="ghost" className="plan-view-button" data-active={view === "2D"} aria-pressed={view === "2D"} onClick={() => onView("2D")}>2D</Button>
              <Button type="button" variant="ghost" className="plan-view-button" data-active={view === "3D"} aria-pressed={view === "3D"} onClick={() => onView("3D")}>3D</Button>
            </div>
          </div>
          <div className="floorplan-shell" aria-label={`${view} visual floor plan with selectable furniture placements`}>
            <div className={`floor-plan${view === "3D" ? " stage-3d" : ""}`}>
              <span className="plan-window" aria-label="Natural light window" /><span className="plan-door" aria-label="Room entry" /><span className="plan-walkway" />
              <span className="furniture-piece rug-piece" data-inactive={!selectedFurniture.includes("Rug")}>Natural jute rug</span>
              <span className="furniture-piece bed-piece" data-inactive={!selectedFurniture.includes("Bed")}>Queen bed<br />200 × 160 cm</span>
              <span className="furniture-piece nightstand-piece" data-inactive={!selectedFurniture.includes("Side table")}>Side table</span>
              <span className="furniture-piece lamp-piece" data-inactive={!selectedFurniture.includes("Lamp")}>Lamp</span>
              <span className="furniture-piece plant-piece" data-inactive={!selectedFurniture.includes("Plant")}>Plant</span>
              <span className="furniture-piece dresser-piece" data-inactive={!selectedFurniture.includes("Dresser")}>Low dresser</span>
              <span className="walkway-label">Clear<br />pathway</span>
            </div>
          </div>
          <p className="plan-description">An illustrative {view} layout. Dotted outline shows an unobstructed path from the entry, with daytime light arriving from above.</p>
        </div>
        <aside aria-label="Furniture placement controls">
          <h2 className="plan-aside-heading">A place for everything.</h2>
          <p className="plan-aside-caption">Select a piece to show or hide it in your room.</p>
          <div className="plan-item-list">
            {[
              { name: "Bed", detail: "Queen · 200 × 160 cm", price: "Anchor" },
              { name: "Rug", detail: "Natural woven · 200 × 300 cm", price: "Soft" },
              { name: "Side table", detail: "Oak · compact", price: "Your find" },
              { name: "Lamp", detail: "Warm ambient · dimmable", price: "Soft" },
              { name: "Plant", detail: "A little living green", price: "Optional" },
              { name: "Dresser", detail: "Low profile · 120 cm", price: "Your find" },
            ].map(({ name, detail, price }) => <Button key={name} type="button" variant="ghost" className="plan-item-toggle" data-selected={selectedFurniture.includes(name)} aria-pressed={selectedFurniture.includes(name)} onClick={() => onToggleFurniture(name)}><span className="grid size-4 place-items-center border border-border">{selectedFurniture.includes(name) && <Check size={12} />}</span><span><span className="plan-item-name block">{name}</span><span className="plan-item-cost block">{detail}</span></span><span className="plan-item-cost">{price}</span></Button>)}
          </div>
          <div className="plan-note"><Footprints size={13} className="mr-1.5 inline" />Clear pathways leave extra room for easy, everyday movement.</div>
        </aside>
      </div>}
      {activeTab === "furniture" && <FurniturePanel budget={answers.budget} />}
      {activeTab === "safety" && <SafetyPanel priorities={answers.priorities} />}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 mt-6">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}><SlidersHorizontal /> Edit your preferences</Button>
        <span className="budget-caption">Furniture selections under €{answers.budget.toLocaleString("en-IE")} budget</span>
      </div>
      <div className="budget-bar" role="progressbar" aria-label="Recommended furniture against your budget" aria-valuemin={0} aria-valuemax={answers.budget} aria-valuenow={products.reduce((sum, product) => sum + product.price, 0)}><div className="budget-fill" style={{ width: `${Math.min(100, products.reduce((sum, item) => sum + item.price, 0) / Math.max(1, answers.budget) * 100)}%` }} /></div>
      <div className="budget-caption mt-2">€{products.reduce((sum, product) => sum + product.price, 0).toLocaleString("en-IE")} suggested · €{Math.max(0, answers.budget - products.reduce((sum, product) => sum + product.price, 0)).toLocaleString("en-IE")} room for your own finds</div>
      {message && <div className="status-message"><CheckCircle2 size={13} />{message}</div>}
    </section>
  );
}

function PlanTabButton({ id, active, onTab, children }: { id: PlanTab; active: PlanTab; onTab: (tab: PlanTab) => void; children: ReactNode }) {
  return <Button type="button" role="tab" variant="ghost" className="plan-tab" id={`tab-${id}`} aria-selected={active === id} aria-controls="plan-content" data-active={active === id} onClick={() => onTab(id)}>{children}</Button>;
}

function FurniturePanel({ budget }: { budget: number }) {
  return (
    <div role="tabpanel" aria-labelledby="tab-furniture" id="plan-content">
      <div className="section-head mt-6"><div><h2 className="section-title">Considered pieces. Nothing more.</h2><p className="section-caption">Good quality, thoughtful materials, and room left in the budget.</p></div><span className="eyebrow">{products.length} HAND-PICKED PIECES</span></div>
      <div className="recommendation-grid">
        {products.map((product, index) => <article key={product.name} className="recommendation-card">
          <img className="recommendation-image" src={index === 0 ? chairImage : roomImage} width={index === 0 ? 816 : 1024} height={index === 0 ? 816 : 1200} alt={index === 0 ? "Soft sage boucle accent chair with sculptural oak arms" : `${product.name}, styled in a calm natural bedroom`} loading="lazy" />
          <div><div className="recommendation-overline">{product.type} · THOUGHTFULLY PICKED</div><h3 className="recommendation-name">{product.name}</h3><div className="recommendation-price">€{product.price} <span className="recommendation-rating"><Sparkles size={10} className="inline" /> {product.match}% style match</span></div><p className="recommendation-copy">{product.description}</p><div className="recommendation-alternative"><span className="font-semibold">A lighter option</span><br />{product.alternative}</div></div>
        </article>)}
      </div>
      <div className="budget-hint mt-5"><Heart size={13} className="mr-2 inline" />A shortlist shaped around a €{budget.toLocaleString("en-IE")} room budget — happy to adapt.</div>
    </div>
  );
}

function SafetyPanel({ priorities }: { priorities: string[] }) {
  const suggestions = [
    { icon: Footprints, title: "A clear way through.", copy: "Keep at least 75 cm beside the bed and in the route from the door. It feels calmer — and is easier to walk through, even in the dark." },
    { icon: Lightbulb, title: "Gentle, layered light.", copy: "Use warm ambient light with a dimmable bedside lamp. Aim lighting where you read, rather than straight across the room." },
    { icon: ShieldCheck, title: "Small things underfoot.", copy: "Secure the rug corners, leave the doorway clear, and consider soft corner guards if little ones are part of everyday life." },
    { icon: Heart, title: "Make space for getting around.", copy: "Leave a little turning room around furniture, and keep everyday belongings within comfortable reach." },
  ];
  return (
    <div role="tabpanel" aria-labelledby="tab-safety" id="plan-content">
      <div className="section-head mt-6"><div><h2 className="section-title">Room to feel at ease.</h2><p className="section-caption">Simple adjustments can make the room gentler for everyone.</p></div><span className="eyebrow"><ShieldCheck size={12} /> SAFE BY DESIGN</span></div>
      <ul className="safety-list">
        {suggestions.map(({ icon: Icon, title, copy }) => <li key={title} className="safety-row"><span className="safety-icon"><Icon size={14} /></span><span><h3 className="safety-title">{title}</h3><p className="safety-copy">{copy}</p></span></li>)}
      </ul>
      <div className="budget-hint mt-5"><CircleHelp size={13} className="mr-2 inline" />{priorities.length ? `Your plan keeps in mind: ${priorities.join(" · ")}.` : "Start with open pathways and comfort underfoot."} These are helpful design prompts, not a professional safety assessment.</div>
    </div>
  );
}

function areaSize(answers: FormAnswers) {
  const area = Number(answers.width) * Number(answers.length);
  return Number.isFinite(area) && area > 0 ? area.toFixed(1) : "0.0";
}