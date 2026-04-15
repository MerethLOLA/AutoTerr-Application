<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        // Priority: authenticated user locale > session > config default
        $locale = config('app.locale', 'fr');
        
        // Check authenticated user's locale preference
        if ($request->user() && $request->user()->locale) {
            $locale = $request->user()->locale;
        } 
        // Check session locale
        elseif ($request->session()->has('locale')) {
            $locale = $request->session()->get('locale');
        }
        
        // Validate against supported locales
        if (!in_array($locale, ['en', 'fr'])) {
            $locale = 'fr';
        }
        
        app()->setLocale($locale);
        
        return $next($request);
    }
}
