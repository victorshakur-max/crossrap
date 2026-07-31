"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Word = { word: string; hint: string; category: string; difficulty: "Fácil" | "Médio" | "Difícil" | "Lendário" };
type PlacedWord = Word & { row: number; col: number; direction: "across" | "down"; number: number };
type Cell = { letter: string; number?: number; across?: number; down?: number };
type RankingEntry = { playerName: string; score: number; durationSeconds: number; isCurrentPlayer?: boolean };
type RankingResult = { position: number; total: number; top: RankingEntry[] };

const RAW_WORDS: Word[] = [
  { word: "RACIONAIS", hint: "Grupo de Mano Brown, Ice Blue, Edi Rock e KL Jay.", category: "Rap Nacional", difficulty: "Fácil" },
  { word: "EMINEM", hint: "MC conhecido como Slim Shady.", category: "Rap Internacional", difficulty: "Fácil" },
  { word: "SABOTAGE", hint: "Rapper paulistano autor de Um Bom Lugar.", category: "Rap Nacional", difficulty: "Fácil" },
  { word: "TUPAC", hint: "Ícone do rap da Costa Oeste, também chamado 2Pac.", category: "Rap Internacional", difficulty: "Fácil" },
  { word: "NAS", hint: "Rapper do Queensbridge que lançou Illmatic.", category: "Álbuns", difficulty: "Médio" },
  { word: "ILLMATIC", hint: "Álbum de estreia de Nas, lançado em 1994.", category: "Álbuns", difficulty: "Médio" },
  { word: "BK", hint: "Rapper carioca autor do álbum Castelos & Ruínas.", category: "Rap Nacional", difficulty: "Médio" },
  { word: "EMICIDA", hint: "MC paulistano que fundou a Laboratório Fantasma.", category: "Rap Nacional", difficulty: "Fácil" },
  { word: "DJONGA", hint: "Rapper mineiro que lançou Heresia.", category: "Rap Nacional", difficulty: "Fácil" },
  { word: "RASHID", hint: "MC paulistano autor do álbum A Coragem da Luz.", category: "Rap Nacional", difficulty: "Médio" },
  { word: "BLACKALIEN", hint: "Rapper fluminense do clássico Babylon By Gus.", category: "Rap Nacional", difficulty: "Difícil" },
  { word: "CRI OLO", hint: "MC paulistano do álbum Nó na Orelha.", category: "Rap Nacional", difficulty: "Fácil" },
  { word: "KENDRICK", hint: "Primeiro rapper a vencer o Pulitzer de Música.", category: "Rap Internacional", difficulty: "Médio" },
  { word: "LAMAR", hint: "Sobrenome de Kendrick, autor de DAMN.", category: "Rap Internacional", difficulty: "Fácil" },
  { word: "BIGGIE", hint: "Apelido de Christopher Wallace, o Notorious B.I.G.", category: "Rap Internacional", difficulty: "Fácil" },
  { word: "OUTKAST", hint: "Dupla de Atlanta formada por André 3000 e Big Boi.", category: "Rap Internacional", difficulty: "Médio" },
  { word: "RUN DMC", hint: "Trio do Queens que ajudou a levar o rap ao mainstream.", category: "História", difficulty: "Médio" },
  { word: "PUBLIC ENEMY", hint: "Grupo de Chuck D e Flavor Flav.", category: "História", difficulty: "Médio" },
  { word: "KRS ONE", hint: "MC do Boogie Down Productions conhecido como The Teacher.", category: "MCs", difficulty: "Difícil" },
  { word: "RAKIM", hint: "MC da dupla com Eric B., referência do liricismo.", category: "MCs", difficulty: "Difícil" },
  { word: "JAY Z", hint: "Rapper do Brooklyn que lançou Reasonable Doubt.", category: "Rap Internacional", difficulty: "Fácil" },
  { word: "KANYE", hint: "Produtor e rapper de The College Dropout.", category: "Beatmakers", difficulty: "Fácil" },
  { word: "DRE", hint: "Doutor que produziu The Chronic e lançou Eminem.", category: "Beatmakers", difficulty: "Fácil" },
  { word: "DILLA", hint: "Produtor de Detroit, autor de Donuts.", category: "Beatmakers", difficulty: "Difícil" },
  { word: "PREMIER", hint: "DJ e produtor, metade da dupla Gang Starr.", category: "DJ", difficulty: "Difícil" },
  { word: "GANG STARR", hint: "Dupla formada por Guru e DJ Premier.", category: "Rap Internacional", difficulty: "Difícil" },
  { word: "KOOL HERC", hint: "DJ associado às primeiras festas do hip hop no Bronx.", category: "História", difficulty: "Médio" },
  { word: "BRONX", hint: "Bairro de Nova York reconhecido como berço do hip hop.", category: "História", difficulty: "Fácil" },
  { word: "BREAK", hint: "Trecho instrumental que DJs prolongavam com dois discos.", category: "DJ", difficulty: "Médio" },
  { word: "CYPHER", hint: "Roda em que MCs rimam ou b-boys dançam.", category: "Curiosidades", difficulty: "Médio" },
  { word: "BBOY", hint: "Dançarino ligado à cultura breaking.", category: "Breaking", difficulty: "Fácil" },
  { word: "TOPROCK", hint: "Passos de breaking executados em pé.", category: "Breaking", difficulty: "Difícil" },
  { word: "FREEZE", hint: "Pose estática usada para finalizar movimentos no breaking.", category: "Breaking", difficulty: "Médio" },
  { word: "TAG", hint: "Assinatura rápida de um artista de graffiti.", category: "Graffiti", difficulty: "Fácil" },
  { word: "WILDSTYLE", hint: "Estilo de graffiti com letras complexas e entrelaçadas.", category: "Graffiti", difficulty: "Difícil" },
  { word: "SPRAY", hint: "Ferramenta em lata muito usada no graffiti.", category: "Graffiti", difficulty: "Fácil" },
  { word: "FREESTYLE", hint: "Rima improvisada, criada no momento.", category: "Battle Rap", difficulty: "Fácil" },
  { word: "BATALHA", hint: "Disputa verbal entre MCs usando rimas.", category: "Battle Rap", difficulty: "Fácil" },
  { word: "SANTA CRUZ", hint: "Estação paulistana que deu nome a uma batalha de MCs histórica.", category: "Battle Rap", difficulty: "Difícil" },
  { word: "ALDEIA", hint: "Batalha de rima criada em Barueri, conhecida pela sigla BDA.", category: "Battle Rap", difficulty: "Médio" },
  { word: "FLOW", hint: "Cadência com que o MC encaixa palavras no beat.", category: "Curiosidades", difficulty: "Fácil" },
  { word: "BEAT", hint: "Base instrumental sobre a qual o MC rima.", category: "Beatmakers", difficulty: "Fácil" },
  { word: "SAMPLE", hint: "Trecho de áudio reutilizado em uma nova produção.", category: "Beatmakers", difficulty: "Médio" },
  { word: "BOOMBAP", hint: "Estética de rap marcada por bateria forte e samples.", category: "Old School", difficulty: "Médio" },
  { word: "TRAP", hint: "Subgênero marcado por 808s e hi-hats acelerados.", category: "Trap", difficulty: "Fácil" },
  { word: "SCRATCH", hint: "Técnica de mover o vinil ritmicamente sob a agulha.", category: "DJ", difficulty: "Médio" },
  { word: "MIXTAPE", hint: "Projeto musical frequentemente lançado fora do formato de álbum.", category: "Música", difficulty: "Fácil" },
  { word: "MIC", hint: "Abreviação em inglês do instrumento essencial do MC.", category: "Curiosidades", difficulty: "Fácil" },
  { word: "PUNCHLINE", hint: "Linha de impacto usada para atingir o oponente numa batalha.", category: "Battle Rap", difficulty: "Médio" },
  { word: "CYPRESS HILL", hint: "Grupo de Los Angeles liderado por B-Real.", category: "Rap Internacional", difficulty: "Médio" },
];
const WORDS: Word[] = RAW_WORDS.map((w) => ({ ...w, word: w.word.replace(/\s/g, "") }));

