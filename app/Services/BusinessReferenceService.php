<?php

namespace App\Services;

use App\Models\Facturation;
use App\Models\TicketSav;

class BusinessReferenceService
{
    public function nextFacture(): string
    {
        return $this->nextReference('FAC', Facturation::class, 'numero_facture');
    }

    public function nextTicketSav(): string
    {
        return $this->nextReference('SAV', TicketSav::class, 'reference_ticket');
    }

    private function nextReference(string $prefix, string $modelClass, string $column): string
    {
        $date = now()->format('Ymd');
        $pattern = $prefix.'-'.$date.'-';

        $lastReference = $modelClass::query()
            ->where($column, 'like', $pattern.'%')
            ->orderByDesc($column)
            ->value($column);

        $lastNumber = 0;

        if ($lastReference && preg_match('/(\d{4})$/', $lastReference, $matches)) {
            $lastNumber = (int) $matches[1];
        }

        return sprintf('%s-%s-%04d', $prefix, $date, $lastNumber + 1);
    }
}
