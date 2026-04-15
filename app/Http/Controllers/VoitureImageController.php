<?php

namespace App\Http\Controllers;

use App\Models\Voiture;
use App\Models\ImageVoiture;
use App\Services\VoitureImageService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class VoitureImageController extends Controller
{
    protected VoitureImageService $imageService;
    
    public function __construct(VoitureImageService $imageService)
    {
        $this->imageService = $imageService;
    }
    
    /**
     * Afficher les images d'une voiture
     */
    public function index(Voiture $voiture): View
    {
        $images = $this->imageService->getImages($voiture);
        
        return view('voitures.images.index', compact('voiture', 'images'));
    }
    
    /**
     * Formulaire d'upload d'image
     */
    public function create(Voiture $voiture): View
    {
        return view('voitures.images.create', compact('voiture'));
    }
    
    /**
     * Sauvegarder une image
     */
    public function store(Request $request, Voiture $voiture)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'vue' => 'required|in:principale,avant,arriere,interieur,profil,autre',
            'description' => 'nullable|string|max:255',
        ]);
        
        try {
            $image = $this->imageService->uploadImage(
                $voiture,
                $request->file('image'),
                $request->input('vue'),
                $request->input('description')
            );
            
            return redirect()
                ->route('voitures.images.index', $voiture)
                ->with('success', __('Image ajoutée avec succès'));
        } catch (\Exception $e) {
            return back()
                ->withError(__('Erreur lors du téléchargement: ' . $e->getMessage()))
                ->withInput();
        }
    }
    
    /**
     * Supprimer une image
     */
    public function destroy(Voiture $voiture, ImageVoiture $image)
    {
        // Vérifier que l'image appartient à la voiture
        if ($image->id_voiture !== $voiture->id) {
            abort(403, 'Accès non autorisé');
        }
        
        $this->imageService->deleteImage($image);
        
        return redirect()
            ->route('voitures.images.index', $voiture)
            ->with('success', __('Image supprimée avec succès'));
    }
    
    /**
     * Mettre à jour la description d'une image
     */
    public function update(Request $request, Voiture $voiture, ImageVoiture $image)
    {
        if ($image->id_voiture !== $voiture->id) {
            abort(403, 'Accès non autorisé');
        }
        
        $request->validate([
            'description' => 'nullable|string|max:255',
            'vue' => 'required|in:principale,avant,arriere,interieur,profil,autre',
        ]);
        
        $image->update($request->only(['description', 'vue']));
        
        return redirect()
            ->route('voitures.images.index', $voiture)
            ->with('success', __('Image mise à jour avec succès'));
    }
}
