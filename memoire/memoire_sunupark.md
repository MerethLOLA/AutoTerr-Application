# MÉMOIRE DE FIN D'ÉTUDES
## Licence en Génie Informatique

---

**Institut Supérieur d'Informatique (ISI)**

**Département Génie Informatique**

---

**Thème :**
# Étude et réalisation d'un système de gestion pour une entreprise de vente de voitures

**Cas pratique : NDIAKHA Automobile**

---

**Présenté par :** [Prénom NOM Étudiant]

**Encadreur pédagogique :** [Prénom NOM Encadreur]

**Année académique :** 2025 – 2026

---
---

## DÉDICACES

*À mes parents, pour leur amour, leur sacrifice et leur soutien sans faille tout au long de mon parcours.*

*À tous mes proches, amis et camarades de promotion qui m'ont accompagné et encouragé.*

---
---

## REMERCIEMENTS

Je tiens à adresser mes sincères remerciements à toutes les personnes qui ont contribué, de près ou de loin, à la réalisation de ce mémoire.

Mes remerciements s'adressent en premier lieu à l'équipe pédagogique de l'**Institut Supérieur d'Informatique (ISI)**, pour la qualité de la formation dispensée et pour l'encadrement dont j'ai bénéficié.

Je remercie chaleureusement mon encadreur pour sa disponibilité, ses conseils précieux et ses orientations tout au long de ce travail.

Je remercie également la direction et le personnel de **NDIAKHA Automobile**, pour leur accueil, leur disponibilité et les informations partagées lors de ma visite de terrain, ainsi que **La Sénégalaise de l'Automobile**, pour les éclairages fournis sur leurs pratiques numériques.

Enfin, je témoigne ma gratitude à ma famille et à mes camarades pour leur soutien moral constant durant cette formation.

---
---

## RÉSUMÉ

Le secteur de la vente automobile au Sénégal est en pleine croissance, mais de nombreuses entreprises du domaine continuent de gérer leurs activités sans outil numérique adapté. C'est le cas de NDIAKHA Automobile, une structure de taille modeste qui s'appuie sur WhatsApp et des tableaux Excel pour gérer ses opérations quotidiennes.

Ce mémoire présente l'étude et la réalisation de **SunuPark**, un système de gestion intégré développé pour répondre aux besoins spécifiques d'une entreprise de vente et de location de véhicules. Après une analyse des processus existants et une étude comparative des solutions du marché, un système complet a été conçu à l'aide du langage UML et développé avec **Laravel 11** (backend) et **Next.js 14** (frontend), sur une base de données **MySQL**.

SunuPark couvre l'ensemble des processus métier : gestion du catalogue, des clients, des ventes, des locations, de la facturation, du SAV, du stock de pièces, de la conformité du parc et du reporting analytique.

**Mots-clés :** Système de gestion, vente automobile, Laravel, Next.js, UML, Sénégal.

---

**ABSTRACT**

The automotive sales sector in Senegal is growing rapidly, yet many companies still manage their operations without adequate digital tools. NDIAKHA Automobile, a small-sized company, relies on WhatsApp and Excel spreadsheets to handle its daily operations.

This thesis presents the study and development of **SunuPark**, an integrated management system designed to address the specific needs of a car dealership. Following an analysis of existing processes and a comparative study of market solutions, a comprehensive system was designed using UML and developed with **Laravel 11** (backend) and **Next.js 14** (frontend), backed by a **MySQL** database.

**Keywords:** Management system, automotive sales, Laravel, Next.js, UML, Senegal.

---
---

## TABLE DES MATIÈRES

- Dédicaces
- Remerciements
- Résumé / Abstract
- Table des matières
- Liste des figures
- Liste des tableaux
- Glossaire
- **Chapitre 1 : Introduction Générale**
  - 1. Présentation de l'entreprise
  - 2. Contexte du projet
  - 3. Sujet du projet de fin de cycle
  - 4. Objectifs du projet
- **Chapitre 2 : Travaux Réalisés**
  - Travail 1 : Analyse et spécification des besoins
  - Travail 2 : Conception et modélisation de la solution
  - Travail 3 : Maquettisation et design des interfaces
  - Travail 4 : Implémentation
  - Travail 5 : Déploiement de la solution
- **Chapitre 3 : Conclusion Générale**
- Bibliographie

---
---

## LISTE DES FIGURES

Figure 2.1 : Diagramme de cas d'utilisation général
Figure 2.2 : Diagramme de cas d'utilisation – gestion des utilisateurs
Figure 2.3 : Diagramme de cas d'utilisation – gestion des véhicules
Figure 2.4 : Diagramme de cas d'utilisation – gestion des ventes
Figure 2.5 : Diagramme de cas d'utilisation – gestion de la location
Figure 2.6 : Diagramme de cas d'utilisation – gestion du SAV
Figure 2.7 : Diagramme de classe
Figure 2.8 : Diagramme de séquence – processus de vente
Figure 2.9 : Diagramme de séquence – processus de location
Figure 2.10 : Architecture générale de l'application (Laravel + Next.js)
Figure 2.11 : Architecture MVC (Laravel)
Figure 2.12 : Schéma de la base de données
Figure 2.13 : Diagramme de déploiement
Figure 2.14 : Structure du projet (backend / frontend)
Figure 2.15 : Page d'accueil
Figure 2.16 : Page catalogue des véhicules
Figure 2.17 : Page détail d'un véhicule
Figure 2.18 : Page de connexion
Figure 2.19 : Page d'inscription
Figure 2.20 : Tableau de bord administrateur
Figure 2.21 : Gestion des utilisateurs
Figure 2.22 : Gestion des véhicules
Figure 2.23 : Interface de vente
Figure 2.24 : Gestion des clients
Figure 2.25 : Gestion des tickets SAV
Figure 2.26 : Gestion des interventions atelier
Figure 2.27 : Génération de facture
Figure 2.28 : Suivi des paiements
Figure 2.29 : Gestion de la location
Figure 2.30 : Tableau de bord reporting (KPI)

