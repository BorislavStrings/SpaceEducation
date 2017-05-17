<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ModelsUpdateCategories extends Model
{
    protected $table = 'sp_scene_models_update_categories';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'model_id', 'unit_id'
    ];

    public function unit()
    {
        return $this->belongsTo('App\Categories', 'category_id');
    }

    public function model()
    {
        return $this->belongsTo('App\SceneModels', 'model_id');
    }
}
