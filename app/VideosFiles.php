<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VideosFiles extends Model
{
    protected $table = 'sp_course_videos_files';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'order_number', 'name', 'description', 'video_id', 'file_id'
    ];

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public function video()
    {
        return $this->belongsTo('App\User', 'video_id');
    }

    public function file()
    {
        return $this->belongsTo('App\Files', 'file_id');
    }

    public $timestamps = false;
}
