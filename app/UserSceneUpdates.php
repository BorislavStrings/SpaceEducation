<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserSceneUpdates extends Model
{
    protected $table = 'sp_user_scene_updates';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'user_id', 'model_id'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

    public function model()
    {
        return $this->belongsTo('App\SceneModels', 'model_id');
    }
}