import type { JSX, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import bgMainSrc from "../assets/img/bg-main.jpg";

import heroLeftSrc from "../assets/img/hero-left.png";
import heroRightSrc from "../assets/img/hero-right.png";
import heroStartSrc from "../assets/img/hero-start.png";
import heroWinSrc from "../assets/img/hero-win.png";

import monster1Src from "../assets/img/monster-1.png";
import monster404Src from "../assets/img/monster-404.png";
import monsterAbandonSrc from "../assets/img/monster-abandon.png";
import monsterAsdfSrc from "../assets/img/monster-asdf.png";
import monsterCorsSrc from "../assets/img/monster-cors.png";
import monsterCrocodileSrc from "../assets/img/monster-crocodile.png";
import monsterCrystalSrc from "../assets/img/monster-crystal.png";
import monsterHuskySrc from "../assets/img/monster-husky.png";
import monsterLoopSrc from "../assets/img/monster-loop.png";
import monsterModuleSrc from "../assets/img/monster-module.png";
import monsterSnakeSrc from "../assets/img/monster-snake.png";
import monsterAbassSrc from "../assets/img/moster-abass.png";
import monsterAbass2Src from "../assets/img/moster-abass-2.png";

import "../styles/GameSection.css";

type Difficulty = "easy" | "normal" | "hard";
type SpawnSide = "left" | "right" | "bottom";
type Facing = "left" | "right";

type Vec2 = { x: number; y: number };

type HeroState = {
	pos: Vec2;
	size: number;
	hitRadius: number;
};

type MonsterKey =
	| "monster-crystal"
	| "monster-cors"
	| "monster-husky"
	| "monster-404"
	| "monster-loop"
	| "monster-module"
	| "monster-1"
	| "monster-abass"
	| "monster-abass-2"
	| "monster-crocodile"
	| "monster-abandon"
	| "monster-asdf"
	| "monster-snake";

type AssetKey =
	| "hero-start"
	| "hero-left"
	| "hero-right"
	| "hero-win"
	| MonsterKey;

type MonsterRole = "text-left" | "text-right" | "flip-when-right" | "front";

type MonsterDef = {
	key: MonsterKey;
	src: string;
	role: MonsterRole;
	spawn: SpawnSide[];
};

type MonsterState = {
	key: MonsterKey;
	role: MonsterRole;
	spawnSide: SpawnSide;
	pos: Vec2;
	vel: Vec2;
	w: number;
	h: number;
	isDying: boolean;
	deathT: number;
	deathVel: Vec2;
	alpha: number;
};

type GamePhase = "idle" | "playing" | "win" | "gameover";

const SCORE_PER_KILL = 25;
const KILLS_TO_WIN = 10;

// Максимальные высоты (как ты попросила)
const HERO_MAX_H_START = 400;
const HERO_MAX_H_PLAY = 300;
const MONSTER_MAX_H = 200;

function vec(x: number, y: number): Vec2 {
	return { x, y };
}

function add(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x - b.x, y: a.y - b.y };
}

function mul(v: Vec2, n: number): Vec2 {
	return { x: v.x * n, y: v.y * n };
}

function mag(v: Vec2): number {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}

