<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MedalRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string',
            'name_bg' => 'string',
            'description' => 'string',
            'description_bg' => 'string',
            'image' => 'image',
            'image_hover' => 'image',
            'create_date' => 'date'
        ];
    }
}
