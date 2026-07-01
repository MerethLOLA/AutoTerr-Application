<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

chdir('/var/www/html');
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

$content = '{"marque":"Toyota","modele":"Yaris","statut":"disponible","type_usage":"location","prix":25000}';
$request = \Illuminate\Http\Request::create('/api/voitures', 'POST', [], [], [], [], $content);
$request->headers->set('Authorization', 'Bearer 62|odbHtGKuflBrxKFhJ0VqwJtCiwizuZdDJpgBxN6T810134d5');
$request->headers->set('Accept', 'application/json');
$request->headers->set('Content-Type', 'application/json');

try {
    $response = $kernel->handle($request);
    echo "STATUS: " . $response->getStatusCode() . PHP_EOL;
    echo $response->getContent() . PHP_EOL;
} catch(Throwable $e) {
    echo 'EXCEPTION: ' . $e->getMessage() . PHP_EOL;
    echo $e->getFile() . ':' . $e->getLine() . PHP_EOL;
    echo $e->getTraceAsString();
}
