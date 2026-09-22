# Clash – Implementierungs-Briefing für Claude Code

## Grundidee

Clash ist eine Full-Stack-Webapp mit der Kernidee **"die Stadt ist der Social Graph"**. Statt Feeds und Follower-Zahlen dreht sich alles um Ort + Zeit auf einer interaktiven Karte. Die App ist von Anfang an mehrstadtfähig (kein hartkodiertes Berlin) — Venues tragen ein `city`-Feld, die Karte startet mit Berlin als Default-Ansicht, lässt sich aber auf andere Städte umschalten.

- **Clash** = Aktivität (Yoga-Session, Hackathon, Brettspielabend) an einem Ort zu einer Zeit.
- **Venue** = wiederverwendbarer physischer Ort (Café, Coworking Space, Park), der mehrere Clashes hosten kann.
- Nutzer **joinen** Clashes, Hosts **akzeptieren/lehnen ab**, alle werden **benachrichtigt**.

## Bestehende Basis

- Scaffold-App bereits vorhanden: **Next.js (React), ShadCN UI, Prisma ORM, SQLite**.
- Kartenintegration: **Leaflet + react-leaflet**.
- Claude Code soll auf dieser Basis aufbauen, nicht neu aufsetzen.

**Tatsächlicher Stand vs. Soll:**

- ✅ Vorhanden: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- ❌ Noch zu ergänzen, obwohl oben als Basis vorausgesetzt: **Prisma ORM** (kein Schema, kein Client), **SQLite** (keine DB-Datei, keine Migration), **Leaflet + react-leaflet** (keine Abhängigkeit installiert, keine Map-Komponente), sowie eine **Auth-Lösung** (z. B. next-auth) — auch die ist noch nicht integriert.

## Grobe Architektur

- **Frontend:** Next.js App Router, Server Components wo sinnvoll, ShadCN-Komponenten für UI-Bausteine (Dialoge, Tabs, Cards, Command Palette).
- **Backend:** Next.js Route Handlers / Server Actions als API-Layer, Prisma als DB-Zugriffsschicht auf SQLite.
- **Karte:** react-leaflet-Wrapper-Komponente, wiederverwendbar für Dashboard-Mini-Map, Clash-/Venue-Detailseiten und Klick-zum-Erstellen-Flow.
- **Auth:** Session-basierte Authentifizierung mit **E-Mail/Passwort (Credentials)** — kein OAuth/Social-Login. Passwörter gehasht (z. B. bcrypt) im `User`-Modell speichern; Umsetzung z. B. via next-auth Credentials-Provider oder eine eigene, einfache Session-Logik.
- **Notifications:** DB-gestützte Tabelle, im Top-Bar-Bell-Icon gerendert, Trigger bei Join-Request, Accept/Reject, neuer Clash an eigener Venue (Empfänger: nur der Venue-Ersteller, kein Follow-Konzept für andere Nutzer).
- **Datenmodell (Kern-Entitäten):** User, Venue (inkl. `city`-Feld für Mehrstadtfähigkeit), Clash, Participation (Status: pending/accepted/rejected/left — "left" wird gesetzt, wenn ein bereits akzeptierter Teilnehmer den Clash selbst verlässt, unterscheidbar von einer Host-Ablehnung), Notification.
- **Berechtigungen:** Jeder eingeloggte Nutzer darf Venues anlegen (kein Rollensystem nötig). Bearbeiten/Löschen eines Clashes nur durch dessen Host, einer Venue nur durch deren Ersteller.

## Kernfeatures (Implementierungsreihenfolge-Vorschlag)

1. **Datenmodell & Prisma-Schema** für User, Venue, Clash, Participation, Notification.
2. **Karte & Discover:** Leaflet-Karte mit Pins für Clashes/Venues, Popups, Klick-zum-Erstellen, Städte-Umschalter (Default: Berlin), Filter der Pins nach aktuell gewählter Stadt.
3. **CRUD Clashes:** Liste (Filter: upcoming/past/all; Sort: soonest/newest/popular — "popular" = Anzahl aller Join-Anfragen, also pending + accepted), Create/Edit mit Location-Picker, optionaler Venue-Verknüpfung, Detailseite mit Mini-Map und People-Panel (Going/Requests). Bei Venue-Auswahl übernimmt der Clash automatisch deren Koordinaten und der Location-Picker wird schreibgeschützt (verhindert widersprüchliche Standorte); ohne Venue bleibt der Picker frei editierbar.
4. **CRUD Venues:** Liste, Create/Edit mit Map-Picker, "Host a clash here"-Flow, Übersicht gehosteter Clashes.
5. **Participation-Workflow:** Join/Leave mit optimistic UI (Leave setzt Status auf "left", nicht "rejected"), Accept/Reject durch Host, "My Participations"-Ansicht (Going/Awaiting/Declined/Left).
6. **Notifications:** Bell-Icon, Mark-as-read (einzeln/alle), Deep-Links zu Clash/Venue.
7. **Profile & Account:** Editierbares Profil, Avatar-Upload mit Crop/Zoom (react-easy-crop) als Base64-Data-URL, Fallback farbige Initialen, öffentliche Profilseiten.
8. **Dashboard:** Stats-Kacheln, Upcoming Clashes, Popular Venues (= Anzahl gehosteter Clashes gesamt je Venue), Recent Activity.
9. **Globale Suche:** ⌘K Command Palette + dedizierte Ergebnisseite (gruppiert nach Clashes/Venues/People).
10. **Settings & Theming:** Light/Dark/System-Theme, Session-Verwaltung.
11. **Responsive Shell** für alle Ansichten.

## Hinweise für Claude Code

- Bestehende Scaffold-Strukturen (Ordner, Konventionen, ShadCN-Setup) respektieren statt neu zu erfinden.
- Prisma-Migrationen inkrementell pro Feature-Block anlegen.
- Leaflet-Komponenten client-seitig rendern (`"use client"`), da SSR mit Leaflet nicht funktioniert.
- Optimistic-UI-Patterns für Join/Leave und Notifications-Mark-as-read konsistent halten (z. B. über React Query oder SWR, falls bereits im Scaffold vorhanden).
