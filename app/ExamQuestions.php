<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ExamQuestions extends Model
{
    protected $table = 'sp_course_questions';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'exam_id', 'description', 'order_number', 'name'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public $timestamps = false;

    public function answers()
    {
        return $this->hasMany('App\QuestionAnswers', 'question_id');
    }

    public function exam()
    {
        return $this->belongsTo('App\Exam', 'exam_id');
    }
}
