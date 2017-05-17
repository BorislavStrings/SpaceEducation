<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VideosLinks extends Model
{
    protected $table = 'sp_course_videos_links';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'order_number', 'video_id', 'name', 'link', 'description'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public function video()
    {
        return $this->belongsTo('App\videos', 'video_id');
    }

    public $timestamps = false;
}
