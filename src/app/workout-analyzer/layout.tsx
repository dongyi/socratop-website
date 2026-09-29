import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free FIT File Analyzer for Running Data",
  description:
    "Upload FIT files to inspect running metrics including heart rate, pace, power, time, and training-session data in one place.",
  alternates: { canonical: "/workout-analyzer" },
  openGraph: {
    title: "Free FIT File Analyzer for Running Data | Socratop",
    description:
      "Inspect FIT running data including heart rate, pace, power, time, and training sessions.",
    url: "/workout-analyzer",
  },
};

export default function WorkoutAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
