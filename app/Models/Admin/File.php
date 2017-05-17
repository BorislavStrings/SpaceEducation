<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use Filter, Single, UploadImage;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'url',
        'create_date',
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_files';

    public $timestamps = false;

    public static function getAll()
    {
        return self::orderBy('ID', 'desc')->paginate(config('constants.paginate'));
    }

    public static function createRecord($request)
    {
        $record = self::create($request);

        return $record;
    }

    public function updateRecord($request)
    {
        $this->update($request);

        return $this;
    }
}
