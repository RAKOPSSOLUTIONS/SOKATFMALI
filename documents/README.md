# Documents d'organisation — SOKATF SARL

Documents d'organisation de l'entreprise, disponibles en **PDF** et **Word (.docx)**.

| Document | Fichiers |
| --- | --- |
| Organigramme de l'entreprise | `organigramme-sokatf.pdf` / `.docx` |
| Présentation (Vision, Mission, Valeurs) | `presentation-sokatf.*` |
| Objectifs (court / moyen / long terme) | `objectifs-sokatf.*` |
| Fiches de poste | `fiches-poste-sokatf.*` |
| Règlement intérieur | `reglement-interieur-sokatf.*` |
| Politique RH | `politique-rh-sokatf.*` |
| Charte informatique et de sécurité | `charte-informatique-sokatf.*` |
| Politique de confidentialité | `politique-confidentialite-sokatf.*` |
| Procédure de gestion des documents | `procedure-documents-sokatf.*` |
| Plan de sauvegarde des données | `plan-sauvegarde-sokatf.*` |
| Plan de communication | `plan-communication-sokatf.*` |
| Business Plan (structure) | `business-plan-sokatf.*` |
| Plan d'action annuel | `plan-action-sokatf.*` |
| Tableau de bord KPI | `kpi-sokatf.*` |

## Régénérer

Le contenu se modifie dans `apps/api/src/lib/orgDocs.ts`. Pour régénérer tous les fichiers :

```bash
cd apps/api
DATABASE_URL="file:./dev.db" pnpm exec tsx scripts/gen-docs.ts
```

Ils sont aussi téléchargeables depuis le back-office : **/admin/documentation** (boutons PDF / Word).
