<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EtatLieuLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_location' => ['required', 'integer', 'exists:locations,id'],
            'type_etat' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'chemin_photo' => ['nullable', 'string', 'max:255'],
            'date_etat' => ['nullable', 'date'],
        ];
    }
}