---
---

## LISTE DES TABLEAUX

Tableau 1.1 : Critique de l'existant chez NDIAKHA Automobile
Tableau 1.2 : Étude comparative des solutions du marché
Tableau 2.1 : Identification des acteurs du système
Tableau 2.2 : Besoins fonctionnels
Tableau 2.3 : Besoins non fonctionnels
Tableau 2.4 : Récapitulatif des outils utilisés
Tableau 2.5 : Récapitulatif des technologies
Tableau 2.6 : Tests fonctionnels des modules
Tableau 3.1 : Bilan des objectifs du projet

---
---

## GLOSSAIRE

**ANAQSUP :** Autorité Nationale d'Assurance Qualité de l'Enseignement Supérieur, organisme chargé de l'évaluation et de l'accréditation des établissements d'enseignement supérieur au Sénégal.

**API (Application Programming Interface) :** Interface permettant la communication entre différentes applications, notamment entre le frontend et le backend.

**Authentification :** Processus permettant de vérifier l'identité d'un utilisateur (connexion).

**Autorisation :** Processus permettant de définir les droits d'accès d'un utilisateur selon son rôle.

**Backend :** Partie serveur de l'application qui gère la logique métier, les données et les traitements.

**CAMES :** Conseil Africain et Malgache pour l'Enseignement Supérieur, organisme intergouvernemental chargé de coordonner les systèmes d'enseignement supérieur en Afrique.

**Chiffre d'affaires (CA) :** Montant total des ventes réalisées par une entreprise sur une période donnée.

**CSS (Cascading Style Sheets) :** Langage utilisé pour décrire la présentation et le style des pages web (couleurs, mise en page, polices).

**CRUD (Create, Read, Update, Delete) :** Ensemble des opérations de base permettant de manipuler les données.

**DOM (Document Object Model) :** Représentation structurée d'une page web sous forme d'objets manipulables par des scripts.

**Framework :** Ensemble d'outils et de bibliothèques facilitant le développement d'applications (ex : Laravel, Next.js).

**Frontend :** Partie visible de l'application avec laquelle l'utilisateur interagit directement.

**ISI :** Institut Supérieur d'Informatique.

**KPI (Key Performance Indicator) :** Indicateur clé permettant de mesurer la performance d'une activité (ex : ventes mensuelles).

**MVC (Model-View-Controller) :** Architecture logicielle qui sépare l'application en trois composants : le modèle (données), la vue (interface) et le contrôleur (logique).

**Next.js :** Framework JavaScript basé sur React permettant de créer des applications web performantes avec rendu côté serveur (SSR) et génération statique.

**ORM (Object Relational Mapping) :** Technique permettant de manipuler une base de données relationnelle à travers des objets (ex : Eloquent dans Laravel).

**PHP (Hypertext Preprocessor) :** Langage de programmation côté serveur utilisé pour le développement d'applications web dynamiques.

**SAV (Service Après-Vente) :** Ensemble des services fournis après la vente d'un produit, notamment la maintenance, la réparation et l'assistance.

**SGBDR (Système de Gestion de Base de Données Relationnelle) :** Logiciel permettant de stocker, organiser et manipuler des données sous forme de tables reliées entre elles.

**SQL (Structured Query Language) :** Langage utilisé pour interagir avec une base de données relationnelle (création, lecture, modification, suppression).

**UML (Unified Modeling Language) :** Langage de modélisation permettant de représenter visuellement les systèmes informatiques (diagrammes).

---
---

# CHAPITRE 1 : INTRODUCTION GÉNÉRALE

## 1. Présentation de l'entreprise

### 1.1 NDIAKHA Automobile

NDIAKHA Automobile est une entreprise sénégalaise spécialisée dans la commercialisation de véhicules, principalement des voitures d'occasion et de collection. Fondée il y a une dizaine d'années et implantée à Dakar, elle s'est progressivement constitué une clientèle fidèle grâce à la qualité de ses véhicules et à la proximité de son service.

L'entreprise compte entre quatre et cinq employés, dont le gérant, un ou deux commerciaux et un responsable administratif. Elle gère un parc de véhicules variés et traite régulièrement des transactions avec des clients particuliers et professionnels. Malgré son ancienneté et son expérience dans le domaine, la structure n'utilise aucun logiciel de gestion dédié à ses activités.

**Activités principales :**
- Acquisition de véhicules auprès de fournisseurs locaux et internationaux
- Stockage, préparation et mise en conformité des véhicules
- Commercialisation (vente et location) auprès des clients
- Suivi administratif et financier des transactions
- Service après-vente

### 1.2 La Sénégalaise de l'Automobile

Dans le cadre de notre étude de terrain, nous avons également visité **La Sénégalaise de l'Automobile**, une entreprise de plus grande envergure du même secteur. Comptant environ cinquante employés, elle a adopté le CRM **HubSpot** pour la gestion de ses activités commerciales et ne rencontre aucun problème majeur avec cette solution. Cette visite nous a permis d'évaluer l'impact d'un outil numérique adapté sur la performance d'une entreprise du secteur.

## 2. Contexte du projet

