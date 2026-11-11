import { permanentRedirect } from "next/navigation";

export default function LegacyListingPage({ params }: { params: { slug: string } }) {
  permanentRedirect(`/listings/${encodeURIComponent(params.slug)}`);
}
