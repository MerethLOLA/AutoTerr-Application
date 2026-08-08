<?php

namespace App\Support;

/** Convertit un entier en toutes lettres françaises (montants sur factures/reçus). */
class NombreEnLettres
{
    private const UNITES = [
        '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
        'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
    ];

    private const DIZAINES = [2 => 'vingt', 3 => 'trente', 4 => 'quarante', 5 => 'cinquante', 6 => 'soixante', 7 => 'soixante', 8 => 'quatre-vingt', 9 => 'quatre-vingt'];

    public static function convertir(int $nombre): string
    {
        if ($nombre === 0) {
            return 'zéro';
        }
        if ($nombre < 0) {
            return 'moins '.self::convertir(-$nombre);
        }

        return trim(preg_replace('/\s+/', ' ', self::groupe($nombre)));
    }

    public static function montantXof(float $montant): string
    {
        return ucfirst(self::convertir((int) round($montant))).' francs CFA';
    }

    private static function groupe(int $n): string
    {
        $milliards = intdiv($n, 1_000_000_000);
        $n %= 1_000_000_000;
        $millions = intdiv($n, 1_000_000);
        $n %= 1_000_000;
        $milliers = intdiv($n, 1000);
        $reste = $n % 1000;

        $parts = [];

        if ($milliards > 0) {
            $parts[] = $milliards === 1 ? 'un milliard' : self::sansPluriel(self::centaines($milliards)).' milliards';
        }
        if ($millions > 0) {
            $parts[] = $millions === 1 ? 'un million' : self::sansPluriel(self::centaines($millions)).' millions';
        }
        if ($milliers > 0) {
            $parts[] = $milliers === 1 ? 'mille' : self::sansPluriel(self::centaines($milliers)).' mille';
        }
        if ($reste > 0) {
            $parts[] = self::centaines($reste);
        }

        return implode(' ', $parts);
    }

    /** "cent"/"vingt" perdent leur 's' de pluriel quand ils sont suivis d'un autre mot numéral (ex: cinq cent mille, pas cinq cents mille). */
    private static function sansPluriel(string $mot): string
    {
        if (str_ends_with($mot, ' cents')) {
            return substr($mot, 0, -1);
        }
        if ($mot === 'quatre-vingts' || str_ends_with($mot, ' quatre-vingts')) {
            return substr($mot, 0, -1);
        }

        return $mot;
    }

    private static function centaines(int $n): string
    {
        if ($n < 20) {
            return self::UNITES[$n];
        }
        if ($n < 100) {
            return self::dizaines($n);
        }

        $centaines = intdiv($n, 100);
        $reste = $n % 100;

        $mot = $centaines === 1 ? 'cent' : self::UNITES[$centaines].' cent';
        if ($reste === 0 && $centaines > 1) {
            $mot .= 's';
        }
        if ($reste > 0) {
            $mot .= ' '.self::dizaines($reste);
        }

        return $mot;
    }

    private static function dizaines(int $n): string
    {
        if ($n < 20) {
            return self::UNITES[$n];
        }

        $d = intdiv($n, 10);
        $u = $n % 10;
        $base = self::DIZAINES[$d];

        if ($d === 7 || $d === 9) {
            if ($d === 7 && $u === 1) {
                return $base.' et onze';
            }

            return $base.'-'.self::UNITES[10 + $u];
        }

        if ($u === 0) {
            return $d === 8 ? $base.'s' : $base;
        }
        if ($u === 1 && $d !== 8) {
            return $base.' et un';
        }

        return $base.'-'.self::UNITES[$u];
    }
}
