"use client";

import { useState } from "react";
import { toast } from "./toast";
import type { SiteContentData, Stat, Service } from "@/lib/siteContent";

type Action = (fd: FormData) => void | Promise<void>;

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary">{icon}</span>
        <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function SiteContentForm({ content, action }: { content: SiteContentData; action: Action }) {
  const [stats, setStats] = useState<Stat[]>(content.stats);
  const [partners, setPartners] = useState<string[]>(content.partners);
  const [services, setServices] = useState<Service[]>(content.services);

  return (
    <form
      action={async (fd) => { await action(fd); toast("Contenu du site enregistré", "success"); }}
      className="space-y-6"
    >
      <input type="hidden" name="stats" value={JSON.stringify(stats)} />
      <input type="hidden" name="partners" value={JSON.stringify(partners)} />
      <input type="hidden" name="services" value={JSON.stringify(services)} />

      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <span className="material-symbols-outlined text-primary">info</span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Les modifications s'appliquent au site public après un <strong className="text-primary">rebuild</strong> (<code className="font-mono">pnpm build</code>, déjà lancé au déploiement).
        </p>
      </div>

      {/* Hero */}
      <Section title="Accueil — bandeau" icon="wallpaper">
        <div><label className="label">Sur-titre</label><input name="heroEyebrow" defaultValue={content.heroEyebrow} className="input" /></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Titre</label><input name="heroTitle" defaultValue={content.heroTitle} className="input" /></div>
          <div><label className="label">Titre (partie dorée)</label><input name="heroTitleAccent" defaultValue={content.heroTitleAccent} className="input" /></div>
        </div>
        <div><label className="label">Sous-titre</label><textarea name="heroSubtitle" rows={3} defaultValue={content.heroSubtitle} className="input" /></div>
      </Section>

      {/* Stats */}
      <Section title="Chiffres clés" icon="insights">
        <div className="space-y-3">
          {stats.map((st, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input className="input col-span-3" placeholder="12+" value={st.value} onChange={(e) => setStats((p) => p.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
              <input className="input col-span-5" placeholder="Libellé" value={st.label} onChange={(e) => setStats((p) => p.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <input className="input col-span-3" placeholder="icône" value={st.icon} onChange={(e) => setStats((p) => p.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} />
              <button type="button" onClick={() => setStats((p) => p.filter((_, j) => j !== i))} className="col-span-1 text-error grid place-items-center"><span className="material-symbols-outlined text-[20px]">delete</span></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setStats((p) => [...p, { value: "", label: "", icon: "star" }])} className="btn-outline py-2"><span className="material-symbols-outlined text-[18px]">add</span> Ajouter un chiffre</button>
      </Section>

      {/* About */}
      <Section title="À propos" icon="info">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Sur-titre</label><input name="aboutEyebrow" defaultValue={content.aboutEyebrow} className="input" /></div>
          <div><label className="label">Titre</label><input name="aboutTitle" defaultValue={content.aboutTitle} className="input" /></div>
        </div>
        <div><label className="label">Texte</label><textarea name="aboutText" rows={4} defaultValue={content.aboutText} className="input" /></div>
      </Section>

      {/* Services */}
      <Section title="Services (accueil)" icon="home_repair_service">
        <div className="space-y-3">
          {services.map((sv, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg bg-surface-container-low">
              <input className="input col-span-6 md:col-span-4" placeholder="Titre" value={sv.title} onChange={(e) => setServices((p) => p.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
              <input className="input col-span-5 md:col-span-2" placeholder="icône" value={sv.icon} onChange={(e) => setServices((p) => p.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} />
              <input className="input col-span-12 md:col-span-5" placeholder="Description" value={sv.text} onChange={(e) => setServices((p) => p.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
              <button type="button" onClick={() => setServices((p) => p.filter((_, j) => j !== i))} className="col-span-1 text-error grid place-items-center h-11"><span className="material-symbols-outlined text-[20px]">delete</span></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setServices((p) => [...p, { title: "", icon: "star", text: "" }])} className="btn-outline py-2"><span className="material-symbols-outlined text-[18px]">add</span> Ajouter un service</button>
      </Section>

      {/* Partners */}
      <Section title="Partenaires" icon="handshake">
        <div className="flex flex-wrap gap-2">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-surface-container-high">
              <input className="bg-transparent outline-none text-body-md w-36" value={p} onChange={(e) => setPartners((arr) => arr.map((x, j) => j === i ? e.target.value : x))} />
              <button type="button" onClick={() => setPartners((arr) => arr.filter((_, j) => j !== i))} className="text-error"><span className="material-symbols-outlined text-[18px]">close</span></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setPartners((p) => [...p, "Nouveau partenaire"])} className="btn-outline py-2"><span className="material-symbols-outlined text-[18px]">add</span> Ajouter un partenaire</button>
      </Section>

      {/* Contact */}
      <Section title="Coordonnées" icon="contact_page">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Ville</label><input name="contactCity" defaultValue={content.contactCity} className="input" /></div>
          <div><label className="label">Adresse</label><input name="contactAddress" defaultValue={content.contactAddress} className="input" /></div>
          <div><label className="label">Téléphone (affiché)</label><input name="phoneDisplay" defaultValue={content.phoneDisplay} className="input" /></div>
          <div><label className="label">Téléphone (lien tel:)</label><input name="phoneTel" defaultValue={content.phoneTel} className="input" placeholder="+22366773275" /></div>
          <div><label className="label">Email</label><input name="email" type="email" defaultValue={content.email} className="input" /></div>
          <div><label className="label">WhatsApp (affiché)</label><input name="whatsapp" defaultValue={content.whatsapp} className="input" /></div>
          <div><label className="label">Lien WhatsApp</label><input name="whatsappLink" defaultValue={content.whatsappLink} className="input" placeholder="https://wa.me/223…" /></div>
          <div><label className="label">NIF</label><input name="nif" defaultValue={content.nif} className="input" /></div>
          <div><label className="label">RCCM</label><input name="rccm" defaultValue={content.rccm} className="input" /></div>
        </div>
        <div><label className="label">Description (pied de page)</label><textarea name="blurb" rows={2} defaultValue={content.blurb} className="input" /></div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <button className="btn-primary shadow-lg"><span className="material-symbols-outlined text-[18px]">save</span> Enregistrer le contenu</button>
      </div>
    </form>
  );
}
