"use client";
import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Field, FormBanner, inputCls, textareaCls } from "@/components/ui/form";
import { btn } from "@/components/ui/styles";
import { ApiError, api } from "@/lib/api";
import { useL } from "@/lib/i18n/provider";
import { normalizePhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export function InquiryForm({ propertySlug, propertyTitle }: { propertySlug?: string; propertyTitle?: string }) {
  const L = useL();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [failure, setFailure] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "pending") return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const errs: Record<string, string> = {};
    if (get("name").length < 2) errs.name = L("Please enter your name.", "Veuillez saisir votre nom.");
    const phone = normalizePhone(get("phone"));
    if (!phone) errs.phone = L("Enter a valid phone number, e.g. +92 300 1234567.", "Saisissez un numéro valide, ex. +92 300 1234567.");
    if (get("email") && !/^\S+@\S+\.\S+$/.test(get("email"))) errs.email = L("Enter a valid email address.", "Saisissez une adresse e-mail valide.");
    if (get("message").length < 10) errs.message = L("Please write at least 10 characters.", "Écrivez au moins 10 caractères.");
    if (!f.get("consent")) errs.consent = L("Please accept to be contacted.", "Veuillez accepter d'être contacté.");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setState("pending");
    try {
      await api("/public/inquiries", {
        method: "POST",
        body: JSON.stringify({
          name: get("name"), phone: get("phone"), email: get("email") || null, message: get("message"),
          property_slug: propertySlug ?? null, consent: true, website: get("website"),
        }),
      });
      form.reset();
      setState("done");
    } catch (caught) {
      setFailure(failureMessage(caught));
      setState("error");
    }
  }

  function failureMessage(caught: unknown) {
    if (caught instanceof ApiError && caught.status === 404)
      return L("This listing is no longer available. You can still contact us from the contact page.", "Cette annonce n'est plus disponible. Vous pouvez toujours nous écrire depuis la page contact.");
    if (caught instanceof ApiError && caught.status === 422)
      return L("Some information was rejected. Check your phone number and email, then try again.", "Certaines informations ont été refusées. Vérifiez votre téléphone et votre e-mail, puis réessayez.");
    return L("Your message could not be sent. Please try again in a moment, or call us.", "Votre message n'a pas pu être envoyé. Réessayez dans un instant ou appelez-nous.");
  }

  if (state === "done") {
    return (
      <div className="space-y-4">
        <FormBanner tone="success">{L("Thank you! An agent will contact you shortly.", "Merci ! Un agent vous contactera très bientôt.")}</FormBanner>
        <button type="button" onClick={() => setState("idle")} className={btn.outline}>{L("Send another message", "Envoyer un autre message")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field label={L("Full name", "Nom complet")} id="name" error={errors.name}>
        <input name="name" autoComplete="name" required maxLength={200} className={inputCls} />
      </Field>
      <Field label={L("Phone", "Téléphone")} id="phone" error={errors.phone}>
        <input name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" required className={inputCls} />
      </Field>
      <Field label={L("Email (optional)", "E-mail (facultatif)")} id="email" error={errors.email}>
        <input name="email" type="email" autoComplete="email" className={inputCls} />
      </Field>
      <Field label={L("Message", "Message")} id="message" error={errors.message}>
        <textarea name="message" rows={4} required maxLength={2000} className={textareaCls}
          defaultValue={propertyTitle ? L(`I am interested in "${propertyTitle}". Please contact me with more information.`, `Je suis intéressé par « ${propertyTitle} ». Merci de me contacter avec plus d'informations.`) : ""} />
      </Field>

      {/* Champ piège anti-spam : invisible et hors tabulation */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input name="consent" type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
          <span>{L("I agree to be contacted about this request.", "J'accepte d'être contacté au sujet de cette demande.")}</span>
        </label>
        {errors.consent && <p role="alert" className="mt-1 text-xs text-destructive">{errors.consent}</p>}
      </div>

      {state === "error" && <FormBanner tone="error">{failure}</FormBanner>}
      <button type="submit" disabled={state === "pending"} className={cn(btn.primary, "w-full disabled:opacity-60")}>
        {state === "pending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {L("Send inquiry", "Envoyer la demande")}
      </button>
    </form>
  );
}