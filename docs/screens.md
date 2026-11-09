# Écrans MVP et libellés figés (J1)

Langue UI MVP : français (fichiers i18n prévus : fr / en). Valeurs techniques en anglais (BD/API), libellés traduits.

## Écrans
| # | Zone | Écran | Jour |
|---|------|-------|------|
| 1 | Système | Connexion, 403, 404, 500, session expirée | J2 |
| 2 | Workspace | Tableau de bord (4 KPI) | J2/J6 |
| 3 | Workspace | Biens : liste, création/édition, détail | J3 |
| 4 | Public | Accueil, liste, détail + formulaire, contact | J4 |
| 5 | Workspace | Leads : liste, fiche (notes, statut, affectation) | J5 |
| 6 | Workspace | Visites : liste, formulaire de planification | J6 |
| 7 | Workspace | Deals : liste/pipeline, détail | J6 |
| 8 | Workspace | Équipe (lecture seule, liste des agents) | J5 |

Menu MVP : Tableau de bord, Biens, Leads, Visites, Deals, Équipe. (Paramètres = phase 2)

## Statuts (valeur BD -> libellé FR)
**Property.status** : draft Brouillon | available Disponible | reserved Réservé | under_offer Sous offre | sold Vendu | rented Loué | inactive Inactif
**Property.is_published** (booléen distinct) : Publié / Non publié
**Lead.stage** : new Nouveau | contacted Contacté | qualified Qualifié | visit_scheduled Visite planifiée | negotiation Négociation | converted Converti | lost Perdu
("À attribuer" = agent vide, pas une étape)
**Visit.status** : requested Demandée | confirmed Confirmée | completed Terminée | cancelled Annulée | no_show Absent
**Deal.stage** : inquiry | qualified | visit | offer | negotiation | booking | closed_won | closed_lost
Règle : un deal est créé à partir d'un lead qualifié (lead.stage >= qualified).

## Corrections de la maquette
- Un seul bouton « Publier l'annonce » ; « Nouvelle demande » -> « Nouveau prospect »
- Filtre « Agents » en un seul exemplaire ; « Attribuer » en lien discret
- Agent responsable = nom d'une personne
- KPI : bleu / vert / ambre / gris (pas de violet)
- Ajouter : connexion, formulaire bien, formulaire visite, deal, version mobile
