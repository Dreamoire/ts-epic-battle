import type { JSX } from "react";

import { Footer } from "./components/Footer";
import { GameSection } from "./components/GameSection";
import { Header } from "./components/Header";
import { PageLayout } from "./components/PageLayout";
import { VideoPanel } from "./components/VideoPanel";

import "./styles/Global.css";

export function App(): JSX.Element {
	return (
		<PageLayout>
			<Header />

			<main>
				<VideoPanel />
				<GameSection />
			</main>

			<Footer />
		</PageLayout>
	);
}

export default App;
