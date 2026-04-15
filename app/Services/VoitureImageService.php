<?php

namespace App\Services;

use App\Models\Voiture;
use App\Models\ImageVoiture;
use Illuminate\Support\Facades\Storage;

class VoitureImageService
{
    /**
     * Upload une image de voiture
     *
     * @param Voiture $voiture
     * @param mixed $file
     * @param string $vue (exemple: 'avant', 'arriere', 'interieur', 'profil')
     * @param string|null $description
     * @return ImageVoiture
     */
    public function uploadImage(Voiture $voiture, $file, string $vue = 'principale', ?string $description = null): ImageVoiture
    {
        // Créer le dossier de la voiture : storage/app/voitures/{id}/
        $folder = "voitures/{$voiture->id}";
        
        // Générer un nom unique
        $filename = time() . '_' .  uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Sauvegarder le fichier
        $path = $file->storeAs(
            $folder,
            $filename,
            'public'
        );
        
        // Obtenir les dimensions de l'image
        $fullPath = storage_path("app/public/{$path}");
        [$width, $height] = getimagesize($fullPath);
        
        // Créer un enregistrement ImageVoiture
        $image = ImageVoiture::create([
            'id_voiture' => $voiture->id,
            'chemin' => "/storage/{$path}",
            'vue' => $vue,
            'description' => $description,
            'largeur' => $width,
            'hauteur' => $height,
            'taille' => filesize($fullPath),
            'legible' => true,
        ]);
        
        return $image;
    }
    
    /**
     * Supprimer une image de voiture
     *
     * @param ImageVoiture $image
     * @return bool
     */
    public function deleteImage(ImageVoiture $image): bool
    {
        // Supprimer le fichier physique
        $path = str_replace('/storage/', '', $image->chemin);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        
        // Supprimer l'enregistrement BD
        return $image->delete();
    }
    
    /**
     * Obtenir les images d'une voiture
     *
     * @param Voiture $voiture
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getImages(Voiture $voiture)
    {
        return $voiture->images()->orderBy('vue')->get();
    }
    
    /**
     * Obtenir l'image principale d'une voiture
     *
     * @param Voiture $voiture
     * @return ImageVoiture|null
     */
    public function getPrincipalImage(Voiture $voiture): ?ImageVoiture
    {
        return $voiture->images()
            ->where('vue', 'principale')
            ->first();
    }
    
    /**
     * Mettre à jour l'ordre des images
     *
     * @param Voiture $voiture
     * @param array $imageIds Tableau des IDs dans l'ordre souhaité
     * @return void
     */
    public function reorderImages(Voiture $voiture, array $imageIds): void
    {
        foreach ($imageIds as $index => $imageId) {
            $image = ImageVoiture::where('id_voiture', $voiture->id)
                ->find($imageId);
            
            if ($image) {
                $image->update(['ordre' => $index + 1]);
            }
        }
    }
}