La transformation numérique s'impose aujourd'hui comme un levier stratégique pour les entreprises, quelle que soit leur taille. Au Sénégal, le marché de l'automobile est en croissance continue, portée par l'essor de la classe moyenne et le développement du marché de la location. Dans ce contexte, la gestion informatisée des opérations constitue un avantage compétitif majeur.

Lors de notre visite chez NDIAKHA Automobile, nous avons constaté que la totalité des opérations — suivi du parc, gestion des clients, enregistrement des ventes, facturation, service après-vente — est assurée à l'aide de deux outils uniquement : **WhatsApp** pour les communications et les échanges d'informations, et des **feuilles de calcul Excel** pour certains enregistrements. Ces outils, bien qu'accessibles, génèrent des problèmes significatifs : perte d'information, absence de traçabilité, impossibilité d'analyser les performances et risque élevé d'erreurs.

En parallèle, la solution HubSpot utilisée par La Sénégalaise de l'Automobile, bien qu'efficace pour une grande structure, s'avère inadaptée pour une TPE comme NDIAKHA Automobile en raison de son coût élevé et de sa complexité. Il existe donc un besoin réel pour une solution sur mesure, adaptée au contexte local et aux réalités des petites entreprises du secteur.

C'est dans ce contexte que s'inscrit le développement de **SunuPark**, un système de gestion intégré conçu spécifiquement pour une entreprise de vente et de location de véhicules.

## 3. Sujet du projet de fin de cycle

Le sujet de ce projet de fin de cycle est le suivant :

**« Étude et réalisation d'un système de gestion pour une entreprise de vente de voitures »**

Ce projet consiste à concevoir et développer une application web complète permettant à une entreprise automobile de gérer l'ensemble de ses processus métier de manière centralisée, sécurisée et efficace. Le système couvre la gestion du catalogue de véhicules, des clients, des ventes, des locations, de la facturation, du service après-vente (SAV), du stock de pièces de rechange, de la conformité du parc (assurances, entretiens, contrôles techniques) et du reporting analytique.

L'application est développée sous la forme d'une architecture web découplée : un backend API en **Laravel 11** (PHP) et un frontend en **Next.js 14** (React/TypeScript), avec une base de données **MySQL**.

## 4. Objectifs du projet

Les objectifs assignés à ce projet de fin de cycle sont les suivants :

**Objectif 1 :** Analyser les processus métier de l'entreprise NDIAKHA Automobile et identifier les dysfonctionnements liés à l'absence d'outil numérique.

**Objectif 2 :** Étudier les solutions existantes sur le marché et évaluer leur adéquation avec les besoins identifiés.

**Objectif 3 :** Spécifier les besoins fonctionnels et non fonctionnels du système à développer.

**Objectif 4 :** Concevoir le système à l'aide du langage de modélisation UML (diagrammes de cas d'utilisation, de classes et de séquence).

**Objectif 5 :** Implémenter une application web complète, sécurisée et performante couvrant l'ensemble des modules identifiés.

**Objectif 6 :** Déployer la solution dans un environnement de production via la conteneurisation Docker.

---
---

# CHAPITRE 2 : TRAVAUX RÉALISÉS

## Travail 1 : Analyse et spécification des besoins

### 1.1 Analyse de l'existant

#### 1.1.1 Description des outils en place

L'étude de terrain menée chez NDIAKHA Automobile a permis de dresser un état des lieux précis des pratiques actuelles. L'entreprise n'utilise aucun logiciel de gestion dédié. Ses opérations reposent sur deux outils :

- **WhatsApp :** Utilisé comme canal de communication principal entre employés, avec fournisseurs et clients. Les informations sur les véhicules (photos, prix, disponibilité) circulent via des groupes de messagerie. Les confirmations de vente et les demandes de renseignements transitent également par ce canal.

- **Tableurs Excel :** Certaines informations (liste des véhicules, prix) sont consignées dans des feuilles de calcul mises à jour manuellement et non partagées en temps réel.

En comparaison, La Sénégalaise de l'Automobile utilise **HubSpot CRM**, une plateforme de gestion de la relation client de renommée mondiale, qui lui permet de centraliser sa base clients, de suivre son pipeline commercial et d'analyser ses performances. Bien que cette solution soit efficace pour une grande structure, elle présente des limites pour une TPE : coût mensuel élevé (plusieurs centaines de dollars), complexité de paramétrage, caractère généraliste (non spécialisé automobile) et hébergement des données sur des serveurs étrangers.

#### 1.1.2 Critique de l'existant

L'analyse des pratiques de NDIAKHA Automobile révèle plusieurs dysfonctionnements majeurs (Tableau 1.1) :

**Tableau 1.1 : Critique de l'existant chez NDIAKHA Automobile**

| Critère | Situation actuelle | Impact sur l'activité |
|---|---|---|
| Centralisation des données | Inexistante (WhatsApp + Excel non partagé) | Perte d'informations fréquente |
| Traçabilité des opérations | Absente | Litiges non documentés, historique inaccessible |
| Gestion financière | Manuelle, sans automatisation | Erreurs de calcul, impayés non détectés |
| Suivi du parc véhicules | Partiel (Excel non mis à jour) | Disponibilité mal maîtrisée |
| Reporting et analyse | Absent | Décisions prises sans données chiffrées |
| Sécurité et pérennité des données | Très faible (données sur téléphones) | Risque de perte totale en cas de panne |

#### 1.1.3 Étude comparative des solutions du marché

**Tableau 1.2 : Étude comparative des solutions du marché**

