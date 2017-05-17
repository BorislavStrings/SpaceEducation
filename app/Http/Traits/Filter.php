<?php
namespace App\Http\Traits;

use Illuminate\Support\Facades\Input;

trait Filter {

    protected $columns = [];

    protected static function filterLike(array $columns = [])
    {
        $query = self::query();

        foreach ($columns as $column) {
            $value = Input::get($column);
            if ($value) {
                $query = $query->where($column, 'LIKE', '%' . $value . '%');
            }
        }

        return $query;
    }

}