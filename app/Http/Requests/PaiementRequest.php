<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'mode_paiement' => ['required', 'string', 'max:100'],
            'reference_paiement' => ['nullable', 'string', 'max:100'],
            'banque' => ['nullable', 'string', 'max:150'],
            'montant' => ['required', 'numeric', 'min:0'],
            'reste' => ['nullable', 'numeric', 'min:0'],
            'id_facture' => ['nullable', 'integer', 'exists:facturations,id'],
            'id_vente' => ['nullable', 'integer', 'exists:ventes,id', 'required_without:id_facture'],
            'id_client' => ['nullable', 'integer', 'exists:clients,id', 'required_without:id_facture'],
        ];
    }
}
