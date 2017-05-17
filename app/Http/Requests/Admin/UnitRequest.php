<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UnitRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'order_number'  => 'integer',
            'category_id'   => 'required|integer|exists:sp_course_categories,ID',
            'name'          => 'required|string',
            'name_en'       => 'string',
            'description'   => 'string',
            'description_en'=> 'string',
            'create_date'   => 'date',
            'points'        => 'required|integer',
            'image'         => 'image'
        ];
    }
}
