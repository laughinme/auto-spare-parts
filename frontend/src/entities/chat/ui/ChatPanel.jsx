import React, { useEffect, useRef, useState } from "react";
import { bubbleCls } from "../../../shared/lib/helpers.js";

export default function ChatPanel({ order, onSend }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [order.chat]);

  return (
    <div className="card flex flex-col h-[520px]">
			<div className="p-4 border-b font-semibold">Чат с продавцом</div>
			<div ref={listRef} className="flex-1 p-4 space-y-3 overflow-y-auto">
				{order.chat.map((m) =>
        <div key={m.id} className={`max-w-[85%] ${m.author === "buyer" ? "ml-auto" : ""}`}>
						<div className={`rounded-2xl px-3 py-2 text-sm shadow ${bubbleCls(m.author)}`}>{m.text}</div>
						<div className="text-[10px] text-slate-500 mt-1">{new Date(m.ts).toLocaleString()}</div>
					</div>
        )}
			</div>
			<div className="p-3 border-t flex gap-2">
				<input className="input flex-1" placeholder="Напишите сообщение…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter" && text.trim()) {onSend(text.trim());setText("");}}} />
				<button className="btn primary" onClick={() => {if (text.trim()) {onSend(text.trim());setText("");}}}>Отправить</button>
			</div>
		</div>);

}