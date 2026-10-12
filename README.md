# 🧺 Centrale Tech — Hub des Anomalies & Pannes laundry.fecc.ma

Plateforme officielle de remontée, suivi et résolution des pannes et anomalies du service de laverie (**laundry.fecc.ma**) de l'**École Centrale Casablanca**, développée et opérée par le club technologique **Centrale Tech**.

---

## 🎨 Identité Visuelle Centrale Tech
Cette application respecte rigoureusement la charte graphique et le design system de **Centrale Tech** :
- **Couleurs officielles** :
  - Deep Petrol : `#0c3d40`
  - Primary Accent Teal : `#009881`
  - Jade Emphasis Teal : `#048471`
  - Institutional ECC Green : `#126a38`
  - Slate Header / Divider : `#435966`
  - Soft Sky Blue : `#abd1f9`
- **Typographies** :
  - Titres Display : `Anton`
  - Titres Cover : `Montserrat`
  - Labels & Navigation : `Outfit`
  - Corps de texte : `Inter` / `Poppins`
- **Motifs emblématiques** :
  - Running Header avec filets hairlines horizontaux `#435966`
  - Coins accentués carré teal `#009881`
  - Badges d'urgence et statuts normalisés

---

## 🚀 Fonctionnalités Clés

### 1. Formulaire Complet de Signalement
- **Titre & Catégorisation** :
  - Panne Machine / Lavage Interrompu
  - Réservation & Créneau Bloqué
  - Jetons & Paiement / Solde Déduit
  - Interface Web & Affichage Mobile
  - Connexion CAS & Session Expirée
  - Alerte Fin de Cycle / SMS Manquant
  - Propreté / Infrastructure du Lavoir
- **Localisation & Machine** : Choix du lavoir (Résidence A, B) et du numéro de machine.
- **Urgence / Sévérité** : Faible, Moyenne, Élevée, Critique.
- **Détection & Sélection de Plateforme** (Android, iPhone, iPad, Mac, Windows, Linux, navigateur Safari/Chrome/Firefox/Edge/Webview, et bouton de détection automatique en 1 clic).
- **Captures d'écran (Optionnelles)** : Téléversement direct d'images (PNG, JPG, WebP) vers le bucket Supabase Storage avec prévisualisation et lightbox.
- **Réplication Vidéo (Optionnelle)** : Téléversement de fichiers vidéo (.mp4, .webm) ou lien externe (Loom, Google Drive).
- **Notification par Email** : E-mail automatique expédié au déclarant dès mise à jour par Centrale Tech.

### 2. Flux Public des Signalements & Résolutions
- Moteur de recherche instantané par machine, titre, ou étudiant.
- Filtres combinés par catégorie, statut et plateforme.
- Visualisation détaillée avec lecteur vidéo et galerie photo.
- Affichage des réponses officielles du Pôle Technique Centrale Tech.

### 3. Espace Membre Pôle Technique (Admin)
- Protégé par mot de passe administrateur (`ADMIN_PASSWORD`).
- Gestion en direct : passage de statut (`open` → `investigating` → `resolved` → `closed`).
- Rédaction de la note d'intervention avec expédition instantanée d'un e-mail officiel à l'étudiant via Gmail SMTP.

---

## 🗄️ Base de Données & Supabase

1. Créez un projet sur [Supabase](https://supabase.com).
2. Exécutez le script SQL présent dans [`supabase-schema.sql`](supabase-schema.sql) dans l'éditeur SQL de votre projet.
3. Le bucket de stockage `issue-attachments` est prêt pour recevoir les captures et vidéos jusqu'à 50 Mo.
4. Renseignez vos clés dans `.env.local` :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
ADMIN_PASSWORD=clubSecretPass2026
GMAIL_SENDER_EMAIL=contact@example.com
GMAIL_APP_PASSWORD=votre_mot_de_passe_d_application
```

---

## 💻 Développement Local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build de production
npm run build
```
Accédez au portail sur `http://localhost:3000`.
