import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { ContactButtons } from "@/components/public/contact-buttons";
import { InquiryForm } from "@/components/public/inquiry-form";
import { Card } from "@/components/ui/card";
import { getL } from "@/lib/i18n/server";
import { SITE, telLink } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const L = getL();
  const details: [LucideIcon, string, React.ReactNode][] = [
    [Phone, L("Phone", "Téléphone"), <a key="p" href={telLink()} className="hover:text-primary">{SITE.phone}</a>],
    [Mail, L("Email", "E-mail"), <a key="e" href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a>],
    [MapPin, L("Office", "Bureau"), SITE.address],
    [Clock, L("Opening hours", "Horaires"), L("Monday to Saturday, 9:00 – 18:00", "Du lundi au samedi, 9 h – 18 h")],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{L("Contact us", "Contactez-nous")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        {L("A question about a property, a visit or selling with us? Send a message and an agent will get back to you.",
          "Une question sur un bien, une visite ou la vente de votre bien ? Envoyez un message, un agent vous répondra.")}
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card title={L("Our details", "Nos coordonnées")}>
            <dl className="space-y-4">
              {details.map(([Icon, label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>
                </div>
              ))}
            </dl>
          </Card>
          <ContactButtons message={L("Hello, I would like some information.", "Bonjour, je souhaiterais avoir des informations.")}
            callLabel={L("Call", "Appeler")} waLabel="WhatsApp" />
        </div>
        <Card title={L("Send a message", "Envoyer un message")}>
          <InquiryForm />
        </Card>
      </div>
    </div>
  );
}
