<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserEnrollments extends Model
{
    protected $table = 'sp_course_users_enrollments';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id', 'category_id'
    ];

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function category()
    {
        return $this->belongsTo('App\Categories', 'category_id');
    }

    /*
    public function userUnits()
    {
        return $this->hasMany('App\UserUnits', 'enrollment_id');
    }
    */

    public function units()
    {
        return $this->hasMany('App\Units', 'category_id', 'category_id');
    }

    public static function userEnrollments($user_id) {
        //$user = Auth::user();
        $categories_and_units = [];

        $user_enrollments = UserEnrollments::with(['units', 'category'])->where(['user_id' => $user_id])->get();
        $inx = 0;
        if ($user_enrollments) {
            foreach ($user_enrollments AS $key => $enrollment) {
                $category_units = $enrollment->units;
                $category = $enrollment->category;
                $inx = $category->ID;
                $categories_and_units[$inx]['category'] = $category;

                $categories_and_units[$inx]['units'] = $category_units;
            }
        }

        return $categories_and_units;
    }

    public $timestamps = false;


}
