export type ModuleStatus = 'api-ready' | 'api-needed' | 'frontend-draft';
export type ModuleKind = 'crud' | 'workflow' | 'analytics' | 'settings';

export interface ModuleColumn {
  label: string;
  key: string;
}

export interface ModuleFormField {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'file';
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  optionsEndpoint?: string;
  optionLabel?: string;
  optionFormatter?: (option: any) => string;
  defaultValue?: string | number;
  readOnly?: boolean;
  hidden?: boolean;
}

export interface ModuleDefinition {
  title: string;
  description: string;
  endpoint?: string;
  kind?: ModuleKind;
  status: ModuleStatus;
  primaryAction: string;
  fields: string[];
  columns?: ModuleColumn[];
  formFields?: ModuleFormField[];
  detailRoute?: string;
  exportRoute?: string;  // ex: 'facturations' → /facturations/{id}/export
  exportFilename?: (item: any) => string;
  transformOnSubmit?: (data: Record<string, string | number>, context: { isEditing: boolean }) => Record<string, string | number>;
  // Configuration menu
  menu?: {
    label: string;
    icon?: string;
    badge?: number | { endpoint: string; path: string };
  };
  hideFromDynamicMenu?: boolean;
}

// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
export const modules: Record<string, ModuleDefinition> = {
  dashboard: {
    title: 'Tableau de bord',
    description: 'KPIs temps reel, alertes metier et pilotage global du parc automobile.',
    kind: 'analytics',
    status: 'api-ready',
    primaryAction: 'Actualiser les KPIs',
    fields: ['Ventes du mois', 'Chiffre affaires', 'Vehicules disponibles', 'Stock critique'],
    menu: { label: 'Tableau de bord' },
    hideFromDynamicMenu: true,
  },
  voitures: {
    title: 'Vehicules',
    description: '',
    endpoint: '/voitures',
    kind: 'crud',
    status: 'api-ready',
      detailRoute: 'voitures',
      primaryAction: 'Ajouter un vehicule',
    fields: ['Marque', 'Modele', 'Annee', 'Prix XOF', 'Statut'],
    columns: [
      { label: 'Marque', key: 'marque' },
      { label: 'Modele', key: 'modele' },
      { label: 'Annee', key: 'annee' },
      { label: 'Prix XOF', key: 'prix' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Marque', name: 'marque', required: true },
      { label: 'Modele', name: 'modele', required: true },
      { label: 'Annee', name: 'annee', type: 'number' },
      { label: 'Prix XOF', name: 'prix', type: 'number', required: true },
      { label: 'Numero chassis', name: 'numero_chassis', required: true },
      { label: 'Couleur', name: 'couleur' },
      { label: 'Statut', name: 'statut', required: true },
      { label: 'Fournisseur', name: 'id_fournisseur', type: 'select', optionsEndpoint: '/fournisseurs', optionFormatter: (option) => option?.nom || `Fournisseur #${option?.id}` },
      { label: 'Energie', name: 'energie' },
      { label: 'Kilometrage', name: 'kilometrage', type: 'number' },
      { label: 'Etat', name: 'etat' },
      { label: 'Type boite', name: 'type_boite' },
      { label: 'Date acquisition', name: 'date_acquisition', type: 'date' },
      { label: 'Description', name: 'description', type: 'textarea' },
      { label: 'Photos', name: 'images', type: 'file', multiple: true, accept: 'image/*' },
    ],
    menu: { label: 'Vehicules' },
  },
  clients: {
    title: 'Clients',
    description: '',
    endpoint: '/clients',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ajouter un client',
    fields: ['Nom', 'Telephone', 'Email', 'Type client', 'Classe'],
    columns: [
      { label: 'Nom', key: 'nom' },
      { label: 'Telephone', key: 'telephone' },
      { label: 'Email', key: 'email' },
      { label: 'Type client', key: 'type_client' },
      { label: 'Classe', key: 'classe' },
    ],
    formFields: [
      { label: 'Nom', name: 'nom', required: true },
      { label: 'Prenom', name: 'prenom' },
      { label: 'Contact', name: 'contact' },
      { label: 'Telephone', name: 'telephone' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Adresse', name: 'adresse', type: 'textarea' },
      { label: 'Piece identite', name: 'piece_identite' },
      { label: 'Numero piece', name: 'numero_piece' },
      { label: 'Numero piece 2', name: 'numero_piece2' },
      { label: 'Type client', name: 'type_client' },
      { label: 'Classe', name: 'classe' },
      { label: 'Raison sociale', name: 'raison_sociale' },
      { label: 'Numero SIRET', name: 'numero_siret' },
      { label: 'Date naissance', name: 'date_naissance', type: 'date' },
      { label: 'Vendeur attribue', name: 'id_vendeur_attribue', type: 'select', optionsEndpoint: '/employes', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Employe #${option?.id}` },
    ],
    menu: { label: 'Clients' },
  },
  fournisseurs: {
    title: 'Fournisseurs',
    description: '',
    endpoint: '/fournisseurs',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ajouter un fournisseur',
    fields: ['Nom', 'Contact', 'Pays origine', 'Vehicules fournis'],
    columns: [
      { label: 'Nom', key: 'nom' },
      { label: 'Telephone', key: 'telephone' },
      { label: 'Email', key: 'email' },
      { label: 'Pays origine', key: 'pays_origine' },
    ],
    formFields: [
      { label: 'Nom', name: 'nom', required: true },
      { label: 'Adresse', name: 'adresse', type: 'textarea' },
      { label: 'Telephone', name: 'telephone' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Lien', name: 'lien' },
      { label: 'Adresse bureau', name: 'adresse_bureau', type: 'textarea' },
      { label: 'Pays origine', name: 'pays_origine' },
      { label: 'Vehicules fournis', name: 'vehicule_fournis', type: 'textarea' },
    ],
    menu: { label: 'Fournisseurs' },
  },
  ventes: {
    title: 'Ventes',
    description: '',
    endpoint: '/ventes',
    kind: 'workflow',
    status: 'api-ready',
    primaryAction: 'Nouvelle vente',
    fields: ['Reference', 'Client', 'Vehicule', 'Prix final', 'Statut'],
    columns: [
      { label: 'Reference', key: 'reference_vente' },
      { label: 'Client', key: 'client.nom' },
      { label: 'Vehicule', key: 'voiture.marque' },
      { label: 'Prix final', key: 'prix_final' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Date vente', name: 'date_vente', type: 'date', required: true },
      { label: 'Client', name: 'id_client', type: 'select', required: true, optionsEndpoint: '/clients', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Client #${option?.id}` },
      { label: 'Vehicule', name: 'id_voiture', type: 'select', required: true, optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Prix final', name: 'prix_final', type: 'number', required: true },
      { label: 'Statut', name: 'statut', required: true },
      { label: 'Employe', name: 'id_employe', type: 'select', required: true, optionsEndpoint: '/employes', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Employe #${option?.id}` },
    ],
    menu: { label: 'Nouvelle vente' },
  },
  facturations: {
    title: 'Facturation',
    description: '',
    endpoint: '/facturations',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Creer une facture',
    fields: ['Numero', 'Vente', 'Montant HT', 'Montant TTC', 'Statut'],
    columns: [
      { label: 'Numero', key: 'numero_facture' },
      { label: 'Vente', key: 'vente.reference_vente' },
      { label: 'Montant HT', key: 'montant_ht' },
      { label: 'Montant TTC', key: 'montant_ttc' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Vente', name: 'id_vente', type: 'select', required: true, optionsEndpoint: '/ventes', optionFormatter: (option) => option?.reference_vente || `Vente #${option?.id}` },
      { label: 'Date facture', name: 'date_facture', type: 'date', required: true },
      { label: 'Montant', name: 'montant', type: 'number' },
      { label: 'Remise', name: 'remise', type: 'number' },
      { label: 'TVA', name: 'taux_tva', type: 'number', defaultValue: 18 },
      { label: 'Statut', name: 'statut' },
      { label: 'Mode livraison', name: 'mode_livraison' },
      { label: 'Echeance', name: 'date_echeance', type: 'date' },
      { label: 'Observations', name: 'observations', type: 'textarea' },
    ],
    exportRoute: 'facturations',
    exportFilename: (item) => `facture-${item.numero_facture ?? item.id}.pdf`,
    menu: { label: 'Facturation' },
  },
  paiements: {
    title: 'Paiements',
    description: '',
    endpoint: '/paiements',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Enregistrer un paiement',
    fields: ['Date', 'Mode', 'Montant', 'Reste', 'Facture'],
    columns: [
      { label: 'Date', key: 'date' },
      { label: 'Mode', key: 'mode_paiement' },
      { label: 'Montant', key: 'montant' },
      { label: 'Reste', key: 'reste' },
      { label: 'Facture', key: 'facturation.numero_facture' },
    ],
    formFields: [
      { label: 'Date', name: 'date', type: 'date', required: true },
      { label: 'Mode paiement', name: 'mode_paiement', required: true },
      { label: 'Montant', name: 'montant', type: 'number', required: true },
      { label: 'Facture', name: 'id_facture', type: 'select', required: true, optionsEndpoint: '/facturations', optionFormatter: (option) => option?.numero_facture || `Facture #${option?.id}` },
      { label: 'Vente', name: 'id_vente', type: 'select', hidden: true, optionsEndpoint: '/ventes', optionFormatter: (option) => option?.reference_vente || `Vente #${option?.id}` },
      { label: 'Client', name: 'id_client', type: 'select', hidden: true, optionsEndpoint: '/clients', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Client #${option?.id}` },
    ],
    transformOnSubmit: (data) => {
      const next = { ...data };
      delete next.id_vente;
      delete next.id_client;
      return next;
    },
    exportRoute: 'paiements',
    exportFilename: (item) => `recu-paiement-${item.id}.pdf`,
    menu: { label: 'Paiements' },
  },
  garanties: {
    title: 'Garanties',
    description: '',
    endpoint: '/garanties',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ajouter une garantie',
    fields: ['Vehicule', 'Type', 'Date debut', 'Date fin'],
    columns: [
      { label: 'Vehicule', key: 'voiture.marque' },
      { label: 'Type', key: 'type_garantie' },
      { label: 'Date debut', key: 'date_debut' },
      { label: 'Date fin', key: 'date_fin' },
    ],
    formFields: [
      { label: 'Vehicule', name: 'id_voiture', type: 'select', required: true, optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Type de garantie', name: 'type_garantie', required: true },
      { label: 'Duree (jours)', name: 'duree_garantie', type: 'number' },
      { label: 'Date debut', name: 'date_debut', type: 'date', required: true },
      { label: 'Date fin', name: 'date_fin', type: 'date', required: true },
    ],
    exportRoute: 'garanties',
    exportFilename: (item) => `garantie-${item.id}.pdf`,
    menu: { label: 'Garanties' },
  },
  documents: {
    title: 'Documents',
    description: '',
    endpoint: '/documents',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ajouter un document',
    fields: ['Type', 'Numero', 'Client', 'Vente', 'Expiration'],
    columns: [
      { label: 'Type', key: 'type_document' },
      { label: 'Numero', key: 'numero_document' },
      { label: 'Client', key: 'client.nom' },
      { label: 'Vente', key: 'vente.reference_vente' },
      { label: 'Expiration', key: 'date_expiration' },
    ],
    formFields: [
      { label: 'Type document', name: 'type_document', required: true },
      { label: 'Numero document', name: 'numero_document' },
      { label: 'Date document', name: 'date_document', type: 'date' },
      { label: 'Date production', name: 'date_production', type: 'date' },
      { label: 'Client', name: 'id_client', type: 'select', optionsEndpoint: '/clients', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Client #${option?.id}` },
      { label: 'Vente', name: 'id_vente', type: 'select', optionsEndpoint: '/ventes', optionFormatter: (option) => option?.reference_vente || `Vente #${option?.id}` },
      { label: 'Vehicule', name: 'id_voiture', type: 'select', optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Employe', name: 'id_employe', type: 'select', optionsEndpoint: '/employes', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Employe #${option?.id}` },
      { label: 'Expiration', name: 'date_expiration', type: 'date' },
      { label: 'Chemin fichier', name: 'chemin_fichier' },
    ],
    menu: { label: 'Documents' },
  },
  sav: {
    title: 'SAV',
    description: '',
    endpoint: '/tickets-sav',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ouvrir un ticket',
    fields: ['Reference', 'Client', 'Vehicule', 'Priorite', 'Statut'],
    columns: [
      { label: 'Reference', key: 'reference_ticket' },
      { label: 'Client', key: 'client.nom' },
      { label: 'Vehicule', key: 'voiture.marque' },
      { label: 'Priorite', key: 'priorite' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Client', name: 'id_client', type: 'select', required: true, optionsEndpoint: '/clients', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Client #${option?.id}` },
      { label: 'Vehicule', name: 'id_voiture', type: 'select', required: true, optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Responsable', name: 'id_responsable', type: 'select', required: true, optionsEndpoint: '/employes', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Employe #${option?.id}` },
      { label: 'Garantie', name: 'id_garantie', type: 'select', optionsEndpoint: '/garanties', optionFormatter: (option) => option?.type_garantie || `Garantie #${option?.id}` },
      { label: 'Objet', name: 'objet', required: true },
      { label: 'Priorite', name: 'priorite' },
      { label: 'Description', name: 'description', type: 'textarea' },
      { label: 'Statut', name: 'statut' },
      { label: 'Date ouverture', name: 'date_ouverture', type: 'date' },
      { label: 'Date resolution', name: 'date_resolution', type: 'date' },
    ],
    detailRoute: 'sav',
    menu: { label: 'SAV' },
  },
  atelier: {
    title: 'Atelier',
    description: '',
    endpoint: '/ordres-travail',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Nouvel ordre de travail',
    fields: ['Reference OT', 'Vehicule', 'Technicien', 'Priorite', 'Statut'],
    columns: [
      { label: 'Reference OT', key: 'reference_ot' },
      { label: 'Vehicule', key: 'voiture.marque' },
      { label: 'Technicien', key: 'technicien.nom' },
      { label: 'Priorite', key: 'priorite' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Vehicule', name: 'id_voiture', type: 'select', required: true, optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Ticket SAV', name: 'id_ticket_sav', type: 'select', optionsEndpoint: '/tickets-sav', optionFormatter: (option) => option?.reference_ticket || `Ticket #${option?.id}` },
      { label: 'Technicien', name: 'id_technicien', type: 'select', optionsEndpoint: '/employes', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Employe #${option?.id}` },
      { label: 'Priorite', name: 'priorite' },
      { label: 'Deadline', name: 'deadline', type: 'date' },
      { label: 'Description', name: 'description', type: 'textarea', required: true },
    ],
    detailRoute: 'atelier',
    menu: { label: 'Atelier' },
  },
  locations: {
    title: 'Locations',
    description: '',
    endpoint: '/locations',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Nouvelle location',
    fields: ['Reference', 'Client', 'Vehicule', 'Debut', 'Fin', 'Statut'],
    columns: [
      { label: 'Reference', key: 'reference_location' },
      { label: 'Client', key: 'client.nom' },
      { label: 'Vehicule', key: 'voiture.marque' },
      { label: 'Debut', key: 'date_debut' },
      { label: 'Fin', key: 'date_fin' },
      { label: 'Statut', key: 'statut' },
    ],
    formFields: [
      { label: 'Client', name: 'id_client', type: 'select', required: true, optionsEndpoint: '/clients', optionFormatter: (option) => [option?.nom, option?.prenom].filter(Boolean).join(' ') || `Client #${option?.id}` },
      { label: 'Vehicule', name: 'id_voiture', type: 'select', required: true, optionsEndpoint: '/voitures', optionFormatter: (option) => [option?.marque, option?.modele].filter(Boolean).join(' ') || `Vehicule #${option?.id}` },
      { label: 'Date debut', name: 'date_debut', type: 'date', required: true },
      { label: 'Date fin', name: 'date_fin', type: 'date', required: true },
      { label: 'Tarif journalier', name: 'tarif_journalier', type: 'number', required: true },
      { label: 'Caution', name: 'caution', type: 'number' },
      { label: 'Statut', name: 'statut' },
      { label: 'Observations', name: 'observations', type: 'textarea' },
    ],
    detailRoute: 'locations',
    exportRoute: 'locations',
    exportFilename: (item) => `contrat-${item.reference_location ?? item.id}.pdf`,
    menu: { label: 'Locations' },
  },
  stock: {
    title: 'Stock',
    description: '',
    endpoint: '/pieces-stock',
    kind: 'crud',
    status: 'api-ready',
    primaryAction: 'Ajouter une piece',
    fields: ['Reference', 'Designation', 'Prix unitaire', 'Quantite', 'Seuil'],
    columns: [
      { label: 'Reference', key: 'reference' },
      { label: 'Designation', key: 'designation' },
      { label: 'Prix unitaire', key: 'prix_unitaire' },
      { label: 'Quantite', key: 'quantite_stock' },
      { label: 'Seuil', key: 'seuil_alerte' },
    ],
    formFields: [
      { label: 'Reference', name: 'reference', required: true },
      { label: 'Designation', name: 'designation', required: true },
      { label: 'Prix unitaire', name: 'prix_unitaire', type: 'number', required: true },
      { label: 'Quantite', name: 'quantite_stock', type: 'number' },
      { label: 'Seuil alerte', name: 'seuil_alerte', type: 'number' },
      { label: 'Statut', name: 'statut' },
    ],
    menu: { label: 'Stock' },
  },
  reporting: {
    title: 'Reporting',
    description: '',
    endpoint: '/reporting',
    kind: 'analytics',
    status: 'api-ready',
    primaryAction: 'Exporter les rapports',
    fields: ['CA mensuel', 'Classement vendeurs', 'Stock critique', 'Paiements attente'],
    menu: { label: 'Reporting' },
  },
  profile: {
    title: 'Profil',
    description: '',
    kind: 'settings',
    status: 'api-ready',
    primaryAction: 'Mettre a jour le profil',
    fields: ['Nom', 'Email', 'Role'],
    menu: { label: 'Profil' },
  },
  settings: {
    title: 'Parametres',
    description: '',
    kind: 'settings',
    status: 'api-ready',
    primaryAction: 'Enregistrer les parametres',
    fields: ['Theme', 'Langue', 'Mot de passe'],
    menu: { label: 'Parametres' },
    hideFromDynamicMenu: true,
  },
};