const SIZE = 19;
const key = (r: number, c: number) => `${r}:${c}`;

function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function seedFromDate(value: string) {
  return [...value].reduce((seed, char) => Math.imul(seed ^ char.charCodeAt(0), 2654435761), 2166136261) >>> 0;
}

function seededRandom(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function generateCrossword(seed?: number): { cells: Map<string, Cell>; words: PlacedWord[]; bounds: [number, number, number, number] } {
  const random = seed === undefined ? Math.random : seededRandom(seed);
  const shuffle = (items: Word[]) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  };
  const shuffled = seed === undefined
    ? shuffle(WORDS).slice(0, 28)
    : shuffle([
        ...shuffle(WORDS.filter(item => item.difficulty === "Fácil")).slice(0, 18),
        ...shuffle(WORDS.filter(item => item.difficulty === "Médio")).slice(0, 9),
        ...shuffle(WORDS.filter(item => item.difficulty === "Difícil")).slice(0, 1),
      ]);
  const cells = new Map<string, Cell>();
  const placed: PlacedWord[] = [];

  function canPlace(word: string, row: number, col: number, dir: "across" | "down") {
    let crossings = 0;
    if (row < 1 || col < 1 || (dir === "across" ? col + word.length >= SIZE - 1 : row + word.length >= SIZE - 1)) return -1;
    for (let i = 0; i < word.length; i++) {
      const r = row + (dir === "down" ? i : 0), c = col + (dir === "across" ? i : 0);
      const existing = cells.get(key(r, c));
      if (existing && existing.letter !== word[i]) return -1;
      if (existing) crossings++;
      if (!existing) {
        const sideA = dir === "across" ? cells.get(key(r - 1, c)) : cells.get(key(r, c - 1));
        const sideB = dir === "across" ? cells.get(key(r + 1, c)) : cells.get(key(r, c + 1));
        if (sideA || sideB) return -1;
      }
    }
    const before = dir === "across" ? cells.get(key(row, col - 1)) : cells.get(key(row - 1, col));
    const after = dir === "across" ? cells.get(key(row, col + word.length)) : cells.get(key(row + word.length, col));
    return before || after ? -1 : crossings;
  }

  function put(item: Word, row: number, col: number, direction: "across" | "down") {
    const idx = placed.length;
    placed.push({ ...item, row, col, direction, number: idx + 1 });
    [...item.word].forEach((letter, i) => {
      const r = row + (direction === "down" ? i : 0), c = col + (direction === "across" ? i : 0);
      const current = cells.get(key(r, c)) || { letter };
      cells.set(key(r, c), { ...current, letter, [direction]: idx });
    });
  }

  const first = shuffled.shift()!;
  put(first, 9, Math.floor((SIZE - first.word.length) / 2), "across");
  for (const item of shuffled) {
    if (placed.length >= 16) break;
    let best: { row: number; col: number; direction: "across" | "down"; score: number } | null = null;
    for (const pw of placed) for (let a = 0; a < item.word.length; a++) for (let b = 0; b < pw.word.length; b++) {
      if (item.word[a] !== pw.word[b]) continue;
      const direction = pw.direction === "across" ? "down" : "across";
      const row = direction === "down" ? pw.row - a : pw.row + b;
      const col = direction === "across" ? pw.col - a : pw.col + b;
      const score = canPlace(item.word, row, col, direction);
      if (score > 0 && (!best || score > best.score || random() > .7)) best = { row, col, direction, score };
    }
    if (best) put(item, best.row, best.col, best.direction);
  }
  const starts = new Map<string, number>();
  let n = 1;
  [...placed].sort((a, b) => a.row - b.row || a.col - b.col).forEach((w) => {
    const k = key(w.row, w.col);
    if (!starts.has(k)) starts.set(k, n++);
    w.number = starts.get(k)!;
  });
  starts.forEach((number, k) => cells.set(k, { ...cells.get(k)!, number }));
  const coords = [...cells.keys()].map((k) => k.split(":").map(Number));
  return { cells, words: placed, bounds: [Math.min(...coords.map(x => x[0])), Math.max(...coords.map(x => x[0])), Math.min(...coords.map(x => x[1])), Math.max(...coords.map(x => x[1]))] };
}

