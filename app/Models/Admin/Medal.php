<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Medal extends Model
{
    use Filter, Single, UploadImage;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'name_bg',
        'description',
        'description_bg',
        'image',
        'image_hover',
        'create_date'
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_medals';

    public $timestamps = false;

    protected static $cacheKey = 'queries';

    protected $appends = [
        'image_path',
        'hover_image_path'
    ];

    public function getImagePathAttribute()
    {
        $path = File::where('ID', $this->image)->first();

        if ($path) {
            $path = env('CDN') . $path->url;
        }

        return $path;
    }

    public function getHoverImagePathAttribute()
    {
        $path = File::where('ID', $this->image_hover)->first();

        if ($path) {
            $path = env('CDN') . $path->url;
        }

        return $path;
    }

    public static function getAll()
    {
        return self::filterLike(['name'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
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
