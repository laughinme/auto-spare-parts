import { SUPPLIER_SELF_ID } from "../../shared/config/constants.js";

export function calculateSupplierMetrics(orders, products) {
  const myOrders = orders.filter((order) => order.supplierId === SUPPLIER_SELF_ID);
  const gmv = myOrders.reduce(
    (sum, order) =>
    sum +
    order.items.reduce(
      (itemSum, item) => itemSum + item.price * item.qty,
      0
    ),
    0
  );
  const pending = myOrders.filter((order) => order.status === "Новый").length;
  const mySkus = products.filter(
    (product) => product.supplierId === SUPPLIER_SELF_ID
  ).length;
  const conversion = myOrders.length ? Math.min(98, 20 + mySkus) : 0;

  return {
    gmv,
    pending,
    mySkus,
    orders: myOrders.length,
    conv: conversion
  };
}