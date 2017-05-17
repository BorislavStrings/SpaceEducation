<?php
namespace App\Http\Traits;

trait Multiple {

    protected static function createRecord($request)
    {
        $record = self::create($request);

        $record->localizations()->sync($request['lang']);

        return $record;
    }

    protected function updateRecord($request)
    {
        $this->update($request);

        $this->localizations()->sync($request['lang']);

        return $this;
    }

    protected static function destroyRecord($record)
    {
        $record->localizations()->detach();

        return $record->delete();
    }

    /**
     * @param $field
     * @param string $locale_field
     * @return array
     */
    public static function lists($field, $locale_field = 'id')
    {
        $records = self::get();

        $results = [];
        foreach ($records as $key => $record) {
            $results[$record->{$locale_field}] = $record->{$field};
        }

        return $results;
    }

}