function Logo() {
  return <div className="logo" aria-label="CrossRap"><span>CR</span><strong>CROSS<span>RAP</span></strong></div>;
}

function MassakiBrand({ compact = false }: { compact?: boolean }) {
  return <a className={`massaki-brand ${compact ? "compact" : ""}`} href="https://www.massaririmas.com" target="_blank" rel="noreferrer" aria-label="Conheça o curso Método Massaki de Rimas">
    <span className="massaki-crop"><img src="/massaki-mark.png" alt="" /></span>
    <span><small>UMA EXPERIÊNCIA</small><b>VICTOR MASSAKI</b></span>
  </a>;
}

export default function Home() {
  const today = dateKey();
  const dailySeed = seedFromDate(today);
  const dailyNumber = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse("2024-01-01T00:00:00Z")) / 86400000) + 1;
  const [screen, setScreen] = useState<"home" | "game">("home");
  const [mode, setMode] = useState<"daily" | "infinite">("daily");
  const [puzzle, setPuzzle] = useState(() => generateCrossword(dailySeed));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [finishedSeconds, setFinishedSeconds] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [ranking, setRanking] = useState<RankingResult | null>(null);
  const [rankingStatus, setRankingStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    try {
      const saved = JSON.parse(localStorage.getItem("crossrap-player") || "{}");
      setStreak(saved.streak || 0); setBestStreak(saved.bestStreak || 0);
    } catch { /* device without storage */ }
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (screen !== "game" || finishedSeconds !== null) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [screen, puzzle, finishedSeconds]);

  const startInfinite = useCallback(() => {
    submittedRef.current=false; setMode("infinite"); setPuzzle(generateCrossword()); setAnswers({}); setScore(0); setSeconds(0); setFinishedSeconds(null); setActive(0); setHintsUsed(0); setRanking(null); setRankingStatus("idle"); setShowResult(false); setScreen("game");
  }, []);
  const startDaily = useCallback(() => {
    submittedRef.current=false; setMode("daily"); setPuzzle(generateCrossword(seedFromDate(dateKey()))); setAnswers({}); setScore(0); setSeconds(0); setFinishedSeconds(null); setActive(0); setHintsUsed(0); setRanking(null); setRankingStatus("idle"); setShowResult(false); setScreen("game");
  }, []);
  const rows = useMemo(() => Array.from({ length: puzzle.bounds[1] - puzzle.bounds[0] + 1 }), [puzzle]);
  const cols = useMemo(() => Array.from({ length: puzzle.bounds[3] - puzzle.bounds[2] + 1 }), [puzzle]);
  const current = puzzle.words[active];
  const completed = puzzle.words.filter((w) => [...w.word].every((_, i) => answers[key(w.row + (w.direction === "down" ? i : 0), w.col + (w.direction === "across" ? i : 0))] === w.word[i])).length;
  const allCellsFilled = [...puzzle.cells.keys()].every(location => Boolean(answers[location]));
  const elapsedSeconds = finishedSeconds ?? seconds;
  const finalScore = Math.max(0, completed * 100 + Math.max(0, 300 - elapsedSeconds) - hintsUsed * 10);
  const saoPauloTime = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(now);
  const timePart = (type: Intl.DateTimeFormatPartTypes) => Number(saoPauloTime.find(part => part.type === type)?.value || 0);
  const remaining = 86400 - (timePart("hour") % 24 * 3600 + timePart("minute") * 60 + timePart("second"));
  const countdown = `${String(Math.floor(remaining / 3600)).padStart(2,"0")}:${String(Math.floor(remaining % 3600 / 60)).padStart(2,"0")}:${String(remaining % 60).padStart(2,"0")}`;

  useEffect(() => {
    if (!puzzle.words.length || completed !== puzzle.words.length || finishedSeconds !== null) return;
    const finishTime = seconds;
    setFinishedSeconds(finishTime);
    setShowResult(true);
    let nextStreak = streak;
    let nextBest = bestStreak;
    if (mode === "daily") {
      try {
        const saved = JSON.parse(localStorage.getItem("crossrap-player") || "{}");
        if (saved.lastDaily !== today) {
          const yesterday = new Date(`${today}T12:00:00Z`); yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          nextStreak = saved.lastDaily === dateKey(yesterday) ? (saved.streak || 0) + 1 : 1;
          nextBest = Math.max(saved.bestStreak || 0, nextStreak);
          localStorage.setItem("crossrap-player", JSON.stringify({ streak: nextStreak, bestStreak: nextBest, lastDaily: today }));
          setStreak(nextStreak); setBestStreak(nextBest);
        }
      } catch { /* keep result available without storage */ }
    }
    if (mode === "daily" && !submittedRef.current) {
      submittedRef.current = true;
      setRankingStatus("loading");
      try {
        let playerId = localStorage.getItem("crossrap-player-id");
        if (!playerId) { playerId = crypto.randomUUID(); localStorage.setItem("crossrap-player-id", playerId); }
        const playerName = `MC ${playerId.slice(0, 4).toUpperCase()}`;
        const resultScore = Math.max(0, puzzle.words.length * 100 + Math.max(0, 300 - finishTime) - hintsUsed * 10);
        fetch("/api/ranking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerId, playerName, challengeDate: today, score: resultScore, durationSeconds: finishTime, hintsUsed }) })
          .then(async response => { if (!response.ok) throw new Error("ranking unavailable"); return response.json(); })
          .then(data => { setRanking(data); setRankingStatus("ready"); })
          .catch(() => setRankingStatus("unavailable"));
      } catch { setRankingStatus("unavailable"); }
    }
  }, [completed, puzzle.words.length, finishedSeconds, mode, streak, bestStreak, today, seconds, hintsUsed]);

  function wordCells(wordIndex = active) {
    const word = puzzle.words[wordIndex];
    return [...word.word].map((_, i) => ({
      row: word.row + (word.direction === "down" ? i : 0),
      col: word.col + (word.direction === "across" ? i : 0),
    }));
  }

  function wordIsFilled(wordIndex: number) {
    return wordCells(wordIndex).every(({ row, col }) => Boolean(answers[key(row, col)]));
  }

  function wordIsSolved(wordIndex: number) {
    const word = puzzle.words[wordIndex];
    return wordCells(wordIndex).every(({ row, col }, index) => answers[key(row, col)] === word.word[index]);
  }

  useEffect(() => {
    if (screen === "game" && allCellsFilled && completed < puzzle.words.length) {
      setToast("Quase! As casas em vermelho precisam de ajuste.");
    }
  }, [allCellsFilled, completed, puzzle.words.length, screen]);

  function focusCell(row: number, col: number) {
    requestAnimationFrame(() => {
      const input = inputRefs.current[key(row, col)];
      input?.focus();
      input?.select();
    });
  }

  function selectWord(wordIndex: number, focusFirstEmpty = true) {
    setActive(wordIndex);
    const cells = wordCells(wordIndex);
    const target = focusFirstEmpty
      ? cells.find(({ row, col }) => !answers[key(row, col)]) ?? cells[0]
      : cells[0];
    focusCell(target.row, target.col);
  }

  function moveWithinWord(r: number, c: number, step: number, wordIndex = active) {
    const cells = wordCells(wordIndex);
    const position = cells.findIndex(cell => cell.row === r && cell.col === c);
    const target = cells[position + step];
    if (target) focusCell(target.row, target.col);
  }

  function typeCell(r: number, c: number, value: string) {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setAnswers(prev => ({ ...prev, [key(r, c)]: letter }));
    if (letter) moveWithinWord(r, c, 1);
  }

  function selectCell(r: number, c: number) {
    const cell = puzzle.cells.get(key(r, c));
    if (!cell) return;
    if (cell.across !== undefined && cell.down !== undefined) {
      setActive(active === cell.across ? cell.down : cell.across);
    } else {
      setActive((cell.across ?? cell.down)!);
    }
  }

  function handleCellKeyDown(e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) {
    const cell = puzzle.cells.get(key(r, c));
    if (!cell) return;
    if (e.key === "Backspace" && !answers[key(r, c)]) {
      e.preventDefault();
      const cells = wordCells();
      const position = cells.findIndex(item => item.row === r && item.col === c);
      const previous = cells[position - 1];
      if (previous) {
        setAnswers(old => ({ ...old, [key(previous.row, previous.col)]: "" }));
        focusCell(previous.row, previous.col);
      }
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (cell.across === undefined) return;
      e.preventDefault(); setActive(cell.across); moveWithinWord(r, c, e.key === "ArrowRight" ? 1 : -1, cell.across);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (cell.down === undefined) return;
      e.preventDefault(); setActive(cell.down); moveWithinWord(r, c, e.key === "ArrowDown" ? 1 : -1, cell.down);
    } else if (e.key === " " && cell.across !== undefined && cell.down !== undefined) {
      e.preventDefault(); setActive(active === cell.across ? cell.down : cell.across);
    }
  }
  function revealLetter() {
    const spots = [...current.word].map((_, i) => [current.row + (current.direction === "down" ? i : 0), current.col + (current.direction === "across" ? i : 0)]).filter(([r,c], i) => answers[key(r,c)] !== current.word[i]);
    if (!spots.length) return;
    const [r,c] = spots[Math.floor(Math.random() * spots.length)];
    setAnswers(a => ({ ...a, [key(r,c)]: puzzle.cells.get(key(r,c))!.letter })); setScore(s => Math.max(0, s - 20)); setHintsUsed(value => value + 2); setToast("Letra revelada · −20 pts");
  }
  function showHint() { setScore(s => Math.max(0, s - 10)); setHintsUsed(value => value + 1); setToast(current.hint); }

  async function shareResult() {
    const squares = Array.from({ length: Math.min(16, puzzle.words.length) }, (_, index) => index < hintsUsed ? "🟨" : "🟩");
    const grid = Array.from({ length: Math.ceil(squares.length / 4) }, (_, row) => squares.slice(row * 4, row * 4 + 4).join("")).join("\n");
    const text = `CrossRap #${dailyNumber} 🎤\n${grid}\n⏱ ${String(Math.floor(elapsedSeconds/60)).padStart(2,"0")}:${String(elapsedSeconds%60).padStart(2,"0")}  🔥 ${streak} dias${ranking ? `  🏆 #${ranking.position}` : ""}\n\nVocê manja de rap? Jogue em ${window.location.origin}`;
    try {
      if (navigator.share) await navigator.share({ title: "Meu resultado no CrossRap", text, url: window.location.origin });
      else { await navigator.clipboard.writeText(text); setToast("Resultado copiado. Agora é só postar!"); }
    } catch { /* sharing was cancelled */ }
  }

  if (screen === "home") return <main className="shell home">
    <header><Logo /><nav><button className="nav-active">Início</button><button onClick={startDaily}>Jogar</button><button>Ranking</button><button>Conquistas</button></nav><MassakiBrand compact /><button className="profile">VN <i>{streak}</i></button></header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span>●</span> O desafio do dia está no ar</div><h1>ONDE O RAP<br/>ENCONTRA AS<br/><em>PALAVRAS.</em></h1><p>Uma cruzada por dia. O mesmo desafio para toda a cena. Complete, mantenha sua sequência e compartilhe sem dar spoiler.</p><div className="hero-actions"><button className="primary" onClick={startDaily}>JOGAR O DESAFIO <span>→</span></button><button className="secondary" onClick={startInfinite}>∞ &nbsp; MODO INFINITO</button></div><div className="streak-line"><b>🔥 {streak} dias</b><span>Melhor sequência: {bestStreak}</span></div></div>
      <div className="record-wrap"><div className="orbit one">HIP HOP</div><div className="orbit two">+150 XP</div><div className="record"><div className="record-grooves"></div><div className="label"><b>CROSS<br/><span>RAP</span></b><small>SIDE A<br/>45 RPM</small></div></div><div className="tonearm"></div></div>
    </section>
    <section className="daily-card"><div className="daily-art"><div className="bars">▥ ▤ ▥</div><span>DESAFIO<br/>DO DIA</span><b>#{dailyNumber}</b></div><div className="daily-info"><div className="eyebrow">TODO MUNDO NO MESMO BEAT</div><h2>CrossRap Diário #{dailyNumber}</h2><p>12–16 palavras · Nível acessível · Disponível só hoje</p><div className="progress"><i style={{width: streak ? "78%" : "18%"}}></i></div><small>Comece pelas mais conhecidas e mantenha sua sequência</small></div><div className="daily-time"><span>NOVO DESAFIO EM</span><strong>{countdown}</strong><button onClick={startDaily}>JOGAR DESAFIO →</button></div></section>
    <section className="massaki-course"><div className="course-brand"><MassakiBrand /></div><div><span>DO JOGO PARA O MICROFONE</span><h2>Quer evoluir suas rimas de verdade?</h2><p>Conheça o método de rima de Victor Massaki e transforme repertório em flow, técnica e presença.</p></div><a href="https://www.massaririmas.com" target="_blank" rel="noreferrer">CONHECER O CURSO <b>↗</b></a></section>
    <section className="categories"><div className="section-title"><div><span>ESCOLHA SUA VIBE</span><h2>Categorias</h2></div><button>VER TODAS →</button></div><div className="category-grid">{[["🎤","Rap Nacional","324 palavras","yellow"],["◎","Rap Internacional","286 palavras","red"],["⚔","Batalhas de Rima","198 palavras","white"],["◉","Old School","172 palavras","gray"]].map(([ic,t,n,c])=><button key={t} className={`category-card ${c}`} onClick={startInfinite}><i>{ic}</i><b>{t}</b><span>{n}</span><em>→</em></button>)}</div></section>
  </main>;

  return <main className="game-shell">
    <header><Logo /><button className="back" onClick={() => setScreen("home")}>← início</button><MassakiBrand compact /><div className="game-stats"><span>🔥 <b>{streak}</b> dias</span><span>⭐ <b>{finalScore}</b> pts</span><span>⏱ <b>{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</b></span></div></header>
    <div className="game-top"><div><span>{mode === "daily" ? `DESAFIO DIÁRIO #${dailyNumber} · NÍVEL ACESSÍVEL` : "MODO INFINITO"}</span><h1>{mode === "daily" ? "Comece pelo que você já conhece" : "Underground Essentials"}</h1></div><div className="word-progress"><b>{completed}/{puzzle.words.length}</b><span>palavras</span><i><em style={{width:`${completed/puzzle.words.length*100}%`}} /></i></div></div>
    {toast && <button className="toast" onClick={() => setToast("")}>{toast}<span>×</span></button>}
    <section className="play-area">
      <div className="board-wrap"><div className="board" style={{gridTemplateColumns:`repeat(${cols.length}, 1fr)`}}>{rows.flatMap((_,ri)=>cols.map((_,ci)=>{const r=ri+puzzle.bounds[0],c=ci+puzzle.bounds[2],cell=puzzle.cells.get(key(r,c)); if(!cell)return <div className="blank" key={key(r,c)}/>; const selected=cell.across===active||cell.down===active; const entered=answers[key(r,c)]; const checked=[cell.across,cell.down].some(index=>index!==undefined&&wordIsFilled(index)); const wrong=Boolean(entered)&&entered!==cell.letter&&checked; return <label className={`tile ${selected?"selected":""} ${entered===cell.letter?"correct":""} ${wrong?"wrong":""}`} key={key(r,c)} onClick={()=>selectCell(r,c)}>{cell.number&&<sup>{cell.number}</sup>}<input ref={element => { inputRefs.current[key(r,c)] = element; }} aria-label={`linha ${r}, coluna ${c}${wrong?", letra incorreta":""}`} aria-invalid={wrong} maxLength={1} value={entered||""} onFocus={()=>{if(cell.across!==active&&cell.down!==active)setActive((cell.across??cell.down)!);}} onKeyDown={e=>handleCellKeyDown(e,r,c)} onChange={e=>typeCell(r,c,e.target.value)}/></label>}))}</div><div className="mobile-clue"><span>{current.number} {current.direction === "across" ? "→" : "↓"}</span><p>{current.hint}</p></div></div>
      <aside><div className="tabs"><button className="active">PISTAS</button><button>PROGRESSO</button></div><div className="clue-scroll">{(["across","down"] as const).map(dir=><div className="clue-group" key={dir}><h3>{dir==="across"?"HORIZONTAIS →":"VERTICAIS ↓"}</h3>{puzzle.words.map((w,i)=>{const hasError=wordIsFilled(i)&&!wordIsSolved(i);return w.direction===dir&&<button key={w.word} className={`${active===i?"active":""} ${hasError?"has-error":""}`} onClick={()=>selectWord(i)}><b>{w.number}</b><span>{w.hint}<small>{hasError?"REVISE ESTA PALAVRA · ":""}{w.category} · {w.word.length} letras · {w.difficulty}</small></span></button>})}</div>)}</div><div className="tools"><button onClick={showHint}>💡 <span><b>Dica</b><small>−10 pts</small></span></button><button onClick={revealLetter}>◐ <span><b>Revelar letra</b><small>−20 pts</small></span></button><button onClick={mode === "daily" ? startDaily : startInfinite}>↻ <span><b>Reiniciar</b><small>{mode === "daily" ? "mesmo tabuleiro" : "novo tabuleiro"}</small></span></button></div></aside>
    </section>
    {showResult && <div className="result-backdrop" role="dialog" aria-modal="true" aria-label="Resultado do desafio"><div className="result-modal">
      <button className="result-close" onClick={() => setShowResult(false)} aria-label="Fechar">×</button>
      <div className="result-kicker">DESAFIO #{dailyNumber} COMPLETO</div><h2>VOCÊ FECHOU<br/><em>O TABULEIRO.</em></h2><p>Agora mostra pra cena — sem entregar nenhuma resposta.</p>
      <div className="share-grid">{Array.from({length: Math.min(16,puzzle.words.length)},(_,index)=><i className={index < hintsUsed ? "hinted" : "solved"} key={index}></i>)}</div>
      <div className="result-stats"><span><b>{String(Math.floor(elapsedSeconds/60)).padStart(2,"0")}:{String(elapsedSeconds%60).padStart(2,"0")}</b><small>TEMPO FINAL</small></span><span><b>{finalScore}</b><small>PONTOS</small></span><span><b>🔥 {streak}</b><small>SEQUÊNCIA</small></span></div>
      {mode === "daily" && <div className="daily-ranking">
        <div className="ranking-head"><span>RANKING DE HOJE</span>{rankingStatus === "ready" && ranking && <b>VOCÊ ESTÁ EM <em>#{ranking.position}</em> DE {ranking.total}</b>}</div>
        {rankingStatus === "loading" && <div className="ranking-message">Calculando sua posição na cena...</div>}
        {rankingStatus === "unavailable" && <div className="ranking-message">Ranking aguardando conexão com o Supabase.</div>}
        {rankingStatus === "ready" && ranking && <div className="ranking-list">{ranking.top.slice(0,5).map((entry,index)=><div className={entry.isCurrentPlayer?"you":""} key={`${entry.playerName}-${index}`}><b>{index+1}</b><span>{entry.playerName}{entry.isCurrentPlayer&&<small>VOCÊ</small>}</span><em>{String(Math.floor(entry.durationSeconds/60)).padStart(2,"0")}:{String(entry.durationSeconds%60).padStart(2,"0")}</em><strong>{entry.score} pts</strong></div>)}</div>}
      </div>}
      <button className="share-button" onClick={shareResult}>COMPARTILHAR RESULTADO <b>↗</b></button>
      <div className="next-daily"><span>PRÓXIMO DESAFIO EM</span><b>{countdown}</b></div>
      <a className="result-course" href="https://www.massaririmas.com" target="_blank" rel="noreferrer"><span className="massaki-crop"><img src="/massaki-mark.png" alt="" /></span><span><small>CURTIU O DESAFIO?</small><b>Leve suas rimas para o próximo nível →</b></span></a>
    </div></div>}
  </main>;
}
