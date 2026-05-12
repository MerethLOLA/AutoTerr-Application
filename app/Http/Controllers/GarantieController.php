<?php

namespace App\Http\Controllers;

use App\Http\Requests\GarantieRequest;
use App\Models\Garantie;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class GarantieController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $garanties = Garantie::query()
            ->with('voiture')
            ->latest()
            ->paginate(15);

        return $this->apiCollection($garanties);
    }

    public function store(GarantieRequest $request)
    {
        $this->ensurePermission('view_voitures');

        $garantie = Garantie::query()->create($request->validated());
        $this->logAction('create', 'garantie', $garantie, $request->validated(), $request);

        return $this->apiItem($garantie->load('voiture'), 201, [
            'message' => 'Garantie creee',
        ]);
    }

    public function show(Garantie $garantie)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($garantie->load(['voiture', 'ticketsSav']));
    }

    public function update(GarantieRequest $request, Garantie $garantie)
    {
        $this->ensurePermission('view_voitures');

        $garantie->update($request->validated());
        $this->logAction('update', 'garantie', $garantie, $request->validated(), $request);

        return $this->apiItem($garantie->fresh()->load('voiture'), 200, [
            'message' => 'Garantie mise a jour',
        ]);
    }

    public function destroy(Garantie $garantie)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'garantie', $garantie, [], request());

        $garantie->delete();

        return $this->apiDeleted();
    }

    public function export(Garantie $garantie, DocumentExportService $exportService)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('export', 'garantie', $garantie, [], request());

        return $exportService->garantie($garantie);
    }
}
