<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_vente' => ['required', 'date'],
            'id_client' => ['required', 'integer', 'exists:clients,id'],
            'id_voiture' => ['required', 'integer', 'exists:voitures,id'],
            'prix_final' => ['required', 'numeric', 'min:0'],
            'remise' => ['nullable', 'numeric', 'min:0'],
            'mode_paiement' => ['nullable', 'string', 'max:100'],
            'statut' => ['required', 'string', 'max:50'],
            'id_employe' => ['required', 'integer', 'exists:employes,id'],
            'observations' => ['nullable', 'string'],
        ];
    }
}
