<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_vente' => ['nullable', 'integer', 'exists:ventes,id'],
            'id_client' => ['nullable', 'integer', 'exists:clients,id'],
            'id_employe' => ['nullable', 'integer', 'exists:employes,id'],
            'id_voiture' => ['nullable', 'integer', 'exists:voitures,id'],
            'type_document' => ['required', 'string', 'max:100'],
            'date_document' => ['nullable', 'date'],
            'numero_document' => ['nullable', 'string', 'max:100'],
            'date_production' => ['nullable', 'date'],
            'date_expiration' => ['nullable', 'date'],
            'chemin_fichier' => ['nullable', 'string', 'max:255'],
        ];
    }
}
