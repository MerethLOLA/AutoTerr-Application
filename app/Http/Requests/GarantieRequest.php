<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GarantieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_voiture'    => ['required', 'integer', 'exists:voitures,id'],
            'id_employe'    => ['nullable', 'integer', 'exists:employes,id'],
            'duree_garantie'=> ['nullable', 'integer', 'min:0'],
            'type_garantie' => ['required', 'string', 'max:100'],
            'date_debut'    => ['required', 'date'],
            'date_fin'      => ['required', 'date', 'after_or_equal:date_debut'],
        ];
    }
}
