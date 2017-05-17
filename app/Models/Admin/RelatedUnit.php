<?php

namespace App\Models;

use App\Http\Traits\Filter;
use App\Http\Traits\Single;
use App\Http\Traits\UploadImage;
use Illuminate\Database\Eloquent\Model;

class RelatedUnit extends Model
{
    use Filter, Single, UploadImage;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'child_id',
        'parent_id',
        'create_date',
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_units_relations';

    public $timestamps = false;

    public function parent()
    {
        return $this->belongsToMany(Unit::class, 'sp_course_units_relations', 'child_id', 'ID');
    }

    public function children()
    {
        return $this->belongsToMany(Unit::class, 'sp_course_units_relations', 'parent_id', 'ID');

    }
}
