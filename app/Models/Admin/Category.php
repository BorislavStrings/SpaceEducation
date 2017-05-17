<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    use Filter, Single;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'order_number',
        'parent_id',
        'name',
        'name_bg',
        'description',
        'description_bg',
        'questions',
        'questions_bg',
        'create_date'
    ];

    protected static $cacheKey = 'queries';

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_categories';

    public $timestamps = false;

    public function units()
    {
        return $this->hasMany(Unit::class, 'category_id', 'ID');
    }

    public static function getAll()
    {
        return self::filterLike(['name', 'name_bg'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
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

        if (array_key_exists('sortable', $request)) {
            Unit::updateSortable($request['sortable']);
        }

        Cache::tags(self::$cacheKey)->flush();

        return $this;
    }
}
