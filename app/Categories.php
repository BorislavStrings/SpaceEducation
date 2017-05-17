<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Categories extends Model
{
    protected $table = 'sp_course_categories';
    protected $primaryKey = 'ID';
    public $timestamps = false;
    protected $points = 0;
    //protected $passed = 0;
    //protected $appends = ['points', 'passed'];
    protected $appends = ['points'];

    protected $fillable = [
        'order_number', 'parent_id', 'name', 'description', 'questions', 'image'
    ];

    /*
    public function getPassedAttribute() {
        return $this->passed;
    }

    public function setPassedAttribute($value) {
        $this->passed = $value;
    }
    */

    public function getPointsAttribute() {
        return $this->points;
    }

    public function setPointsAttribute($value) {
        $this->points = $value;
    }

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getQuestionsAttribute($value) {
        return nl2br(stripslashes($value));
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public function units()
    {
        return $this->hasMany('App\Units', 'category_id');
    }

    public function imageData()
    {
        return $this->belongsTo('App\Files', 'image', 'ID');
    }

    public function subCategories()
    {
        return $this->hasMany('App\Categories', 'parent_id')->orderBy('order_number', 'asc');
    }
}
