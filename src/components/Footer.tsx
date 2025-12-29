import type { JSX } from "react";

import "../styles/Footer.css";

export function Footer(): JSX.Element {
	return (
		<footer className="footer">
			<p className="footer__text">
				<a
					className="footer__link"
					href="https://www.dreamoire.fr/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Création&nbsp;: Yuliana
				</a>
				<span className="footer__sep"> | </span>
				<a
					className="footer__link"
					href="https://warhammer-rpg-initiation.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
				>
					Pour&nbsp;: Thibaut
				</a>
				<span className="footer__year"> — 2025</span>
			</p>
		</footer>
	);
}
