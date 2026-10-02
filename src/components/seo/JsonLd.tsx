import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/site";
import type { SiteSettings } from "@/types/content";

/** Chèn dữ liệu có cấu trúc (JSON-LD) cho Google vào HTML trả về từ server. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Thay "<" để nội dung không thể đóng thẻ <script> sớm
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** "0338975925" → "+84338975925" (định dạng quốc tế Google khuyên dùng) */
function intlPhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.startsWith("0") ? `+84${digits.slice(1)}` : `+${digits}`;
}

/**
 * "Danh thiếp" của tiệm cho Google: loại hình Bakery, tên, địa chỉ, giờ mở cửa, hotline, mạng xã hội.
 * Không gắn điểm đánh giá: Google không chấp nhận đánh giá tự đăng trên chính web của tiệm.
 */
export function BusinessJsonLd({ settings }: { settings: SiteSettings }) {
  const sameAs = [settings.facebook, settings.instagram, settings.tiktok, settings.threads].filter((u) =>
    u?.startsWith("http"),
  );
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Bakery",
            "@id": `${SITE_URL}/#bakery`,
            name: BUSINESS.name,
            description: BUSINESS.description,
            url: SITE_URL,
            logo: `${SITE_URL}${BUSINESS.logo}`,
            image: `${SITE_URL}${BUSINESS.logo}`,
            telephone: intlPhone(settings.hotline),
            email: settings.email || undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: BUSINESS.streetAddress,
              addressLocality: BUSINESS.addressLocality,
              addressCountry: BUSINESS.addressCountry,
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: BUSINESS.opens,
              closes: BUSINESS.closes,
            },
            priceRange: "₫₫",
            currenciesAccepted: "VND",
            sameAs: sameAs.length > 0 ? sameAs : undefined,
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            inLanguage: "vi",
            publisher: { "@id": `${SITE_URL}/#bakery` },
          },
        ],
      }}
    />
  );
}
