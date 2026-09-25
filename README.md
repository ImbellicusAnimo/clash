# Clash

**Die Stadt ist der Social Graph.** Clash ist eine Full-Stack-Webapp, in der sich alles um Ort und Zeit auf einer interaktiven Karte dreht, statt um Feeds und Follower. Nutzer legen **Clashes** (Aktivitäten wie Yoga-Session, Hackathon oder Brettspielabend) an, optional an einer wiederverwendbaren **Venue**. Andere Nutzer **joinen**, der Host **akzeptiert oder lehnt ab**, und alle Beteiligten werden **benachrichtigt**. Die App ist von Anfang an mehrstadtfähig, Berlin ist nur die Startansicht der Karte.

## Funktionen

- **Authentifizierung:** Registrierung, Login und Logout mit Benutzername und Passwort (bcrypt-Hash, signiertes Session-Cookie), Routenschutz über `proxy.ts`.
- **Clashes:** Liste mit Suche, Filter (Upcoming / Past / All) und Sortierung, Detailseite, Anlegen, Bearbeiten und Löschen (nur der Host).
- **Venues:** Liste mit Suche und Sortierung, Detailseite, Anlegen, Bearbeiten und Löschen (nur der Ersteller).
- **Karte:** Leaflet-Karte auf dem Dashboard und Standort-Auswahl in den Formularen. Bei einem Clash mit Venue ist der Standort schreibgeschützt.
- **Teilnahme:** Join und Leave für Teilnehmer, Accept und Reject für den Host, direkt in der „People"-Karte der Clash-Detailseite.
- **Meine Teilnahmen:** `/participations` gruppiert nach _Going_, _Awaiting Approval_ und _Declined_.
- **Benachrichtigungen:** Posteingang unter `/notifications` mit Ungelesen-Badge in der Sidebar, einzeln oder gesammelt als gelesen markierbar.

## Tech-Stack

| Bereich     | Technologie                                                        |
| ----------- | ------------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, Turbopack), React 19, TypeScript           |
| UI          | Tailwind CSS v4, shadcn/ui (`radix-nova`), Lucide-Icons            |
| Daten       | Prisma 7 mit SQLite über `better-sqlite3`-Adapter                  |
| Auth        | `jose` (JWT im httpOnly-Cookie), `bcryptjs`                        |
| Validierung | Zod (ein Schema je Entität, in Formular und Server Action geteilt) |
| Karte       | Leaflet, react-leaflet                                             |

> Achtung: Dieses Next.js hat Breaking Changes gegenüber älteren Versionen (siehe `AGENTS.md`). Die passende Doku liegt lokal unter `node_modules/next/dist/docs/`.

## Voraussetzungen

- **Node.js 26** (siehe `.nvmrc`) und npm.
- `better-sqlite3` ist ein natives Modul und wird für die Node-Version gebaut, mit der `npm install` lief. Nach einem Wechsel der Node-Version einmal `npm rebuild better-sqlite3` ausführen, sonst schlägt jede Datenbankabfrage mit einem `NODE_MODULE_VERSION`-Fehler fehl.

## Einrichtung

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen anlegen (siehe unten)

# 3. Prisma-Client generieren (landet in lib/generated/prisma, nicht im Repo)
npx prisma generate

# 4. Datenbank anlegen und Migrationen anwenden
npx prisma migrate deploy

# 5. Beispieldaten laden
npx prisma db seed

# 6. Dev-Server starten
npm run dev
```

Danach ist die App unter [http://localhost:3000](http://localhost:3000) erreichbar.

### Umgebungsvariablen

Lege im Projektverzeichnis eine Datei `.env` an. Sie ist per `.gitignore` vom Repo ausgeschlossen und darf nicht eingecheckt werden.

| Variable         | Bedeutung                                             | Beispiel                                     |
| ---------------- | ----------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`   | Pfad der SQLite-Datei                                 | `file:./dev.db`                              |
| `SESSION_SECRET` | Schlüssel zum Signieren der Session-Cookies (geheim!) | Zufallswert, z. B. `openssl rand -base64 32` |

Ändert man `SESSION_SECRET`, werden alle bestehenden Sessions ungültig.

### Beispieldaten und Test-Logins

Der Seed legt 8 Nutzer, 5 Venues, Clashes, Teilnahmen und Benachrichtigungen an. Alle Nutzer haben das Passwort `password123` (nur für die lokale Entwicklung).

