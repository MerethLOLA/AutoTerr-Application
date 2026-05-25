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
            'type_boite' => ['nullable', 'string', 'max:50'],
            'type_vehicule_id' => ['nullable', 'integer', 'exists:types_vehicules,id'],
            'origine_marque_id' => ['nullable', 'integer', 'exists:origines_marques,id'],
            'id_fournisseur' => ['nullable', 'integer', 'exists:fournisseurs,id'],
            'description' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ];
    }
}
