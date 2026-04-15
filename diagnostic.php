<?php

// Simple diagnostic using PDO
$host = '127.0.0.1';
$db = 'sunupark_db';
$user = 'sunupark_user';
$pass = 'p@sser123';

echo "\n=== SUNUPARK DIAGNOSTIC ===\n\n";

try {
    // Connexion PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    echo "✓ Connexion BD: OK\n";

    // Lister les colonnes de users
    $stmt = $pdo->prepare("DESCRIBE users");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $columnNames = array_column($columns, 'Field');
    
    echo "\n📋 Colonnes table 'users':\n";
    foreach ($columnNames as $col) {
        if ($col === 'locale') {
            echo "   ✓ $col\n";
        } elseif ($col === 'theme') {
            echo "   ✓ $col\n";
        } else {
            echo "   - $col\n";
        }
    }

    // Vérifier colonnes obligatoires
    echo "\n🔍 Vérification colonnes requises:\n";
    if (in_array('locale', $columnNames)) {
        echo "   ✓ Colonne 'locale': EXISTS\n";
    } else {
        echo "   ✗ Colonne 'locale': MISSING\n";
    }

    if (in_array('theme', $columnNames)) {
        echo "   ✓ Colonne 'theme': EXISTS\n";
    } else {
        echo "   ✗ Colonne 'theme': MISSING\n";
    }

    // Vérifier image_voitures
    $stmt2 = $pdo->prepare("DESCRIBE image_voitures");
    $stmt2->execute();
    $imgColumns = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    $imgColumnNames = array_column($imgColumns, 'Field');
    
    if (in_array('ordre', $imgColumnNames)) {
        echo "   ✓ Colonne 'ordre' (image_voitures): EXISTS\n";
    } else {
        echo "   ✗ Colonne 'ordre' (image_voitures): MISSING\n";
    }

    echo "\n✅ DIAGNOSTIC TERMINÉ\n\n";

} catch (PDOException $e) {
    echo "❌ ERREUR BD: " . $e->getMessage() . "\n\n";
    exit(1);
}

