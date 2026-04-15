<?php

namespace App\Http\Controllers;

use App\Models\NotificationInterne;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotificationInterneController extends Controller
{
    public function read(Request $request, NotificationInterne $notificationInterne): RedirectResponse
    {
        abort_if(($request->user()?->role ?? null) === 'client', Response::HTTP_FORBIDDEN);

        $notificationInterne->update(['lue_at' => now()]);

        return redirect($notificationInterne->url ?: route('dashboard'))
            ->with('success', 'Notification marquee comme lue.');
    }
}
