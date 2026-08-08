<?php

use Illuminate\Support\Facades\Broadcast;

// Canal public — toutes les notifications temps-réel de l'application
Broadcast::channel('autoterr-notifications', function () {
    return true;
});

// Canal privé par rôle (pour usage futur)
Broadcast::channel('employees', function ($user) {
    return in_array($user->role, ['admin', 'super_admin', 'manager', 'commercial', 'sav', 'atelier']);
});
