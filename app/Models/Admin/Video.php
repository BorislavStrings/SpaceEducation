<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Video extends Model
{
    use Filter, Single, UploadImage;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'title_bg',
        'short_description',
        'short_description_bg',
        'long_description',
        'long_description_bg',
        'image',
        'url',
        'order_number',
        'unit_id',
        'create_date'
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_videos';

    public $timestamps = false;

    protected static $cacheKey = 'queries';

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'ID');
    }

    public static function getAll()
    {
        return self::filterLike(['title'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
    }

    public static function createRecord($request)
    {
        self::cleanRequest($request);

        $record = self::create($request);

        Cache::tags(self::$cacheKey)->flush();

        return $record;
    }

    public function updateRecord($request)
    {
        self::cleanRequest($request);

        $this->update($request);

        Cache::tags(self::$cacheKey)->flush();

        return $this;
    }
}
