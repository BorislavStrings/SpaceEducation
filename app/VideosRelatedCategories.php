<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VideosRelatedCategories extends Model
{
    protected $table = 'sp_course_videos_rel_categories';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'video_id', 'category_id'
    ];

    public function category()
    {
        return $this->belongsTo('App\Categories', 'category_id');
    }

    public function videos()
    {
        return $this->belongsTo('App\Videos', 'video_id');
    }

    public $timestamps = false;
}
