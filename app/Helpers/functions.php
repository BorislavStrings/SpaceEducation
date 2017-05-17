<?php

if (!function_exists('localize_records')) {
    function localize_records($lang)
    {
        if ($lang != '' && $lang != 'en') {
            return('_' . $lang);
        } else {
            return '';
        }

    }
}