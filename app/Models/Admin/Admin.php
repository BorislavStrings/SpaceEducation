<?php

namespace App\Models\Admin;

use App\Http\Traits\Filter;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use Filter;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $primaryKey = 'ID';

    protected $table = 'sp_admins';

    public static function getAll()
    {
        return self::filterLike(['name', 'email'])->orderBy('id', 'desc')->paginate(config('constants.paginate'));
    }
}
