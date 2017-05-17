<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Exam extends Model
{
    use Filter, Single, UploadImage;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'unit_id',
        'name',
        'name_bg',
        'description',
        'description_bg',
        'percents',
        'create_date'
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_exam';

    public $timestamps = false;

    protected static $cacheKey = 'queries';

    protected $with = [
        'unit',
    ];

    public function unit()
    {
        return $this->hasOne(Unit::class, 'ID', 'unit_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'exam_id', 'ID');
    }

    public static function getAll()
    {
        return self::filterLike(['name', 'percents'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
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
            Question::updateSortable($request['sortable']);
        }

        Cache::tags(self::$cacheKey)->flush();

        return $this;
    }
}
