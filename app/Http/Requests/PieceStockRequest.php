<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PieceStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference' => ['required', 'string', 'max:100'],
            'designation' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
            'prix_unitaire' => ['required', 'numeric', 'min:0'],
            'quantite_stock' => ['nullable', 'integer', 'min:0'],
            'seuil_alerte' => ['nullable', 'integer', 'min:0'],
            'id_fournisseur' => ['nullable', 'integer', 'exists:fournisseurs,id'],
            'statut' => ['nullable', 'string', 'max:50'],
        ];
    }
}
