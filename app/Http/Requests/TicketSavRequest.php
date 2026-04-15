<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TicketSavRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_client' => ['required', 'integer', 'exists:clients,id'],
            'id_voiture' => ['required', 'integer', 'exists:voitures,id'],
            'id_responsable' => ['required', 'integer', 'exists:employes,id'],
            'id_garantie' => ['nullable', 'integer', 'exists:garanties,id'],
            'objet' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'statut' => ['nullable', 'string', 'max:50'],
            'priorite' => ['nullable', 'string', 'max:50'],
            'date_ouverture' => ['nullable', 'date'],
            'date_resolution' => ['nullable', 'date'],
        ];
    }
}
