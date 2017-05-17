<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UnitsRelations extends Model
{
    protected $primaryKey = 'ID';

    protected $table = 'sp_course_units_relations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'child_id', 'parent_id'
    ];

    public function unitOne() {
        return $this->belongsTo('App\Units', 'child_id');
    }

    public function unitTwo() {
        return $this->belongsTo('App\Units', 'parent_id');
    }
}
