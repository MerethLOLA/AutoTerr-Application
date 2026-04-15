CREATE DATABASE IF NOT EXISTS sunupark_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sunupark_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS etats_lieux_locations;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS consommations_pieces;
DROP TABLE IF EXISTS taches_atelier;
DROP TABLE IF EXISTS ordres_travail;
DROP TABLE IF EXISTS mouvements_stock;
DROP TABLE IF EXISTS pieces_stock;
DROP TABLE IF EXISTS interventions_sav;
DROP TABLE IF EXISTS tickets_sav;
DROP TABLE IF EXISTS garanties;
DROP TABLE IF EXISTS paiements;
DROP TABLE IF EXISTS facturations;
DROP TABLE IF EXISTS ventes;
DROP TABLE IF EXISTS image_voitures;
DROP TABLE IF EXISTS voitures;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS origines_marques;
DROP TABLE IF EXISTS types_vehicules;
DROP TABLE IF EXISTS fournisseurs;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS action_logs;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employes;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS job_batches;
DROP TABLE IF EXISTS failed_jobs;
DROP TABLE IF EXISTS cache_locks;
DROP TABLE IF EXISTS cache;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE employes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NULL,
  adresse VARCHAR(255) NULL,
  date_embauche DATE NULL,
  salaire DECIMAL(15,2) NULL,
  contrat VARCHAR(255) NULL,
  poste VARCHAR(100) NOT NULL,
  telephone VARCHAR(50) NULL,
  email VARCHAR(255) NULL UNIQUE,
  statut VARCHAR(50) NOT NULL DEFAULT 'actif',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_photo_path VARCHAR(255) NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'vendeur',
  statut VARCHAR(50) NOT NULL DEFAULT 'actif',
  theme VARCHAR(255) NOT NULL DEFAULT 'light',
  last_login TIMESTAMP NULL,
  token_expiration TIMESTAMP NULL,
  id_employe BIGINT UNSIGNED NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_employe
    FOREIGN KEY (id_employe) REFERENCES employes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
  email VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  payload LONGTEXT NOT NULL,
  last_activity INT NOT NULL,
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_last_activity (last_activity),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(100) NULL,
  description VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(100) NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_role_permission (role, permission_id),
  CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE action_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  target_type VARCHAR(255) NULL,
  target_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_action_logs_action (action),
  INDEX idx_action_logs_module (module),
  CONSTRAINT fk_action_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fournisseurs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  adresse VARCHAR(255) NULL,
  telephone VARCHAR(50) NULL,
  contact VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  lien VARCHAR(255) NULL,
  adresse_bureau VARCHAR(255) NULL,
  pays_origine VARCHAR(100) NULL,
  vehicule_fournis TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE types_vehicules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  type_gasoil VARCHAR(100) NULL,
  type_boite VARCHAR(100) NULL,
  carburant VARCHAR(100) NULL,
  description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE origines_marques (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NULL,
  adresse VARCHAR(255) NULL,
  contact VARCHAR(255) NULL,
  telephone VARCHAR(50) NULL,
  email VARCHAR(255) NULL UNIQUE,
  piece_identite VARCHAR(100) NULL,
  numero_piece VARCHAR(100) NULL,
  numero_piece2 VARCHAR(100) NULL,
  type_client VARCHAR(100) NULL,
  classe VARCHAR(100) NULL,
  raison_sociale VARCHAR(255) NULL,
  numero_siret VARCHAR(100) NULL,
  date_naissance DATE NULL,
  id_vendeur_attribue BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_clients_vendeur
    FOREIGN KEY (id_vendeur_attribue) REFERENCES employes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE voitures (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  marque VARCHAR(100) NOT NULL,
  modele VARCHAR(100) NOT NULL,
  annee SMALLINT UNSIGNED NULL,
  couleur VARCHAR(50) NULL,
  prix DECIMAL(15,2) NOT NULL,
  kilometrage INT UNSIGNED NULL,
  numero_chassis VARCHAR(100) NOT NULL UNIQUE,
  date_acquisition DATE NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'disponible',
  etat VARCHAR(50) NULL,
  energie VARCHAR(50) NULL,
  type_boite VARCHAR(50) NULL,
  type_vehicule_id BIGINT UNSIGNED NULL,
  origine_marque_id BIGINT UNSIGNED NULL,
  id_fournisseur BIGINT UNSIGNED NULL,
  description TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_voitures_type
    FOREIGN KEY (type_vehicule_id) REFERENCES types_vehicules(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_voitures_origine
    FOREIGN KEY (origine_marque_id) REFERENCES origines_marques(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_voitures_fournisseur
    FOREIGN KEY (id_fournisseur) REFERENCES fournisseurs(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE image_voitures (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_voiture BIGINT UNSIGNED NOT NULL,
  chemin VARCHAR(255) NOT NULL,
  vue VARCHAR(100) NULL,
  description TEXT NULL,
  largeur INT UNSIGNED NULL,
  hauteur INT UNSIGNED NULL,
  taille BIGINT UNSIGNED NULL,
  legible TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_image_voitures_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ventes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_vente VARCHAR(100) NOT NULL UNIQUE,
  date_vente DATE NOT NULL,
  id_client BIGINT UNSIGNED NOT NULL,
  id_voiture BIGINT UNSIGNED NOT NULL,
  prix_final DECIMAL(15,2) NOT NULL,
  mode_paiement VARCHAR(100) NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  id_employe BIGINT UNSIGNED NOT NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ventes_client
    FOREIGN KEY (id_client) REFERENCES clients(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ventes_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_ventes_employe
    FOREIGN KEY (id_employe) REFERENCES employes(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE facturations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_facture VARCHAR(100) NOT NULL UNIQUE,
  date_facture DATE NOT NULL,
  mode_livraison VARCHAR(100) NULL,
  montant DECIMAL(15,2) NULL,
  remise DECIMAL(15,2) NULL,
  montant_ht DECIMAL(15,2) NOT NULL,
  taux_tva DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  montant_ttc DECIMAL(15,2) NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'impayee',
  date_echeance DATE NULL,
  observations TEXT NULL,
  id_vente BIGINT UNSIGNED NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_facturations_vente
    FOREIGN KEY (id_vente) REFERENCES ventes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paiements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  mode_paiement VARCHAR(100) NOT NULL,
  montant DECIMAL(15,2) NOT NULL,
  reste DECIMAL(15,2) NULL,
  id_facture BIGINT UNSIGNED NULL,
  id_vente BIGINT UNSIGNED NOT NULL,
  id_client BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_paiements_facture
    FOREIGN KEY (id_facture) REFERENCES facturations(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_paiements_vente
    FOREIGN KEY (id_vente) REFERENCES ventes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_paiements_client
    FOREIGN KEY (id_client) REFERENCES clients(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE garanties (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_voiture BIGINT UNSIGNED NOT NULL UNIQUE,
  duree_garantie INT UNSIGNED NULL,
  type_garantie VARCHAR(100) NULL,
  date_debut DATE NULL,
  date_fin DATE NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_garanties_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tickets_sav (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_ticket VARCHAR(100) NOT NULL UNIQUE,
  id_client BIGINT UNSIGNED NOT NULL,
  id_voiture BIGINT UNSIGNED NOT NULL,
  id_responsable BIGINT UNSIGNED NOT NULL,
  id_garantie BIGINT UNSIGNED NULL,
  objet VARCHAR(255) NOT NULL,
  description TEXT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'ouvert',
  priorite VARCHAR(50) NOT NULL DEFAULT 'normale',
  date_ouverture TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_resolution TIMESTAMP NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tickets_sav_statut (statut),
  CONSTRAINT fk_tickets_sav_client
    FOREIGN KEY (id_client) REFERENCES clients(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tickets_sav_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tickets_sav_responsable
    FOREIGN KEY (id_responsable) REFERENCES employes(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_tickets_sav_garantie
    FOREIGN KEY (id_garantie) REFERENCES garanties(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interventions_sav (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ticket_sav BIGINT UNSIGNED NOT NULL,
  id_employe BIGINT UNSIGNED NULL,
  description TEXT NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours',
  temps_passe_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  date_intervention TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_interventions_sav_statut (statut),
  CONSTRAINT fk_interventions_ticket
    FOREIGN KEY (id_ticket_sav) REFERENCES tickets_sav(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_interventions_employe
    FOREIGN KEY (id_employe) REFERENCES employes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pieces_stock (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(100) NOT NULL UNIQUE,
  designation VARCHAR(255) NOT NULL,
  description TEXT NULL,
  prix_unitaire DECIMAL(15,2) NOT NULL,
  quantite_stock INT UNSIGNED NOT NULL DEFAULT 0,
  seuil_alerte INT UNSIGNED NOT NULL DEFAULT 0,
  id_fournisseur BIGINT UNSIGNED NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'actif',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pieces_stock_statut (statut),
  CONSTRAINT fk_pieces_stock_fournisseur
    FOREIGN KEY (id_fournisseur) REFERENCES fournisseurs(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mouvements_stock (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_piece_stock BIGINT UNSIGNED NOT NULL,
  type_mouvement VARCHAR(50) NOT NULL,
  quantite INT UNSIGNED NOT NULL,
  source_mouvement VARCHAR(100) NULL,
  reference_source VARCHAR(255) NULL,
  observations TEXT NULL,
  date_mouvement TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mouvements_stock_type (type_mouvement),
  INDEX idx_mouvements_stock_date (date_mouvement),
  CONSTRAINT fk_mouvements_piece
    FOREIGN KEY (id_piece_stock) REFERENCES pieces_stock(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ordres_travail (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_ot VARCHAR(100) NOT NULL UNIQUE,
  id_voiture BIGINT UNSIGNED NOT NULL,
  id_ticket_sav BIGINT UNSIGNED NULL,
  description TEXT NOT NULL,
  priorite VARCHAR(50) NOT NULL DEFAULT 'normale',
  deadline TIMESTAMP NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'ouvert',
  id_technicien BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ordres_travail_priorite (priorite),
  INDEX idx_ordres_travail_deadline (deadline),
  INDEX idx_ordres_travail_statut (statut),
  CONSTRAINT fk_ordres_travail_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ordres_travail_ticket
    FOREIGN KEY (id_ticket_sav) REFERENCES tickets_sav(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_ordres_travail_technicien
    FOREIGN KEY (id_technicien) REFERENCES employes(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE taches_atelier (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ordre_travail BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'a_faire',
  temps_passe_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_taches_atelier_statut (statut),
  CONSTRAINT fk_taches_atelier_ordre
    FOREIGN KEY (id_ordre_travail) REFERENCES ordres_travail(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consommations_pieces (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ordre_travail BIGINT UNSIGNED NOT NULL,
  id_piece_stock BIGINT UNSIGNED NOT NULL,
  quantite INT UNSIGNED NOT NULL,
  date_consommation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_consommations_ordre
    FOREIGN KEY (id_ordre_travail) REFERENCES ordres_travail(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_consommations_piece
    FOREIGN KEY (id_piece_stock) REFERENCES pieces_stock(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_location VARCHAR(100) NOT NULL UNIQUE,
  id_client BIGINT UNSIGNED NOT NULL,
  id_voiture BIGINT UNSIGNED NOT NULL,
  date_debut TIMESTAMP NOT NULL,
  date_fin TIMESTAMP NOT NULL,
  date_retour_effective TIMESTAMP NULL,
  tarif_journalier DECIMAL(15,2) NOT NULL,
  caution DECIMAL(15,2) NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'planifiee',
  observations TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_locations_date_debut (date_debut),
  INDEX idx_locations_date_fin (date_fin),
  INDEX idx_locations_statut (statut),
  CONSTRAINT fk_locations_client
    FOREIGN KEY (id_client) REFERENCES clients(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_locations_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE etats_lieux_locations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_location BIGINT UNSIGNED NOT NULL,
  type_etat VARCHAR(50) NOT NULL,
  description TEXT NULL,
  chemin_photo VARCHAR(255) NULL,
  date_etat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_etats_lieux_type (type_etat),
  CONSTRAINT fk_etats_lieux_location
    FOREIGN KEY (id_location) REFERENCES locations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_vente BIGINT UNSIGNED NULL,
  id_client BIGINT UNSIGNED NULL,
  id_employe BIGINT UNSIGNED NULL,
  id_voiture BIGINT UNSIGNED NULL,
  type_document VARCHAR(100) NOT NULL,
  date_document DATE NULL,
  numero_document VARCHAR(100) NULL,
  date_production DATE NULL,
  date_expiration DATE NULL,
  chemin_fichier VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_vente
    FOREIGN KEY (id_vente) REFERENCES ventes(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_documents_client
    FOREIGN KEY (id_client) REFERENCES clients(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_documents_employe
    FOREIGN KEY (id_employe) REFERENCES employes(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_documents_voiture
    FOREIGN KEY (id_voiture) REFERENCES voitures(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cache (
  `key` VARCHAR(255) PRIMARY KEY,
  value MEDIUMTEXT NOT NULL,
  expiration INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cache_locks (
  `key` VARCHAR(255) PRIMARY KEY,
  owner VARCHAR(255) NOT NULL,
  expiration INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload LONGTEXT NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL,
  reserved_at INT UNSIGNED NULL,
  available_at INT UNSIGNED NOT NULL,
  created_at INT UNSIGNED NOT NULL,
  INDEX idx_jobs_queue (queue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_batches (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_jobs INT NOT NULL,
  pending_jobs INT NOT NULL,
  failed_jobs INT NOT NULL,
  failed_job_ids LONGTEXT NOT NULL,
  options MEDIUMTEXT NULL,
  cancelled_at INT NULL,
  created_at INT NOT NULL,
  finished_at INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE failed_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL UNIQUE,
  connection TEXT NOT NULL,
  queue TEXT NOT NULL,
  payload LONGTEXT NOT NULL,
  exception LONGTEXT NOT NULL,
  failed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (nom, type, description) VALUES
('create_vente', 'vente', 'Creer une vente'),
('manage_ventes', 'vente', 'Gerer les ventes'),
('view_clients', 'client', 'Consulter les clients'),
('manage_sav', 'sav', 'Gerer le service apres-vente'),
('create_ticket', 'sav', 'Creer un ticket SAV'),
('manage_atelier', 'atelier', 'Gerer l atelier'),
('view_stock', 'stock', 'Consulter le stock'),
('assign_taches', 'atelier', 'Assigner les taches'),
('manage_stock', 'stock', 'Gerer le stock'),
('view_fournisseurs', 'fournisseur', 'Consulter les fournisseurs'),
('view_paiements', 'paiement', 'Consulter les paiements'),
('manage_recouvrement', 'paiement', 'Gerer le recouvrement'),
('manage_location', 'location', 'Gerer la location'),
('view_voitures', 'voiture', 'Consulter les voitures');

INSERT INTO role_permissions (role, permission_id)
SELECT 'administrateur', id FROM permissions;

INSERT INTO role_permissions (role, permission_id)
SELECT 'vendeur', id FROM permissions
WHERE nom IN ('create_vente', 'manage_ventes', 'view_clients', 'view_voitures', 'view_paiements');

INSERT INTO role_permissions (role, permission_id)
SELECT 'responsable_sav', id FROM permissions
WHERE nom IN ('manage_sav', 'create_ticket', 'view_clients', 'view_voitures');

INSERT INTO role_permissions (role, permission_id)
SELECT 'chef_atelier', id FROM permissions
WHERE nom IN ('manage_atelier', 'assign_taches', 'view_stock');

INSERT INTO role_permissions (role, permission_id)
SELECT 'agent_stock', id FROM permissions
WHERE nom IN ('manage_stock', 'view_stock', 'view_fournisseurs');

INSERT INTO role_permissions (role, permission_id)
SELECT 'agent_recouvrement', id FROM permissions
WHERE nom IN ('view_paiements', 'manage_recouvrement', 'view_clients');

INSERT INTO role_permissions (role, permission_id)
SELECT 'responsable_location', id FROM permissions
WHERE nom IN ('manage_location', 'view_voitures', 'view_clients');

INSERT INTO types_vehicules (nom, type_gasoil, type_boite, carburant, description) VALUES
('SUV', 'Diesel', 'Automatique', 'Diesel', 'Vehicule utilitaire sport'),
('Berline', 'Essence', 'Manuelle', 'Essence', 'Voiture de tourisme'),
('Citadine', 'Essence', 'Manuelle', 'Essence', 'Vehicule compact'),
('Utilitaire', 'Diesel', 'Manuelle', 'Diesel', 'Vehicule de transport'),
('Electrique', NULL, 'Automatique', 'Electrique', 'Vehicule electrique'),
('Hybride', NULL, 'Automatique', 'Hybride', 'Vehicule hybride');

INSERT INTO origines_marques (nom, description) VALUES
('France', 'Vehicule importe de France'),
('Japon', 'Vehicule importe du Japon'),
('Dubai', 'Vehicule importe de Dubai'),
('Chine', 'Vehicule importe de Chine'),
('Senegal', 'Vehicule distribue localement');



CREATE DATABASE IF NOT EXISTS sunupark_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP USER IF EXISTS 'sunupark_user'@'localhost';
DROP USER IF EXISTS 'sunupark_user'@'127.0.0.1';

CREATE USER 'sunupark_user'@'localhost' IDENTIFIED BY 'p@sser123';
CREATE USER 'sunupark_user'@'127.0.0.1' IDENTIFIED BY 'p@sser123';

GRANT ALL PRIVILEGES ON sunupark_db.* TO 'sunupark_user'@'localhost';
GRANT ALL PRIVILEGES ON sunupark_db.* TO 'sunupark_user'@'127.0.0.1';



                                         USE `sunupark_db`;

CREATE TABLE `tickets_sav` (
                               `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                               `reference_ticket` VARCHAR(255) NOT NULL,
                               `id_client` BIGINT UNSIGNED NOT NULL,
                               `id_voiture` BIGINT UNSIGNED NOT NULL,
                               `id_responsable` BIGINT UNSIGNED NOT NULL,
                               `id_garantie` BIGINT UNSIGNED NULL,
                               `objet` VARCHAR(255) NOT NULL,
                               `description` TEXT NULL,
                               `statut` VARCHAR(255) NOT NULL DEFAULT 'ouvert',
                               `priorite` VARCHAR(255) NOT NULL DEFAULT 'normale',
                               `date_ouverture` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               `date_resolution` TIMESTAMP NULL DEFAULT NULL,
                               `created_at` TIMESTAMP NULL DEFAULT NULL,
                               `updated_at` TIMESTAMP NULL DEFAULT NULL,
                               PRIMARY KEY (`id`),
                               UNIQUE KEY `tickets_sav_reference_ticket_unique` (`reference_ticket`),
                               KEY `tickets_sav_statut_index` (`statut`),
                               KEY `tickets_sav_id_client_foreign` (`id_client`),
                               KEY `tickets_sav_id_voiture_foreign` (`id_voiture`),
                               KEY `tickets_sav_id_responsable_foreign` (`id_responsable`),
                               KEY `tickets_sav_id_garantie_foreign` (`id_garantie`),
                               CONSTRAINT `tickets_sav_id_client_foreign`
                                   FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`)
                                       ON DELETE CASCADE,
                               CONSTRAINT `tickets_sav_id_voiture_foreign`
                                   FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`)
                                       ON DELETE CASCADE,
                               CONSTRAINT `tickets_sav_id_responsable_foreign`
                                   FOREIGN KEY (`id_responsable`) REFERENCES `employes` (`id`)
                                       ON DELETE RESTRICT,
                               CONSTRAINT `tickets_sav_id_garantie_foreign`
                                   FOREIGN KEY (`id_garantie`) REFERENCES `garanties` (`id`)
                                       ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `interventions_sav` (
                                     `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                     `id_ticket_sav` BIGINT UNSIGNED NOT NULL,
                                     `id_employe` BIGINT UNSIGNED NULL,
                                     `description` TEXT NOT NULL,
                                     `statut` VARCHAR(255) NOT NULL DEFAULT 'en_cours',
                                     `temps_passe_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
                                     `date_intervention` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     `created_at` TIMESTAMP NULL DEFAULT NULL,
                                     `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                     PRIMARY KEY (`id`),
                                     KEY `interventions_sav_id_ticket_sav_foreign` (`id_ticket_sav`),
                                     KEY `interventions_sav_id_employe_foreign` (`id_employe`),
                                     KEY `interventions_sav_statut_index` (`statut`),
                                     CONSTRAINT `interventions_sav_id_ticket_sav_foreign`
                                         FOREIGN KEY (`id_ticket_sav`) REFERENCES `tickets_sav` (`id`)
                                             ON DELETE CASCADE,
                                     CONSTRAINT `interventions_sav_id_employe_foreign`
                                         FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`)
                                             ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pieces_stock` (
                                `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                `reference` VARCHAR(255) NOT NULL,
                                `designation` VARCHAR(255) NOT NULL,
                                `description` TEXT NULL,
                                `prix_unitaire` DECIMAL(15,2) NOT NULL,
                                `quantite_stock` INT UNSIGNED NOT NULL DEFAULT 0,
                                `seuil_alerte` INT UNSIGNED NOT NULL DEFAULT 0,
                                `id_fournisseur` BIGINT UNSIGNED NULL,
                                `statut` VARCHAR(255) NOT NULL DEFAULT 'actif',
                                `created_at` TIMESTAMP NULL DEFAULT NULL,
                                `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `pieces_stock_reference_unique` (`reference`),
                                KEY `pieces_stock_id_fournisseur_foreign` (`id_fournisseur`),
                                KEY `pieces_stock_statut_index` (`statut`),
                                CONSTRAINT `pieces_stock_id_fournisseur_foreign`
                                    FOREIGN KEY (`id_fournisseur`) REFERENCES `fournisseurs` (`id`)
                                        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mouvements_stock` (
                                    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                    `id_piece_stock` BIGINT UNSIGNED NOT NULL,
                                    `type_mouvement` VARCHAR(255) NOT NULL,
                                    `quantite` INT UNSIGNED NOT NULL,
                                    `source_mouvement` VARCHAR(255) NULL,
                                    `reference_source` VARCHAR(255) NULL,
                                    `observations` TEXT NULL,
                                    `date_mouvement` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                    `created_at` TIMESTAMP NULL DEFAULT NULL,
                                    `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                    PRIMARY KEY (`id`),
                                    KEY `mouvements_stock_id_piece_stock_foreign` (`id_piece_stock`),
                                    KEY `mouvements_stock_type_mouvement_index` (`type_mouvement`),
                                    KEY `mouvements_stock_date_mouvement_index` (`date_mouvement`),
                                    CONSTRAINT `mouvements_stock_id_piece_stock_foreign`
                                        FOREIGN KEY (`id_piece_stock`) REFERENCES `pieces_stock` (`id`)
                                            ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ordres_travail` (
                                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                  `reference_ot` VARCHAR(255) NOT NULL,
                                  `id_voiture` BIGINT UNSIGNED NOT NULL,
                                  `id_ticket_sav` BIGINT UNSIGNED NULL,
                                  `description` TEXT NOT NULL,
                                  `priorite` VARCHAR(255) NOT NULL DEFAULT 'normale',
                                  `deadline` TIMESTAMP NULL DEFAULT NULL,
                                  `statut` VARCHAR(255) NOT NULL DEFAULT 'ouvert',
                                  `id_technicien` BIGINT UNSIGNED NULL,
                                  `created_at` TIMESTAMP NULL DEFAULT NULL,
                                  `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                  PRIMARY KEY (`id`),
                                  UNIQUE KEY `ordres_travail_reference_ot_unique` (`reference_ot`),
                                  KEY `ordres_travail_id_voiture_foreign` (`id_voiture`),
                                  KEY `ordres_travail_id_ticket_sav_foreign` (`id_ticket_sav`),
                                  KEY `ordres_travail_priorite_index` (`priorite`),
                                  KEY `ordres_travail_deadline_index` (`deadline`),
                                  KEY `ordres_travail_statut_index` (`statut`),
                                  KEY `ordres_travail_id_technicien_foreign` (`id_technicien`),
                                  CONSTRAINT `ordres_travail_id_voiture_foreign`
                                      FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`)
                                          ON DELETE CASCADE,
                                  CONSTRAINT `ordres_travail_id_ticket_sav_foreign`
                                      FOREIGN KEY (`id_ticket_sav`) REFERENCES `tickets_sav` (`id`)
                                          ON DELETE SET NULL,
                                  CONSTRAINT `ordres_travail_id_technicien_foreign`
                                      FOREIGN KEY (`id_technicien`) REFERENCES `employes` (`id`)
                                          ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `taches_atelier` (
                                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                  `id_ordre_travail` BIGINT UNSIGNED NOT NULL,
                                  `description` TEXT NOT NULL,
                                  `statut` VARCHAR(255) NOT NULL DEFAULT 'a_faire',
                                  `temps_passe_minutes` INT UNSIGNED NOT NULL DEFAULT 0,
                                  `created_at` TIMESTAMP NULL DEFAULT NULL,
                                  `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                  PRIMARY KEY (`id`),
                                  KEY `taches_atelier_id_ordre_travail_foreign` (`id_ordre_travail`),
                                  KEY `taches_atelier_statut_index` (`statut`),
                                  CONSTRAINT `taches_atelier_id_ordre_travail_foreign`
                                      FOREIGN KEY (`id_ordre_travail`) REFERENCES `ordres_travail` (`id`)
                                          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consommations_pieces` (
                                        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                        `id_ordre_travail` BIGINT UNSIGNED NOT NULL,
                                        `id_piece_stock` BIGINT UNSIGNED NOT NULL,
                                        `quantite` INT UNSIGNED NOT NULL,
                                        `date_consommation` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                        `created_at` TIMESTAMP NULL DEFAULT NULL,
                                        `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                        PRIMARY KEY (`id`),
                                        KEY `consommations_pieces_id_ordre_travail_foreign` (`id_ordre_travail`),
                                        KEY `consommations_pieces_id_piece_stock_foreign` (`id_piece_stock`),
                                        CONSTRAINT `consommations_pieces_id_ordre_travail_foreign`
                                            FOREIGN KEY (`id_ordre_travail`) REFERENCES `ordres_travail` (`id`)
                                                ON DELETE CASCADE,
                                        CONSTRAINT `consommations_pieces_id_piece_stock_foreign`
                                            FOREIGN KEY (`id_piece_stock`) REFERENCES `pieces_stock` (`id`)
                                                ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `locations` (
                             `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                             `reference_location` VARCHAR(255) NOT NULL,
                             `id_client` BIGINT UNSIGNED NOT NULL,
                             `id_voiture` BIGINT UNSIGNED NOT NULL,
                             `date_debut` TIMESTAMP NOT NULL,
                             `date_fin_prevue` TIMESTAMP NOT NULL,
                             `date_fin_reelle` TIMESTAMP NULL DEFAULT NULL,
                             `montant_journalier` DECIMAL(15,2) NOT NULL,
                             `caution` DECIMAL(15,2) NULL DEFAULT NULL,
                             `kilometrage_depart` INT UNSIGNED NOT NULL DEFAULT 0,
                             `kilometrage_retour` INT UNSIGNED NULL DEFAULT NULL,
                             `statut` VARCHAR(255) NOT NULL DEFAULT 'en_cours',
                             `observations` TEXT NULL,
                             `created_at` TIMESTAMP NULL DEFAULT NULL,
                             `updated_at` TIMESTAMP NULL DEFAULT NULL,
                             PRIMARY KEY (`id`),
                             UNIQUE KEY `locations_reference_location_unique` (`reference_location`),
                             KEY `locations_id_client_foreign` (`id_client`),
                             KEY `locations_id_voiture_foreign` (`id_voiture`),
                             KEY `locations_statut_index` (`statut`),
                             CONSTRAINT `locations_id_client_foreign`
                                 FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`)
                                     ON DELETE CASCADE,
                             CONSTRAINT `locations_id_voiture_foreign`
                                 FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`)
                                     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `etats_lieux_locations` (
                                         `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                                         `id_location` BIGINT UNSIGNED NOT NULL,
                                         `type_etat_lieu` VARCHAR(255) NOT NULL,
                                         `kilometrage` INT UNSIGNED NOT NULL DEFAULT 0,
                                         `niveau_carburant` VARCHAR(255) NULL,
                                         `etat_general` TEXT NULL,
                                         `observations` TEXT NULL,
                                         `date_etat_lieu` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         `created_at` TIMESTAMP NULL DEFAULT NULL,
                                         `updated_at` TIMESTAMP NULL DEFAULT NULL,
                                         PRIMARY KEY (`id`),
                                         KEY `etats_lieux_locations_id_location_foreign` (`id_location`),
                                         KEY `etats_lieux_locations_type_etat_lieu_index` (`type_etat_lieu`),
                                         CONSTRAINT `etats_lieux_locations_id_location_foreign`
                                             FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`)
                                                 ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



username: Rebecca
•
email: admin@sunupark.sn
•
mot de passe: passer
