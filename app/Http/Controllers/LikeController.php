<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LikeController extends Controller
{
    public function toggle(Request $request, Voiture $voiture): JsonResponse
    {
        $fingerprint = substr(md5(($request->ip() ?? '') . ($request->userAgent() ?? '')), 0, 64);

        $exists = DB::table('voiture_likes')
            ->where('voiture_id', $voiture->id)
            ->where('fingerprint', $fingerprint)
            ->exists();

        if ($exists) {
            DB::table('voiture_likes')
                ->where('voiture_id', $voiture->id)
                ->where('fingerprint', $fingerprint)
                ->delete();
            $voiture->decrement('likes_count');
            $liked = false;
        } else {
            DB::table('voiture_likes')->insertOrIgnore([
                'voiture_id'  => $voiture->id,
                'fingerprint' => $fingerprint,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
            $voiture->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $voiture->fresh()->likes_count,
        ]);
    }

    public function status(Request $request, Voiture $voiture): JsonResponse
    {
        $fingerprint = substr(md5(($request->ip() ?? '') . ($request->userAgent() ?? '')), 0, 64);

        $liked = DB::table('voiture_likes')
            ->where('voiture_id', $voiture->id)
            ->where('fingerprint', $fingerprint)
            ->exists();

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $voiture->likes_count,
        ]);
    }
}
