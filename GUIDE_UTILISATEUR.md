# Guide Utilisateur — ERP Industriel GISAC

> **Version** 1.2 — Avril 2026
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

```text
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

- **Barre de navigation** (gauche) : couleur aux couleurs de votre entreprise, accès à tous les modules selon votre rôle et les modules activés
- **Zone de travail** (droite) : contenu du module actif
- **Sur mobile** : appuyer sur le bouton menu (3 traits) pour ouvrir la navigation

> La barre de navigation affiche uniquement les modules **activés** pour votre entreprise. Si un module disparaît du menu, votre administrateur l'a désactivé — c'est intentionnel.

### Se déconnecter

Cliquer sur **Déconnexion** en bas de la barre de navigation.

---

## 3. Rôles et accès

Chaque utilisateur possède un rôle qui détermine les modules visibles et les actions autorisées.

| Rôle | Description | Modules accessibles |
| --- | --- | --- |
| `admin` | Administrateur | Tous les modules activés |
| `direction` | Direction générale | Tous sauf Administration/Paramètres |
| `commercial` | Équipe commerciale | Tableau de bord, CRM, Commandes, Facturation, Logistique |
| `production` | Responsable production | Tableau de bord, Production, Machines, Stock, Matières premières |
| `magasinier` | Gestionnaire stock | Stock, Matières premières, Fournisseurs, Logistique |
| `comptable` | Comptabilité | Facturation, Reporting |

> Les modules non autorisés **ou désactivés** n'apparaissent pas dans votre menu — c'est normal.

---

## 4. Tableau de bord

**Accès** : tous les rôles

Le tableau de bord affiche une vue synthétique de l'activité en cours.

### Indicateurs affichés

| Indicateur | Description |
| --- | --- |
| Chiffre d'affaires du mois | Total des factures payées ce mois |
| Commandes en cours | Nombre de commandes actives (hors annulées) |
| OFs en cours | Ordres de fabrication actifs |
| Clients | Total dans le portefeuille |
| Alertes stock | Produits sous le seuil d'alerte |
| Factures impayées | Factures émises non soldées |

### Graphiques

- **Chiffre d'affaires — 12 derniers mois** : évolution mensuelle du CA
- **Répartition des commandes** : camembert par statut
- **Top 5 clients — CA** : meilleurs clients du trimestre
- **Dernières commandes** : accès rapide aux commandes récentes
- **Ordres de fabrication** : OFs actifs avec avancement

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

```text
Brouillon → Confirmée → En production → Prête → Livrée → Facturée
     ↓            ↓             ↓
  Annulée      Annulée       Annulée
```

| Statut | Signification |
| --- | --- |
| Brouillon | Commande créée, non encore confirmée |
| Confirmée | Commande validée, en attente de production |
| En production | Un ou plusieurs ordres de fabrication sont en cours |
| Prête | Tous les OFs liés sont terminés — prête à expédier |
| Livrée | Bon de livraison émis, stock débité automatiquement |
| Facturée | Facture générée |
| Annulée | Commande annulée (possible depuis Brouillon, Confirmée ou En production) |

> Le passage **En production → Prête** peut se faire automatiquement lorsque tous les ordres de fabrication liés sont terminés.
>
> Le passage **Confirmée → Livrée** vérifie que le stock est suffisant avant d'autoriser la livraison.

### Consulter les commandes

1. Cliquer sur **Commandes** dans la navigation
2. Filtrer par statut, client grâce aux filtres en haut de la liste

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
3. La commande passe en statut *Confirmée* et une notification est envoyée

### Suivre l'avancement

La page détail d'une commande affiche :

- L'**historique des statuts** avec date, utilisateur et commentaire
- Les **lignes commandées** et leur état
- Les **ordres de fabrication** associés (si en production)
- Le **bon de livraison** associé (si livrée)
- La **facture** associée (si facturée)

---

## 7. Production

**Accès** : tous les rôles (modification : production, admin, direction)

### Ordres de fabrication (OF)

Un ordre de fabrication est créé pour produire un produit fini à partir de matières premières.

### Cycle de vie d'un OF

```text
Planifié → En cours → Terminé
               ↓
           En pause → En cours
               ↓
            Annulé
