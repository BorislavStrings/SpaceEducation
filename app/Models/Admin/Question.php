<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\Sortable;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Question extends Model
{
    use Filter, Single, UploadImage, Sortable;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'order_number',
        'exam_id',
        'name',
        'name_bg',
        'description',
        'description_bg',
        'create_date'
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_questions';

    public $timestamps = false;

    protected static $cacheKey = 'queries';

    protected $with = [
        'exam',
        'answers'
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id', 'ID');
    }

    public function answers()
    {
        return $this->hasMany(Answer::class, 'question_id', 'ID');
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

        if (array_key_exists('sortable', $request)) {
            Answer::updateSortable($request['sortable']);
        }

        Cache::tags(self::$cacheKey)->flush();

        return $this;
    }
}