function unit(v: Vec2): Vec2 {
	const m = mag(v);
	if (m === 0) return { x: 0, y: 0 };
	return { x: v.x / m, y: v.y / m };
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

function distance(a: Vec2, b: Vec2): number {
	return mag(sub(a, b));
}

function difficultySpeed(d: Difficulty): number {
	if (d === "easy") return 1.2;
	if (d === "normal") return 1.55;
	return 2.05;
}

function difficultySpawnMs(d: Difficulty): number {
	if (d === "easy") return 1200;
	if (d === "normal") return 850;
	return 600;
}

const MONSTERS: MonsterDef[] = [
	{
		key: "monster-crystal",
		src: monsterCrystalSrc,
		role: "text-left",
		spawn: ["left"],
	},
	{
		key: "monster-cors",
		src: monsterCorsSrc,
		role: "text-left",
		spawn: ["left"],
	},
	{
		key: "monster-husky",
		src: monsterHuskySrc,
		role: "text-left",
		spawn: ["left"],
	},

	{
		key: "monster-404",
		src: monster404Src,
		role: "text-right",
		spawn: ["right"],
	},
	{
		key: "monster-loop",
		src: monsterLoopSrc,
		role: "text-right",
		spawn: ["right"],
	},
	{
		key: "monster-module",
		src: monsterModuleSrc,
		role: "text-right",
		spawn: ["right"],
	},

	{
		key: "monster-1",
		src: monster1Src,
		role: "flip-when-right",
		spawn: ["left", "right", "bottom"],
	},
	{
		key: "monster-abass",
		src: monsterAbassSrc,
		role: "flip-when-right",
		spawn: ["left", "right", "bottom"],
	},
	{
		key: "monster-abass-2",
		src: monsterAbass2Src,
		role: "flip-when-right",
		spawn: ["left", "right", "bottom"],
	},
	{
		key: "monster-crocodile",
		src: monsterCrocodileSrc,
		role: "flip-when-right",
		spawn: ["left", "right", "bottom"],
	},

	{
		key: "monster-abandon",
		src: monsterAbandonSrc,
		role: "front",
		spawn: ["left", "right", "bottom"],
	},
	{
		key: "monster-asdf",
		src: monsterAsdfSrc,
		role: "front",
		spawn: ["left", "right", "bottom"],
	},
	{
		key: "monster-snake",
		src: monsterSnakeSrc,
		role: "front",
		spawn: ["left", "right", "bottom"],
	},
];

function pickRandom<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = "async";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
		img.src = src;
	});
}

function fitSizeByMaxHeight(
	img: HTMLImageElement,
	targetH: number,
	maxH: number,
	minH: number,
	maxW: number,
): { w: number; h: number } {
	const aspect =
		img.naturalHeight > 0 && img.naturalWidth > 0
			? img.naturalWidth / img.naturalHeight
			: 1;

	const h = clamp(targetH, minH, maxH);
	const w = clamp(h * aspect, 24, maxW);

	return { w, h };
}

