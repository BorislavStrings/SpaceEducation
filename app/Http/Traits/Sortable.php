<?php
namespace App\Http\Traits;

trait Sortable {

    public static function updateSortable($ids)
    {
        $records = self::whereIn('ID', $ids)->get();

        $order_number = 0;

        foreach ($records as $record) {
            $record->update([
                'order_number' => array_search($record->ID, $ids)
            ]);

            $order_number++;
        }
    }
}
