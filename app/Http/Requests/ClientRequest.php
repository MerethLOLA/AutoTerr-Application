<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client')?->id;

        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['nullable', 'string', 'max:255'],
            'adresse' => ['nullable', 'string', 'max:500'],
            'contact' => ['nullable', 'string', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('clients', 'email')->ignore($clientId)],
            'piece_identite' => ['nullable', 'string', 'max:100'],
            'numero_piece' => ['nullable', 'string', 'max:100'],
            'numero_piece2' => ['nullable', 'string', 'max:100'],
            'type_client' => ['nullable', 'string', 'max:100'],
            'classe' => ['nullable', 'string', 'max:100'],
            'raison_sociale' => ['nullable', 'string', 'max:255'],
            'numero_siret' => ['nullable', 'string', 'max:100'],
            'date_naissance' => ['nullable', 'date'],
            'id_vendeur_attribue' => ['nullable', 'integer', 'exists:employes,id'],
        ];
    }
}