| Solution | Points forts | Limites pour NDIAKHA |
|---|---|---|
| HubSpot CRM | Fiable, complet, moderne | Coût élevé, généraliste, non adapté au secteur auto |
| DealerSocket / AutoSoft | Spécialisé automobile | Coût prohibitif, interface en anglais, peu connu localement |
| Odoo | Modulaire, open source | Complexité de déploiement, ressources techniques importantes |
| **SunuPark (solution développée)** | Sur mesure, adapté au contexte local, complet, évolutif | Nécessite un développement initial |

Au regard de cette comparaison, le développement d'une solution sur mesure se justifie pleinement pour répondre aux besoins spécifiques de l'entreprise à un coût maîtrisé.

### 1.2 Besoins fonctionnels

Les besoins fonctionnels définissent les fonctionnalités que doit offrir le système SunuPark. Ils ont été identifiés sur la base des entretiens menés avec les responsables de l'entreprise et de l'analyse des processus existants.

**Tableau 2.1 : Identification des acteurs du système**

| Acteur | Rôle dans le système |
|---|---|
| Administrateur | Gestion des comptes utilisateurs, des rôles et de la configuration |
| Manager | Supervision de l'ensemble des activités, consultation des rapports |
| Vendeur | Gestion des clients, des ventes, des demandes en ligne |
| Technicien | Gestion des ordres de travail, des interventions SAV et du stock |
| Caissier | Enregistrement des paiements et suivi de la facturation |
| Client (portail web) | Consultation du catalogue et soumission de demandes en ligne |

**Tableau 2.2 : Besoins fonctionnels**

| Module | Fonctionnalités |
|---|---|
| Véhicules | Ajouter, modifier, supprimer, consulter les véhicules ; gérer les photos ; suivre les statuts |
| Clients | Créer et gérer les fiches clients ; consulter l'historique des transactions |
| Ventes | Enregistrer les ventes ; générer les contrats et factures ; suivre les paiements |
| Locations | Gérer réservations, états des lieux, retours ; détecter les retards |
| Facturation | Générer factures TTC avec TVA et remises ; suivre les statuts |
| SAV | Ouvrir des tickets ; assigner des responsables ; suivre les interventions |
| Atelier | Gérer les ordres de travail ; enregistrer les tâches et pièces consommées |
| Stock | Gérer les pièces détachées ; enregistrer mouvements ; déclencher alertes |
| Conformité | Suivre assurances, contrôles techniques, entretiens, carburant, sinistres |
| Reporting | Tableau de bord KPI ; rapports mensuels ; export CSV |
| Utilisateurs | Créer/gérer comptes ; assigner rôles et permissions |
| Portail client | Consulter le catalogue en ligne ; soumettre des demandes |

### 1.3 Besoins non fonctionnels

**Tableau 2.3 : Besoins non fonctionnels**

| Critère | Exigence |
|---|---|
| Sécurité | Authentification par token (Sanctum) ; gestion des permissions par rôle ; protection contre les injections SQL et XSS |
| Performance | Temps de réponse < 2 secondes pour les opérations courantes ; mise en cache des données fréquentes |
| Disponibilité | Application accessible 24h/24, 7j/7 |
| Ergonomie | Interface intuitive, ne nécessitant pas de formation longue |
| Compatibilité | Fonctionnel sur les navigateurs modernes (Chrome, Firefox, Edge, Safari) |
| Maintenabilité | Code structuré, architecture modulaire, évolutivité facilitée |
| Responsive | Interface adaptée aux différentes tailles d'écran (ordinateur, tablette) |

---

## Travail 2 : Conception et modélisation de la solution

### 2.1 Choix du langage de modélisation

Pour la conception du système SunuPark, nous avons retenu le langage **UML (Unified Modeling Language)**, langage de modélisation orienté objet reconnu et standardisé par l'OMG (Object Management Group). UML a été choisi pour les raisons suivantes :

