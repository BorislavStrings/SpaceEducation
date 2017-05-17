<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\Sortable;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Unit extends Model
{
    use Filter, Single, UploadImage, Sortable;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'order_number',
        'category_id',
        'name',
        'name_bg',
        'description',
        'description_bg',
        'points',
        'image',
        'create_date'
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_units';

    public $timestamps = false;

    protected static $cacheKey = 'queries';

    protected $appends = [
        'image_path'
    ];

    protected $with = [
        'related'
    ];

    public function getImagePathAttribute()
    {
        $path = File::where('ID', $this->image)->first();

        if ($path) {
            $path = env('CDN') . $path->url;
        }

        return $path;
    }

    public function related()
    {
        return $this->hasMany(RelatedUnit::class, 'parent_id', 'ID');
    }

    public static function getAll()
    {
        return self::filterLike(['name', 'name_bg', 'points'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
    }

    public static function createRecord($request)
    {
        self::cleanRequest($request);

        $request['image'] = self::uploadImage($request, 'unit');

        $record = self::create($request);

        if (array_key_exists('related_units', $request) && !empty($request['related_units'])) {
            foreach ($request['related_units'] as $related_unit) {
                DB::table('sp_course_units_relations')->insert([
                    'child_id' => $related_unit,
                    'parent_id' => $record->ID
                ]);
            }
        }

        Cache::tags(self::$cacheKey)->flush();

        return $record;
    }

    public function updateRecord($request)
    {
        self::cleanRequest($request);

        if(array_key_exists('image', $request)){
            $request['image'] = self::uploadImage($request, 'unit');
        }

        $this->update($request);

        DB::table('sp_course_units_relations')->where('parent_id', $this->ID)->delete();

        if (array_key_exists('related_units', $request) && !empty($request['related_units'])) {
            foreach ($request['related_units'] as $related_unit) {
                DB::table('sp_course_units_relations')->insert([
                    'child_id' => $related_unit,
                    'parent_id' => $this->ID
                ]);
            }
        }

        Cache::tags(self::$cacheKey)->flush();

        return $this;
    }
}