```

| Statut | Signification |
| --- | --- |
| Planifié | OF créé, pas encore démarré |
| En cours | Production démarrée — machine affectée mise en statut *En production* |
| En pause | Production suspendue temporairement |
| Terminé | Production achevée — stock produit fini incrémenté automatiquement |
| Annulé | OF annulé — machine libérée automatiquement |

> Avant le passage **Planifié → En cours**, le système vérifie que les stocks de matières premières sont suffisants selon la nomenclature (BOM) du produit.
>
> Quand un OF passe en **Terminé**, si tous les OFs d'une commande sont terminés, la commande passe automatiquement en statut *Prête*.

### Créer un ordre de fabrication

1. Cliquer sur **Production** dans la navigation
2. Cliquer sur **Nouvel ordre**
3. Renseigner :

   - Le **produit** à fabriquer
   - La **quantité** planifiée
   - La **date de début** et la **date de fin prévue**
   - La **machine** assignée (optionnel)
   - La **commande** liée (optionnel — permet le suivi automatique)

4. Enregistrer — l'OF est en statut *Planifié*

### Consommation de matières premières

Lors de la production, enregistrer les matières consommées :

1. Ouvrir l'OF en cours
2. Cliquer sur **Enregistrer une consommation**
3. Sélectionner la matière première et saisir la quantité
4. Enregistrer — le stock de matière est immédiatement décrémenté

---

## 8. Machines

**Accès** : admin, production, direction

### Consulter le parc machines

1. Cliquer sur **Machines** dans la navigation
2. La liste affiche toutes les machines avec leur statut et localisation

### Ajouter une machine

1. Cliquer sur **Nouvelle machine**
2. Renseigner :

   - **Nom** et **code**
   - **Type** (injection, extrusion, soufflage…)
   - **Capacité** et **unité** (optionnel)

3. Enregistrer

### Statuts des machines

| Statut | Signification |
| --- | --- |
| Disponible | Prête à l'emploi |
| En production | Affectée à un OF en cours — mise à jour automatiquement |
| En maintenance | Hors service temporairement |
| Hors service | Panne ou réforme |

> Le statut de la machine est mis à jour **automatiquement** lors des changements de statut de l'OF associé.

---

## 9. Stock

**Accès** : tous les rôles

### Consulter le stock

1. Cliquer sur **Stock** dans la navigation
2. La liste affiche tous les produits finis avec leur quantité en stock
3. Les produits **en rouge** sont sous le seuil d'alerte

### Mouvements automatiques

Les mouvements de stock sont créés automatiquement par le système :

| Événement | Mouvement |
| --- | --- |
| OF terminé | Entrée en stock du produit fini (quantité produite) |
| Commande livrée | Sortie du stock pour chaque ligne (quantité commandée) |

### Ajustement manuel

Pour un écart d'inventaire ou une correction :

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

Un bon de livraison (BL) est généré **automatiquement** quand une commande passe en statut *Livrée*. La référence suit le format `BL-AAAA-XXXX`.

### Consulter les bons de livraison

1. Cliquer sur **Logistique** dans la navigation
2. La liste affiche tous les bons de livraison avec leur statut

### Bon de livraison automatique

Lors du passage d'une commande en statut *Livrée* :

- Un BL est créé automatiquement avec les lignes de la commande
- Le stock des produits est décrémenté automatiquement
- Un mouvement de stock de type *Sortie livraison* est enregistré

---

## 13. Facturation

**Accès** : tous les rôles (création/modification : commercial, comptable, admin, direction)

### Cycle de vie d'une facture

```text
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
| --- | --- |
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
- **L'état avant** et **l'état après** la modification

> Ces informations sont précieuses en cas de litige ou d'erreur — elles permettent de retrouver qui a fait quoi et quand.

---

## 17. Administration

**Accès** : admin uniquement

### Gérer les utilisateurs

Cliquer sur **Administration** dans la navigation, puis **Utilisateurs**.

#### Créer un utilisateur

