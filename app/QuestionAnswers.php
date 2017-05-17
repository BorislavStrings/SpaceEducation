<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class QuestionAnswers extends Model
{
    protected $table = 'sp_course_answers';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'order_number', 'question_id', 'name', 'is_correct'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public $timestamps = false;

    public function question()
    {
        return $this->belongsTo('App\ExamQuestions', 'question_id');
    }
}
