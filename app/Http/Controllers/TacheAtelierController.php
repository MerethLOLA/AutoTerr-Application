<?php

namespace App\Http\Controllers;

use App\Http\Requests\TacheAtelierRequest;
use App\Models\OrdreTravail;
use App\Models\TacheAtelier;
use Illuminate\Http\Request;

class TacheAtelierController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('assign_taches');

        $taches = TacheAtelier::query()
            ->with('ordreTravail')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($taches);
        }

        return view('taches-atelier.index', compact('taches'));
    }

    public function create(Request $request)
    {
        $this->ensurePermission('assign_taches');

        return view('taches-atelier.create', [
            'tacheAtelier' => new TacheAtelier([
                'id_ordre_travail' => $request->integer('ordre'),
                'statut' => 'a_faire',
            ]),
            'ordres' => OrdreTravail::query()->orderByDesc('created_at')->get(['id', 'reference_ot']),
            'isEdit' => false,
        ]);
    }

    public function store(TacheAtelierRequest $request)
    {
        $this->ensurePermission('assign_taches');
        $tache = TacheAtelier::query()->create($request->validated());
        $this->logAction('create', 'tache_atelier', $tache, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $tache->id_ordre_travail)->with('success', 'Tache atelier ajoutee.');
        }

        return response()->json($tache->load('ordreTravail'), 201);
    }

    public function show(Request $request, TacheAtelier $tacheAtelier)
    {
        $this->ensurePermission('assign_taches');

        $tacheAtelier->load('ordreTravail');

        if ($request->wantsJson()) {
            return response()->json($tacheAtelier);
        }

        return view('taches-atelier.show', compact('tacheAtelier'));
    }

    public function edit(TacheAtelier $tacheAtelier)
    {
        $this->ensurePermission('assign_taches');

        return view('taches-atelier.edit', [
            'tacheAtelier' => $tacheAtelier,
            'ordres' => OrdreTravail::query()->orderByDesc('created_at')->get(['id', 'reference_ot']),
            'isEdit' => true,
        ]);
    }

    public function update(TacheAtelierRequest $request, TacheAtelier $tacheAtelier)
    {
        $this->ensurePermission('assign_taches');
        $tacheAtelier->update($request->validated());
        $this->logAction('update', 'tache_atelier', $tacheAtelier, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $tacheAtelier->id_ordre_travail)->with('success', 'Tache atelier mise a jour.');
        }

        return response()->json($tacheAtelier->fresh()->load('ordreTravail'));
    }

    public function destroy(TacheAtelier $tacheAtelier)
    {
        $this->ensurePermission('assign_taches');
        $this->logAction('delete', 'tache_atelier', $tacheAtelier, [], request());
        $ordreId = $tacheAtelier->id_ordre_travail;
        $tacheAtelier->delete();

        if (! request()->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordreId)->with('success', 'Tache atelier supprimee.');
        }

        return response()->json([], 204);
    }
}
