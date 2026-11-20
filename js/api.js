import { CONFIG } from "./config.js";

const BASE_URL = CONFIG.features.backendEnabled && CONFIG.api?.baseUrl ? CONFIG.api.baseUrl : "http://localhost:3000";

async function request(endpoint, options = {}) {
  const url = BASE_URL + endpoint;
  const config = { headers: { "Content-Type": "application/json", ...options.headers }, ...options };
  try {
    const res = await fetch(url, config);
    if (res.status === 503) throw new Error("Backend no disponible");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error " + res.status);
    return data;
  } catch (err) {
    if (err.message.includes("fetch") || err.name === "TypeError") throw new Error("No se pudo conectar");
    throw err;
  }
}

// Generic methods for admin panel
export async function get(endpoint) {
  return await request(endpoint, { method: "GET" });
}

export async function post(endpoint, data) {
  return await request(endpoint, { method: "POST", body: JSON.stringify(data) });
}

export async function put(endpoint, data) {
  return await request(endpoint, { method: "PUT", body: JSON.stringify(data) });
}

export async function del(endpoint) {
  return await request(endpoint, { method: "DELETE" });
}

export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.category) params.set("category", filters.category);
  if (filters.size) params.set("size", filters.size);
  if (filters.color) params.set("color", filters.color);
  if (filters.featured !== undefined) params.set("featured", filters.featured);
  const query = params.toString();
  const data = await request("/api/products" + (query ? "?" + query : ""));
  return data.products || [];
}

export async function getFeaturedProducts() {
  const data = await request("/api/products/featured");
  return data.products || [];
}

export async function getProduct(id) {
  const data = await request("/api/products/" + id);
  return data.product || null;
}

export async function createOrder(orderData) {
  return await request("/api/orders", { method: "POST", body: JSON.stringify(orderData) });
}

export async function sendContactMessage(contactData) {
  return await request("/api/contact", { method: "POST", body: JSON.stringify(contactData) });
}

export async function healthCheck() {
  return request("/api/health");
}

export const api = { get, post, put, del, getProducts, getFeaturedProducts, getProduct, createOrder, sendContactMessage, healthCheck };
export default api;