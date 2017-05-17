<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'order_number'  => 'integer',
            'exam_id'       => 'required|integer|exists:sp_course_exam,ID',
            'name'          => 'required|string',
            'name_en'       => 'string',
            'description'   => 'string',
            'description_en'=> 'string',
            'create_date'   => 'date',
        ];
    }
}