| Benutzername                                                           | Passwort      |
| ---------------------------------------------------------------------- | ------------- |
| `alice`, `ben`, `carla`, `dennis`, `elena`, `felix`, `greta`, `hannah` | `password123` |

> **Der Seed löscht vorher alle vorhandenen Daten** (Nutzer, Venues, Clashes, Teilnahmen, Benachrichtigungen), auch selbst registrierte Konten.

## Befehle

### App

| Befehl           | Wirkung                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`    | Dev-Server mit Turbopack und Hot Reload                                                            |
| `npm run build`  | Produktions-Build                                                                                  |
| `npm run start`  | Produktions-Server (nach `npm run build`)                                                          |
| `npm run lint`   | ESLint                                                                                             |
| `npm run verify` | Gesamtprüfung: `tsc --noEmit`, ESLint, `next build` und `vitest run`, bricht beim ersten Fehler ab |

### Prisma (Datenbankverwaltung)

Es gibt keine eigenen npm-Skripte dafür, die Befehle laufen direkt über `npx prisma`. Die Konfiguration steht in `prisma7.config.ts` und wird automatisch geladen (Schema: `prisma/schema.prisma`, Migrationen: `prisma/migrations`, Seed: `prisma/seed.ts`).

| Befehl                                 | Wirkung                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `npx prisma generate`                  | Erzeugt den Prisma-Client in `lib/generated/prisma` (nach jeder Schema-Änderung nötig) |
| `npx prisma migrate dev --name <name>` | Legt nach einer Schema-Änderung eine neue Migration an und wendet sie an               |
| `npx prisma migrate deploy`            | Wendet vorhandene Migrationen an (Einrichtung, CI, Produktion)                         |
| `npx prisma migrate status`            | Zeigt, ob die Datenbank dem Migrationsstand entspricht                                 |
| `npx prisma migrate reset`             | Setzt die Datenbank zurück und wendet alle Migrationen neu an (**löscht alle Daten**)  |
| `npx prisma db seed`                   | Lädt die Beispieldaten (**löscht vorher alle Daten**)                                  |
| `npx prisma studio`                    | Öffnet die grafische Datenbank-Oberfläche im Browser                                   |
| `npx prisma validate`                  | Prüft das Schema auf Fehler                                                            |
| `npx prisma format`                    | Formatiert `prisma/schema.prisma`                                                      |

## Projektstruktur

```text
app/
  (public)/          Startseite, Login, Registrierung
  (app)/             geschützter Bereich mit Sidebar-Layout
    dashboard/       Karte "Discover"
    clashes/         Liste, Detail, Anlegen, Bearbeiten
    venues/          Liste, Detail, Anlegen, Bearbeiten
    participations/  Meine Teilnahmen
    notifications/   Benachrichtigungs-Posteingang
  actions/           Server Actions (auth, clash, venue, participation, notification)
  api/session/       Route Handler, der verwaiste Session-Cookies aufräumt
components/          Formulare, Teilnahme-Steuerung, Karte, shadcn/ui
lib/
  dal.ts             Datenzugriff (Lesen), mit React cache()
  definitions.ts     Zod-Schemas und gemeinsame Typen
  session.ts         Session-Cookie (JWT signieren, prüfen, löschen)
  prisma.ts          Prisma-Client mit SQLite-Adapter
