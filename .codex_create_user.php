<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\\Contracts\\Console\\Kernel');
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::query()->updateOrCreate(
    ['email' => 'lolasemerethrebecca@gmail.com'],
    [
        'name' => 'Rebecca',
        'username' => 'Rebecca',
        'password' => Hash::make('passer'),
        'password_hash' => Hash::make('passer'),
        'role' => 'admin',
        'statut' => 'actif',
    ]
);

echo json_encode([
    'id' => $user->id,
    'email' => $user->email,
    'username' => $user->username,
    'role' => $user->role,
    'statut' => $user->statut,
], JSON_UNESCAPED_SLASHES) . PHP_EOL;
