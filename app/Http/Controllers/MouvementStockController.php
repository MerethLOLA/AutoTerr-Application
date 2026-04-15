<?php

namespace App\Http\Controllers;

use App\Models\MouvementStock;
use Illuminate\Http\Request;

class MouvementStockController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_stock');

        $mouvements = MouvementStock::query()
            ->with('piece')
            ->when($request->filled('type_mouvement'), fn ($query) => $query->where('type_mouvement', $request->string('type_mouvement')->toString()))
            ->latest('date_mouvement')
            ->paginate(15);

        return response()->json($mouvements);
    }

    public function show(MouvementStock $mouvementStock)
    {
        $this->ensurePermission('view_stock');

        return response()->json($mouvementStock->load('piece'));
    }
}
