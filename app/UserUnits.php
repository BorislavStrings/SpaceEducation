<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserUnits extends Model
{
    protected $table = 'sp_course_user_units';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'enrollment_id', 'unit_id', 'status'
    ];


    public function enrollment()
    {
        return $this->belongsTo('App\UserEnrollments', 'enrollment_id');
    }

    public function unit()
    {
        return $this->belongsTo('App\Units', 'unit_id');
    }

    public function videos()
    {
        return $this->hasMany('App\Videos', 'unit_id');
    }

    public function userVideos()
    {
        return $this->hasMany('App\UserVideos', 'user_unit_id');
    }

    public $timestamps = false;
}
