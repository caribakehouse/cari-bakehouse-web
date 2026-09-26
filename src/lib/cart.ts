// Giỏ hàng dùng chung toàn site, lưu trong localStorage (giá chỉ để hiển thị — database tính lại khi đặt hàng).

import { useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/persistent-store";
import { defaultOptions, defaultSize, unitPriceFor } from "@/lib/db";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/lib/mock-data";

export const MAX_ITEM_QUANTITY = 99;

const EMPTY_CART: CartItem[] = [];

function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return EMPTY_CART;
  return value.filter(
    (i): i is CartItem =>
      !!i &&
      typeof i.slug === "string" &&
      typeof i.name === "string" &&
      typeof i.image === "string" &&
      typeof i.price === "number" &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0,
  );
}

const cartStore = createPersistentStore<CartItem[]>("cari-cart", EMPTY_CART, sanitizeCart);

/** Khóa phân biệt từng dòng giỏ hàng: cùng sản phẩm nhưng khác cỡ / khác tùy chọn là 2 dòng riêng */
export function cartLineKey(item: Pick<CartItem, "slug" | "size" | "options">): string {
  const options = item.options
    ? Object.keys(item.options)
        .sort()
        .map((k) => `${k}=${item.options![k]}`)
        .join("|")
    : "";
  return `${item.slug}::${item.size ?? ""}::${options}`;
}

export function addToCart(
  product: Pick<Product, "slug" | "name" | "image" | "price" | "sizes" | "options">,
  quantity = 1,
  size?: string,
  options?: Record<string, string>,
) {
  // Không chọn cỡ / tùy chọn thì lấy cỡ đầu tiên / lựa chọn đầu tiên của mỗi nhóm
  size = size ?? defaultSize(product);
  options = options ?? defaultOptions(product);
  const price = unitPriceFor(product, size, options);
  const line: CartItem = {
    slug: product.slug,
    name: product.name,
    image: product.image,
    price,
    size,
    options,
    quantity: Math.min(MAX_ITEM_QUANTITY, quantity),
  };
  const key = cartLineKey(line);
  const items = cartStore.getSnapshot();
  const existing = items.find((i) => cartLineKey(i) === key);
  if (existing) {
    cartStore.set(
      items.map((i) =>
        i === existing ? { ...i, quantity: Math.min(MAX_ITEM_QUANTITY, i.quantity + quantity) } : i,
      ),
    );
    return;
  }
  cartStore.set([...items, line]);
}

export function updateCartQuantity(item: CartItem, quantity: number) {
  const next = Math.max(1, Math.min(MAX_ITEM_QUANTITY, quantity));
  const key = cartLineKey(item);
  cartStore.set(cartStore.getSnapshot().map((i) => (cartLineKey(i) === key ? { ...i, quantity: next } : i)));
}

export function removeFromCart(item: CartItem) {
  const key = cartLineKey(item);
  cartStore.set(cartStore.getSnapshot().filter((i) => cartLineKey(i) !== key));
}

export function clearCart() {
  cartStore.set(EMPTY_CART);
}

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { items, count, subtotal };
}
