<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\Sortable;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use Filter, Single, Sortable;
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

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_answers';

    public $timestamps = false;

    public static function getAll()
    {
        return self::filterLike(['name', 'name_bg'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
    }

    public static function createRecord($request)
    {
        self::cleanRequest($request);

        $record = self::create($request);

        return $record;
    }

    public function updateRecord($request)
    {
        self::cleanRequest($request);

        $this->update($request);

        return $this;
    }
}
