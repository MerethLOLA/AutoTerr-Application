<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PreferencesController extends Controller
{
    /**
     * Switch user theme (dark/light)
     */
    public function setTheme(Request $request, $theme)
    {
        if (!in_array($theme, ['light', 'dark'])) {
            return response()->json(['error' => 'Invalid theme'], 400);
        }

        if ($request->user()) {
            $request->user()->update(['theme' => $theme]);
        }

        return response()->json([
            'ok' => true,
            'theme' => $theme,
            'message' => __('ui.preferences.theme_updated'),
        ]);
    }

    /**
     * Switch user language
     */
    public function setLanguage(Request $request, $locale)
    {
        if (!in_array($locale, ['en', 'fr'])) {
            return redirect()->back();
        }

        // Set session locale
        session(['locale' => $locale]);
        
        // If authenticated, update user preference
        if ($request->user()) {
            $request->user()->update(['locale' => $locale]);
        }

        // Redirect back with new locale
        return redirect()->back()->with('locale_changed', true);
    }
}
