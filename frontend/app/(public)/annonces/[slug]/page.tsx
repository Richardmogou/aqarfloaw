import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";
import { PROPERTIES } from "@/lib/mock-properties";

export default function Page({ params }: { params: { slug: string } }) {
  const p = PROPERTIES.find((x) => x.slug === params.slug);
  if (!p) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PlaceholderPage title={p.title} description={`${p.locality}, ${p.city}`} day="au jour 4" />
    </div>
  );
}