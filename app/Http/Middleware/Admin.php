<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = 'admin')
    {

        if (Auth::guard('admin')->check() &&
            !in_array(request()->segment(2),
                [
                    'dashboard',
                    'videos',
                    'units',
                    'medals',
                    'answers',
                    'questions',
                    'exams'
                ]
            ) && Auth::guard('admin')->user()->super_admin == 0) {

            return redirect('admin/dashboard');

        }

        if (!Auth::guard('admin')->check()) {
            return redirect('admin/login');
        }

        return $next($request);
    }
}
