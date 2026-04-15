<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TacheAtelierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_ordre_travail' => ['required', 'integer', 'exists:ordres_travail,id'],
            'description' => ['required', 'string'],
            'statut' => ['nullable', 'string', 'max:50'],
            'temps_passe_minutes' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
