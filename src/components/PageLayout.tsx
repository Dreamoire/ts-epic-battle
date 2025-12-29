import type { PropsWithChildren } from "react";

import "../styles/PageLayout.css";

export function PageLayout({ children }: PropsWithChildren) {
	return <div className="page-layout">{children}</div>;
}
