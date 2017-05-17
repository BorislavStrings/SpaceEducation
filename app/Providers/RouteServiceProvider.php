<?php

namespace App\Providers;

use App\Models\Admin\Admin;
use App\Models\Admin\User;
use App\Models\Answer;
use App\Models\Category;
use App\Models\Exam;
use App\Models\Medal;
use App\Models\Question;
use App\Models\Unit;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\App;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @param  \Illuminate\Routing\Router  $router
     * @return void
     */
    public function boot(Router $router)
    {
        $router->model('units', Unit::class);
        $router->model('users', User::class);
        $router->model('exams', Exam::class);
        $router->model('admins', Admin::class);
        $router->model('questions', Question::class);
        $router->model('answers', Answer::class);
        $router->model('medals', Medal::class);
        $router->model('videos', Video::class);
        $router->model('categories', Category::class);

        parent::boot($router);
    }

    /**
     * Define the routes for the application.
     *
     * @param  \Illuminate\Routing\Router  $router
     * @return void
     */
    public function map(Router $router, Request $request)
    {
        $locale = $request->segment(1);
        if ($locale == 'bg' || $locale == 'en') {
            App::setLocale($locale);
            $request->attributes->add(['lang' => $locale]);

            $router->group(['namespace' => $this->namespace, 'prefix' => $locale, 'middleware' => 'web'], function($router) {
                require app_path('Http/routes.php');
            });
        } else {
            App::setLocale('en');
            $request->attributes->add(['lang' => 'en']);

            $router->group(['namespace' => $this->namespace, 'middleware' => 'web'], function($router) {
                require app_path('Http/routes.php');
            });
        }

        $this->mapWebRoutes($router);

    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     *
     * @param  \Illuminate\Routing\Router  $router
     * @return void
     */
    protected function mapWebRoutes(Router $router)
    {
        $router->group([
            'namespace' => $this->namespace, 'middleware' => 'web',
        ], function ($router) {
            require app_path('Http/routes.php');
        });
    }
}
