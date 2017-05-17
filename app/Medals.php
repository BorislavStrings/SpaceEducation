<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\UserExams;

class Medals extends Model
{
    protected $table = 'sp_course_medals';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'name', 'image', 'image_hover', 'description'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public $timestamps = false;

    public function imageData()
    {
        return $this->belongsTo('App\Files', 'image', 'ID');
    }

    public function imageHoverData()
    {
        return $this->belongsTo('App\Files', 'image_hover', 'ID');
    }

    public function exams()
    {
        return $this->hasMany('App\MedalExams', 'medal_id');
    }

    public function hasWon(&$user_passed_exams) {
        $exams = $this->exams;
        if (sizeof($exams) < 1 || empty($user_passed_exams)) {
            return false;
        }

        $won = true;
        foreach ($exams AS $exam) {
            if (!in_array($exam->exam_id, $user_passed_exams)) {
                $won = false;
                break;
            }
        }

        return $won;
    }
}
