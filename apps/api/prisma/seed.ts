import { PrismaClient } from "@prisma/client";
import { SECTORS } from "../src/lib/sectors-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sectors…");
  for (const s of SECTORS) {
    await prisma.sector.upsert({
      where: { slug: s.slug },
      update: { ...s },
      create: { ...s },
    });
  }

  console.log("Seeding sample projects…");
  const projects = [
    {
      slug: "immeuble-plateau-abidjan",
      title: "Immeuble de bureaux — Plateau",
      sector: "btp-construction",
      description:
        "Construction d'un immeuble de bureaux R+8 aux normes internationales au cœur du Plateau, Abidjan.",
      location: "Abidjan, Côte d'Ivoire",
      year: 2024,
      status: "COMPLETED",
      featured: true,
    },
    {
      slug: "reseau-securite-zone-industrielle",
      title: "Dispositif de sécurité — Zone industrielle",
      sector: "securite-gardiennage",
      description:
        "Déploiement d'un dispositif de gardiennage et de surveillance 24/7 pour un site industriel.",
      location: "Yopougon, Abidjan",
      year: 2023,
      status: "COMPLETED",
      featured: true,
    },
    {
      slug: "plateforme-si-agro",
      title: "Plateforme SI — filière agro",
      sector: "informatique",
      description:
        "Mise en place d'une plateforme de gestion et de traçabilité pour une coopérative agricole.",
      location: "San-Pédro",
      year: 2025,
      status: "IN_PROGRESS",
      featured: false,
    },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...p },
      create: { ...p },
    });
  }

  console.log("Seeding a sample lead…");
  const existingLead = await prisma.lead.findFirst({
    where: { email: "demo@example.com" },
  });
  if (!existingLead) {
    await prisma.lead.create({
      data: {
        type: "QUOTE",
        status: "NEW",
        name: "Client Démo",
        email: "demo@example.com",
        phone: "+225 07 00 00 00",
        company: "Démo SARL",
        sector: "btp-construction",
        budget: "10-50M FCFA",
        message:
          "Nous souhaitons un devis pour la construction d'un entrepôt de 2000 m².",
        source: "/contact",
      },
    });
  }

  const counts = {
    sectors: await prisma.sector.count(),
    projects: await prisma.project.count(),
    leads: await prisma.lead.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
