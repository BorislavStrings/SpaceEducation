<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SceneModels extends Model
{
    protected $table = 'sp_scene_models';
    protected $primaryKey = 'ID';
    public $timestamps = false;

    protected $fillable = [
        'name', 'name_bg', 'description', 'description_bg', 'points', 'parent_id', 'image'
    ];

    public function imageData()
    {
        return $this->belongsTo('App\Files', 'image', 'ID');
    }

    public function parent()
    {
        return $this->belongsTo('App\SceneModels', 'parent_id', 'ID');
    }

    public function updates()
    {
        return $this->hasMany('App\SceneModels', 'parent_id');
    }

    public function categories()
    {
        return $this->hasMany('App\ModelsUpdateCategories', 'model_id');
    }
}
