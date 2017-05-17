<?php
namespace App\Http\Traits;

trait Single {

    public static function createRecord($request)
    {
        if (isset($request['description'])) {
            clean($request['description']);
        }

        if (isset($request['title'])) {
            $request['slug'] = str_slug($request['title']);
        }

        $record = self::create($request);

        return $record;
    }

    public function updateRecord($request)
    {
        if (isset($request['description'])) {
            clean($request['description']);
        }

        if (isset($request['title'])) {
            $request['slug'] = str_slug($request['title']);
        }

        $this->update($request);

        return $this;
    }

    public static function destroyRecord($record)
    {
        return $record->delete();
    }

    /**
     * @param $field
     * @param string $locale_field
     * @param array $records
     * @return array
     */
    public static function lists($field, $locale_field = 'ID', $records = [])
    {
        if (empty($records)) {
            $records = self::get();
        }

        $results = [0 => 'None'];
        foreach ($records as $key => $record) {
            $results[$record->{$locale_field}] = $record->{$field};
        }

        return $results;
    }

    public static function cleanRequest($request)
    {
        foreach ($request as $key => $field) {
            clean($request[$key]);
        }

        return $request;
    }

}