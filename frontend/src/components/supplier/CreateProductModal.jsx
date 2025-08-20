import React, { useEffect, useState } from "react";

export default function CreateProductModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [img, setImg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setPrice("");
    setVehicle("");
    setImg("");
  }, [isOpen]);

  if (!isOpen) return null;

  const disabled = !title.trim() || !price.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onCreate && onCreate({ title: title.trim(), price, vehicle: vehicle.trim(), img: img.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4">
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xl font-semibold">Новый товар</div>
              <div className="text-sm text-slate-500">Заполните информацию о товаре</div>
            </div>
            <button className="btn ghost" onClick={onClose}>Закрыть</button>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <input className="input" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Цена, ₽" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} />
              <input className="input" placeholder="Какое авто (совместимость)" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </div>
            <input className="input" placeholder="Ссылка на фото" value={img} onChange={(e) => setImg(e.target.value)} />

            {img && (
              <div className="mt-2">
                <img src={img} className="w-full h-40 object-cover rounded-2xl border" alt="Предпросмотр" />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              <button type="button" className="btn secondary" onClick={onClose}>Отмена</button>
              <button type="submit" className="btn primary" disabled={disabled}>Создать</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



