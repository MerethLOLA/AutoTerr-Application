<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\\Contracts\\Console\\Kernel');
$kernel->bootstrap();
echo 'default_db=' . config('database.default') . PHP_EOL;
echo 'mysql_db=' . config('database.connections.mysql.database') . PHP_EOL;
echo 'user_count=' . Illuminate\Support\Facades\DB::table('users')->count() . PHP_EOL;
$users = Illuminate\Support\Facades\DB::table('users')->select('id','username','email','role','statut')->limit(5)->get();
foreach ($users as $user) {
    echo json_encode($user, JSON_UNESCAPED_SLASHES) . PHP_EOL;
}
