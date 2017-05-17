<?php

//Route::group(['middleware' => ['web']], function () {
    // Route::group( ['middleware' => ['web'] ], function ()
    // {
        Route::get('400', function(){
            return view('errors.400');
        });

        Route::get('401', function(){
            return view('errors.401');
        });

        Route::get('403', function(){
            return view('errors.403');
        });

        Route::get('404', function(){
            return view('errors.404');
        });

        Route::get('405', function(){
            return view('errors.405');
        });

        Route::get('500', function(){
            return view('errors.500');
        });

        Route::get('502', function(){
            return view('errors.502');
        });

        Route::get('503', function(){
            return view('errors.503');
        });

        Route::get('504', function(){
            return view('errors.504');
        });

        // Route::get('/users_count', 'HomeController@users_count');
        
        Route::post('send_mail', 'HomeController@send_mail')->name('send_mail');

        Route::get('/', 'HomeController@index');

        Route::get('/home', ['as' => 'home', 'uses' => 'HomeController@index']);

        Route::get('/intro', 'CategoriesController@intro');

        Route::get('/medals', 'MedalsController@index');

        Route::get('auth/facebook/login', 'Auth\AuthController@redirectToProvider');

        Route::get('auth/facebook/login/callback', 'Auth\AuthController@handleProviderCallback');

        Route::get('auth/facebook/register', 'Auth\AuthController@redirectToProvider');

        Route::get('auth/facebook/register/callback', 'Auth\AuthController@handleProviderCallback');

        Route::get('auth/linkedin/login', 'Auth\AuthController@redirectToLinkedInProvider');

        Route::get('auth/linkedin/login/callback', 'Auth\AuthController@handleLinkedInProviderCallback');

        Route::get('auth/linkedin/register', 'Auth\AuthController@redirectToLinkedInProvider');

        Route::get('auth/linkedin/register/callback', 'Auth\AuthController@handleLinkedInProviderCallback');

        Route::get('/error', 'HomeController@error');

        Route::get('/errors/404', 'HomeController@error404');

        Route::get('/flush/{tag}/cache/{token}', 'CacheController@flush');
        Route::get('/migrate_admin', 'PopulateController@populate_admin');
//        Route::auth();
        Route::post('/register', 'Auth\AuthController@register');
        Route::get('/register', 'Auth\AuthController@showRegistrationForm');
        Route::post('/password/email', 'Auth\PasswordController@sendResetLinkEmail');
        Route::post('/password/reset', 'Auth\PasswordController@reset');
        Route::get('/password/reset/{token?}', 'Auth\PasswordController@showResetForm');
        Route::post('/login/{token?}', 'Auth\AuthController@login');
        Route::get('/login/{token?}', 'Auth\AuthController@showLoginForm');
        Route::get('/logout', 'Auth\AuthController@logout');
    // });

    Route::group(['middleware' => ['auth']], function () {
        Route::get('/profile/me', 'UserController@me');
        Route::post('/profile/edit', 'UserController@edit');
        Route::post('/profile/upload', 'UserController@uploadImage');

        Route::get('/update/buy/{model_id}', 'UserController@buyUpdate');
        Route::get('/update/sell/{model_id}', 'UserController@sellUpdate');

        Route::get('/video/{video_id}', 'VideosController@getVideo');
        Route::get('/video/{video_id}', 'VideosController@getVideo');
        Route::get('/unit/{unit_id}', 'UnitsController@getUnit');
        Route::get('/mindmap', 'CategoriesController@mindmap');
        Route::get('/missions', 'CategoriesController@categories');
        Route::get('/file/{file_id}', 'FilesController@download');
        Route::post('/video/watched/{video_id}', 'VideosController@watchedVideo');
        Route::post('/comment/set/video/{video_id}', 'VideosController@setVideoComment');
        Route::get('/exam/get/{unit_id}', 'ExamController@getExam');
        Route::post('/exam/set/{unit_id}', 'ExamController@setExam');
        Route::get('/credits/default/set', 'UserController@tempFunctionSetDefaultPoints');
    });


    Route::get('admin/login', 'Admin\Auth\LoginController@showLoginForm')->name('admin_login');

    Route::post('admin/login', 'Admin\Auth\LoginController@login');

    Route::get('admin/logout', ['as' => 'logout', 'uses' => 'Admin\Auth\LoginController@logout']);

    Route::get('migrate', 'DatabaseController@migrate');
    Route::group(['middleware' => 'admin', 'namespace' => 'Admin', 'prefix' => 'admin'], function () {
        Route::get('/', ['as' => 'admin.dashboard', 'uses' => 'DashboardController@index']);
        Route::get('dashboard', ['as' => 'admin.dashboard', 'uses' => 'DashboardController@index']);
        Route::resource('admins', 'AdminsController');
        Route::resource('units', 'UnitsController');
        Route::resource('users', 'UsersController');
        Route::resource('categories', 'CategoriesController');
        Route::resource('medals', 'MedalsController');
        Route::resource('exams', 'ExamsController');
        Route::resource('answers', 'AnswersController');
        Route::resource('videos', 'VideosController');
        Route::resource('questions', 'QuestionsController');
    });
//});
