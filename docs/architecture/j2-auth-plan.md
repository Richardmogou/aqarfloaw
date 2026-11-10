# J2 — Authentification & rôles (plan)

Contexte : spec AqarFlow v1.1 §5.1, §12, §13, §14 J2, §16 critères 1-2. Frontend Next.js 14 (Vercel), API FastAPI (VPS), PostgreSQL. Rôles MVP : admin, agent (colonne `users.role`).

## Stratégie : session opaque côté serveur + cookie first-party via proxy Next

1. **Proxy** : `next.config.mjs` `rewrites` `/api/v1/:path*` → `${BACKEND_URL}/api/v1/:path*`. Le navigateur ne parle qu'au domaine Vercel ; le cookie est donc first-party, pas de CORS ni de `SameSite=None` en production.
2. **Session** : table `sessions` (id UUID, user_id FK, token_hash CHAR(64) unique = SHA-256 du jeton, created_at, expires_at, revoked_at). Jeton = `secrets.token_urlsafe(32)`, seul le hash est stocké. Durée absolue 7 jours.
3. **Cookie** : `aqarflow_session`, HttpOnly, Secure (hors development), SameSite=Lax, Path=/.
4. **CSRF** : SameSite=Lax + l'API refuse toute requête mutante (POST/PATCH/PUT/DELETE) sans header `X-Requested-With: aqarflow` (header custom → preflight obligatoire en cross-origin, impossible depuis un formulaire tiers).
5. **Dépendances FastAPI** : `get_current_user` (cookie → hash → session non révoquée, non expirée, user actif, sinon 401) ; `require_role(*roles)` (sinon 403). Toute requête métier sera scopée par `current_user.agency_id` (jamais pris du client).
6. **Endpoints** :
   - `POST /auth/login` {email, password} → 204 + Set-Cookie. Message d'erreur identique pour email inconnu / mot de passe faux / compte inactif. Hash factice vérifié si email inconnu (temps constant).
   - `POST /auth/logout` → révoque la session courante, efface le cookie.
   - `POST /auth/logout-all` → révoque toutes les sessions de l'utilisateur.
   - `GET /auth/me` → {id, full_name, email, role, agency_id}.
   - Hors J2 (spec §10, dépend d'un fournisseur email) : forgot/reset password, vérification email.
7. **Création du premier admin** : commande `python -m app.cli create-admin --agency "..." --email ... --name ...` (mot de passe saisi via getpass).
8. **Frontend** :
   - `middleware.ts` : si pas de cookie `aqarflow_session` sur une route du workspace → redirect `/login?next=...` (contrôle d'ergonomie uniquement ; la sécurité reste au backend).
   - Layout workspace (server component) : appelle `GET /auth/me` côté serveur en relayant le cookie ; 401 → redirect `/login`. Passe le rôle à la Sidebar ; `NAV_ITEMS` reçoit `roles` (Team = admin uniquement).
   - Page `/login` (client) : formulaire email/mot de passe, états chargement/erreur ; `next` validé (chemin relatif commençant par `/` et pas `//`).
   - Bouton logout dans la Topbar.
9. **Tests (pytest, Postgres réel)** : login OK/KO, cookie posé, `/me` 401 sans cookie, session expirée/révoquée → 401, logout-all, `require_role` 403 pour agent, POST sans header CSRF → 403. CI : ajout d'un service postgres:16 au workflow backend.

## Revue adversariale (2026-11-09)
Couverture partielle : seul Gemini 3.8 Flash a répondu ; GPT-OSS en échec (serveur agy indisponible).
Retenu : URL relative `/api/v1` côté client, relais explicite du cookie + `cache: "no-store"` côté serveur, header CSRF par défaut dans `api.ts`, validation stricte de `next` (rejette `\` et caractères de contrôle), emails normalisés en minuscules (contrainte CHECK).
Rejeté : `Path=/api/v1` (le middleware et le layout doivent lire le cookie) ; secret proxy sur le VPS (contourner le proxy n'apporte rien, l'auth est portée par le cookie).
Reporté : contrôle du tenant sur les `assigned_agent_id` (couche service J3+), rate limiting, e2e Playwright (J7).

## Hors périmètre J2, signalé
- Rate limiting du login (spec §12) : nécessite Redis ou table de tentatives ; prévu J7 ou phase 2.
- Nettoyage des sessions expirées : tâche planifiée phase 2.
