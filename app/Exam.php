<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $table = 'sp_course_exam';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'unit_id', 'name', 'percents', 'description'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public $timestamps = false;

    public function questions()
    {
        return $this->hasMany('App\ExamQuestions', 'exam_id');
    }

    public function unit()
    {
        return $this->belongsTo('App\Units', 'unit_id');
    }
}
