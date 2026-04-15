<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permissionId = $this->route('permission')?->id;

        return [
            'nom' => ['required', 'string', 'max:100', Rule::unique('permissions', 'nom')->ignore($permissionId)],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', 'string', 'max:100'],
        ];
    }
}
