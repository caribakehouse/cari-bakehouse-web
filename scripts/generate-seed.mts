// Sinh supabase/seed.sql từ dữ liệu mẫu trong src/lib/mock-data.ts.
// Chạy: npm run db:seed-sql  → rồi dán supabase/seed.sql vào Supabase SQL Editor và bấm Run.
// Chỉ đưa lên dữ liệu hiển thị (nhóm, sản phẩm, đánh giá, nội dung trang, cài đặt) — KHÔNG đưa
// khách hàng / đơn hàng / điểm / yêu cầu mẫu, để database thật không lẫn dữ liệu giả.
// Chạy lại nhiều lần an toàn: dòng đã có thì bỏ qua (on conflict do nothing).

import { writeFileSync } from "node:fs";
import {
  SEED_ABOUT_CONTENT,
  SEED_HOME_CONTENT,
  SEED_PRODUCTS,
  SEED_PRODUCTS_PAGE_CONTENT,
  SEED_SITE_SETTINGS,
  reviews,
} from "../src/lib/mock-data.ts";

const str = (v: string | undefined | null) => (v == null ? "null" : `'${v.replace(/'/g, "''")}'`);
const num = (v: number | undefined | null) => (v == null ? "null" : String(v));
const json = (v: unknown) => (v == null ? "null" : `${str(JSON.stringify(v))}::jsonb`);

const lines: string[] = [
  "-- File sinh tự động bởi scripts/generate-seed.mts — không sửa tay.",
  "begin;",
  "",
  "-- Nhóm sản phẩm",
];

SEED_PRODUCTS_PAGE_CONTENT.groups.forEach((g, i) => {
  lines.push(
    `insert into public.product_groups (id, category, title, description, sort_order) values ` +
      `(${str(g.id)}, ${str(g.category)}, ${str(g.title)}, ${str(g.description)}, ${i}) on conflict (id) do nothing;`,
  );
});

lines.push("", "-- Sản phẩm");
for (const p of SEED_PRODUCTS) {
  lines.push(
    `insert into public.products (id, slug, name, category, subcategory, description, price, original_price, image, badge, rating, reviews, sizes, stock, status) values (` +
      [
        num(p.id),
        str(p.slug),
        str(p.name),
        str(p.category),
        str(p.subcategory),
        str(p.description),
        num(p.price),
        num(p.originalPrice),
        str(p.image),
        str(p.badge),
        num(p.rating),
        num(p.reviews),
        json(p.sizes),
        num(p.stock),
        str(p.status ?? "active"),
      ].join(", ") +
      ") on conflict (id) do nothing;",
  );
}
lines.push(
  "select setval(pg_get_serial_sequence('public.products', 'id'), (select coalesce(max(id), 1) from public.products));",
);

lines.push("", "-- Đánh giá");
for (const r of reviews) {
  lines.push(
    `insert into public.reviews (id, name, avatar, rating, date, content) values ` +
      `(${num(r.id)}, ${str(r.name)}, ${str(r.avatar)}, ${num(r.rating)}, ${str(r.date)}, ${str(r.content)}) on conflict (id) do nothing;`,
  );
}
lines.push(
  "select setval(pg_get_serial_sequence('public.reviews', 'id'), (select coalesce(max(id), 1) from public.reviews));",
);

// Danh sách nhóm đã nằm ở bảng product_groups, nên nội dung trang /san-pham chỉ giữ phần còn lại
const content: Record<string, unknown> = {
  home: SEED_HOME_CONTENT,
  about: SEED_ABOUT_CONTENT,
  settings: SEED_SITE_SETTINGS,
  products_page: { categoryPickerLabel: SEED_PRODUCTS_PAGE_CONTENT.categoryPickerLabel },
};
lines.push("", "-- Nội dung trang & cài đặt");
for (const [key, value] of Object.entries(content)) {
  lines.push(`insert into public.site_content (key, value) values (${str(key)}, ${json(value)}) on conflict (key) do nothing;`);
}

lines.push("", "commit;", "");

const out = new URL("../supabase/seed.sql", import.meta.url);
writeFileSync(out, lines.join("\n"), "utf8");
console.log(
  `Đã ghi supabase/seed.sql: ${SEED_PRODUCTS_PAGE_CONTENT.groups.length} nhóm, ${SEED_PRODUCTS.length} sản phẩm, ${reviews.length} đánh giá, ${Object.keys(content).length} mục nội dung.`,
);
