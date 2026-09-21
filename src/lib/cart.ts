// Giỏ hàng dùng chung toàn site, lưu trong localStorage.
// TODO: đồng bộ giỏ hàng với backend khi có tài khoản thật.

import { useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/persistent-store";
import { defaultSize, priceForSize } from "@/lib/db";
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

const isSameLine = (item: CartItem, slug: string, size?: string) =>
  item.slug === slug && item.size === size;

export function addToCart(
  product: Pick<Product, "slug" | "name" | "image" | "price" | "sizes">,
  quantity = 1,
  size?: string,
) {
  // Sản phẩm có nhiều cỡ: không chọn cỡ thì lấy cỡ đầu tiên; giá theo cỡ đã chọn
  size = size ?? defaultSize(product);
  const price = priceForSize(product, size);
  const items = cartStore.getSnapshot();
  const existing = items.find((i) => isSameLine(i, product.slug, size));
  if (existing) {
    cartStore.set(
      items.map((i) =>
        i === existing
          ? { ...i, quantity: Math.min(MAX_ITEM_QUANTITY, i.quantity + quantity) }
          : i,
      ),
    );
    return;
  }
  cartStore.set([
    ...items,
    {
      slug: product.slug,
      name: product.name,
      image: product.image,
      price,
      size,
      quantity: Math.min(MAX_ITEM_QUANTITY, quantity),
    },
  ]);
}

export function updateCartQuantity(slug: string, size: string | undefined, quantity: number) {
  const next = Math.max(1, Math.min(MAX_ITEM_QUANTITY, quantity));
  cartStore.set(
    cartStore
      .getSnapshot()
      .map((i) => (isSameLine(i, slug, size) ? { ...i, quantity: next } : i)),
  );
}

export function removeFromCart(slug: string, size: string | undefined) {
  cartStore.set(cartStore.getSnapshot().filter((i) => !isSameLine(i, slug, size)));
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
