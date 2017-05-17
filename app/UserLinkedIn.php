<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserLinkedIn extends Model
{
    protected $table = 'sp_course_users_linkedin';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id',
        'linkedin_id',
        'name',
        'email',
        'avatar',
        'avatar_original',
        'gender',
        'token'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getEmailAttribute($value) {
        return stripslashes($value);
    }

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }


    public $timestamps = false;
}
