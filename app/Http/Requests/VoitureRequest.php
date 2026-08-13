<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VoitureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $voitureId = $this->route('voiture')?->id;
        $chassisRules = ['nullable', 'string', 'max:100', Rule::unique('voitures', 'numero_chassis')->ignore($voitureId)];

        if ($voitureId) {
            $chassisRules[0] = 'required';
        }

        return [
            'marque' => ['required', 'string', 'max:100'],
            'modele' => ['required', 'string', 'max:100'],
            'annee' => ['nullable', 'integer', 'min:1900', 'max:' . (now()->year + 1)],
            'couleur' => ['nullable', 'string', 'max:50'],
            'prix'       => ['nullable', 'numeric', 'min:0'],
            'prix_vente' => ['nullable', 'numeric', 'min:0'],
            'type_usage' => ['nullable', 'string', 'in:location,vente,les_deux'],
            'kilometrage' => ['nullable', 'integer', 'min:0'],
            'numero_chassis' => $chassisRules,
            'date_acquisition' => ['nullable', 'date'],
            'statut' => ['required', 'string', 'max:50'],
            'etat' => ['nullable', 'string', 'max:50'],
            'energie' => ['nullable', 'string', 'max:50'],
            'puissance' => ['nullable', 'integer', 'min:1', 'max:5000'],
            'cylindree' => ['nullable', 'string', 'max:20'],
            'type_boite' => ['nullable', 'string', 'max:50'],
            'nombre_vitesses' => ['nullable', 'integer', 'min:1', 'max:12'],
            'transmission' => ['nullable', 'string', 'in:traction,propulsion,4x4'],
            'nombre_portes' => ['nullable', 'integer', 'min:1', 'max:10'],
            'nombre_places' => ['nullable', 'integer', 'min:1', 'max:100'],
            'consommation' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'emissions_co2' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'type_vehicule_id' => ['nullable', 'integer', 'exists:types_vehicules,id'],
            'origine_marque_id' => ['nullable', 'integer', 'exists:origines_marques,id'],
            'id_fournisseur' => ['nullable', 'integer', 'exists:fournisseurs,id'],
            'description' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ];
    }
}
