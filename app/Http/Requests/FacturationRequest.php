<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FacturationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $facturationId = $this->route('facturation')?->id;

        return [
            'numero_facture' => ['nullable', 'string', 'max:100', Rule::unique('facturations', 'numero_facture')->ignore($facturationId)],
            'date_facture' => ['required', 'date'],
            'mode_livraison' => ['nullable', 'string', 'max:100'],
            'montant' => ['nullable', 'numeric', 'min:0'],
            'remise' => ['nullable', 'numeric', 'min:0'],
            'montant_ht' => ['nullable', 'numeric', 'min:0'],
            'taux_tva' => ['nullable', 'numeric', 'min:0'],
            'montant_ttc' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['nullable', 'string', 'max:50'],
            'date_echeance' => ['nullable', 'date'],
            'observations' => ['nullable', 'string'],
            'id_vente' => ['required', 'integer', 'exists:ventes,id'],
        ];
    }
}
