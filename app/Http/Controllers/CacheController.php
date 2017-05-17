<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CacheController extends Controller
{
    /**
     * @param $tag
     * @param $token
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     * @example http://www.spaceport.spaceedu.net/flush/queries/cache/b4b5d135ce1ea030ffe8bddfd65aaf76
     */
    public function flush($tag, $token)
    {
        $check = DB::table('cache_token')->where('tag', $tag)->where('token', $token)->first();

        if (!$check) {
            abort(404);
        }

        DB::table('cache_token')->where('id', $check->id)->delete();

        Cache::tags($tag)->flush();

        return redirect('home');
    }
}
