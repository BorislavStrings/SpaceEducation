<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class MedalExams extends Model
{
    protected $table = 'sp_course_medal_exams';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'medal_id', 'exam_id'
    ];

    public $timestamps = false;

    public function medal()
    {
        return $this->belongsTo('App\Medals', 'medal_id', 'ID');
    }

    public function units()
    {
        return $this->belongsTo('App\Exam', 'exam_id');
    }
}
