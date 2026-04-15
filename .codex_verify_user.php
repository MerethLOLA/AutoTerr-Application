<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\\Contracts\\Console\\Kernel');
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::query()->where('email', 'lolasemerethrebecca@gmail.com')->first();

echo json_encode([
    'found' => (bool) $user,
    'password_ok' => $user ? Hash::check('passer', $user->password) : false,
    'password_hash_ok' => $user ? Hash::check('passer', $user->password_hash) : false,
], JSON_UNESCAPED_SLASHES) . PHP_EOL;
