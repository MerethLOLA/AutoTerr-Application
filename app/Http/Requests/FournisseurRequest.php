<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FournisseurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'adresse' => ['nullable', 'string', 'max:500'],
            'telephone' => ['nullable', 'string', 'max:50'],
            'contact' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'lien' => ['nullable', 'string', 'max:255'],
            'adresse_bureau' => ['nullable', 'string', 'max:500'],
            'pays_origine' => ['nullable', 'string', 'max:100'],
            'vehicule_fournis' => ['nullable', 'string'],
        ];
    }
}
