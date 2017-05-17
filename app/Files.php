<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Config;

class Files extends Model
{
    protected $table = 'sp_files';
    protected $primaryKey = 'ID';

    protected $fillable = [
        'url'
    ];

    public function getUrlAttribute($url) {
        return env('ADMIN_CDN') . $url;
    }

    public $timestamps = false;
}
