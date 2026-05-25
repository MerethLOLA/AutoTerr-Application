<?php

use Illuminate\Support\Facades\Route;

// Point d'entrée Blade minimal — le frontend est géré par Next.js (SPA).
// Les routes métier sont toutes dans api.php.

Route::view('/', 'auth.login')->name('home');
