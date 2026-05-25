/**
 * Types centralisés pour l'application SunuPark
 * Ce fichier regroupe les interfaces utilisées par plusieurs modules
 */

// ============================================
// Types utilisateur
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  theme?: string;
  locale?: string;
  profile_photo_url?: string | null;
}

export interface UserProfile extends User {
  locale?: string;
  theme?: string;
  profile_photo_url?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// Types génériques API
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[]>;
  isNetworkError?: boolean;
}

// ============================================
// Types entités métier
// ============================================

export interface Client {
  id: number;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  type_client?: string;
  classe?: string;
}

export interface Voiture {
  id: number;
  marque: string;
  modele: string;
  annee?: number;
  prix: number;
  numero_chassis?: string;
  statut: string;
  energie?: string;
  date_acquisition?: string;
  description?: string;
  image_principale?: string;
}

export interface Fournisseur {
  id: number;
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  pays_origine?: string;
}

export interface Employe {
  id: number;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  role?: string;
}

export interface Vente {
  id: number;
  reference_vente: string;
  date_vente: string;
  id_client: number;
  id_voiture: number;
  id_employe: number;
  prix_final: number;
  statut: string;
  client?: Client;
  voiture?: Voiture;
}

export interface Facturation {
  id: number;
  numero_facture: string;
  id_vente: number;
  date_facture: string;
  montant_ht: number;
  montant_ttc: number;
  remise?: number;
  taux_tva?: number;
  statut: string;
  date_echeance?: string;
  observations?: string;
  vente?: Vente;
}

export interface Paiement {
  id: number;
  date: string;
  mode_paiement: string;
  montant: number;
  reste?: number;
  id_facture: number;
  id_vente?: number;
  id_client?: number;
  facturation?: Facturation;
}

export interface Location {
  id: number;
  reference_location: string;
  id_client: number;
  id_voiture: number;
  date_debut: string;
  date_fin: string;
  montant_journalier: number;
  statut: string;
  client?: Client;
  voiture?: Voiture;
}

export interface Garantie {
  id: number;
  id_voiture: number;
  type_garantie: string;
  date_debut: string;
  date_fin: string;
  duree_garantie?: number;
  voiture?: Voiture;
}

export interface Document {
  id: number;
  type_document: string;
  numero_document: string;
  date_document?: string;
  id_client?: number;
  id_vente?: number;
  id_voiture?: number;
  id_employe?: number;
  date_expiration?: string;
  client?: Client;
  vente?: Vente;
  voiture?: Voiture;
}

export interface TicketSav {
  id: number;
  reference_ticket: string;
  id_client: number;
  id_voiture: number;
  id_responsable: number;
  objet: string;
  description?: string;
  priorite?: string;
  statut: string;
  client?: Client;
  voiture?: Voiture;
  responsable?: Employe;
}

export interface OrdreTravail {
  id: number;
  reference_ot: string;
  id_voiture: number;
  id_ticket_sav?: number;
  id_technicien?: number;
  description: string;
  priorite?: string;
  deadline?: string;
  statut: string;
  voiture?: Voiture;
  ticket_sav?: TicketSav;
  technicien?: Employe;
}

export interface PieceStock {
  id: number;
  reference: string;
  nom: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  seuil_alerte: number;
  id_fournisseur?: number;
  fournisseur?: Fournisseur;
}

// ============================================
// Types reporting
// ============================================

export interface ReportingPayload {
  year: number;
  voituresDisponibles?: number;
  salesMonthly?: Array<{ label: string; count: number; amount: number }>;
  financeStats?: {
    encaissements_mois?: number;
    factures_impayees?: number;
    factures_en_retard?: number;
    reste_global?: number;
  };
  stockStats?: {
    alertes?: number;
    valeur_stock?: number;
    references?: number;
    entrees_mois?: number;
    sorties_mois?: number;
    top_alerts?: Array<{ id: number; designation: string; quantite_stock: number; seuil_alerte: number }>;
  };
  savStats?: {
    tickets_ouverts?: number;
    tickets_resolus_mois?: number;
    ordres_ouverts?: number;
    ordres_en_retard?: number;
  };
  locationStats?: {
    en_cours?: number;
    reservations?: number;
    retards?: number;
    retours_mois?: number;
  };
  paymentModes?: Array<{ mode_paiement: string; total: number; montant: number }>;
  conformiteStats?: {
    assurances_expirant?: number;
    assurances_expirees?: number;
    sinistres_ouverts?: number;
    entretiens_a_venir?: number;
    cout_entretien_mois?: number;
    cout_carburant_mois?: number;
  };
}