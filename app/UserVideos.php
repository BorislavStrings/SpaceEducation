<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use DB;

class UserVideos extends Model
{
    protected $table = 'sp_course_users_videos';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id', 'video_id'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function videos()
    {
        return $this->belongsTo('App\User', 'video_id');
    }

    public static function userVideosByUnit($user_id, $unit_id)
    {
        $videos = DB::table('sp_course_users_videos')
            ->where(['sp_course_users_videos.user_id' => $user_id, 'sp_course_videos.unit_id' => $unit_id])
            ->join('sp_course_videos', 'sp_course_videos.ID', '=', 'sp_course_users_videos.video_id')
            ->get();

        return $videos;
    }

    public static function resetVideos($user_id, $unit_id) {
        $videos_array = Videos::where(['unit_id' => $unit_id])->pluck('ID')->toArray();
        UserVideos::where(['user_id' => $user_id])->whereIn('video_id', $videos_array)->delete();
    }
}
