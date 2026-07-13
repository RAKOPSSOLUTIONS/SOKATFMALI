/**
 * Local paths for the SOKATF corporate images, downloaded from the Stitch
 * "Industrial Excellence" mockups into /public/img/stitch/ (permanent, no
 * external dependency). Keys are semantic slots.
 */
export const IMG = {
  // Home
  heroHome: "/img/stitch/AB6AXuBZ1aVzzCDKZ5HjTY0lYL9dUZWa.jpg",
  aboutOffice: "/img/stitch/AB6AXuB9drHp5g9acenxVgrlUDaUtuk-.jpg",
  projRoad: "/img/stitch/AB6AXuD-BMjmDD9iov4MwkSADHYxmJBk.jpg",
  projAgro: "/img/stitch/AB6AXuD4yIKYe_X_AZH06NxQmrx8fHpA.jpg",
  projControl: "/img/stitch/AB6AXuDu6MxM1klytrGje7VOhZw_K-iH.jpg",
  // Services
  oilRefinery: "/img/stitch/AB6AXuDvAWD3cPwiMKhS3LnbmlCYoRSA.jpg",
  // Projets
  projHero: "/img/stitch/AB6AXuD6gDb0JLLvNvIYkh9jTrW7B2N5.jpg",
  mineSyama: "/img/stitch/AB6AXuAKNvhEJhZZ6EQKGV-Hh7nFz1zT.jpg",
  bamakoAdmin: "/img/stitch/AB6AXuCE7xfIjv1Nkt5QgG-EcTaYLxcs.jpg",
  cloudData: "/img/stitch/AB6AXuAlUVxsryj8E6SrHmJXr6eI4Lwr.jpg",
  sikassoAgro: "/img/stitch/AB6AXuCWJZNkm_03DIgEGPGZOTFQG_zT.jpg",
  bamakoKayes: "/img/stitch/AB6AXuBxsbyP9toCw75UMeVX6tnS9LVh.jpg",
  sokatfTech: "/img/stitch/AB6AXuDjYj-tjNGdNDBdUXbMcs9nK5lF.jpg",
  // Partenaires
  partHero: "/img/stitch/AB6AXuCnMYwa7zGPaMO5M90RgDrDXKMg.jpg",
  testimonialAuthor: "/img/stitch/AB6AXuDKDSlVVV05ldYSr3n3c6Yg2D8l.jpg",
  // À propos
  aproposHero: "/img/stitch/AB6AXuDUQsu82YuZPF7yTUi-eWAzz86n.jpg",
  dirigeantPortrait: "/img/stitch/AB6AXuAfd1Ojiaihhphla3qIuOkFNYYD.jpg",
  signature: "/img/stitch/AB6AXuDvM44F2qzG8pkf_muIJBMUxTAW.jpg",
  impactSocial: "/img/stitch/AB6AXuCuAq_YFumerI4P_lN7D243nua_.jpg",
  // Contact
  contactHero: "/img/stitch/AB6AXuDKF46bxiaYD3SFCnkaDbFjTEAs.jpg",
  mapBamako: "/img/stitch/AB6AXuBcl5PQ-asXE9DljYAbiNc0ZpfE.jpg",
  careersTeam: "/img/stitch/AB6AXuA1pcGVautu9fggTujgKa-qd6Tm.jpg",
} as const;

export type ImgKey = keyof typeof IMG;
