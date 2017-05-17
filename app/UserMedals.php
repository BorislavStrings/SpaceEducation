<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserMedals extends Model
{
    protected $table = 'sp_course_user_medals';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id', 'medal_id'
    ];

    public $timestamps = false;

    public function medal()
    {
        return $this->belongsTo('App\Medals', 'medal_id');
    }

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }
}
