import type { CSSProperties, JSX } from "react";

import logoSrc from "../assets/img/logo.png";
import headerBgSrc from "../assets/img/bg-header.jpg";
import "../styles/Header.css";

export function Header(): JSX.Element {
	const bgStyle: CSSProperties = {
		backgroundImage: `url(${headerBgSrc})`,
	};

	return (
		<header className="site-header">
			<div className="site-header__bg" aria-hidden="true" style={bgStyle} />

			<div className="header-content">
				<div className="top-header">
					<img
						className="site-logo"
						src={logoSrc}
						alt="Logo TS Epic Battle"
						loading="eager"
						decoding="async"
					/>

					<div className="topline">
						<h1 className="header-title">
							<span className="ribbon">TS Epic Battle</span>
						</h1>
					</div>
				</div>
				<div className="header-panel">
					<h2>
						La bataille épique du chevalier TS
						<br />
						de la Team Triche contre le Chaos
					</h2>

					<div className="header-text">
						<p>
							Cette page a vu le jour dans le cadre du Secret Santa, pour
							Thibaut, choisi par le destin. Il a été donné à l’autrice de
							combattre à ses côtés, dans la même équipe, lors de leur projet de
							formation le plus ambitieux — une véritable campagne finale.
						</p>

						<p>
							Puisse ce cadeau lui donner le sourire et ranimer la flamme. Que
							cette année soit celle où toutes les batailles seront remportées :
							contre les bugs, contre Husky, contre Biome, et surtout contre le
							plus perfide des ennemis — celui qui souffle « j’abandonne ».
							<p>Tenir la ligne. Frapper juste. Recommencer.</p>
							Que la Force soit avec lui, aujourd’hui et pour chaque combat à
							venir.
						</p>
						<br />

						<h2>
							Un chevalier. Une terre à défendre.
							<br />
							Une horde de monstres.
							<br />
							Le Chaos approche.
						</h2>

						<p>Clique vite, frappe juste, et protège la terre.</p>

						<p>
							Si tu es assez rapide et assez brave, appuie sur Start et bonne
							chance.
						</p>
					</div>
				</div>
			</div>
		</header>
	);
}
