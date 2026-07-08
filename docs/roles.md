# Mapping des rôles et appellations

Ce document liste les rôles recommandés, leurs clés techniques et une courte description. Utiliser ces clés pour les seeders, traductions et ACL.

| Clé technique | Appellation FR | Description courte |
|---|---|---|
| role_insurance | Assureur | Gestion des dossiers sinistres et liaison avec les assureurs |
| role_service_advisor | Conseiller SAV | Réception et suivi des réclamations, contact client |
| role_technician | Technicien Atelier | Diagnostics, interventions et mise à jour des ordres de travail |
| role_rental_agent | Agent Location | Gestion des contrats de location et états véhicules |
| role_sales | Commercial | Vente de véhicules et gestion prospects |
| role_fleet_manager | Responsable Parc | Supervision de la flotte et planning maintenance |
| role_accountant | Comptable | Facturation, encaissements et rapprochements |
| role_admin | Administrateur | Gestion utilisateurs, droits et rapports |
| role_client | Client | Accès front‑office pour gestion personnelle |

## Permissions suggérées (exemples)

- vehicles.create, vehicles.edit, vehicles.publish
- rentals.create, rentals.manage, rentals.return
- repairs.create, repairs.update_status, repairs.close
- claims.create, claims.process, claims.notify_insurer
- invoices.create, invoices.view, invoices.pay
- users.manage, roles.manage, reports.view

## Instructions

1. Lancer le seeder :

```bash
php artisan db:seed --class=Database\\Seeders\\RolesTableSeeder
```

2. Vérifier les libellés via `resources/lang/fr/roles.php` et afficher avec `__('roles.role_technician')`.
3. Adapter le mapping permissions → rôles dans `docs/roles.md` selon vos besoins opérationnels.
