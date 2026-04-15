<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InterventionSavRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_ticket_sav' => ['required', 'integer', 'exists:tickets_sav,id'],
            'id_employe' => ['nullable', 'integer', 'exists:employes,id'],
            'description' => ['required', 'string'],
            'statut' => ['nullable', 'string', 'max:50'],
            'temps_passe_minutes' => ['nullable', 'integer', 'min:0'],
            'date_intervention' => ['nullable', 'date'],
        ];
    }
}