- Il est universellement reconnu et maîtrisé dans le domaine du génie logiciel.
- Il offre une grande richesse de représentation (cas d'utilisation, classes, séquences, déploiement).
- Il favorise la communication entre les différentes parties prenantes d'un projet (développeurs, clients, encadrants).
- Il est indépendant du langage de programmation et de la plateforme technique.

Trois types de diagrammes UML ont été utilisés pour modéliser le système :
- Les **diagrammes de cas d'utilisation**, pour représenter les interactions entre les acteurs et le système.
- Le **diagramme de classes**, pour représenter la structure statique des données et leurs relations.
- Les **diagrammes de séquence**, pour représenter les échanges dynamiques lors des processus clés.

### 2.2 Diagrammes de cas d'utilisation

#### 2.2.1 Diagramme général

Le diagramme de cas d'utilisation général (Figure 2.1) représente l'ensemble des interactions entre les six acteurs du système et les fonctionnalités offertes par SunuPark. On y distingue :

- L'**Administrateur** gère les utilisateurs, les rôles et les permissions.
- Le **Manager** supervise toutes les activités et consulte les tableaux de bord et rapports.
- Le **Vendeur** gère les clients, les ventes, les demandes et le catalogue.
- Le **Technicien** gère le SAV, les ordres de travail atelier et le stock de pièces.
- Le **Caissier** enregistre les paiements et assure le suivi de la facturation.
- Le **Client** consulte le catalogue en ligne et soumet des demandes d'information, d'essai ou d'achat.

*[Figure 2.1 : Diagramme de cas d'utilisation général]*

#### 2.2.2 Diagramme de cas d'utilisation – Gestion des utilisateurs

Ce diagramme (Figure 2.2) détaille les fonctionnalités liées à la gestion des comptes. L'administrateur peut créer, modifier, activer ou désactiver des comptes et assigner des rôles. Chaque utilisateur peut modifier son profil et son mot de passe.

*[Figure 2.2 : Diagramme de cas d'utilisation – gestion des utilisateurs]*

#### 2.2.3 Diagramme de cas d'utilisation – Gestion des véhicules

Ce diagramme (Figure 2.3) présente les opérations liées au catalogue : ajout d'un véhicule avec ses caractéristiques et ses photos, modification des informations, mise à jour du statut (disponible, vendu, loué, en réparation) et suppression.

*[Figure 2.3 : Diagramme de cas d'utilisation – gestion des véhicules]*

#### 2.2.4 Diagramme de cas d'utilisation – Gestion des ventes

Ce diagramme (Figure 2.4) illustre le processus de vente : le vendeur sélectionne un client et un véhicule, renseigne le prix final, puis le système génère automatiquement la facture. Le caissier enregistre les paiements. Le manager peut consulter et superviser l'ensemble des ventes.

*[Figure 2.4 : Diagramme de cas d'utilisation – gestion des ventes]*

#### 2.2.5 Diagramme de cas d'utilisation – Gestion des locations

Ce diagramme (Figure 2.5) couvre le cycle complet d'une location : création de la réservation, enregistrement de l'état des lieux de départ, suivi en temps réel, détection des retards, enregistrement du retour et génération de la facture de location.

*[Figure 2.5 : Diagramme de cas d'utilisation – gestion des locations]*

#### 2.2.6 Diagramme de cas d'utilisation – Gestion du SAV

Ce diagramme (Figure 2.6) représente le flux de traitement d'un ticket SAV : ouverture du ticket, assignation à un responsable, création d'un ordre de travail, enregistrement des interventions et des pièces consommées, et clôture.

*[Figure 2.6 : Diagramme de cas d'utilisation – gestion du SAV]*

### 2.3 Diagramme de classes

Le diagramme de classes (Figure 2.7) représente la structure statique du système SunuPark. Les principales classes et leurs relations sont les suivantes :

- **Voiture** est la classe centrale, reliée à la quasi-totalité des autres classes (Vente, Location, Garantie, Assurance, Entretien, OrdreTravail, ImageVoiture).
- **Client** est associé aux classes Vente, Location, TicketSav et Document.
- **Vente** est liée aux classes Client, Voiture, Employe et Facturation (relation de composition).
- **Facturation** est liée soit à une Vente, soit à une Location, et est associée aux Paiements.
- **TicketSav** est lié aux classes Client, Voiture et Employe (responsable), et est composé d'Interventions et d'OrdresTravail.
- **OrdreTravail** est lié à une Voiture et un TicketSav, et est composé de Tâches et de ConsommationsPieces.
- **PieceStock** est gérée à travers les MouvementsStock et les ConsommationsPieces.
- **User** est associé à Employe et à un ensemble de Permissions via des rôles.

*[Figure 2.7 : Diagramme de classes]*

### 2.4 Diagrammes de séquence

#### 2.4.1 Diagramme de séquence – Processus de vente

Le diagramme de séquence (Figure 2.8) illustre les interactions lors d'une transaction de vente :

1. Le vendeur s'authentifie et accède au module Ventes.
2. Il sélectionne un client (existant ou nouveau) et un véhicule disponible.
3. Il renseigne le prix final et valide la vente.
4. Le système enregistre la vente, met le statut du véhicule à « vendu » et génère automatiquement la facture.
5. Le caissier enregistre le ou les paiements.
6. Le système met à jour le statut de la facture (impayée → partiellement payée → payée).

*[Figure 2.8 : Diagramme de séquence – processus de vente]*

#### 2.4.2 Diagramme de séquence – Processus de location

Le diagramme de séquence (Figure 2.9) décrit les étapes du cycle de location :

1. Création de la réservation pour un client et un véhicule, avec dates de début et de fin.
2. Enregistrement de l'état des lieux de départ à la remise des clés.
3. Suivi en cours de location ; détection automatique des retards à l'échéance.
4. Enregistrement du retour et de l'état des lieux de retour.
5. Calcul automatique du montant sur la base du tarif journalier et génération de la facture.
6. Enregistrement du paiement ; le véhicule redevient disponible.

*[Figure 2.9 : Diagramme de séquence – processus de location]*

---

## Travail 3 : Maquettisation et design des interfaces

### 3.1 Charte graphique

Avant le développement des interfaces, une charte graphique a été définie afin d'assurer la cohérence visuelle de l'ensemble de l'application. Les choix retenus sont les suivants :

- **Palette de couleurs :** Dominante gris ardoise foncé (#33475b) pour les éléments principaux, blanc (#ffffff) pour les fonds, gris clair (#f5f8fa) pour les panneaux, et une couleur d'accentuation violette (#7c3aed) pour les éléments secondaires.
- **Typographie :** Police sans-serif moderne, lisible et adaptée aux interfaces professionnelles.
- **Iconographie :** Icônes vectorielles épurées, cohérentes sur l'ensemble des modules.
- **Mise en page :** Disposition en sidebar fixe pour la navigation, contenu principal en zone scrollable, composants réutilisables (cartes, tableaux, formulaires, modales).

### 3.2 Maquettes des interfaces principales

Les maquettes ont été réalisées avant l'implémentation pour valider l'organisation des informations et le parcours utilisateur.

**Portail public :** La partie publique comprend une page d'accueil présentant l'entreprise et ses chiffres clés, une page catalogue avec filtres (marque, prix, énergie, type), et une fiche détaillée par véhicule avec galerie photos et formulaire de contact.

**Espace de connexion :** Un formulaire de connexion épuré, centré sur la page, avec saisie de l'identifiant et du mot de passe.

**Tableau de bord :** Affichage en grille de quatre indicateurs clés (KPI), suivi d'une liste d'alertes prioritaires et de graphiques d'évolution. La navigation latérale liste l'ensemble des modules accessibles selon le rôle.

**Modules de gestion :** Chaque module suit la même structure : liste paginée avec filtres en haut de page, bouton d'ajout, et accès au détail par clic sur une ligne. Les formulaires sont présentés en modal (fenêtre superposée) pour les opérations courantes.

---

## Travail 4 : Implémentation

### 4.1 Environnement technique

#### 4.1.1 Outils utilisés

**Tableau 2.4 : Récapitulatif des outils utilisés**

| Outil | Type | Rôle |
|---|---|---|
| Visual Studio Code | Logiciel | Éditeur de code principal |
| Docker Desktop | Logiciel | Conteneurisation et environnement unifié |
| Laragon | Logiciel | Serveur local de développement (Apache, MySQL, PHP) |
| Git | Logiciel | Gestion de versions du code source |
| Postman | Logiciel | Test et documentation des endpoints API |
| dbdiagram.io | Outil en ligne | Modélisation du schéma de base de données |
| StarUML | Logiciel | Modélisation UML (diagrammes de classes et séquence) |
| PC de développement | Matériel | Ordinateur Windows 10, RAM 16 Go |

#### 4.1.2 Technologies utilisées

**Tableau 2.5 : Récapitulatif des technologies**

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Backend | Laravel (PHP) | 11 | Framework API REST, logique métier |
| Frontend | Next.js (React) | 14 | Framework SPA, interfaces utilisateur |
| Langage frontend | TypeScript | 5 | Typage statique JavaScript |
| Style | Tailwind CSS | 3 | Framework CSS utilitaire |
| Base de données | MySQL | 8 | Stockage des données |
| Cache | Redis | 7 | Mise en cache tableau de bord et reporting |
| Authentification | Laravel Sanctum | 4 | Tokens d'accès API sécurisés |
| Conteneurisation | Docker / Docker Compose | — | Déploiement unifié multi-services |
| Serveur web | Nginx | — | Reverse proxy et routage |

**Laravel 11** a été choisi pour sa robustesse, son ORM Eloquent (manipulation des données via des objets PHP), son système de migrations (versionnage de la base de données), sa gestion intégrée des permissions et sa grande communauté. Laravel suit le patron MVC illustré en Figure 2.11.

**Next.js 14** a été choisi pour ses performances (rendu côté serveur SSR, optimisation automatique des images), son système de routage basé sur l'arborescence de fichiers (App Router) et son intégration native avec TypeScript, garantissant un code frontend typé et maintenable.

**Architecture générale** (Figure 2.10) : Le frontend et le backend sont deux applications indépendantes communicant via une API REST sécurisée. Cette architecture découplée offre une grande flexibilité et permet d'envisager à terme une application mobile utilisant la même API.

*[Figure 2.10 : Architecture générale de l'application (Laravel + Next.js)]*
*[Figure 2.11 : Architecture MVC (Laravel)]*

### 4.2 Réalisation des travaux applicatifs

#### 4.2.1 Création de la base de données

La base de données MySQL de SunuPark comprend **34 tables** organisées en dix groupes fonctionnels (Figure 2.12). Les migrations Laravel permettent de créer et de versionner le schéma de manière reproductible.

Les tables principales et leurs relations :
- `voitures` : table centrale référencée par la quasi-totalité des modules.
- `ventes` : relie `clients`, `voitures` et `employes`.
- `facturations` : liée à une vente **ou** à une location, reliée aux paiements.
- `tickets_sav` : relie `clients`, `voitures` et `employes`.
- `ordres_travail` : relie `voitures`, `tickets_sav` et un technicien.
- `consommations_pieces` : pivot entre `ordres_travail` et `pieces_stock`.

La Figure 2.14 illustre la structure des répertoires du projet.

*[Figure 2.12 : Schéma de la base de données]*
*[Figure 2.14 : Structure du projet (backend / frontend)]*

#### 4.2.2 Création des interfaces

**Portail public — Catalogue en ligne**

L'application dispose d'une partie publique accessible sans authentification, permettant aux clients potentiels de découvrir l'offre de l'entreprise.

- **Page d'accueil (Figure 2.15) :** Présentation de l'entreprise, chiffres clés et appel à l'action vers le catalogue. Conçue pour convertir les visiteurs en prospects.
- **Page catalogue (Figure 2.16) :** Affichage des véhicules disponibles en grille de cartes visuelles, avec filtres par marque, type, énergie et fourchette de prix.
- **Page détail d'un véhicule (Figure 2.17) :** Fiche complète avec galerie de photos, caractéristiques techniques détaillées et formulaire de demande (information, essai, reprise, achat).

**Espace de connexion**

- **Page de connexion (Figure 2.18) :** Formulaire sécurisé avec identifiant et mot de passe. Un token d'accès est généré côté serveur par Laravel Sanctum et stocké côté client.
- **Page d'inscription (Figure 2.19) :** Accessible aux administrateurs pour la création de nouveaux comptes.

**Tableau de bord (Figure 2.20)**

Le tableau de bord présente en temps réel les indicateurs clés : nombre de véhicules disponibles et vendus, chiffre d'affaires du mois, alertes prioritaires (factures impayées, locations en retard, stock critique, assurances expirant bientôt) et graphiques d'évolution.

#### 4.2.3 Création des CRUDs des modules

**Gestion des utilisateurs (Figure 2.21)**

L'administrateur accède à la liste des comptes, crée de nouveaux utilisateurs, modifie les rôles (administrateur, manager, vendeur, technicien, caissier) et active ou désactive les accès. Un système de permissions granulaires contrôle précisément les droits de chaque rôle.

**Gestion des véhicules (Figure 2.22)**

Liste paginée avec filtres avancés (marque, statut, type d'énergie, fourchette de prix). L'ajout d'un véhicule se fait via un formulaire complet couvrant les informations générales, les caractéristiques techniques (énergie, boîte, kilométrage, couleur) et les photos. Le statut du véhicule (disponible, vendu, loué, en réparation) est mis à jour automatiquement selon les opérations enregistrées.

**Gestion des clients (Figure 2.24)**

La fiche client centralise les informations personnelles et commerciales (coordonnées, pièce d'identité, type client : particulier ou professionnel), ainsi que l'historique complet des transactions (achats, locations, tickets SAV).

**Interface de vente (Figure 2.23)**

Le formulaire de vente guide le vendeur : sélection du client, du véhicule disponible, saisie du prix final et du mode de paiement. La facture est générée automatiquement à la validation. L'historique des ventes est consultable avec filtres par date, statut et vendeur.

**Gestion des tickets SAV (Figure 2.25)**

Les tickets SAV sont créés par les vendeurs suite aux réclamations clients. Chaque ticket est assigné à un responsable, priorisé (basse, normale, haute, critique) et suivi jusqu'à sa résolution. Un journal d'interventions trace chaque action réalisée (Figure 2.26).

**Génération de facture (Figure 2.27)**

Les factures sont générées automatiquement à la validation d'une vente ou d'une location. Elles intègrent les informations de l'entreprise et du client, les montants HT, la TVA (18%) et le montant TTC. Un export PDF est disponible.

**Suivi des paiements (Figure 2.28)**

Le module paiements permet d'enregistrer des règlements partiels ou totaux en différents modes (espèces, chèque, virement bancaire, mobile money). Le statut de la facture est mis à jour automatiquement (impayée → partiellement payée → payée).

**Gestion des locations (Figure 2.29)**

Le module location couvre le cycle complet : création de la réservation avec dates et tarif journalier, état des lieux de départ, suivi avec détection automatique des retards, état des lieux de retour et génération de la facture.

**Reporting et analyse (Figure 2.30)**

Le module reporting offre une vue analytique de l'exercice en cours : quatre KPIs (nombre de ventes, CA ventes, nombre de locations, CA locations), statistiques financières (encaissements du mois, factures impayées), statistiques SAV et stock, et tableaux mensuels avec histogrammes de parts. Un export CSV de l'ensemble des indicateurs est disponible.

---

## Travail 5 : Déploiement de la solution

### 5.1 Architecture de déploiement

Le déploiement de SunuPark est assuré via **Docker** et **Docker Compose**, permettant de créer un environnement unifié, reproductible et facilement déployable sur n'importe quel serveur. L'architecture de déploiement (Figure 2.13) comprend quatre conteneurs :

| Conteneur | Technologie | Rôle |
|---|---|---|
| backend | Apache + PHP 8.2 + Laravel | Serveur de l'API REST |
| frontend | Node.js + Next.js | Application web (build de production) |
| mysql | MySQL 8 | Base de données relationnelle |
| redis | Redis 7 | Cache des données (tableau de bord, reporting) |

Un **reverse proxy Nginx** assure le routage du trafic HTTP entre les conteneurs et expose l'application sur un port unique.

*[Figure 2.13 : Diagramme de déploiement]*

### 5.2 Configuration et mise en production

La configuration de l'application est externalisée dans des fichiers d'environnement (`.env`) qui définissent les paramètres de connexion à la base de données, les clés d'authentification et les URL des services. Ce mécanisme garantit la portabilité de la solution entre les environnements de développement et de production.

La mise en production s'effectue via les commandes Docker Compose, qui construisent les images, créent et démarrent les conteneurs, et exécutent les migrations de base de données.

### 5.3 Tests et validation

Des tests fonctionnels ont été réalisés pour valider le bon fonctionnement de chaque module après déploiement.

**Tableau 2.6 : Tests fonctionnels des modules**

| Module | Cas testé | Résultat |
|---|---|---|
| Authentification | Connexion avec identifiants valides | ✓ Succès |
| Authentification | Connexion avec mauvais mot de passe | ✓ Erreur affichée |
| Véhicules | Ajout d'un véhicule avec photos | ✓ Succès |
| Ventes | Création d'une vente et génération de facture | ✓ Succès |
| Paiements | Paiement partiel — mise à jour du statut | ✓ Succès |
| SAV | Ouverture de ticket et assignation | ✓ Succès |
| Stock | Déclenchement d'alerte si quantité ≤ seuil | ✓ Succès |
| Permissions | Accès refusé selon le rôle utilisateur | ✓ Succès |
| Reporting | Export CSV des données de l'exercice | ✓ Succès |
| Locations | Détection des retards de restitution | ✓ Succès |

L'ensemble des cas de test a été validé avec succès. Les tests de sécurité ont confirmé que toutes les routes API sont protégées par Sanctum (erreur 401 sans token valide) et que le contrôle des permissions est opérationnel (erreur 403 si rôle insuffisant).

---
---

# CHAPITRE 3 : CONCLUSION GÉNÉRALE

## 1. Bilan des objectifs

Ce projet de fin de cycle avait pour ambition de concevoir et de réaliser un système de gestion intégré pour une entreprise de vente de voitures. Au terme de ce travail, nous dressons le bilan suivant :

**Tableau 3.1 : Bilan des objectifs du projet**

| Objectif | Statut | Commentaire |
|---|---|---|
| Objectif 1 : Analyser les processus et identifier les dysfonctionnements | ✓ Atteint | Étude de terrain menée chez NDIAKHA Automobile avec critique complète de l'existant |
| Objectif 2 : Étudier les solutions du marché | ✓ Atteint | Comparaison de HubSpot, DealerSocket, Odoo et justification du développement sur mesure |
| Objectif 3 : Spécifier les besoins fonctionnels et non fonctionnels | ✓ Atteint | Cahier des charges complet avec identification des acteurs et des fonctionnalités |
| Objectif 4 : Concevoir le système en UML | ✓ Atteint | Diagrammes de cas d'utilisation, de classes et de séquence réalisés |
| Objectif 5 : Implémenter l'application web | ✓ Atteint | Application complète (12 modules) développée avec Laravel 11 et Next.js 14 |
| Objectif 6 : Déployer la solution via Docker | ✓ Atteint | Déploiement fonctionnel avec 4 conteneurs (backend, frontend, MySQL, Redis) |

L'ensemble des objectifs fixés au début du projet ont été atteints. SunuPark est une application web complète, sécurisée et opérationnelle, couvrant l'intégralité des processus métier d'une entreprise de vente et de location de véhicules.

## 2. Intérêts personnels

Ce projet de fin de cycle a été une expérience particulièrement enrichissante, tant sur le plan technique que sur le plan humain.

Sur le plan **technique**, il m'a permis de consolider et d'approfondir les compétences acquises tout au long de ma formation : modélisation UML, conception de bases de données relationnelles, développement full-stack (PHP/Laravel, JavaScript/TypeScript/Next.js), architecture API REST et conteneurisation Docker. C'est la première fois que j'ai conçu et développé, de bout en bout, un système d'information complet destiné à un contexte professionnel réel, ce qui a considérablement renforcé ma confiance dans mes capacités de développeur.

Sur le plan **méthodologique**, ce projet m'a appris à structurer une démarche de projet informatique : partir des besoins utilisateurs, passer par la modélisation, puis aller jusqu'à la réalisation et au déploiement. La visite de terrain chez NDIAKHA Automobile m'a également sensibilisé à l'importance de comprendre le contexte métier avant de se lancer dans la conception technique.

## 3. Intérêts pour l'entreprise

SunuPark apporte à NDIAKHA Automobile une valeur ajoutée considérable par rapport à sa situation initiale :

- **Centralisation de l'information :** Toutes les données (véhicules, clients, ventes, finances) sont désormais accessibles depuis une interface unique et sécurisée.
- **Traçabilité complète :** Chaque opération est enregistrée et horodatée, permettant de retrouver l'historique de n'importe quelle transaction.
- **Automatisation :** La génération des factures, le calcul des montants TTC, la mise à jour des statuts et les alertes sont automatiques, réduisant considérablement le risque d'erreurs manuelles.
- **Aide à la décision :** Le tableau de bord et le module de reporting fournissent des indicateurs fiables permettant au dirigeant de prendre des décisions éclairées.
- **Professionnalisation :** Le portail client en ligne renforce la visibilité de l'entreprise et améliore l'expérience client.

## 4. Perspectives

Bien que SunuPark constitue une solution complète et opérationnelle, plusieurs axes d'amélioration peuvent être envisagés pour les évolutions futures :

- **Application mobile** (React Native) pour les techniciens et commerciaux en déplacement.
- **Notifications SMS** automatiques aux clients (rappels de paiement, rendez-vous, entretiens).
- **Module comptable** avec export vers des logiciels de comptabilité.
- **Intelligence artificielle** : recommandation de véhicules basée sur l'historique client.
- **Multi-agences** : gestion de plusieurs sites ou concessionnaires depuis la même plateforme.

En définitive, ce projet démontre qu'il est possible, dans le cadre d'un travail académique de niveau Licence, de concevoir et de développer une solution numérique professionnelle répondant aux besoins concrets des entreprises sénégalaises.

---
---

# BIBLIOGRAPHIE

**Documentation technique officielle**

[1] Laravel LLC. *Laravel 11 Documentation*. Disponible sur : https://laravel.com/docs/11.x

[2] Vercel Inc. *Next.js 14 Documentation*. Disponible sur : https://nextjs.org/docs

[3] MySQL AB / Oracle. *MySQL 8.0 Reference Manual*. Disponible sur : https://dev.mysql.com/doc/refman/8.0/en

[4] Docker Inc. *Docker Documentation*. Disponible sur : https://docs.docker.com

[5] Tailwind Labs. *Tailwind CSS Documentation*. Disponible sur : https://tailwindcss.com/docs

**Ouvrages**

[6] Rumbaugh, J., Jacobson, I., Booch, G. *The Unified Modeling Language Reference Manual*, 2e éd. Addison-Wesley, 2004.

[7] Fowler, M. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.

[8] Pressman, R.S. *Software Engineering: A Practitioner's Approach*, 8e éd. McGraw-Hill, 2014.

**Solutions et plateformes étudiées**

[9] HubSpot Inc. *HubSpot CRM Platform*. Disponible sur : https://www.hubspot.com

[10] OWASP Foundation. *OWASP Top Ten — Security Risks*. Disponible sur : https://owasp.org/www-project-top-ten

---

*Fin du mémoire — SunuPark — ISI Dakar — Licence Génie Informatique — 2025-2026*
