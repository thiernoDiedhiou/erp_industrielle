# Guide Utilisateur — ERP Industriel GISAC

> **Version** 1.0 — Avril 2026
> Ce document est mis à jour à chaque nouvelle fonctionnalité.

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Connexion et navigation](#2-connexion-et-navigation)
3. [Rôles et accès](#3-rôles-et-accès)
4. [Tableau de bord](#4-tableau-de-bord)
5. [CRM / Clients](#5-crm--clients)
6. [Commandes](#6-commandes)
7. [Production](#7-production)
8. [Machines](#8-machines)
9. [Stock](#9-stock)
10. [Matières Premières](#10-matières-premières)
11. [Fournisseurs](#11-fournisseurs)
12. [Logistique](#12-logistique)
13. [Facturation](#13-facturation)
14. [Recyclage](#14-recyclage)
15. [Reporting](#15-reporting)
16. [Journal d'audit](#16-journal-daudit)
17. [Administration](#17-administration)
18. [Paramètres](#18-paramètres)
19. [Notifications en temps réel](#19-notifications-en-temps-réel)
20. [Questions fréquentes](#20-questions-fréquentes)
21. [Historique des mises à jour](#21-historique-des-mises-à-jour)

---

## 1. Introduction

L'ERP Industriel GISAC est la plateforme de gestion intégrée de **Global Invest Samoura & Co** (Thiès, Sénégal). Elle centralise toutes les opérations de l'entreprise : clients, commandes, production, stocks, facturation et plus encore.

**Accès** : `https://erp.gisac.sn/gisac`

**Support** : contacter l'administrateur système au **33 999 01 79**

---

## 2. Connexion et navigation

### Se connecter

1. Ouvrir le navigateur et aller sur l'adresse fournie par votre administrateur
2. Saisir votre **adresse email** et votre **mot de passe**
3. Cliquer sur **Se connecter**

> Si vous avez oublié votre mot de passe, contactez votre administrateur.

### Interface principale

```
┌──────────────┬────────────────────────────────────────┐
│              │                                        │
│  Barre de    │                                        │
│  navigation  │         Zone de travail                │
│  (gauche)    │                                        │
│              │                                        │
│  • Module 1  │                                        │
│  • Module 2  │                                        │
│  • ...       │                                        │
│              │                                        │
│  Déconnexion │                                        │
└──────────────┴────────────────────────────────────────┘
```

- **Barre de navigation** (gauche, bleue) : accès à tous les modules selon votre rôle
- **Zone de travail** (droite) : contenu du module actif
- **Sur mobile** : appuyer sur le bouton menu (3 traits) pour ouvrir la navigation

### Se déconnecter

Cliquer sur **Déconnexion** en bas de la barre de navigation.

---

## 3. Rôles et accès

Chaque utilisateur possède un rôle qui détermine les modules visibles et les actions autorisées.

| Rôle | Description | Modules accessibles |
|------|-------------|---------------------|
| `admin` | Administrateur | Tous les modules |
| `direction` | Direction générale | Tous sauf Administration/Paramètres |
| `commercial` | Équipe commerciale | Tableau de bord, CRM, Commandes, Facturation, Logistique |
| `production` | Responsable production | Tableau de bord, Production, Machines, Stock, Matières premières |
| `magasinier` | Gestionnaire stock | Stock, Matières premières, Fournisseurs, Logistique |
| `comptable` | Comptabilité | Facturation, Reporting |

> Les modules non autorisés n'apparaissent pas dans votre menu — c'est normal.

---

## 4. Tableau de bord

**Accès** : tous les rôles

Le tableau de bord affiche une vue synthétique de l'activité en cours.

### Indicateurs affichés

| Indicateur | Description |
|-----------|-------------|
| Chiffre d'affaires du mois | Total des factures payées ce mois |
| Commandes en cours | Nombre de commandes actives (hors annulées) |
| Produits en stock faible | Produits sous le seuil d'alerte |
| Taux de production | Ordres de fabrication terminés vs planifiés |

### Actions rapides

Depuis le tableau de bord vous pouvez directement :
- Créer une nouvelle commande
- Voir les alertes de stock
- Accéder aux factures impayées

---

## 5. CRM / Clients

**Accès** : tous les rôles

### Consulter la liste des clients

1. Cliquer sur **CRM / Clients** dans la navigation
2. La liste affiche tous les clients actifs avec leur nom, email et téléphone
3. Utiliser la **barre de recherche** pour filtrer par nom ou email
4. La liste est paginée (20 clients par page) — utiliser les boutons **Précédent / Suivant**

### Créer un client

1. Cliquer sur le bouton **Nouveau client** (en haut à droite)
2. Remplir le formulaire :
   - **Nom** *(obligatoire)* : raison sociale ou nom complet
   - **Email** : adresse email de contact
   - **Téléphone** : numéro avec indicatif
   - **Adresse** : adresse complète
3. Cliquer sur **Enregistrer**

### Modifier un client

1. Cliquer sur le nom du client dans la liste
2. Modifier les champs souhaités
3. Cliquer sur **Enregistrer**

### Supprimer un client

> Un client qui possède des commandes ne peut pas être supprimé.

1. Cliquer sur l'icône de suppression (corbeille) sur la ligne du client
2. Confirmer la suppression dans la fenêtre de confirmation

> La suppression est une **suppression douce** : le client disparaît de la liste mais ses données sont conservées dans les archives.

---

## 6. Commandes

**Accès** : tous les rôles

### Cycle de vie d'une commande

```
Brouillon → Confirmée → En production → Expédiée → Livrée
                                                        ↓
                                                    Annulée (si brouillon ou confirmée)
```

### Consulter les commandes

1. Cliquer sur **Commandes** dans la navigation
2. Filtrer par statut, client ou date grâce aux filtres en haut de la liste

### Créer une commande

1. Cliquer sur **Nouvelle commande**
2. Sélectionner le **client** dans la liste déroulante
3. Ajouter des **lignes de commande** :
   - Choisir le produit
   - Saisir la quantité
   - Le prix unitaire se renseigne automatiquement (modifiable)
4. Vérifier le **sous-total**, la **TVA (18%)** et le **total TTC**
5. Cliquer sur **Enregistrer** — la commande est créée en statut *Brouillon*

### Confirmer une commande

1. Ouvrir la commande (cliquer sur son numéro)
2. Cliquer sur **Confirmer la commande**
3. La commande passe en statut *Confirmée* et une notification est envoyée automatiquement au client par email

### Suivre l'avancement

La page détail d'une commande affiche :
- L'historique des changements de statut
- Les lignes commandées et leur état
- Le bon de livraison associé (si expédiée)
- La facture associée (si facturée)

---

## 7. Production

**Accès** : tous les rôles (modification : production, admin, direction)

### Ordres de fabrication

Un ordre de fabrication (OF) est créé pour produire un produit fini.

### Créer un ordre de fabrication

1. Cliquer sur **Production** dans la navigation
2. Cliquer sur **Nouvel ordre**
3. Renseigner :
   - Le **produit** à fabriquer
   - La **quantité** planifiée
   - La **date de début** et la **date de fin prévue**
   - La **machine** assignée (optionnel)
4. Enregistrer — l'OF est en statut *Planifié*

### Suivre la production

Les statuts possibles d'un OF :

| Statut | Signification |
|--------|---------------|
| Planifié | OF créé, pas encore démarré |
| En cours | Production démarrée |
| Terminé | Production achevée, stock mis à jour |
| Annulé | OF annulé |

### Consommation de matières premières

Lors du passage en statut *Terminé*, le système déduit automatiquement les matières premières consommées du stock.

---

## 8. Machines

**Accès** : admin, production, direction

### Consulter le parc machines

1. Cliquer sur **Machines** dans la navigation
2. La liste affiche toutes les machines avec leur statut et localisation

### Ajouter une machine

1. Cliquer sur **Nouvelle machine**
2. Renseigner :
   - **Nom** et **référence**
   - **Type** (injection, extrusion, soufflage…)
   - **Localisation** dans l'atelier
   - **Date d'acquisition** et **date de dernière maintenance**
3. Enregistrer

### Statuts des machines

| Statut | Signification |
|--------|---------------|
| Disponible | Prête à l'emploi |
| En production | Affectée à un OF en cours |
| En maintenance | Hors service temporairement |
| Hors service | Panne ou réforme |

---

## 9. Stock

**Accès** : tous les rôles

### Consulter le stock

1. Cliquer sur **Stock** dans la navigation
2. La liste affiche tous les produits finis avec leur quantité en stock
3. Les produits **en rouge** sont sous le seuil d'alerte

### Enregistrer un mouvement de stock

Les mouvements de stock (entrée/sortie) sont généralement automatiques (créés par les ordres de fabrication et les bons de livraison). Pour un ajustement manuel :

1. Cliquer sur **Nouveau mouvement**
2. Sélectionner le **produit** et le **type** (entrée ou sortie)
3. Saisir la **quantité** et le **motif**
4. Enregistrer

> Tout mouvement est tracé dans le journal d'audit.

---

## 10. Matières Premières

**Accès** : admin, magasinier, production, direction

### Consulter le stock de matières premières

1. Cliquer sur **Matières Premières** dans la navigation
2. La liste affiche toutes les matières avec leur stock actuel et leur seuil minimum
3. Les matières **sous le seuil** sont signalées et une **alerte automatique** est envoyée au responsable stock

### Ajouter une matière première

1. Cliquer sur **Nouvelle matière**
2. Renseigner :
   - **Nom** et **référence**
   - **Unité de mesure** (kg, litre, m², pièce…)
   - **Stock initial**
   - **Stock minimum** — seuil déclenchant l'alerte
   - **Fournisseur** par défaut (optionnel)
3. Enregistrer

### Enregistrer une réception fournisseur

Lors de la réception d'une livraison de matières premières :

1. Ouvrir la matière première concernée
2. Cliquer sur **Entrée de stock**
3. Saisir la quantité reçue et le numéro de bon de livraison fournisseur
4. Enregistrer — le stock est mis à jour immédiatement

---

## 11. Fournisseurs

**Accès** : admin, magasinier, direction

### Gérer les fournisseurs

1. Cliquer sur **Fournisseurs** dans la navigation
2. La liste affiche les fournisseurs actifs et inactifs

### Ajouter un fournisseur

1. Cliquer sur **Nouveau fournisseur**
2. Renseigner :
   - **Raison sociale** *(obligatoire)*
   - **Contact** (nom, email, téléphone)
   - **Adresse**
   - **Conditions de paiement** (délai habituel)
3. Enregistrer

### Activer / Désactiver un fournisseur

Un fournisseur peut être désactivé sans être supprimé (ses données et historiques sont conservés) :

1. Sur la ligne du fournisseur, cliquer sur le **bouton de statut** (Actif/Inactif)
2. Confirmer le changement

> Un fournisseur ne peut pas être supprimé s'il a des matières premières associées.

---

## 12. Logistique

**Accès** : admin, commercial, magasinier, direction

### Bons de livraison

Un bon de livraison (BL) est généré à partir d'une commande confirmée pour organiser l'expédition.

### Créer un bon de livraison

1. Cliquer sur **Logistique** dans la navigation
2. Cliquer sur **Nouveau bon de livraison**
3. Sélectionner la **commande** à expédier
4. Vérifier les lignes à livrer (possibilité de livraison partielle)
5. Renseigner :
   - Le **transporteur**
   - L'**adresse de livraison**
   - La **date de livraison prévue**
6. Enregistrer

### Confirmer une livraison

Une fois la livraison effectuée :

1. Ouvrir le bon de livraison
2. Cliquer sur **Marquer comme livré**
3. Le stock des produits est automatiquement décrémenté
4. La commande passe en statut *Livrée*

---

## 13. Facturation

**Accès** : tous les rôles (création/modification : commercial, comptable, admin, direction)

### Cycle de vie d'une facture

```
Brouillon → Émise → Partiellement payée → Soldée
                ↓
            Annulée
```

### Créer une facture

Les factures sont généralement créées automatiquement depuis une commande. Pour créer manuellement :

1. Cliquer sur **Facturation** dans la navigation
2. Cliquer sur **Nouvelle facture**
3. Sélectionner le **client** et la **commande** associée
4. Vérifier les lignes, la TVA (18%) et le montant total
5. Enregistrer — la facture est en statut *Brouillon*

### Émettre une facture

1. Ouvrir la facture
2. Cliquer sur **Émettre** — un email avec la facture est envoyé automatiquement au client

### Enregistrer un paiement

1. Ouvrir la facture émise
2. Cliquer sur **Enregistrer un paiement**
3. Saisir :
   - Le **montant** payé
   - Le **mode de paiement** (virement, espèces, chèque…)
   - La **date** de réception
4. Enregistrer
   - Si le montant total est atteint → la facture passe automatiquement à *Soldée*
   - Sinon → *Partiellement payée*

### Tableau de bord facturation

La page affiche en haut :
- **Total facturé** ce mois
- **Total encaissé** ce mois
- **En attente** (émises non soldées)
- **En retard** (émises dont l'échéance est dépassée)

---

## 14. Recyclage

**Accès** : tous les rôles

### Collectes de recyclage

GISAC collecte les déchets plastiques pour les recycler en matière première.

### Enregistrer une collecte

1. Cliquer sur **Recyclage** dans la navigation
2. Cliquer sur **Nouvelle collecte**
3. Renseigner :
   - Le **type de matériau** collecté
   - La **quantité** (en kg)
   - La **source** (client, partenaire, collecte externe)
   - La **date** de collecte
4. Enregistrer

---

## 15. Reporting

**Accès** : admin, direction, comptable

### Rapports disponibles

| Rapport | Description |
|---------|-------------|
| Ventes par période | CA mensuel/trimestriel/annuel |
| Top clients | Clients par volume de commandes |
| Production | Taux de réalisation des OF par période |
| Stock | Valeur du stock et rotations |
| Matières premières | Consommation et approvisionnements |
| Recyclage | Tonnage collecté par période |

### Générer un rapport

1. Cliquer sur **Reporting** dans la navigation
2. Sélectionner le **type de rapport**
3. Choisir la **période** (dates de début et de fin)
4. Cliquer sur **Générer**
5. Les résultats s'affichent sous forme de tableaux et graphiques
6. Cliquer sur **Exporter** pour télécharger en CSV ou PDF

---

## 16. Journal d'audit

**Accès** : admin, direction uniquement

Le journal d'audit enregistre **toutes les actions** effectuées dans le système : création, modification, suppression, changements de statut, exports.

### Consulter le journal

1. Cliquer sur **Journal d'audit** dans la navigation
2. La liste affiche les actions récentes (25 par page)

### Filtrer les actions

Utiliser les filtres disponibles :
- **Type d'action** : Création, Modification, Suppression, Statut, Export
- **Module** : Clients, Commandes, Factures, etc.
- **Période** : dates de début et de fin

### Consulter le détail d'une action

Cliquer sur une ligne du journal pour voir :
- L'utilisateur qui a effectué l'action
- La date et l'heure exactes
- L'adresse IP
- **L'état avant** et **l'état après** la modification (pour les modifications)

> Ces informations sont précieuses en cas de litige ou d'erreur — elles permettent de retrouver qui a fait quoi et quand.

---

## 17. Administration

**Accès** : admin uniquement

### Gérer les utilisateurs

1. Cliquer sur **Administration** dans la navigation
2. Aller dans l'onglet **Utilisateurs**

#### Créer un utilisateur

1. Cliquer sur **Nouvel utilisateur**
2. Renseigner :
   - **Prénom** et **Nom**
   - **Email** (servira d'identifiant)
   - **Rôle** (voir [tableau des rôles](#3-rôles-et-accès))
   - **Mot de passe** temporaire
3. Enregistrer — l'utilisateur peut se connecter immédiatement

#### Désactiver un utilisateur

Pour bloquer l'accès d'un utilisateur sans supprimer son compte (recommandé en cas de départ) :
1. Cliquer sur l'utilisateur dans la liste
2. Cliquer sur **Désactiver**

### Gérer les modules actifs

Les modules peuvent être activés ou désactivés par tenant :

1. Aller dans l'onglet **Modules**
2. Cocher/décocher les modules à activer
3. Enregistrer — le changement est effectif immédiatement pour tous les utilisateurs

### Gérer les workflows

Les workflows définissent les étapes et transitions de statut (commandes, OF, etc.) :

1. Aller dans l'onglet **Workflows**
2. Sélectionner un workflow à modifier
3. Ajouter ou supprimer des états et des transitions autorisées

---

## 18. Paramètres

**Accès** : admin uniquement

### Paramètres de l'entreprise

Configurer les informations générales de l'entreprise :
- Nom, adresse, téléphone
- Logo (affiché sur les factures)
- Devise et taux de TVA par défaut
- Numéro NINEA / RC

### Numérotation automatique

Configurer les préfixes et formats des numéros automatiques :
- Factures : `FAC-2026-XXXX`
- Commandes : `CMD-2026-XXXX`
- Bons de livraison : `BL-2026-XXXX`

### Alertes

Configurer les seuils et destinataires des alertes automatiques :
- Seuil de stock faible → email au responsable stock
- Factures en retard → email au comptable

---

## 19. Notifications en temps réel

Une **cloche de notification** en haut de page affiche les alertes en temps réel :

| Type | Déclencheur |
|------|-------------|
| Alerte stock | Un stock passe sous le seuil minimum |
| Nouvelle commande | Une commande est confirmée |
| Paiement reçu | Un paiement est enregistré |
| OF terminé | Un ordre de fabrication passe en *Terminé* |

Les notifications disparaissent après lecture. Elles sont également envoyées par **email** si vous êtes le responsable concerné.

---

## 20. Questions fréquentes

**Je ne vois pas un module dans le menu — est-ce normal ?**
Oui. Seuls les modules correspondant à votre rôle sont visibles. Contactez votre administrateur si vous pensez avoir besoin d'un accès supplémentaire.

**J'ai fait une erreur de saisie — comment la corriger ?**
Ouvrir l'enregistrement concerné, modifier les champs, et enregistrer. La modification est tracée dans le journal d'audit avec l'état avant/après.

**Je ne peux pas supprimer un client / fournisseur — pourquoi ?**
Un client ou fournisseur ne peut pas être supprimé s'il possède des commandes, factures ou matières premières associées. Vous pouvez le désactiver à la place.

**Comment récupérer mon mot de passe ?**
Contacter votre administrateur. Il peut vous attribuer un nouveau mot de passe depuis le module Administration.

**L'application est lente — que faire ?**
Vider le cache du navigateur (Ctrl+Maj+Suppr), puis actualiser la page. Si le problème persiste, contacter le support.

**Puis-je utiliser l'ERP sur téléphone ?**
Oui. L'interface est responsive et fonctionne sur tous les appareils. Sur mobile, le menu s'ouvre via le bouton (3 traits) en haut à gauche.

---

## 21. Historique des mises à jour

| Version | Date | Nouveautés |
|---------|------|------------|
| **1.0** | Avril 2026 | Version initiale : CRM, Commandes, Production, Stock, Facturation, Recyclage, Fournisseurs, Machines, Matières premières, Logistique, Reporting, Journal d'audit |

---

*Document interne GISAC — Global Invest Samoura & Co*
*Mis à jour par l'équipe technique — contact : admin@gisac.sn*
