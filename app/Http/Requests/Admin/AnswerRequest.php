<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AnswerRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'order_number'  => 'integer',
            'question_id'       => 'required|integer|exists:sp_course_questions,ID',
            'name'          => 'required|string',
            'name_en'       => 'string',
            'create_date'   => 'date',
        ];
    }
}
