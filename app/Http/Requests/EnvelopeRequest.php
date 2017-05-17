<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnvelopeRequest extends FormRequest
{
    protected $fillable = [
        'sender', 'content', 'subject'
    ];

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'sender' => 'required|email',
            'subject' => 'string|max:255',
            'content' => 'string|max:1000',
        ];
    }
}
