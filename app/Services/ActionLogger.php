<?php

namespace App\Services;

use App\Models\ActionLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActionLogger
{
    public function log(string $action, string $module, ?Model $target = null, array $details = [], ?Request $request = null): void
    {
        $payload = [
            'user_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'target_type' => $target ? $target::class : null,
            'target_id' => $target?->getKey(),
            'details' => $details,
            'ip_address' => $request?->ip(),
        ];

        ActionLog::query()->create($payload);
        Log::info('action_log', $payload);
    }
}