1. Cliquer sur **Nouvel utilisateur**
2. Renseigner :

   - **Prénom** et **Nom**
   - **Email** (servira d'identifiant)
   - **Rôle** (voir [tableau des rôles](#3-rôles-et-accès))
   - **Mot de passe** temporaire

3. Enregistrer — l'utilisateur peut se connecter immédiatement

#### Désactiver un utilisateur

Pour bloquer l'accès sans supprimer le compte (recommandé en cas de départ) :

1. Cliquer sur l'utilisateur dans la liste
2. Cliquer sur **Désactiver**

### Gérer les groupes et droits

Les **groupes** permettent d'affiner les droits par module au-delà des rôles de base :

1. Aller dans **Groupes & Droits**
2. Créer un groupe et lui attribuer des permissions (Lire / Écrire / Supprimer) par module
3. Associer des utilisateurs au groupe

### Gérer les modules actifs

Les modules peuvent être activés ou désactivés. Le changement est **effectif immédiatement** — la barre de navigation de tous les utilisateurs du tenant est mise à jour dès leur prochain chargement de page.

> Cette gestion est réservée à l'administrateur plateforme (Innosoft Creation). Contactez le support pour toute demande d'activation ou désactivation de module.

### Workflows et statuts

Les workflows définissent les étapes et transitions autorisées (commandes, ordres de fabrication, etc.).

**Comportement par défaut** (sans workflow personnalisé) :

- *Commandes* : Brouillon → Confirmée → En production → Prête → Livrée → Facturée
- *Ordres de fabrication* : Planifié → En cours → Terminé / En pause

**Personnalisation** (via l'administrateur Innosoft) : il est possible de configurer des workflows sur-mesure avec des états et des transitions spécifiques à votre activité, y compris des restrictions par rôle.

### Champs personnalisés

Des champs supplémentaires peuvent être ajoutés aux entités (clients, commandes, produits, etc.) par l'administrateur Innosoft selon vos besoins métier.

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

Les numéros sont générés automatiquement :

- Factures : `FAC-AAAA-XXXX`
- Commandes : `CMD-AAAA-XXXX`
- Bons de livraison : `BL-AAAA-XXXX`
- Ordres de fabrication : `OF-AAAA-XXXX`

### Alertes

Configurer les seuils et destinataires des alertes automatiques :

- Seuil de stock faible → notification au responsable stock
- Factures en retard → notification au comptable

---

## 19. Notifications en temps réel

Une **cloche de notification** en haut de page affiche les alertes en temps réel :

| Type | Déclencheur |
| --- | --- |
| Alerte stock | Un stock passe sous le seuil minimum |
| Statut commande | Une commande change de statut |
| OF terminé | Un ordre de fabrication passe en *Terminé* |
| Paiement reçu | Un paiement est enregistré sur une facture |

Les notifications sont également envoyées par **email** si vous êtes le responsable concerné.

---

## 20. Questions fréquentes

**Je ne vois pas un module dans le menu — est-ce normal ?**
Oui. Seuls les modules **activés** pour votre entreprise et correspondant à votre rôle sont visibles. Contactez votre administrateur si vous pensez avoir besoin d'un accès supplémentaire.

**Un module a disparu du menu depuis hier — que se passe-t-il ?**
Votre administrateur a peut-être désactivé ce module. La barre de navigation se met à jour immédiatement après chaque modification. Contactez votre administrateur pour en savoir plus.

**La commande est passée automatiquement en "Prête" — est-ce normal ?**
Oui. Quand tous les ordres de fabrication liés à une commande sont terminés, le système fait passer automatiquement la commande en statut *Prête*. C'est le comportement attendu.

**J'ai fait une erreur de saisie — comment la corriger ?**
Ouvrir l'enregistrement concerné, modifier les champs, et enregistrer. La modification est tracée dans le journal d'audit avec l'état avant/après.

**Je ne peux pas supprimer un client / fournisseur — pourquoi ?**
Un client ou fournisseur ne peut pas être supprimé s'il possède des commandes, factures ou matières premières associées. Vous pouvez le désactiver à la place.

**Je ne peux pas livrer une commande — le système bloque. Pourquoi ?**
Le système vérifie que le stock est suffisant pour toutes les lignes avant d'autoriser la livraison. Si un produit manque, un message détaille les quantités disponibles vs demandées. Lancez un OF pour produire les quantités manquantes.

**Comment récupérer mon mot de passe ?**
Contacter votre administrateur. Il peut vous attribuer un nouveau mot de passe depuis le module Administration.

**L'application est lente — que faire ?**
Vider le cache du navigateur (Ctrl+Maj+Suppr), puis actualiser la page. Si le problème persiste, contacter le support.

**Puis-je utiliser l'ERP sur téléphone ?**
Oui. L'interface est responsive et fonctionne sur tous les appareils. Sur mobile, le menu s'ouvre via le bouton (3 traits) en haut à gauche.

---

## 21. Historique des mises à jour

| Version | Date | Nouveautés |
| --- | --- | --- |
| **1.2** | Avril 2026 | Workflows configurables par tenant avec états et transitions personnalisés ; comportement par défaut documenté (brouillon → confirmée → en production → prête → livrée → facturée) ; modules désactivés masqués en temps réel dans la navigation pour tous les rôles ; champs personnalisés par entité ; passage automatique commande en "Prête" quand tous les OFs sont terminés ; bon de livraison généré automatiquement à la livraison |
| **1.1** | Avril 2026 | Charte graphique par tenant (couleurs + logo), gestion des permissions sur tous les modules (boutons masqués selon droits), module Nomenclatures BOM |
| **1.0** | Avril 2026 | Version initiale : CRM, Commandes, Production, Stock, Facturation, Recyclage, Fournisseurs, Machines, Matières premières, Logistique, Reporting, Journal d'audit |

---

Document interne GISAC — Global Invest Samoura & Co
Mis à jour par l'équipe technique Innosoft Creation — contact : `admin@innosoft.sn`