prisma/              Schema, Migrationen, Seed
proxy.ts             Routenschutz (früher "middleware")
```

Neue Schreib-Pfade folgen immer demselben Ablauf: **validieren → autorisieren → speichern → Benachrichtigung erzeugen (falls nötig, in derselben Transaktion) → `revalidatePath`**.

## Weitere Dokumente

- [`brief.md`](brief.md): das ursprüngliche Implementierungs-Briefing.
- [`entity-model.md`](entity-model.md): ER-Diagramm des Datenmodells. Die genauen Felder und Constraints stehen im Prisma-Schema.

## Glossar

**User:** Ein Konto mit Benutzername und Passwort (kein OAuth). Die `email` ist ein optionales Profilfeld, wird weder für Login noch Registrierung gebraucht und es wird keine Bestätigungs-Mail verschickt. Ein User kann Venues anlegen, Clashes hosten und Clashes als Teilnehmer beitreten.

**Venue:** Ein wiederverwendbarer physischer Ort (Café, Coworking Space, Park), der über die Zeit mehrere Clashes hosten kann. Sie hat ein `city`-Feld, Berlin ist nur die Startansicht der Karte und nirgends hartkodiert. Jeder eingeloggte User darf eine Venue anlegen, aber nur ihr Ersteller darf sie bearbeiten oder löschen.

**Clash:** Eine einzelne Aktivität an einem bestimmten Ort zu einer bestimmten Zeit (Yoga-Session, Hackathon, Brettspielabend). Ein Clash ist entweder mit einer Venue verknüpft, dann wird der Standort von der Venue übernommen und die Standort-Auswahl ist schreibgeschützt, oder er hat einen frei gewählten Standort ohne Venue. Nur der Host darf den Clash bearbeiten oder löschen.

**Participation:** Die Beitrittsbeziehung zwischen einem User und einem Clash. Der Status ist einer von:

| Status     | Bedeutung                                                              |
| ---------- | ---------------------------------------------------------------------- |
| `pending`  | Beitritt angefragt, wartet auf die Entscheidung des Hosts              |
| `accepted` | Der Host hat zugestimmt                                                |
| `rejected` | Der Host hat abgelehnt                                                 |
| `left`     | Der User ist freiwillig ausgetreten (vorher `pending` oder `accepted`) |

`left` ist bewusst getrennt von `rejected`, damit Selbst-Austritte und Ablehnungen in der Historie unterscheidbar bleiben. Aus `rejected` oder `left` kann man erneut beitreten: Die vorhandene Zeile (eindeutig je `userId` und `clashId`) wird auf `pending` zurückgesetzt, es entsteht keine neue. Es gibt keinen direkten Übergang von `accepted` nach `rejected` (kein „Kick" durch den Host). Der Host eines Clashes kann seinem eigenen Clash nicht beitreten.

```text
(keine) ──join──▶ pending ──accept──▶ accepted ──leave──▶ left
                     │                                      │
                     ├──reject──▶ rejected                  │
                     └──leave───▶ left        rejoin ◀──────┘ (auch aus rejected)
