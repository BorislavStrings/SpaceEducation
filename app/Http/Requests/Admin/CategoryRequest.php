<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
//            'order_number'  => 'required|integer',
//            'parent_id'     => 'integer|exists:sp_course_categories,ID',
            'name'          => 'required|string',
            'name_en'       => 'string',
            'description'   => 'string',
            'description_en'=> 'string',
            'questions'     => 'string',
            'questions_en'  => 'string',
//            'image'         => 'integer|exists:sp_files,ID',
            'create_date'   => 'date'
        ];
    }
}
