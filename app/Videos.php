<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Videos extends Model
{
    protected $table = 'sp_course_videos';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'unit_id', 'title', 'image',
        'short_description', 'long_description', 'url',
        'public'
    ];

    public function getTitleAttribute($value) {
        return stripslashes($value);
    }

    public function getShortDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public function getLongDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public function getYouTubeID() {
        $id = [];
        $values = null;
        if (preg_match('/youtube\.com\/watch\?v=([^\&\?\/]+)/', $this->url, $id)) {
            $values = $id[1];
        } else if (preg_match('/youtube\.com\/embed\/([^\&\?\/]+)/', $this->url, $id)) {
            $values = $id[1];
        } else if (preg_match('/youtube\.com\/v\/([^\&\?\/]+)/', $this->url, $id)) {
            $values = $id[1];
        } else if (preg_match('/youtu\.be\/([^\&\?\/]+)/', $this->url, $id)) {
            $values = $id[1];
        }
        else if (preg_match('/youtube\.com\/verify_age\?next_url=\/watch%3Fv%3D([^\&\?\/]+)/', $this->url, $id)) {
            $values = $id[1];
        }

        return $values;
    }

    public function getImageAttribute($value) {
        if (!$value) {
            return 'http://img.youtube.com/vi/' . $this->getYouTubeID() . '/0.jpg';
        }

        return $value;
    }

    public function getImageDataAttribute($value) {
        return $this->getImageAttribute();
    }

    public function imageFile() {
        return $this->belongsTo('App\Files', 'image');
    }

    public function comments()
    {
        return $this->hasMany('App\VideosComments', 'video_id');
    }

    public function files()
    {
        return $this->hasMany('App\VideosFiles', 'video_id');
    }

    public function getFiles() {
        return $this->files()->with('file')->orderBy('order_number', 'asc')->get();
    }

    public function getComments() {
        return $this->comments()->with(['user' => function($q) {
            $q->with(['imageData', 'facebook'])->get();
        }])->orderBy('create_date', 'desc')->get();
    }

    public function links()
    {
        return $this->hasMany('App\VideosLinks', 'video_id');
    }

    public function relatedCategories()
    {
        return $this->hasMany('App\VideosRelatedCategories', 'video_id');
    }

    public function unit()
    {
        return $this->belongsTo('App\Units', 'unit_id');
    }

    public function watchedVideos()
    {
        return $this->hasOne('App\UserVideos', 'video_id');
    }

    public $timestamps = false;
}