```

**Notification:** Ein in der Datenbank gespeicherter Eintrag, der im Posteingang unter `/notifications` erscheint. Ungelesene Einträge sind hervorgehoben, ihre Anzahl steht als Badge in der Sidebar. Es gibt vier Typen:

| Typ                  | Ausgelöst durch                              | Empfänger               |
| -------------------- | -------------------------------------------- | ----------------------- |
| `join_request`       | Ein User fragt den Beitritt an               | der Host des Clashes    |
| `join_accepted`      | Der Host akzeptiert die Anfrage              | der anfragende User     |
| `join_rejected`      | Der Host lehnt die Anfrage ab                | der anfragende User     |
| `new_clash_at_venue` | Ein neuer Clash wird an einer Venue angelegt | der Ersteller der Venue |

Bei `new_clash_at_venue` wird nur der Ersteller der Venue benachrichtigt (es gibt kein „Venue folgen"), und nicht, wenn er den Clash selbst hostet. Austritte (`leave`) lösen keine Benachrichtigung aus. Eine Benachrichtigung enthält keinen Auslöser, der Text wird aus Typ, Clash-Titel und Venue-Name zusammengesetzt.

**Abgeleitete Begriffe:**

- **Requests** (Spalte in der Clash-Liste, Sortierfeld): Anzahl der Teilnahmen mit Status `pending` oder `accepted`.
- **Clashes** (Spalte in der Venue-Liste): Anzahl aller Clashes, die an dieser Venue stattfinden.
- **Host:** der User, der einen Clash angelegt hat.
- **Going / Awaiting Approval / Declined** (in „Meine Teilnahmen"): Teilnahmen mit Status `accepted`, `pending` beziehungsweise `rejected`. Ausgetretene (`left`) werden nicht angezeigt.

## Abweichungen und Besonderheiten

Stellen, an denen die Umsetzung vom Briefing (`brief.md`) oder von den üblichen Standards abweicht:

**Gegenüber dem Briefing**

- **Benachrichtigungen:** Statt eines Glocken-Icons in der Top-Bar gibt es einen eigenen Posteingang unter `/notifications`, in der Sidebar mit Ungelesen-Badge. Die Einträge verlinken auf den zugehörigen Clash. Ein Deep-Link direkt zur Venue ist nicht umgesetzt.
- **Kein Auslöser in Benachrichtigungen:** Das Modell speichert nur den Empfänger, den Clash und die Venue. Texte wie „Neue Beitrittsanfrage für ‚Titel'" werden aus Typ und Titel gebaut und nennen nicht, wer die Anfrage gestellt hat. Das nachzurüsten erfordert eine Schema-Migration.
- **Dashboard:** Es zeigt nur die Karte „Discover". Statistik-Kacheln, Upcoming Clashes, „Popular Venues" und „Recent Activity" aus dem Briefing gibt es nicht.
- **Clash-Liste:** Statt der Sortierung soonest / newest / popular sind die Spalten Title, Start, Venue, Host und Requests einzeln sortierbar. „Popular" entspricht der Spalte Requests (`pending` plus `accepted`). Der Filter Upcoming / Past / All ist wie im Briefing vorhanden.

**Gegenüber den Standards**

- **Prisma ohne npm-Skripte:** Alle Datenbank-Befehle laufen über `npx prisma …`. Die Config heißt `prisma7.config.ts` statt `prisma.config.ts`, Prisma findet sie trotzdem automatisch. Ausdrücklich geprüft sind `migrate status` und `validate`. `db seed` und `migrate reset` sind dokumentiert, aber nicht bei der Erstellung dieser README ausgeführt worden, weil beide alle Daten löschen.
- **Keine `.env.example`:** Die Variablen stehen nur in dieser README. Die `.env` ist über `.gitignore` (`.env*`) ausgeschlossen und nicht im Repo.
- **Node-Version:** `.nvmrc` pinnt Node 26, passend zum aktuellen Build von `better-sqlite3`. Ein Wechsel der Node-Version erfordert `npm rebuild better-sqlite3`.
- **Session-Aufräumen:** Ein Route Handler (`app/api/session/expired`) löscht verwaiste Session-Cookies, weil sich Cookies beim Rendern eines Server Components nicht löschen lassen.
- **Dev-Origins:** `next.config.ts` erlaubt zusätzlich `127.0.0.1` und `[::1]`. `localhost` ist in Next.js standardmäßig erlaubt.
- **Seed löscht alles:** `prisma/seed.ts` leert zuerst alle Tabellen, auch selbst angelegte Konten.
- **Tests:** Vitest ist eingerichtet, es gibt aber noch keine Testdateien. `npm run verify` ruft es deshalb mit `--passWithNoTests` auf. Sobald Tests existieren, den Schalter in `package.json` entfernen, damit fehlende Tests nicht mehr durchrutschen. `@types/node` steht auf `^26`, weil Vitest 5 mindestens Version 22 verlangt und Node 26 gepinnt ist.

## Fehlersuche

- **`was compiled against a different Node.js version` / `NODE_MODULE_VERSION`:** `better-sqlite3` wurde mit einer anderen Node-Version gebaut. Mit `npm rebuild better-sqlite3` unter der aktuell benutzten Node-Version neu bauen (oder zur Version aus `.nvmrc` wechseln).
- **`DATABASE_URL is not set` / `SESSION_SECRET is not set`:** Die `.env` fehlt oder ist unvollständig.
- **Tabellen fehlen oder Schema-Fehler:** `npx prisma migrate deploy` und danach `npx prisma generate` ausführen.
- **Dev-Zugriff über `127.0.0.1` oder `[::1]`:** Diese Origins sind in `next.config.ts` unter `allowedDevOrigins` freigegeben. Für weitere Hosts (z. B. die LAN-IP) dort ergänzen.
- **Dev-Overlay zeigt „1 Issue" mit einem Hydration-Hinweis auf `data-feedly-mini` am `<body>`:** Das kommt von der Feedly-Browsererweiterung, die das DOM vor der Hydration verändert, nicht von der App. Zum Prüfen ein Fenster ohne Erweiterungen benutzen.
- **Nach einem Reseed hängt der Browser in einer Weiterleitungsschleife:** Behoben. Verweist ein gültig signiertes Cookie auf einen nicht mehr vorhandenen User, räumt `/api/session/expired` das Cookie auf und leitet zum Login. Bei einer älteren Version das Cookie `session` im Browser löschen.
