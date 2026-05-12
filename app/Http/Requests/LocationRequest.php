<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'id_client' => [$required, 'integer', 'exists:clients,id'],
            'id_voiture' => [$required, 'integer', 'exists:voitures,id'],
            'date_debut' => [$required, 'date'],
            'date_fin' => [$required, 'date', 'after_or_equal:date_debut'],
            'date_retour_effective' => ['nullable', 'date'],
            'tarif_journalier' => [$required, 'numeric', 'min:0'],
            'statut' => ['nullable', 'string', 'max:50'],
            'caution' => ['nullable', 'numeric', 'min:0'],
            'observations' => ['nullable', 'string'],
        ];
    }
}
