import React, { useMemo, useState } from "react";

export default function AdvancedSearch({ onApply }) {
	const [query, setQuery] = useState(""); // e.g., "дверь"
	const [sideLeft, setSideLeft] = useState(null); // true/false/null
	const [sideFront, setSideFront] = useState(null); // true/false/null for front/rear

	const [brand, setBrand] = useState(""); // e.g., "BMW X6"
	const [tab, setTab] = useState("gen"); // gen | body

	const [generation, setGeneration] = useState("any");
	const [mod, setMod] = useState("any");

	const [bodyNo, setBodyNo] = useState("");
	const [engineNo, setEngineNo] = useState("");

	// Simple mock options based on brand
	const genOptions = useMemo(() => {
		if (/bmw\s*x6/i.test(brand)) {
			return [
				{ key: "any", label: "Любое поколение" },
				{ key: "g06", label: "3 поколение", sub: "2019 – н.в." },
				{ key: "f16", label: "2 поколение", sub: "2014 – 2019" },
				{ key: "e71", label: "1 поколение", sub: "2007 – 2014" },
			];
		}
		if (/toyota\s*camry/i.test(brand)) {
			return [
				{ key: "any", label: "Любое поколение" },
				{ key: "v70", label: "XV70", sub: "2017 – н.в." },
				{ key: "v50", label: "XV50", sub: "2011 – 2017" },
			];
		}
		return [{ key: "any", label: "Любое поколение" }];
	}, [brand]);

	const modOptions = useMemo(() => {
		if (/bmw\s*x6/i.test(brand)) {
			return [
				{ key: "any", label: "Любая модификация" },
				{ key: "30d", label: "3.0 л диз." },
				{ key: "30i", label: "3.0 л бенз." },
				{ key: "44i", label: "4.4 л бенз." },
			];
		}
		if (/toyota\s*camry/i.test(brand)) {
			return [
				{ key: "any", label: "Любая модификация" },
				{ key: "25", label: "2.5 л бенз." },
				{ key: "35", label: "3.5 л бенз." },
			];
		}
		return [{ key: "any", label: "Любая модификация" }];
	}, [brand]);

	const apply = () => {
		onApply({
			query: [query, sideLeft === true ? "левая" : sideLeft === false ? "правая" : "", sideFront === true ? "передняя" : sideFront === false ? "задняя" : "", brand, generation !== "any" ? generation : "", mod !== "any" ? mod : "", bodyNo, engineNo].filter(Boolean).join(" "),
			brand,
		});
	};

	return (
		<div className="card p-5">
			<div className="grid lg:grid-cols-12 gap-3 items-start">
				<div className="lg:col-span-9 space-y-3">
					<div className="flex gap-2">
						<input className="input flex-1" placeholder="Что ищем? Например, дверь" value={query} onChange={(e) => setQuery(e.target.value)} />
						<button className="btn primary" onClick={apply}>Найти</button>
					</div>

					<div className="text-sm text-slate-600 select-none">
						<ToggleUnderline labelLeft="левая" labelRight="правая" value={sideLeft} onChange={setSideLeft} />
						<span className="mx-2">,</span>
						<ToggleUnderline labelLeft="передняя" labelRight="задняя" value={sideFront} onChange={setSideFront} />
					</div>

					<div className="flex gap-2 items-center">
						<div className="relative flex-1">
							<input className="input w-full" placeholder="Марка и модель (напр., BMW X6)" value={brand} onChange={(e) => setBrand(e.target.value)} />
							{brand && (
								<button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setBrand("")}>×</button>
							)}
						</div>
						<div className="segmented">
							<button className={`seg ${tab === "gen" ? "seg--active" : ""}`} onClick={() => setTab("gen")}>По поколению</button>
							<button className={`seg ${tab === "body" ? "seg--active" : ""}`} onClick={() => setTab("body")}>По номеру кузова</button>
						</div>
					</div>

					{tab === "gen" && (
						<div className="space-y-3">
							<div className="flex flex-wrap gap-2 items-center">
								{genOptions.map((g) => (
									<button key={g.key} className={`chip ${generation === g.key ? "chip--active-soft" : ""}`} onClick={() => setGeneration(g.key)}>
										<span className={`${generation === g.key ? "font-semibold" : ""}`}>{g.label}</span>
										{g.sub && <span className="ml-2 text-xs text-slate-500">{g.sub}</span>}
									</button>
								))}
							</div>
							<div className="flex flex-wrap gap-2 items-center">
								{modOptions.map((m) => (
									<button key={m.key} className={`chip ${mod === m.key ? "chip--active-soft" : ""}`} onClick={() => setMod(m.key)}>{m.label}</button>
								))}
							</div>
						</div>
					)}

					{tab === "body" && (
						<div className="grid sm:grid-cols-2 gap-3">
							<input className="input" placeholder="Номер кузова" value={bodyNo} onChange={(e) => setBodyNo(e.target.value)} />
							<input className="input" placeholder="Номер двигателя" value={engineNo} onChange={(e) => setEngineNo(e.target.value)} />
						</div>
					)}
				</div>

				<div className="lg:col-span-3 text-sm text-slate-600">
					<div className="rounded-2xl bg-sky-50 border border-sky-100 p-3">
						Подсказка: заполните марку/модель и уточните поколение — это резко сузит выдачу. Можно указать сторону и положение (например, «левая передняя дверь»).
					</div>
				</div>
			</div>
		</div>
	);
}

function ToggleUnderline({ labelLeft, labelRight, value, onChange }) {
	return (
		<span className="inline-flex gap-2">
			<button className={`underline decoration-dotted underline-offset-4 ${value === true ? "text-sky-700" : "hover:text-sky-700"}`} onClick={() => onChange(true)}>{labelLeft}</button>
			<span>–</span>
			<button className={`underline decoration-dotted underline-offset-4 ${value === false ? "text-sky-700" : "hover:text-sky-700"}`} onClick={() => onChange(false)}>{labelRight}</button>
		</span>
	);
}


