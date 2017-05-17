<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ExamRequest extends FormRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $unique = '';
        if (request()->method() == 'POST') {
            $unique = '|unique:sp_course_exam,unit_id';
        }

        return [
            'unit_id' => 'required|exists:sp_course_units,ID' . $unique,
            'name' => 'required|string',
            'name_bg' => 'string',
            'description' => 'string',
            'description_bg' => 'string',
            'percents' => 'required|numeric|min:1|max:100',
            'create_date' => 'date'
        ];
    }
}
