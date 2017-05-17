<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserExams extends Model
{
    protected $table = 'sp_course_user_exams';
    protected $primaryKey = 'ID';
    public static $exam_attempts = 3;

    protected $fillable = [
        'user_id', 'exam_id', 'passed', 'active'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function exam()
    {
        return $this->belongsTo('App\Exam', 'exam_id');
    }

    public function answers()
    {
        return $this->hasMany('App\UserExamsAnswers', 'user_exam_id');
    }

    public static function validateAndResetExam($user_id, $unit_id, $exam_id) {
        $attempts = UserExams::userExamCount($user_id, $exam_id);
        if ($attempts >= UserExams::$exam_attempts) {
            UserVideos::resetVideos($user_id, $unit_id);
            UserExams::where(['user_id' => $user_id, 'exam_id' => $exam_id, 'passed' => 0, 'active' => 1])->update(['active' => 0]);

            return false;
        }

        return true;
    }

    public static function userExamCount($user_id, $exam_id) {
        return UserExams::where(['user_id' => $user_id, 'exam_id' => $exam_id, 'passed' => 0, 'active' => 1])->count();
    }
}
