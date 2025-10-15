import React from "react";

export default function RoleCard({ title, desc, selected, onClick, icon }) {
  return (
    <button onClick={onClick} className={`text-left p-5 rounded-3xl border transition shadow-sm hover:shadow-md ${selected ? "border-sky-600 ring-2 ring-sky-100" : "border-slate-200"}`}>
			<div className="text-3xl mb-2">{icon}</div>
			<div className="font-semibold">{title}</div>
			<div className="text-sm text-slate-600 mt-1">{desc}</div>
		</button>);

}