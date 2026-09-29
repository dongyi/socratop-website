import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Running Equipment Reviews and Ratings",
  description:
    "Browse sports equipment, compare community ratings, and read reviews to make better running-gear decisions.",
  alternates: { canonical: "/equipment-browser" },
  openGraph: {
    title: "Running Equipment Reviews and Ratings | Socratop",
    description:
      "Browse sports equipment, compare community ratings, and read reviews for your next running-gear decision.",
    url: "/equipment-browser",
  },
};

export default function EquipmentBrowserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
