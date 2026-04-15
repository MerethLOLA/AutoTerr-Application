<?php

namespace App\Http\Controllers;

use App\Models\Garantie;
use App\Services\DocumentExportService;

class GarantieController extends Controller
{
    public function index()
    {
        $this->ensurePermission('view_voitures');

        return response()->json(Garantie::query()->with('voiture')->latest()->paginate(15));
    }

    public function show(Garantie $garantie)
    {
        $this->ensurePermission('view_voitures');

        return response()->json($garantie->load(['voiture', 'ticketsSav']));
    }

    public function export(Garantie $garantie, DocumentExportService $exportService)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('export', 'garantie', $garantie, [], request());

        return $exportService->garantie($garantie);
    }
}
