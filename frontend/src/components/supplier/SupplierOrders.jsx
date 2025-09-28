import React, { useEffect, useMemo, useState } from "react";
import {
  listSellerOrders,
  getSellerOrderItem,
  acceptSellerOrderItem,
  rejectSellerOrderItem,
  shipSellerOrderItem,
  deliverSellerOrderItem,
} from "../../api/api.js";

const ALL_STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"];

export default function SupplierOrders({ defaultOrgId }) {
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState(["pending","confirmed","processing"]);
  const [orgId, setOrgId] = useState(defaultOrgId || "");
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const params = useMemo(() => ({ statuses, search: search || undefined, org_id: orgId || undefined, limit: 20 }), [statuses, search, orgId]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setItems([]);
    setNextCursor(null);
    listSellerOrders(params)
      .then((data) => {
        if (ignore) return;
        setItems(data?.items || []);
        setNextCursor(data?.next_cursor || null);
      })
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [params.statuses, params.search, params.org_id]);

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    listSellerOrders({ ...params, cursor: nextCursor })
      .then((data) => {
        setItems((prev) => [...prev, ...(data?.items || [])]);
        setNextCursor(data?.next_cursor || null);
      })
      .finally(() => setLoadingMore(false));
  };

  const openDetails = (id) => {
    setSelectedId(id);
    setDetails(null);
    setDetailsLoading(true);
    getSellerOrderItem(id)
      .then(setDetails)
      .finally(() => setDetailsLoading(false));
  };

  const patchItem = (updated) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
    if (selectedId === updated.id) setDetails(updated);
  };

  const onAccept = async (id) => {
    const data = await acceptSellerOrderItem(id);
    patchItem(data);
  };

  const onReject = async (id) => {
    const reason = window.prompt("Причина отказа (необязательна):") || undefined;
    const data = await rejectSellerOrderItem(id, reason);
    patchItem(data);
  };

  const onShip = async (id) => {
    const carrier = window.prompt("Перевозчик (carrier_code):");
    if (!carrier) return;
    const tn = window.prompt("Трек-номер (tracking_number):");
    if (!tn) return;
    const url = window.prompt("Tracking URL (опционально):") || undefined;
    const data = await shipSellerOrderItem(id, { carrier_code: carrier, tracking_number: tn, tracking_url: url });
    patchItem(data);
  };

  const onDeliver = async (id) => {
    const data = await deliverSellerOrderItem(id, {});
    patchItem(data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Заказы</h2>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Поиск по номеру детали/названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          multiple
          value={statuses}
          onChange={(e) => setStatuses(Array.from(e.target.selectedOptions).map((o) => o.value))}
          className="px-3 py-2 rounded-xl border border-slate-300"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          className="px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="org_id (опционально)"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
          onClick={() => {
            const p = { statuses, search: search || undefined, org_id: orgId || undefined, limit: 20 };
            setLoading(true);
            listSellerOrders(p).then((d) => {
              setItems(d?.items || []);
              setNextCursor(d?.next_cursor || null);
            }).finally(() => setLoading(false));
          }}
        >
          Применить
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Ref</th>
              <th className="text-left p-3">Статус</th>
              <th className="text-left p-3">Товар</th>
              <th className="text-left p-3">Кол-во</th>
              <th className="text-left p-3">Покупатель</th>
              <th className="text-left p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6" colSpan={6}>Загрузка…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6" colSpan={6}>Пусто</td></tr>
            ) : (
              items.map((it) => {
                const allowed = actionsByStatus[it.status] || [];
                return (
                  <tr key={it.id} className="border-t">
                    <td className="p-3">
                      <button className="text-sky-700 hover:underline" onClick={() => openDetails(it.id)}>
                        {it.order_reference || it.id.slice(0, 8)}
                      </button>
                    </td>
                    <td className="p-3">{it.status}</td>
                    <td className="p-3">{it.product_title}</td>
                    <td className="p-3">{it.quantity}</td>
                    <td className="p-3">{it?.buyer?.username || it?.buyer?.email || it?.buyer?.id}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {allowed.includes("accept") && (
                          <button className="px-2 py-1 rounded-lg border bg-white hover:bg-slate-50" onClick={() => onAccept(it.id)}>Accept</button>
                        )}
                        {allowed.includes("reject") && (
                          <button className="px-2 py-1 rounded-lg border bg-white hover:bg-slate-50" onClick={() => onReject(it.id)}>Reject</button>
                        )}
                        {allowed.includes("ship") && (
                          <button className="px-2 py-1 rounded-lg border bg-white hover:bg-slate-50" onClick={() => onShip(it.id)}>Ship</button>
                        )}
                        {allowed.includes("deliver") && (
                          <button className="px-2 py-1 rounded-lg border bg-white hover:bg-slate-50" onClick={() => onDeliver(it.id)}>Deliver</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div>
          <button
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Загрузка…" : "Показать ещё"}
          </button>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Детали</h3>
              <button className="px-2 py-1 rounded-lg border" onClick={() => setSelectedId(null)}>Закрыть</button>
            </div>
            {detailsLoading ? (
              <div className="p-4">Загрузка…</div>
            ) : details ? (
              <pre className="text-xs bg-slate-50 p-3 rounded-xl overflow-auto max-h-[60vh]">{JSON.stringify(details, null, 2)}</pre>
            ) : (
              <div className="p-4">Нет данных</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const actionsByStatus = {
  pending: ["accept","reject"],
  confirmed: ["ship"],
  processing: ["ship"],
  shipped: ["deliver"],
  delivered: [],
  cancelled: [],
  refunded: [],
};