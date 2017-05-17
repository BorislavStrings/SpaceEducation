<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\UserVideos;
use App\Videos;

class Units extends Model
{
    protected $table = 'sp_course_units';
    protected $primaryKey = 'ID';
    //protected $appends = ['passed'];
    //protected $passed = 0;

    protected $fillable = [
        'order_number', 'category_id', 'name',
        'image', 'description'
    ];

    public static $points = [
        ['points' => 20, 'name' => 'Space Cadet', 'title' => 'Congratulations, you are now a Space Cadet!'],
        ['points' => 50, 'name' => 'Advanced Space Cadet', 'title' => 'Congratulations, you’ve achieved Advanced Space Cadet level!'],
        ['points' => 100, 'name' => 'Space Admiral', 'title' => 'Congratulations, you’ve achieved the highest honor - Space Admiral!']
    ];

    /*
    public function getPassedAttribute() {
        return $this->passed;
    }

    public function setPassedAttribute($value) {
        $this->passed = $value;
    }
    */

    public static function checkUnitTitle($old_points, $new_points) {
        foreach (self::$points AS $item) {
            $points = $item['points'];

            if ($old_points < $points && $points <= $new_points) {
                return $item;
            }
        }

        return null;
    }

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    public $timestamps = false;

    public function imageData()
    {
        return $this->belongsTo('App\Files', 'image', 'ID');
    }

    public function getImageAttribute($value) {
        if (!$value) {
            // $video = $this->videos()->first();
            if (isset($video) && $video) {
                return $video->image;
            }
        }

        return $value;
    }

    public function category()
    {
        return $this->belongsTo('App\Categories', 'category_id');
    }

    public function exam()
    {
        return $this->hasOne('App\Exam', 'unit_id');
    }

    public function videos()
    {
        return $this->hasMany('App\Videos', 'unit_id');
    }

    public function userVideos($user_id)
    {
        $user_videos = UserVideos::where(['user_id' => $user_id])->pluck('video_id')->toArray();
        $videos = $this->videos()->get();
        if ($user_videos && $videos) {
            foreach ($videos AS $inx => $video) {
                if (in_array($video->ID, $user_videos)) {
                    $videos[$inx]['watched'] = 1;
                } else {
                    $videos[$inx]['watched'] = 0;
                }
            }
        }

        return $videos;
    }
}
