import React from "react";

export default function Stepper({ step, steps }) {
	return (
		<div className="flex items-center gap-2">
			{steps.map((label, idx) => (
				<React.Fragment key={label + idx}>
					<div className={`flex items-center gap-2 ${idx <= step ? "text-sky-600" : "text-slate-400"}`}>
						<div className={`w-7 h-7 rounded-full border flex items-center justify-center ${idx <= step ? "bg-sky-600 text-white border-sky-600" : "border-slate-300"}`}>{idx + 1}</div>
						<span className="text-sm hidden sm:block">{label}</span>
					</div>
					{idx < steps.length - 1 && <div className={`h-px flex-1 ${idx < step ? "bg-sky-600" : "bg-slate-200"}`}></div>}
				</React.Fragment>
			))}
		</div>
	);
}


