<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VideosComments extends Model
{
    protected $table = 'sp_course_videos_comments';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id', 'video_id', 'text'
    ];

    public function getTextAttribute($value) {
        return stripslashes($value);
    }

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function video()
    {
        return $this->belongsTo('App\Videos', 'video_id');
    }

    public $timestamps = false;
}
