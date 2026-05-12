<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrdreTravailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'id_voiture' => [$required, 'integer', 'exists:voitures,id'],
            'id_ticket_sav' => ['nullable', 'integer', 'exists:tickets_sav,id'],
            'description' => [$required, 'string'],
            'priorite' => ['nullable', 'string', 'max:50'],
            'deadline' => ['nullable', 'date'],
            'statut' => ['nullable', 'string', 'max:50'],
            'id_technicien' => ['nullable', 'integer', 'exists:employes,id'],
        ];
    }
}