function computeCanvasSize(canvas: HTMLCanvasElement): void {
	const parent = canvas.parentElement;
	if (!parent) return;

	const rect = parent.getBoundingClientRect();
	const dpr = window.devicePixelRatio || 1;

	canvas.width = Math.floor(rect.width * dpr);
	canvas.height = Math.floor(rect.height * dpr);

	const ctx = canvas.getContext("2d");
	if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function GameSection(): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const rafRef = useRef<number | null>(null);
	const spawnTimerRef = useRef<number | null>(null);

	const imagesRef = useRef<Record<AssetKey, HTMLImageElement> | null>(null);

	const monstersRef = useRef<MonsterState[]>([]);
	const activeKeysRef = useRef<Set<MonsterKey>>(new Set());

	const heroRef = useRef<HeroState>({
		pos: vec(0, 0),
		size: 120,
		hitRadius: 44,
	});

	const phaseRef = useRef<GamePhase>("idle");
	const difficultyRef = useRef<Difficulty>("easy");
	const scoreRef = useRef(0);
	const killsRef = useRef(0);
	const lastFacingRef = useRef<Facing>("right");

	const [phase, setPhase] = useState<GamePhase>("idle");
	const [difficulty, setDifficulty] = useState<Difficulty>("easy");
	const [score, setScore] = useState(0);
	const [kills, setKills] = useState(0);
	const [assetsReady, setAssetsReady] = useState(false);
	const [lastFacing, setLastFacing] = useState<Facing>("right");

	useEffect(() => {
		phaseRef.current = phase;
	}, [phase]);

	useEffect(() => {
		difficultyRef.current = difficulty;
	}, [difficulty]);

	useEffect(() => {
		scoreRef.current = score;
	}, [score]);

	useEffect(() => {
		killsRef.current = kills;
	}, [kills]);

	useEffect(() => {
		lastFacingRef.current = lastFacing;
	}, [lastFacing]);

	const bgStyle = useMemo(() => ({ backgroundImage: `url(${bgMainSrc})` }), []);

	const stopRaf = useCallback((): void => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const stopSpawn = useCallback((): void => {
		if (spawnTimerRef.current !== null) {
			window.clearInterval(spawnTimerRef.current);
			spawnTimerRef.current = null;
		}
	}, []);

	const stopAll = useCallback((): void => {
		stopRaf();
		stopSpawn();
	}, [stopRaf, stopSpawn]);

	const endGameOver = useCallback((): void => {
		// НЕ останавливаем raf — просто перестаём спавнить и чистим монстров
		stopSpawn();
		monstersRef.current = [];
		activeKeysRef.current = new Set<MonsterKey>();
		setPhase("gameover");
	}, [stopSpawn]);

	const endWin = useCallback((): void => {
		stopSpawn();
		monstersRef.current = [];
		activeKeysRef.current = new Set<MonsterKey>();
		setPhase("win");
	}, [stopSpawn]);

	const getHeroImageKey = useCallback(
		(
			currentPhase: GamePhase,
		): "hero-start" | "hero-left" | "hero-right" | "hero-win" => {
			if (currentPhase === "win") return "hero-win";
			if (currentPhase !== "playing") return "hero-start";
			return lastFacingRef.current === "left" ? "hero-left" : "hero-right";
		},
		[],
	);

	const heroCollision = useCallback((m: MonsterState): boolean => {
		if (m.isDying) return false;

		const hero = heroRef.current;
		const mc = vec(m.pos.x + m.w / 2, m.pos.y + m.h / 2);

		const d = distance(hero.pos, mc);
		const monsterRadius = Math.min(m.w, m.h) * 0.34;

		return d <= hero.hitRadius + monsterRadius;
	}, []);

	const resetGameState = useCallback((): void => {
		monstersRef.current = [];
		activeKeysRef.current = new Set<MonsterKey>();
		setScore(0);
		setKills(0);
		setLastFacing("right");
	}, []);

	const startGame = useCallback((): void => {
		if (!assetsReady) return;
		resetGameState();
		setPhase("playing");
	}, [assetsReady, resetGameState]);

	const restartAfterEnd = useCallback((): void => {
		stopSpawn();
		resetGameState();
		setPhase("idle");
	}, [resetGameState, stopSpawn]);

	const killMonster = useCallback((m: MonsterState): void => {
		if (m.isDying) return;

		m.isDying = true;
		m.deathT = 0;

		const sideKick = (Math.random() * 2 - 1) * 2.2;
		m.deathVel = vec(sideKick, -6.2);
	}, []);

	const hitTestMonster = useCallback((m: MonsterState, p: Vec2): boolean => {
		if (m.isDying) return false;

		return (
			p.x >= m.pos.x &&
			p.x <= m.pos.x + m.w &&
			p.y >= m.pos.y &&
			p.y <= m.pos.y + m.h
		);
	}, []);

	const spawnMonster = useCallback((): void => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		if (phaseRef.current !== "playing") return;

		const parent = canvas.parentElement;
		if (!parent) return;

		const rect = parent.getBoundingClientRect();
		const hero = heroRef.current;

		const images = imagesRef.current;
		if (!images) return;

		const activeKeys = activeKeysRef.current;
		const available = MONSTERS.filter((m) => !activeKeys.has(m.key));
		if (available.length === 0) return;

		const def = pickRandom(available);
		const side = pickRandom(def.spawn);

		const img = images[def.key];

		// Монстры: нормальный размер, не «слишком маленькие на большом экране»
		const targetH = rect.height * 0.18; // базовая доля от арены
		const { w, h } = fitSizeByMaxHeight(
			img,
			targetH,
			MONSTER_MAX_H,
			70,
			rect.width * 0.22,
		);

		const margin = 18;

		let x = 0;
		let y = 0;

		if (side === "left") {
			x = -w - margin;
			y = clamp(
				hero.pos.y - h / 2 + (Math.random() * 120 - 60),
				40,
				rect.height - h - 40,
			);
		} else if (side === "right") {
			x = rect.width + margin;
			y = clamp(
				hero.pos.y - h / 2 + (Math.random() * 120 - 60),
				40,
				rect.height - h - 40,
			);
		} else {
			x = Math.random() * (rect.width - w);
			y = rect.height + margin + Math.random() * 120;
		}

		const monsterCenter = vec(x + w / 2, y + h / 2);
		const toward = unit(sub(hero.pos, monsterCenter));

		const speed = difficultySpeed(difficultyRef.current);

		const vel = mul(toward, 1.5 * speed);

		monstersRef.current.push({
			key: def.key,
			role: def.role,
			spawnSide: side,
			pos: vec(x, y),
			vel,
			w,
			h,
			isDying: false,
			deathT: 0,
			deathVel: vec(0, 0),
			alpha: 1,
		});

		activeKeys.add(def.key);
	}, []);

	function onPointerDown(e: PointerEvent<HTMLCanvasElement>): void {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const clickPos = vec(e.clientX - rect.left, e.clientY - rect.top);

		const hero = heroRef.current;
		setLastFacing(clickPos.x < hero.pos.x ? "left" : "right");

		if (phaseRef.current !== "playing") return;

		const monsters = monstersRef.current;
		for (let i = monsters.length - 1; i >= 0; i -= 1) {
			const m = monsters[i];
			if (hitTestMonster(m, clickPos)) {
				killMonster(m);
				setScore((s) => s + SCORE_PER_KILL);
				setKills((k) => k + 1);
				break;
			}
		}
	}

	// Preload images once (typed cleanly)
	useEffect(() => {
		let isMounted = true;

		async function preload(): Promise<void> {
			try {
				const monsterPairs: Array<[AssetKey, string]> = MONSTERS.map(
					(m): [AssetKey, string] => [m.key, m.src],
				);

				const list: Array<[AssetKey, string]> = [
					["hero-start", heroStartSrc],
					["hero-left", heroLeftSrc],
					["hero-right", heroRightSrc],
					["hero-win", heroWinSrc],
					...monsterPairs,
				];

				const loaded = await Promise.all(
					list.map(async ([key, src]) => {
						const img = await loadImage(src);
						return [key, img] as const;
					}),
				);

				if (!isMounted) return;

				const map = {} as Record<AssetKey, HTMLImageElement>;
				for (const [key, img] of loaded) {
					map[key] = img;
				}

				imagesRef.current = map;
				setAssetsReady(true);
			} catch (error) {
				console.error("Image preload failed", error);
				if (isMounted) setAssetsReady(false);
			}
		}

		void preload();

		return () => {
			isMounted = false;
		};
	}, []);

	// Main RAF loop (always running once assets are ready)
	useEffect(() => {
		if (!assetsReady) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const draw = (): void => {
			const parent = canvas.parentElement;
			if (!parent) return;

			const rect = parent.getBoundingClientRect();
			ctx.clearRect(0, 0, rect.width, rect.height);

			ctx.font = "16px Libre Baskerville, Georgia, serif";
			ctx.fillStyle = "#EDE7DC";
			ctx.fillText(`Score: ${scoreRef.current}`, 12, 24);

			const images = imagesRef.current;
			if (!images) return;

			// Hero sizing: респонсивно, но с твоими max-ограничениями
			const hero = heroRef.current;
			const heroKey = getHeroImageKey(phaseRef.current);
			const heroImg = images[heroKey];

			if (heroImg) {
				const maxH =
					heroKey === "hero-start" ? HERO_MAX_H_START : HERO_MAX_H_PLAY;
				const targetH = rect.height * 0.26;

				const { w, h } = fitSizeByMaxHeight(
					heroImg,
					targetH,
					maxH,
					110,
					rect.width * 0.28,
				);

				hero.size = Math.max(w, h);
				hero.hitRadius = Math.min(w, h) * 0.34;
				const battlefieldY = 0.45;
				hero.pos = vec(rect.width / 2, rect.height * battlefieldY);

				ctx.drawImage(heroImg, hero.pos.x - w / 2, hero.pos.y - h / 2, w, h);
			}

			for (const m of monstersRef.current) {
				const img = images[m.key];
				if (!img) continue;

				ctx.save();
				ctx.globalAlpha = m.alpha;

				const mustFlip =
					m.role === "flip-when-right" && m.spawnSide === "right";
				if (mustFlip) {
					ctx.translate(m.pos.x + m.w / 2, 0);
					ctx.scale(-1, 1);
					ctx.translate(-(m.pos.x + m.w / 2), 0);
				}

				ctx.drawImage(img, m.pos.x, m.pos.y, m.w, m.h);
				ctx.restore();
			}
		};

		const step = (): void => {
			const parent = canvas.parentElement;
			if (!parent) return;

			const rect = parent.getBoundingClientRect();

			const monsters = monstersRef.current;
			const activeKeys = activeKeysRef.current;

			for (const m of monsters) {
				if (!m.isDying) {
					// движение только в игре
					if (phaseRef.current === "playing") {
						m.pos = add(m.pos, m.vel);

						if (heroCollision(m)) {
							endGameOver();
							break;
						}
					}
				} else {
					m.pos = add(m.pos, m.deathVel);
					m.deathVel = add(m.deathVel, vec(0, 0.16));
					m.deathT = clamp(m.deathT + 0.05, 0, 1);
					m.alpha = 1 - m.deathT;
				}
			}

			// чистим умерших
			monstersRef.current = monsters.filter((m) => {
				if (!m.isDying) return true;
				if (m.deathT < 1) return true;
				activeKeys.delete(m.key);
				return false;
			});

			// win-check
			if (phaseRef.current === "playing" && killsRef.current >= KILLS_TO_WIN) {
				endWin();
			}

			// лёгкое ограничение: если улетели далеко, чистим (чтобы не копились)
			monstersRef.current = monstersRef.current.filter((m) => {
				const out =
					m.pos.x < -m.w - 220 ||
					m.pos.x > rect.width + 220 ||
					m.pos.y < -m.h - 220 ||
					m.pos.y > rect.height + 220;
				if (!out) return true;
				activeKeys.delete(m.key);
				return false;
			});

			draw();
			rafRef.current = requestAnimationFrame(step);
		};

		const onResize = (): void => {
			computeCanvasSize(canvas);
			draw();
		};

		computeCanvasSize(canvas);
		window.addEventListener("resize", onResize);

		rafRef.current = requestAnimationFrame(step);

		return () => {
			window.removeEventListener("resize", onResize);
			stopAll();
		};
	}, [
		assetsReady,
		endGameOver,
		endWin,
		getHeroImageKey,
		heroCollision,
		stopAll,
	]);

	// Spawn loop (ВАЖНО: тут НЕ трогаем raf)
	useEffect(() => {
		if (!assetsReady) return;

		// остановить только spawn-таймер
		if (spawnTimerRef.current !== null) {
			window.clearInterval(spawnTimerRef.current);
			spawnTimerRef.current = null;
		}

		if (phase !== "playing") return;

		const spawnMs = difficultySpawnMs(difficulty);
		spawnTimerRef.current = window.setInterval(() => {
			spawnMonster();
		}, spawnMs);

		return () => {
			if (spawnTimerRef.current !== null) {
				window.clearInterval(spawnTimerRef.current);
				spawnTimerRef.current = null;
			}
		};
	}, [assetsReady, difficulty, phase, spawnMonster]);

	return (
		<section className="game" aria-labelledby="game-title">
			<h2 className="game__sr-title" id="game-title">
				Champ de bataille
			</h2>

			<div className="game__bg" style={bgStyle} aria-hidden="true" />

			<div className="game__arena">
				<canvas
					ref={canvasRef}
					className="game__canvas"
					onPointerDown={onPointerDown}
					aria-label="Champ de bataille : clique sur les monstres pour protéger le chevalier."
					role="img"
				/>

				{phase !== "playing" ? (
					<div className="game__overlay" role="dialog" aria-modal="false">
						<div className="game__card">
							{phase === "idle" ? (
								<>
									<h3 className="game__card-title">Prêt·e à combattre ?</h3>
									<p className="game__card-text">
										Objectif: éliminer {KILLS_TO_WIN} monstres.
										<br />
										Attention: un seul contact = défaite.
									</p>

									<label className="game__field">
										<span className="game__field-label">Difficulté </span>
										<select
											className="game__select"
											value={difficulty}
											onChange={(e) => {
												setDifficulty(e.target.value as Difficulty);
											}}
										>
											<option value="easy">I — Lent (facile)</option>
											<option value="normal">II — Normal</option>
											<option value="hard">III — Rapide (difficile)</option>
										</select>
									</label>

									<button
										className="game__btn"
										type="button"
										onClick={startGame}
										disabled={!assetsReady}
									>
										{assetsReady ? "Start" : "Chargement…"}
									</button>
								</>
							) : null}

							{phase === "gameover" ? (
								<>
									<h3 className="game__card-title">GAME OVER !</h3>
									<p className="game__card-text">
										Player score : <strong>{score}</strong>
									</p>
									<button
										className="game__btn"
										type="button"
										onClick={restartAfterEnd}
									>
										Start over
									</button>
								</>
							) : null}

							{phase === "win" ? (
								<>
									<h3 className="game__card-title">Victoire !</h3>
									<p className="game__card-text">
										Monstres éliminés : <strong>{kills}</strong> — Score :{" "}
										<strong>{score}</strong>
									</p>
									<button
										className="game__btn"
										type="button"
										onClick={restartAfterEnd}
									>
										Rejouer
									</button>
								</>
							) : null}
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}
