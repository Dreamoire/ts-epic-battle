import type { JSX } from "react";
import { useId, useState } from "react";

import previewSrc from "../assets/img/video-preview.jpg";
import videoSrc from "../assets/video/epic-battle.mp4";
import captionsSrc from "../assets/video/epic-battle.vtt";
import "../styles/VideoPanel.css";

export function VideoPanel(): JSX.Element {
	const helpId = useId();

	const [isExpanded, setIsExpanded] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	const buttonLabel = isExpanded ? "Réduire la vidéo" : "Ouvrir la vidéo";

	function toggleExpanded() {
		setIsExpanded((v) => !v);
	}

	return (
		<section className="video-panel" aria-labelledby={helpId}>
			<div className="video-panel__header">
				<button
					className="video-panel__toggle"
					type="button"
					onClick={toggleExpanded}
					aria-expanded={isExpanded}
					aria-controls="intro-video"
				>
					{buttonLabel}
				</button>
			</div>

			<div className="video-panel__frame">
				{isExpanded ? (
					<div className="video-panel__media">
						{isLoading ? (
							<output className="video-panel__loading" aria-live="polite">
								Chargement… La vidéo va s’afficher ici.
							</output>
						) : null}

						<video
							id="intro-video"
							className="video-panel__video"
							controls
							preload="metadata"
							playsInline
							poster={previewSrc}
							aria-label="Vidéo : une bataille épique du chevalier contre des monstres."
							onLoadStart={() => setIsLoading(true)}
							onCanPlay={() => setIsLoading(false)}
							onLoadedData={() => setIsLoading(false)}
							onError={() => setIsLoading(false)}
						>
							<source src={videoSrc} type="video/mp4" />
							<track
								kind="captions"
								src={captionsSrc}
								srcLang="fr"
								label="Français"
								default
							/>
							Ton navigateur ne supporte pas la vidéo HTML5. Une scène montre un
							chevalier affrontant des monstres.
						</video>
					</div>
				) : (
					<figure className="video-panel__preview">
						<img
							className="video-panel__img"
							src={previewSrc}
							alt="Aperçu : vidéo d’une bataille épique où un chevalier affronte des monstres."
							loading="lazy"
							decoding="async"
						/>
					</figure>
				)}
			</div>
		</section>
	);
}
