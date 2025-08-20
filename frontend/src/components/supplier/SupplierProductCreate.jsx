import React, { useMemo, useState } from "react";
import { SUPPLIER_SELF_ID } from "../../data/constants.js";

export default function SupplierProductCreate({ supplierProfile, onCancel, onCreate }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const canSubmit = title.trim() && price.trim();

  const preview = useMemo(() => {
    if (fileUrl) return fileUrl;
    return "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop";
  }, [fileUrl]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setFileUrl(url);
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    const payload = {
      title: title.trim(),
      price,
      vehicle: vehicle.trim(),
      // In real app we would upload 'file' and store URL from backend
      img: fileUrl,
    };
    onCreate && onCreate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Новый товар</h1>
          <p className="text-slate-600 text-sm">Загрузите фото и заполните данные</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn secondary" onClick={onCancel}>Отмена</button>
          <button className="btn primary" disabled={!canSubmit} onClick={handleCreate}>Создать</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-3">
          <input className="input" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Цена, ₽" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} />
            <input className="input" placeholder="Какое авто (совместимость)" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Фото товара</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            <div className="text-xs text-slate-500 mt-1">Поддерживаются изображения. Файл не отправляется на сервер, только предпросмотр.</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-[16/9] bg-slate-100">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="text-xl font-semibold">{title || "Предпросмотр товара"}</div>
                <div className="text-base font-semibold">{price ? new Intl.NumberFormat("ru-RU").format(Number(price)) + " ₽" : "—"}</div>
              </div>
              <div className="text-sm text-slate-600 mt-1">{vehicle || "Укажите совместимость"}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="chip">Misc</span>
                <span className="chip">Новый</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



