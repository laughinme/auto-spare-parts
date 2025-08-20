import React, { useState } from "react";
import { QUICK_TAGS } from "../../data/constants.js";

export default function TagSelector() {
	const [sel, setSel] = useState(new Set());
	return (
		<div className="flex flex-wrap gap-2">
			{QUICK_TAGS.map((t) => (
				<button
					key={t}
					className={`chip ${sel.has(t) ? "chip--active" : ""}`}
					onClick={() => {
						const s = new Set(sel);
						if (s.has(t)) s.delete(t); else s.add(t);
						setSel(s);
					}}
				>
					{t}
				</button>
			))}
		</div>
	);
}


