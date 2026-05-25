-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: sunupark_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `action_logs`
--

DROP TABLE IF EXISTS `action_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` bigint unsigned DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `action_logs_user_id_foreign` (`user_id`),
  KEY `action_logs_action_index` (`action`),
  KEY `action_logs_module_index` (`module`),
  CONSTRAINT `action_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action_logs`
--

LOCK TABLES `action_logs` WRITE;
/*!40000 ALTER TABLE `action_logs` DISABLE KEYS */;
INSERT INTO `action_logs` VALUES (1,3,'create','fournisseur','App\\Models\\Fournisseur',1,'{\"nom\": \"Eauto From China\", \"lien\": \"https://fr.eautofromchina.com/contact-us/\", \"email\": \"info@eautofromchina.com\", \"adresse\": \"Beijing, Chine\", \"telephone\": \"+86 137 0109 7347\", \"pays_origine\": \"Chine\", \"adresse_bureau\": \"No. 19, Anningzhuang West Road, district de Haidian, P├®kin, Chine\"}','127.0.0.1','2026-05-05 00:41:02','2026-05-05 00:41:02'),(2,3,'update','fournisseur','App\\Models\\Fournisseur',1,'{\"nom\": \"Eauto From China\", \"lien\": \"https://fr.eautofromchina.com/contact-us/\", \"email\": \"info@eautofromchina.com\", \"adresse\": \"Beijing, Chine\", \"telephone\": \"+86 137 0109 7347\", \"pays_origine\": \"Chine\", \"adresse_bureau\": \"No. 19, Anningzhuang West Road, district de Haidian, P├®kin, Chine\", \"vehicule_fournis\": \"TOYOTA\"}','127.0.0.1','2026-05-05 00:43:51','2026-05-05 00:43:51'),(3,3,'create','voiture','App\\Models\\Voiture',2,'{\"etat\": \"Neuf\", \"prix\": \"23000000\", \"annee\": \"2016\", \"images\": [{}], \"marque\": \"Toyota Allion\", \"modele\": \"Beijing Off-Road BJ20\", \"statut\": \"Disponible\", \"couleur\": \"Rouge\", \"energie\": \"Essence\", \"type_boite\": \"Transmission ├®lectrique\", \"description\": \"G├®n├®ration. Guide de montage des roues\", \"kilometrage\": \"80\", \"numero_chassis\": \"CHS-260403-WM8VV2BM\", \"date_acquisition\": \"2026-05-05\"}','127.0.0.1','2026-05-05 01:10:27','2026-05-05 01:10:27'),(4,3,'create','client','App\\Models\\Client',2,'{\"nom\": \"LOLA SEMERETH\", \"email\": \"lolasemerethrebecca@gmail.com\", \"classe\": \"Social\", \"prenom\": \"Rebecca\", \"adresse\": \"Dieuppeul Derkl├®\", \"telephone\": \"777588295\", \"type_client\": \"Paticulier\", \"numero_piece\": \"PAS234NBDFD\", \"numero_siret\": \"RAS\", \"numero_piece2\": \"CNI\", \"date_naissance\": \"2026-05-05\", \"piece_identite\": \"Passeport\", \"raison_sociale\": \"RAS\"}','127.0.0.1','2026-05-05 01:20:27','2026-05-05 01:20:27'),(5,3,'update','client','App\\Models\\Client',2,'{\"nom\": \"LOLA SEMERETH\", \"email\": \"lolasemerethrebecca@gmail.com\", \"classe\": \"Social\", \"prenom\": \"Rebecca\", \"telephone\": \"777588295\", \"type_client\": \"Paticulier\", \"raison_sociale\": \"RAS\"}','127.0.0.1','2026-05-05 01:20:47','2026-05-05 01:20:47'),(6,3,'create','voiture','App\\Models\\Voiture',3,'{\"etat\": \"occasion\", \"prix\": \"1500000\", \"annee\": \"2017\", \"images\": [{}, {}], \"marque\": \"Vitara\", \"modele\": \"Suzuki\", \"statut\": \"disponible\", \"couleur\": \"Rouge\", \"energie\": \"essence\", \"type_boite\": \"semi-automatique\", \"description\": \"Chaque route repr├®sente une nouvelle histoire, une nouvelle d├®couverte et il existe une nouvelle race de SUV qui peut toutes les conqu├®rir. Avec un design audacieux, des int├®rieurs sophistiqu├®s, la Vitara est l├á pour dominer toutes les routes.\", \"kilometrage\": \"120\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-N66YRD0S\", \"date_acquisition\": \"2026-05-13\"}','127.0.0.1','2026-05-13 00:07:56','2026-05-13 00:07:56'),(7,3,'update','voiture','App\\Models\\Voiture',3,'{\"etat\": \"occasion\", \"prix\": \"1500000.00\", \"annee\": \"2017\", \"images\": [{}], \"marque\": \"Vitara\", \"modele\": \"Suzuki\", \"statut\": \"disponible\", \"couleur\": \"Rouge\", \"energie\": \"essence\", \"type_boite\": \"semi-automatique\", \"description\": \"Chaque route repr├®sente une nouvelle histoire, une nouvelle d├®couverte et il existe une nouvelle race de SUV qui peut toutes les conqu├®rir. Avec un design audacieux, des int├®rieurs sophistiqu├®s, la Vitara est l├á pour dominer toutes les routes.\", \"kilometrage\": \"120\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-N66YRD0S\", \"date_acquisition\": \"2026-05-13\"}','127.0.0.1','2026-05-13 00:09:47','2026-05-13 00:09:47'),(8,3,'update','voiture','App\\Models\\Voiture',2,'{\"etat\": \"neuf\", \"prix\": \"23000000.00\", \"annee\": \"2025\", \"images\": [{}, {}, {}, {}], \"marque\": \"Toyota Allion\", \"modele\": \"Beijing Off-Road BJ20\", \"statut\": \"disponible\", \"couleur\": \"Rouge\", \"energie\": \"diesel\", \"type_boite\": \"Transmission ├®lectrique\", \"description\": \"G├®n├®ration. Guide de montage des roues\", \"kilometrage\": \"40\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260403-WM8VV2BM\", \"date_acquisition\": \"2026-05-13\"}','127.0.0.1','2026-05-13 00:19:49','2026-05-13 00:19:49'),(9,3,'update','voiture','App\\Models\\Voiture',3,'{\"etat\": \"occasion\", \"prix\": \"1500000.00\", \"annee\": \"2017\", \"images\": [{}, {}, {}, {}], \"marque\": \"Vitara\", \"modele\": \"Suzuki\", \"statut\": \"disponible\", \"couleur\": \"Rouge\", \"energie\": \"essence\", \"type_boite\": \"semi-automatique\", \"description\": \"Chaque route repr├®sente une nouvelle histoire, une nouvelle d├®couverte et il existe une nouvelle race de SUV qui peut toutes les conqu├®rir. Avec un design audacieux, des int├®rieurs sophistiqu├®s, la Vitara est l├á pour dominer toutes les routes.\", \"kilometrage\": \"120\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-N66YRD0S\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 00:25:45','2026-05-13 00:25:45'),(10,3,'create','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": \"20000000\", \"annee\": \"2025\", \"images\": [{}, {}, {}, {}], \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13\"}','127.0.0.1','2026-05-13 00:38:57','2026-05-13 00:38:57'),(11,3,'export','location','App\\Models\\Location',2,'[]','127.0.0.1','2026-05-13 14:00:26','2026-05-13 14:00:26'),(12,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": \"50000\", \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"20000000\", \"type_usage\": \"vente\", \"ancien_prix\": \"20000000.00\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:24:00','2026-05-13 14:24:00'),(13,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": \"50000.00\", \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"19999999\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:26:19','2026-05-13 14:26:19'),(14,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": \"50000.00\", \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"19999998\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:28:08','2026-05-13 14:28:08'),(15,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"19999999\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:29:37','2026-05-13 14:29:37'),(16,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": null, \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"20000000\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"ancien_prix\": \"50000.00\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:35:34','2026-05-13 14:35:34'),(17,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": null, \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"19999998\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-13T00:00:00.000000Z\"}','127.0.0.1','2026-05-13 14:35:59','2026-05-13 14:35:59'),(18,3,'update','voiture','App\\Models\\Voiture',4,'{\"etat\": \"neuf\", \"prix\": null, \"annee\": \"2025\", \"marque\": \"Corolla Touring Sports\", \"modele\": \"Corolla\", \"statut\": \"disponible\", \"couleur\": \"Gris\", \"energie\": \"hybride\", \"prix_vente\": \"20000000\", \"type_boite\": \"semi-automatique\", \"type_usage\": \"vente\", \"description\": \"Toyota Corolla Touring Sports Hybride\\r\\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\\r\\n\\r\\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\\r\\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota\", \"kilometrage\": \"100\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-5TQFAIPB\", \"date_acquisition\": \"2026-05-12\"}','127.0.0.1','2026-05-13 14:43:13','2026-05-13 14:43:13'),(19,3,'update','client','App\\Models\\Client',3,'{\"nom\": \"DIALLO\", \"email\": \"maremediallo@gmail.com\", \"classe\": \"RAS\", \"prenom\": \"Mareme\", \"adresse\": \"Dieuppeul Derkl├®\", \"contact\": \"Mareme DIALLO\", \"telephone\": \"777588295\", \"type_client\": \"Personnel\", \"numero_piece\": \"PAS234NBDFD\", \"numero_siret\": \"RAS\", \"numero_piece2\": \"CNI\", \"date_naissance\": \"1990-12-13\", \"piece_identite\": \"Passeport\", \"raison_sociale\": \"RAS\"}','127.0.0.1','2026-05-13 14:57:27','2026-05-13 14:57:27'),(20,3,'update','client','App\\Models\\Client',3,'{\"nom\": \"DIALLO Mareme\", \"email\": \"maremediallo@gmail.com\", \"prenom\": \"Mareme\", \"contact\": \"Mareme DIALLO\", \"telephone\": \"777588295\", \"type_client\": \"Personnel\", \"raison_sociale\": \"RAS\"}','127.0.0.1','2026-05-13 14:57:56','2026-05-13 14:57:56'),(21,3,'update','voiture','App\\Models\\Voiture',3,'{\"etat\": \"occasion\", \"prix\": \"50000\", \"annee\": \"2017\", \"marque\": \"Vitara\", \"modele\": \"Suzuki\", \"statut\": \"disponible\", \"couleur\": \"Rouge\", \"energie\": \"essence\", \"prix_vente\": null, \"type_boite\": \"semi-automatique\", \"type_usage\": \"location\", \"ancien_prix\": \"1500000.00\", \"description\": \"Chaque route repr├®sente une nouvelle histoire, une nouvelle d├®couverte et il existe une nouvelle race de SUV qui peut toutes les conqu├®rir. Avec un design audacieux, des int├®rieurs sophistiqu├®s, la Vitara est l├á pour dominer toutes les routes.\", \"kilometrage\": \"120\", \"id_fournisseur\": \"1\", \"numero_chassis\": \"CHS-260513-N66YRD0S\", \"date_acquisition\": \"2026-05-12\"}','127.0.0.1','2026-05-13 23:05:38','2026-05-13 23:05:38');
/*!40000 ALTER TABLE `action_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assurances`
--

DROP TABLE IF EXISTS `assurances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assurances` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `compagnie` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_police` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_assurance` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tous_risques',
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `montant_prime` decimal(15,2) DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `id_gestionnaire` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assurances_id_voiture_foreign` (`id_voiture`),
  KEY `assurances_id_gestionnaire_foreign` (`id_gestionnaire`),
  CONSTRAINT `assurances_id_gestionnaire_foreign` FOREIGN KEY (`id_gestionnaire`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assurances_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assurances`
--

LOCK TABLES `assurances` WRITE;
/*!40000 ALTER TABLE `assurances` DISABLE KEYS */;
/*!40000 ALTER TABLE `assurances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carburants`
--

DROP TABLE IF EXISTS `carburants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carburants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `date_plein` date NOT NULL,
  `kilometrage_au_plein` int unsigned DEFAULT NULL,
  `quantite_litres` decimal(8,2) DEFAULT NULL,
  `prix_par_litre` decimal(8,2) DEFAULT NULL,
  `montant_total` decimal(15,2) NOT NULL,
  `type_carburant` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'essence',
  `station` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `carburants_id_voiture_foreign` (`id_voiture`),
  CONSTRAINT `carburants_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carburants`
--

LOCK TABLES `carburants` WRITE;
/*!40000 ALTER TABLE `carburants` DISABLE KEYS */;
/*!40000 ALTER TABLE `carburants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `piece_identite` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_piece` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_piece2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_client` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `classe` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raison_sociale` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_siret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `id_vendeur_attribue` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clients_email_unique` (`email`),
  KEY `clients_id_vendeur_attribue_foreign` (`id_vendeur_attribue`),
  CONSTRAINT `clients_id_vendeur_attribue_foreign` FOREIGN KEY (`id_vendeur_attribue`) REFERENCES `employes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (2,'LOLA SEMERETH','Rebecca','Dieuppeul Derkl├®',NULL,'777588295','lolasemerethrebecca@gmail.com','Passeport','PAS234NBDFD','CNI','Paticulier','Social','RAS','RAS','2026-05-05',NULL,'2026-05-05 01:20:27','2026-05-05 01:20:27'),(3,'DIALLO Mareme','Mareme','Dieuppeul Derkl├®','Mareme DIALLO','777588295','maremediallo@gmail.com','Passeport','PAS234NBDFD','CNI','Personnel','RAS','RAS','RAS','1990-12-13',NULL,'2026-05-13 12:57:02','2026-05-13 14:57:56');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consommations_pieces`
--

DROP TABLE IF EXISTS `consommations_pieces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consommations_pieces` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ordre_travail` bigint unsigned NOT NULL,
  `id_piece_stock` bigint unsigned NOT NULL,
  `quantite` int unsigned NOT NULL,
  `date_consommation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `consommations_pieces_id_ordre_travail_foreign` (`id_ordre_travail`),
  KEY `consommations_pieces_id_piece_stock_foreign` (`id_piece_stock`),
  CONSTRAINT `consommations_pieces_id_ordre_travail_foreign` FOREIGN KEY (`id_ordre_travail`) REFERENCES `ordres_travail` (`id`) ON DELETE CASCADE,
  CONSTRAINT `consommations_pieces_id_piece_stock_foreign` FOREIGN KEY (`id_piece_stock`) REFERENCES `pieces_stock` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consommations_pieces`
--

LOCK TABLES `consommations_pieces` WRITE;
/*!40000 ALTER TABLE `consommations_pieces` DISABLE KEYS */;
/*!40000 ALTER TABLE `consommations_pieces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `controles_techniques`
--

DROP TABLE IF EXISTS `controles_techniques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `controles_techniques` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `type_controle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'periodique',
  `date_controle` date NOT NULL,
  `date_expiration` date DEFAULT NULL,
  `resultat` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'favorable',
  `organisme` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cout` decimal(15,2) DEFAULT NULL,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `controles_techniques_id_voiture_foreign` (`id_voiture`),
  CONSTRAINT `controles_techniques_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `controles_techniques`
--

LOCK TABLES `controles_techniques` WRITE;
/*!40000 ALTER TABLE `controles_techniques` DISABLE KEYS */;
/*!40000 ALTER TABLE `controles_techniques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demandes`
--

DROP TABLE IF EXISTS `demandes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demandes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('information','reprise','essai','achat') COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('en_attente','traite','archive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_attente',
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `rendez_vous_date` date DEFAULT NULL,
  `rendez_vous_heure` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_voiture` bigint unsigned DEFAULT NULL,
  `reprise_marque` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reprise_modele` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reprise_annee` year DEFAULT NULL,
  `reprise_kilometrage` int unsigned DEFAULT NULL,
  `reprise_etat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `demandes_id_voiture_foreign` (`id_voiture`),
  KEY `demandes_type_index` (`type`),
  KEY `demandes_statut_index` (`statut`),
  CONSTRAINT `demandes_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demandes`
--

LOCK TABLES `demandes` WRITE;
/*!40000 ALTER TABLE `demandes` DISABLE KEYS */;
INSERT INTO `demandes` VALUES (1,'achat','traite','Alex','alexsoudou@gmail.com','+221777588295','Bonjour,\nJe suis int├®ress├®(e) par ce v├®hicule et souhaiterais convenir dÔÇÖun rendez-vous afin de le voir et discuter des modalit├®s dÔÇÖachat.\n\nMerci dÔÇÖavance pour votre retour.','2026-05-20','12:00',2,NULL,NULL,NULL,NULL,NULL,'2026-05-13 14:04:45','2026-05-15 15:54:34');
/*!40000 ALTER TABLE `demandes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_vente` bigint unsigned DEFAULT NULL,
  `id_client` bigint unsigned DEFAULT NULL,
  `id_employe` bigint unsigned DEFAULT NULL,
  `id_voiture` bigint unsigned DEFAULT NULL,
  `type_document` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_document` date DEFAULT NULL,
  `numero_document` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_production` date DEFAULT NULL,
  `date_expiration` date DEFAULT NULL,
  `chemin_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `documents_id_vente_foreign` (`id_vente`),
  KEY `documents_id_client_foreign` (`id_client`),
  KEY `documents_id_employe_foreign` (`id_employe`),
  KEY `documents_id_voiture_foreign` (`id_voiture`),
  CONSTRAINT `documents_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_id_employe_foreign` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_id_vente_foreign` FOREIGN KEY (`id_vente`) REFERENCES `ventes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employes`
--

DROP TABLE IF EXISTS `employes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `salaire` decimal(15,2) DEFAULT NULL,
  `contrat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poste` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employes_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employes`
--

LOCK TABLES `employes` WRITE;
/*!40000 ALTER TABLE `employes` DISABLE KEYS */;
/*!40000 ALTER TABLE `employes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entretiens`
--

DROP TABLE IF EXISTS `entretiens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entretiens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `id_technicien` bigint unsigned DEFAULT NULL,
  `type_entretien` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_prevue` date DEFAULT NULL,
  `date_realise` date DEFAULT NULL,
  `kilometrage_prevu` int unsigned DEFAULT NULL,
  `kilometrage_realise` int unsigned DEFAULT NULL,
  `cout` decimal(15,2) DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planifie',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `entretiens_id_voiture_foreign` (`id_voiture`),
  KEY `entretiens_id_technicien_foreign` (`id_technicien`),
  CONSTRAINT `entretiens_id_technicien_foreign` FOREIGN KEY (`id_technicien`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `entretiens_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entretiens`
--

LOCK TABLES `entretiens` WRITE;
/*!40000 ALTER TABLE `entretiens` DISABLE KEYS */;
/*!40000 ALTER TABLE `entretiens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etats_lieux_locations`
--

DROP TABLE IF EXISTS `etats_lieux_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etats_lieux_locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_location` bigint unsigned NOT NULL,
  `type_etat` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `chemin_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_etat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `etats_lieux_locations_id_location_foreign` (`id_location`),
  KEY `etats_lieux_locations_type_etat_index` (`type_etat`),
  CONSTRAINT `etats_lieux_locations_id_location_foreign` FOREIGN KEY (`id_location`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etats_lieux_locations`
--

LOCK TABLES `etats_lieux_locations` WRITE;
/*!40000 ALTER TABLE `etats_lieux_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `etats_lieux_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturations`
--

DROP TABLE IF EXISTS `facturations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero_facture` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_facture` date NOT NULL,
  `mode_livraison` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `montant` decimal(15,2) DEFAULT NULL,
  `remise` decimal(15,2) DEFAULT NULL,
  `montant_ht` decimal(15,2) NOT NULL,
  `taux_tva` decimal(5,2) NOT NULL DEFAULT '18.00',
  `montant_ttc` decimal(15,2) NOT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'impayee',
  `date_echeance` date DEFAULT NULL,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `id_vente` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `facturations_numero_facture_unique` (`numero_facture`),
  UNIQUE KEY `facturations_id_vente_unique` (`id_vente`),
  KEY `idx_facturations_statut` (`statut`),
  CONSTRAINT `facturations_id_vente_foreign` FOREIGN KEY (`id_vente`) REFERENCES `ventes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturations`
--

LOCK TABLES `facturations` WRITE;
/*!40000 ALTER TABLE `facturations` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fournisseurs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_bureau` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays_origine` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehicule_fournis` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fournisseurs`
--

LOCK TABLES `fournisseurs` WRITE;
/*!40000 ALTER TABLE `fournisseurs` DISABLE KEYS */;
INSERT INTO `fournisseurs` VALUES (1,'Eauto From China','Beijing, Chine','+86 137 0109 7347',NULL,'info@eautofromchina.com','https://fr.eautofromchina.com/contact-us/','No. 19, Anningzhuang West Road, district de Haidian, P├®kin, Chine','Chine','TOYOTA','2026-05-05 00:41:02','2026-05-05 00:43:51');
/*!40000 ALTER TABLE `fournisseurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garanties`
--

DROP TABLE IF EXISTS `garanties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garanties` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `duree_garantie` int unsigned DEFAULT NULL,
  `type_garantie` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `id_employe` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `garanties_id_voiture_unique` (`id_voiture`),
  KEY `garanties_id_employe_foreign` (`id_employe`),
  CONSTRAINT `garanties_id_employe_foreign` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `garanties_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garanties`
--

LOCK TABLES `garanties` WRITE;
/*!40000 ALTER TABLE `garanties` DISABLE KEYS */;
/*!40000 ALTER TABLE `garanties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_voitures`
--

DROP TABLE IF EXISTS `image_voitures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_voitures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `chemin` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `largeur` int unsigned DEFAULT NULL,
  `hauteur` int unsigned DEFAULT NULL,
  `taille` bigint unsigned DEFAULT NULL,
  `legible` tinyint(1) NOT NULL DEFAULT '1',
  `ordre` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `image_voitures_id_voiture_foreign` (`id_voiture`),
  CONSTRAINT `image_voitures_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_voitures`
--

LOCK TABLES `image_voitures` WRITE;
/*!40000 ALTER TABLE `image_voitures` DISABLE KEYS */;
INSERT INTO `image_voitures` VALUES (5,2,'voitures/oNYXeE9zFm6DcLuiGixSmD1Is9RctR8xvgp98k6Q.webp',NULL,NULL,NULL,NULL,NULL,1,0),(6,2,'voitures/70ry7qb8pHpZ9Qbc6gRu2tcT9n0Mbki6s61INWrZ.webp',NULL,NULL,NULL,NULL,NULL,1,0),(7,2,'voitures/TBFNQmMhTUMoOmcFnToricZWv0HZZHwdmKF2n7sT.webp',NULL,NULL,NULL,NULL,NULL,1,0),(8,2,'voitures/lu2EP35g4d3A11rKHfWzOxfdoy5AbgrleLMPKpf0.webp',NULL,NULL,NULL,NULL,NULL,1,0),(9,3,'voitures/hrmhHbsLaFJtVTq4ch4kORrQ1QhPt2baCH9SAbrZ.png',NULL,NULL,NULL,NULL,NULL,1,0),(10,3,'voitures/k0hUPzpiyOMc9MyQ8wcvRQSXnfMTeCbivwW9Q3Oc.png',NULL,NULL,NULL,NULL,NULL,1,0),(11,3,'voitures/ItVRSsleh95C3GmjUJkhldbbORNwYkPAGEkVigVF.png',NULL,NULL,NULL,NULL,NULL,1,0),(12,3,'voitures/yaELnqSpOCkCLXugiFfYGBR1rd0mmVNoxAPceYEy.png',NULL,NULL,NULL,NULL,NULL,1,0),(13,4,'voitures/qIefkxWH0WzsJtuAYifPzdXqoZFld9DNT7tV6jMU.webp',NULL,NULL,NULL,NULL,NULL,1,0),(14,4,'voitures/yvAddDyJBizVEQoZ6O57i6a4IR9SMaPgUcvveIG2.webp',NULL,NULL,NULL,NULL,NULL,1,0),(15,4,'voitures/wrGDkTGx1IkdU2GxrOap7UMyi135AtTTQUKUR9fC.webp',NULL,NULL,NULL,NULL,NULL,1,0),(16,4,'voitures/fYpYysLw7evBsRhwFSxyYHN3w87vmbvs3ymrpaOE.webp',NULL,NULL,NULL,NULL,NULL,1,0);
/*!40000 ALTER TABLE `image_voitures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interventions_sav`
--

DROP TABLE IF EXISTS `interventions_sav`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interventions_sav` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ticket_sav` bigint unsigned NOT NULL,
  `id_employe` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_cours',
  `temps_passe_minutes` int unsigned NOT NULL DEFAULT '0',
  `date_intervention` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `interventions_sav_id_ticket_sav_foreign` (`id_ticket_sav`),
  KEY `interventions_sav_id_employe_foreign` (`id_employe`),
  KEY `interventions_sav_statut_index` (`statut`),
  CONSTRAINT `interventions_sav_id_employe_foreign` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `interventions_sav_id_ticket_sav_foreign` FOREIGN KEY (`id_ticket_sav`) REFERENCES `tickets_sav` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interventions_sav`
--

LOCK TABLES `interventions_sav` WRITE;
/*!40000 ALTER TABLE `interventions_sav` DISABLE KEYS */;
/*!40000 ALTER TABLE `interventions_sav` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_client` bigint unsigned NOT NULL,
  `id_voiture` bigint unsigned NOT NULL,
  `date_debut` timestamp NOT NULL,
  `date_fin` timestamp NOT NULL,
  `date_retour_effective` timestamp NULL DEFAULT NULL,
  `tarif_journalier` decimal(15,2) NOT NULL,
  `caution` decimal(15,2) DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planifiee',
  `observations` text COLLATE utf8mb4_unicode_ci,
  `id_agent` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `locations_reference_location_unique` (`reference_location`),
  KEY `locations_id_client_foreign` (`id_client`),
  KEY `locations_id_voiture_foreign` (`id_voiture`),
  KEY `locations_date_debut_index` (`date_debut`),
  KEY `locations_date_fin_index` (`date_fin`),
  KEY `locations_statut_index` (`statut`),
  KEY `locations_id_agent_foreign` (`id_agent`),
  KEY `idx_locations_statut` (`statut`),
  KEY `idx_locations_date_fin` (`date_fin`),
  CONSTRAINT `locations_id_agent_foreign` FOREIGN KEY (`id_agent`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `locations_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `locations_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (2,'RES-20260513125702',3,2,'2026-05-13 00:00:00','2026-05-14 00:00:00',NULL,0.00,0.00,'planifiee','Bonjour, je souhaite r├®server une voiture pour une location.\nPouvez-vous me confirmer la disponibilit├® du v├®hicule ?',NULL,'2026-05-13 12:57:02','2026-05-13 12:57:02');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_04_01_000001_add_profile_photo_path_to_users_table',1),(5,'2026_04_02_102256_add_theme_to_users_table',1),(6,'2026_04_02_180000_create_notifications_internes_table',1),(7,'2026_04_03_000000_add_locale_to_users_table',1),(8,'2026_04_03_add_ordre_to_image_voitures',1),(9,'2026_04_09_151822_create_personal_access_tokens_table',1),(10,'2026_05_04_000000_add_image_principale_to_voitures_table',2),(11,'2026_05_12_000001_create_modules_parc_complets',3),(12,'2026_05_12_000002_add_employe_to_modules',4),(13,'2026_05_12_133730_nom_descriptif',5),(14,'2026_05_13_000001_create_demandes_table',6),(15,'2026_05_13_000002_add_type_usage_to_voitures',7),(16,'2026_05_13_000003_add_prix_vente_and_rdv_to_tables',8),(17,'2026_05_13_000004_make_prix_nullable_on_voitures',9),(18,'2026_05_15_000001_add_performance_indexes',10);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mouvements_stock`
--

DROP TABLE IF EXISTS `mouvements_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mouvements_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_piece_stock` bigint unsigned NOT NULL,
  `type_mouvement` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantite` int unsigned NOT NULL,
  `source_mouvement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `date_mouvement` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mouvements_stock_id_piece_stock_foreign` (`id_piece_stock`),
  KEY `mouvements_stock_type_mouvement_index` (`type_mouvement`),
  KEY `mouvements_stock_date_mouvement_index` (`date_mouvement`),
  CONSTRAINT `mouvements_stock_id_piece_stock_foreign` FOREIGN KEY (`id_piece_stock`) REFERENCES `pieces_stock` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mouvements_stock`
--

LOCK TABLES `mouvements_stock` WRITE;
/*!40000 ALTER TABLE `mouvements_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `mouvements_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_internes`
--

DROP TABLE IF EXISTS `notifications_internes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_internes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `declenchee_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lue_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notifications_internes_signature_unique` (`signature`),
  KEY `notifications_internes_type_index` (`type`),
  KEY `notifications_internes_niveau_index` (`niveau`),
  KEY `notifications_internes_declenchee_at_index` (`declenchee_at`),
  KEY `notifications_internes_lue_at_index` (`lue_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_internes`
--

LOCK TABLES `notifications_internes` WRITE;
/*!40000 ALTER TABLE `notifications_internes` DISABLE KEYS */;
INSERT INTO `notifications_internes` VALUES (1,'echeance_location','location-2','danger','Location en retard','RES-20260513125702 - Toyota Allion Beijing Off-Road BJ20, fin prevue le 14/05/2026.','http://localhost:8000/api/locations/2','2026-05-24 19:26:09',NULL,'2026-05-13 12:58:36','2026-05-24 19:26:09');
/*!40000 ALTER TABLE `notifications_internes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordres_travail`
--

DROP TABLE IF EXISTS `ordres_travail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordres_travail` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_ot` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_voiture` bigint unsigned NOT NULL,
  `id_ticket_sav` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priorite` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normale',
  `deadline` timestamp NULL DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ouvert',
  `id_technicien` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ordres_travail_reference_ot_unique` (`reference_ot`),
  KEY `ordres_travail_id_voiture_foreign` (`id_voiture`),
  KEY `ordres_travail_id_ticket_sav_foreign` (`id_ticket_sav`),
  KEY `ordres_travail_id_technicien_foreign` (`id_technicien`),
  KEY `ordres_travail_priorite_index` (`priorite`),
  KEY `ordres_travail_deadline_index` (`deadline`),
  KEY `ordres_travail_statut_index` (`statut`),
  CONSTRAINT `ordres_travail_id_technicien_foreign` FOREIGN KEY (`id_technicien`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ordres_travail_id_ticket_sav_foreign` FOREIGN KEY (`id_ticket_sav`) REFERENCES `tickets_sav` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ordres_travail_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordres_travail`
--

LOCK TABLES `ordres_travail` WRITE;
/*!40000 ALTER TABLE `ordres_travail` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordres_travail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `origines_marques`
--

DROP TABLE IF EXISTS `origines_marques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `origines_marques` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `origines_marques_nom_unique` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `origines_marques`
--

LOCK TABLES `origines_marques` WRITE;
/*!40000 ALTER TABLE `origines_marques` DISABLE KEYS */;
/*!40000 ALTER TABLE `origines_marques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `mode_paiement` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `reste` decimal(15,2) DEFAULT NULL,
  `id_facture` bigint unsigned DEFAULT NULL,
  `id_vente` bigint unsigned NOT NULL,
  `id_client` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `paiements_id_facture_foreign` (`id_facture`),
  KEY `paiements_id_vente_foreign` (`id_vente`),
  KEY `paiements_id_client_foreign` (`id_client`),
  CONSTRAINT `paiements_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `paiements_id_facture_foreign` FOREIGN KEY (`id_facture`) REFERENCES `facturations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `paiements_id_vente_foreign` FOREIGN KEY (`id_vente`) REFERENCES `ventes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiements`
--

LOCK TABLES `paiements` WRITE;
/*!40000 ALTER TABLE `paiements` DISABLE KEYS */;
/*!40000 ALTER TABLE `paiements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_nom_unique` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (42,'App\\Models\\User',4,'frontend','9b22c744b641eaec53b35a785f85a4a741d03f67d31f5a378d2b9a9f9d75f4f6','[\"*\"]','2026-05-13 15:43:15',NULL,'2026-05-13 15:24:24','2026-05-13 15:43:15'),(51,'App\\Models\\User',3,'frontend','dbe6a9315b1bbde253d64f74a87be5cf1c215f3fae86494bf69a8d76e11c2cc9','[\"*\"]','2026-05-24 20:18:57',NULL,'2026-05-24 19:26:02','2026-05-24 20:18:57');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pieces_stock`
--

DROP TABLE IF EXISTS `pieces_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pieces_stock` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `prix_unitaire` decimal(15,2) NOT NULL,
  `quantite_stock` int unsigned NOT NULL DEFAULT '0',
  `seuil_alerte` int unsigned NOT NULL DEFAULT '0',
  `id_fournisseur` bigint unsigned DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pieces_stock_reference_unique` (`reference`),
  KEY `pieces_stock_id_fournisseur_foreign` (`id_fournisseur`),
  KEY `pieces_stock_statut_index` (`statut`),
  CONSTRAINT `pieces_stock_id_fournisseur_foreign` FOREIGN KEY (`id_fournisseur`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pieces_stock`
--

LOCK TABLES `pieces_stock` WRITE;
/*!40000 ALTER TABLE `pieces_stock` DISABLE KEYS */;
/*!40000 ALTER TABLE `pieces_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permissions_role_permission_id_unique` (`role`,`permission_id`),
  KEY `role_permissions_permission_id_foreign` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `1` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sinistres`
--

DROP TABLE IF EXISTS `sinistres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sinistres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_voiture` bigint unsigned NOT NULL,
  `id_client` bigint unsigned DEFAULT NULL,
  `id_assurance` bigint unsigned DEFAULT NULL,
  `date_sinistre` date NOT NULL,
  `type_sinistre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'accident',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_dommages` decimal(15,2) DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'declare',
  `numero_declaration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `id_gestionnaire` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sinistres_id_voiture_foreign` (`id_voiture`),
  KEY `sinistres_id_client_foreign` (`id_client`),
  KEY `sinistres_id_assurance_foreign` (`id_assurance`),
  KEY `sinistres_id_gestionnaire_foreign` (`id_gestionnaire`),
  CONSTRAINT `sinistres_id_assurance_foreign` FOREIGN KEY (`id_assurance`) REFERENCES `assurances` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sinistres_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sinistres_id_gestionnaire_foreign` FOREIGN KEY (`id_gestionnaire`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sinistres_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sinistres`
--

LOCK TABLES `sinistres` WRITE;
/*!40000 ALTER TABLE `sinistres` DISABLE KEYS */;
/*!40000 ALTER TABLE `sinistres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taches_atelier`
--

DROP TABLE IF EXISTS `taches_atelier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taches_atelier` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_ordre_travail` bigint unsigned NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'a_faire',
  `temps_passe_minutes` int unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `taches_atelier_id_ordre_travail_foreign` (`id_ordre_travail`),
  KEY `taches_atelier_statut_index` (`statut`),
  CONSTRAINT `taches_atelier_id_ordre_travail_foreign` FOREIGN KEY (`id_ordre_travail`) REFERENCES `ordres_travail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taches_atelier`
--

LOCK TABLES `taches_atelier` WRITE;
/*!40000 ALTER TABLE `taches_atelier` DISABLE KEYS */;
/*!40000 ALTER TABLE `taches_atelier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets_sav`
--

DROP TABLE IF EXISTS `tickets_sav`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets_sav` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_ticket` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_client` bigint unsigned NOT NULL,
  `id_voiture` bigint unsigned NOT NULL,
  `id_responsable` bigint unsigned NOT NULL,
  `id_garantie` bigint unsigned DEFAULT NULL,
  `objet` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ouvert',
  `priorite` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normale',
  `date_ouverture` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_resolution` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_sav_reference_ticket_unique` (`reference_ticket`),
  KEY `tickets_sav_id_client_foreign` (`id_client`),
  KEY `tickets_sav_id_voiture_foreign` (`id_voiture`),
  KEY `tickets_sav_id_responsable_foreign` (`id_responsable`),
  KEY `tickets_sav_id_garantie_foreign` (`id_garantie`),
  KEY `tickets_sav_statut_index` (`statut`),
  CONSTRAINT `tickets_sav_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_sav_id_garantie_foreign` FOREIGN KEY (`id_garantie`) REFERENCES `garanties` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tickets_sav_id_responsable_foreign` FOREIGN KEY (`id_responsable`) REFERENCES `employes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `tickets_sav_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets_sav`
--

LOCK TABLES `tickets_sav` WRITE;
/*!40000 ALTER TABLE `tickets_sav` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets_sav` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `types_vehicules`
--

DROP TABLE IF EXISTS `types_vehicules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `types_vehicules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_gasoil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_boite` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carburant` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `types_vehicules`
--

LOCK TABLES `types_vehicules` WRITE;
/*!40000 ALTER TABLE `types_vehicules` DISABLE KEYS */;
/*!40000 ALTER TABLE `types_vehicules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vendeur',
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'actif',
  `theme` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light',
  `locale` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fr',
  `last_login` timestamp NULL DEFAULT NULL,
  `token_expiration` timestamp NULL DEFAULT NULL,
  `id_employe` bigint unsigned DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_id_employe_foreign` (`id_employe`),
  CONSTRAINT `users_id_employe_foreign` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'Rebecca','Rebecca','admin@sunupark.sn',NULL,'$2y$12$0O2Tl7NF7/81hId8V2Wi5.fXLz.dFcbOmGIgk7JcpWK0KOY2NYFea','$2y$12$0O2Tl7NF7/81hId8V2Wi5.fXLz.dFcbOmGIgk7JcpWK0KOY2NYFea','profile_photos/wJ9TjEi1OCwMbVkcWbZSHNK3TpteHYEYuFgkXSMu.png','admin','actif','light','fr',NULL,NULL,NULL,NULL,'2026-05-05 00:19:44','2026-05-24 19:27:38'),(4,'Mareme DIALLO','Mareme','maremediallo@gmail.com',NULL,'$2y$12$KprrrNLCkTv..sx36mUTB.in2vuTm.bIIpsAHc4HcP6Dys63H5fQO','$2y$12$mVx7wS.NuA2b2q2A0lEZT.hpFVYSbQpZRl3nPWTIQ/Hu0XVRcqVVq',NULL,'client','actif','light','fr',NULL,NULL,NULL,NULL,'2026-05-13 12:24:49','2026-05-13 12:24:49');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_vente` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_vente` date NOT NULL,
  `id_client` bigint unsigned NOT NULL,
  `id_voiture` bigint unsigned NOT NULL,
  `prix_final` decimal(15,2) NOT NULL,
  `mode_paiement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en_cours',
  `id_employe` bigint unsigned NOT NULL,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ventes_reference_vente_unique` (`reference_vente`),
  KEY `ventes_id_client_foreign` (`id_client`),
  KEY `ventes_id_voiture_foreign` (`id_voiture`),
  KEY `ventes_id_employe_foreign` (`id_employe`),
  KEY `idx_ventes_date_vente` (`date_vente`),
  CONSTRAINT `ventes_id_client_foreign` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ventes_id_employe_foreign` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `ventes_id_voiture_foreign` FOREIGN KEY (`id_voiture`) REFERENCES `voitures` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventes`
--

LOCK TABLES `ventes` WRITE;
/*!40000 ALTER TABLE `ventes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voitures`
--

DROP TABLE IF EXISTS `voitures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voitures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `marque` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modele` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `annee` smallint unsigned DEFAULT NULL,
  `couleur` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prix` decimal(15,2) DEFAULT NULL,
  `prix_vente` decimal(15,2) DEFAULT NULL,
  `kilometrage` int unsigned DEFAULT NULL,
  `numero_chassis` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_acquisition` date DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'disponible',
  `type_usage` enum('location','vente','les_deux') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'les_deux',
  `etat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `energie` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_boite` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_vehicule_id` bigint unsigned DEFAULT NULL,
  `origine_marque_id` bigint unsigned DEFAULT NULL,
  `id_fournisseur` bigint unsigned DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_principale` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `voitures_numero_chassis_unique` (`numero_chassis`),
  KEY `voitures_type_vehicule_id_foreign` (`type_vehicule_id`),
  KEY `voitures_origine_marque_id_foreign` (`origine_marque_id`),
  KEY `voitures_id_fournisseur_foreign` (`id_fournisseur`),
  KEY `idx_voitures_statut` (`statut`),
  KEY `idx_voitures_type_usage` (`type_usage`),
  KEY `idx_voitures_created_at` (`created_at`),
  CONSTRAINT `voitures_id_fournisseur_foreign` FOREIGN KEY (`id_fournisseur`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `voitures_origine_marque_id_foreign` FOREIGN KEY (`origine_marque_id`) REFERENCES `origines_marques` (`id`) ON DELETE SET NULL,
  CONSTRAINT `voitures_type_vehicule_id_foreign` FOREIGN KEY (`type_vehicule_id`) REFERENCES `types_vehicules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voitures`
--

LOCK TABLES `voitures` WRITE;
/*!40000 ALTER TABLE `voitures` DISABLE KEYS */;
INSERT INTO `voitures` VALUES (2,'Toyota Allion','Beijing Off-Road BJ20',2025,'Rouge',23000000.00,NULL,40,'CHS-260403-WM8VV2BM','2026-05-13','disponible','les_deux','neuf','diesel','Transmission ├®lectrique',NULL,NULL,1,'G├®n├®ration. Guide de montage des roues','voitures/oNYXeE9zFm6DcLuiGixSmD1Is9RctR8xvgp98k6Q.webp','2026-05-05 01:10:27','2026-05-13 00:19:49'),(3,'Vitara','Suzuki',2017,'Rouge',50000.00,NULL,120,'CHS-260513-N66YRD0S','2026-05-12','disponible','location','occasion','essence','semi-automatique',NULL,NULL,1,'Chaque route repr├®sente une nouvelle histoire, une nouvelle d├®couverte et il existe une nouvelle race de SUV qui peut toutes les conqu├®rir. Avec un design audacieux, des int├®rieurs sophistiqu├®s, la Vitara est l├á pour dominer toutes les routes.','voitures/hrmhHbsLaFJtVTq4ch4kORrQ1QhPt2baCH9SAbrZ.png','2026-05-13 00:07:56','2026-05-13 23:05:38'),(4,'Corolla Touring Sports','Corolla',2025,'Gris',NULL,20000000.00,100,'CHS-260513-5TQFAIPB','2026-05-12','disponible','vente','neuf','hybride','semi-automatique',NULL,NULL,1,'Toyota Corolla Touring Sports Hybride\r\nGamme Corolla Touring Sports Hybride : consommations en mixte combin├®e (L/100 km) et ├®missions de CO2 en combin├®e (g/km) selon norme WLTP : de 4,5 ├á 4,8 et de 101 ├á 108.\r\n\r\nJusquÔÇÖ├á 10% de remise exceptionnelle sur la Corolla Touring Sports Hybride pour la reprise dÔÇÖun v├®hicule.\r\nOffre r├®serv├®e aux particuliers non cumulable. Offre valable jusquÔÇÖau 01/06/2026 pour toute commande d\'une Corolla Touring Sports Hybride neuve dans le r├®seau Toyota','voitures/qIefkxWH0WzsJtuAYifPzdXqoZFld9DNT7tV6jMU.webp','2026-05-13 00:38:57','2026-05-13 14:43:13');
/*!40000 ALTER TABLE `voitures` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 12:40:56
