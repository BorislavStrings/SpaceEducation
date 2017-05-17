<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Medals;
use Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class MedalsController extends Controller
{
    use HeaderProgressTrait;

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function index() {
        $header_data = [];
        if (Auth::check()) {
            $header_data = $this->getUserHeaderData();
        }

        $medals = Cache::tags('queries')->remember('medals', env('CACHE_TIMEOUT'), function () {
            return Medals::with('imageData')->get();
        });

        return view('medals', [
            'medals' => $medals,
            'header_data' => $header_data,
            'black' => true,
            'lang' => $this->lang,
            'records_lang' => localize_records($this->lang)
        ]);
    }
}
