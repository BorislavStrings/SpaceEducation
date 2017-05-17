<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class VideoRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string',
            'title_bg' => 'string',
            'description' => 'string',
            'description_bg' => 'string',
            'image' => 'integer|exists:sp_files,ID',
            'image_hover' => 'integer|exists:sp_files,ID',
            'create_date' => 'date'
        ];
    }
}
