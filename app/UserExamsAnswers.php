<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserExamsAnswers extends Model
{
    protected $table = 'sp_course_user_exams_answers';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_exam_id', 'question_id', 'answer_id'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo('App\UserExams', 'user_exam_id');
    }

    public function question()
    {
        return $this->belongsTo('App\ExamQuestions', 'question_id');
    }

    public function answer()
    {
        return $this->belongsTo('App\QuestionAnswers', 'answer_id');
    }
}
