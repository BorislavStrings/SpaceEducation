{{-- */$cdn=env('CDN');/* --}} @if(!isset($lang)) {{-- */ $lang = ''; /* --}} @endif
<!DOCTYPE html>
<html lang="en">

<head>
    <title>{{ trans('app.head_title') }}</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> @if(request()->segment(1) == 'bg')
    <link href="https://fonts.googleapis.com/css?family=Roboto+Slab:700" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto-Bold', sans-serif;
        }
        
        .map-row .section-name > .name {
            font-size: 14px;
        }
        
        #medals-mindmap .medal > .name {
            font-size: 1.08em !important;
            max-width: 200px;
        }
        
        #medals .tree-body .medal .name {
            font-size: 1em !important;
        }
        
        .prof-unitdesc {
            font-size: 14px !important;
        }
    </style>
    @else
    <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
    <style>
        body {
            font-family: 'Montserrat', sans-serif !important;
        }
    </style>
    @endif
    <script type="text/javascript">
        window.language = '<?php echo isset($records_lang) ? $records_lang : '
        '; ?>';
    </script>
    <!-- <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js"></script> -->
    <script type="text/javascript" src="{{$cdn}}js/webfont.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" integrity="sha384-XdYbMnZ/QjLh6iI4ogqCTaIjrFk87ip+ekIjefZch0Y+PvJ8CDYtEs1ipDmPorQ+" crossorigin="anonymous">
    <!-- <link rel="stylesheet" type="text/css" href="{{ $cdn }}css/font-awesome.css"> -->
    <link rel="stylesheet" href="{{$cdn}}css/bootstrap.min.css">
    <link rel="stylesheet" href="{{$cdn}}css/normalize.css">
    <link rel="stylesheet" href="{{$cdn}}css/slick.css">
    <link rel="stylesheet" href="{{$cdn}}css/styles.css"> @if(request()->segment(1) == 'bg')
    <link href="{{$cdn}}css/fixes-bg.css" rel="stylesheet"> @endif
    <link rel="stylesheet" href="{{$cdn}}css/custom.css">
    <link rel="stylesheet" href="{{$cdn}}css/fixes.css">

    <script>
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/pl_PL/all.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    </script>
</head>

<body id="app-layout" class="{{ empty($black) ? '' : 'black planet' }}">
    @if (!empty($video_background))
    <?php $video_number = rand(1, 5); ?>
        <div id="video_background">)
            <video class="bg-video 19 <?php echo $video_number == 1 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster1.jpg') }});" poster="{{ URL::asset($cdn.'images/poster1.jpg') }}" playsinline <?php echo $video_number==1 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video1.mp4') }}" type="video/mp4">
            </video>
            <video class="bg-video 22 <?php echo $video_number == 2 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster2.jpg') }});" poster="{{ URL::asset($cdn.'images/poster2.jpg') }}" playsinline <?php echo $video_number==2 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video2.mp4') }}" type="video/mp4">
            </video>
            <video class="bg-video 23 <?php echo $video_number == 3 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster3.jpg') }});" poster="{{ URL::asset($cdn.'images/poster3.jpg') }}" playsinline <?php echo $video_number==3 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video3.mp4') }}" type="video/mp4">
            </video>
            <video class="bg-video 21 <?php echo $video_number == 4 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster4.jpg') }});" poster="{{ URL::asset($cdn.'images/poster4.jpg') }}" playsinline <?php echo $video_number==4 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video4.mp4') }}" type="video/mp4">
            </video>
            <video class="bg-video 44 <?php echo $video_number == 5 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster5.jpg') }});" poster="{{ URL::asset($cdn.'images/poster5.jpg') }}" playsinline <?php echo $video_number==5 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video5.mp4') }}" type="video/mp4">
            </video>
            <video class="bg-video 24 <?php echo $video_number == 6 ? 'active' : ''; ?>" style="background-image: url({{ URL::asset($cdn.'images/poster6.jpg') }});" poster="{{ URL::asset($cdn.'images/poster6.jpg') }}" playsinline <?php echo $video_number==6 ? 'autoplay' : ''; ?> muted loop>
                <source src="{{ URL::asset($cdn.'images/video6.mp4') }}" type="video/mp4">
            </video>
            <div class="flash"></div>
            <div class="mask"></div>
        </div>
        @endif
        <nav class="navbar navbar-default navbar-static-top">
            <div class="container">
                <div class="navbar-header">
                    <!-- Collapsed Hamburger -->
                    <button type="button" class="navbar-toggle collapsed" data-target="#app-navbar-collapse">
                        <span class="sr-only">{{ trans('app.toggle_navigation') }}</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>

                    <!-- Branding Image -->
                    <a class="navbar-brand" href="{{ url($lang.'/') }}">
                        <img src="{{ URL::asset($cdn.'images/logo.png') }}" class="logo" alt="{{ trans('app.logo') }}" />
                    </a>
                </div>

                <div class="collapse navbar-collapse" id="app-navbar-collapse">
                    @if (Auth::guest())
                    <ul class="nav navbar-nav navbar-left">
                        <li><a class="home" href="{{ url($lang.'/home') }}">{{ trans('app.home') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left">
                        <li><a href="{{ url($lang.'/medals') }}">{{ trans('app.medals') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left mobile">
                        <li><a href="{{ url($lang.'/login') }}">{{ trans('app.login') }}/{{ trans('app.register') }}</a></li>
                    </ul>
                    @else
                    <ul class="nav navbar-nav navbar-left">
                        <li><a class="home" href="{{ url($lang.'/') }}">{{ trans('app.home') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left profile-me">
                        <li><a href="{{ url($lang.'/profile/me') }}">{{ trans('app.profile') }}</a></li>
                    </ul>
                    @if (!Auth::guest())
                    <ul class="nav navbar-nav navbar-left">
                        <li><a href="{{ url($lang.'/missions') }}">{{ trans('app.missions') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left">
                        <li><a href="{{ url($lang.'/mindmap') }}">{{ trans('app.mind_maps') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left">
                        <li><a href="{{ url($lang.'/medals') }}">{{ trans('app.medals') }}</a></li>
                    </ul>
                    <ul class="nav navbar-nav navbar-left logout">
                        <li><a href="{{ url($lang.'/logout') }}"><i class="fa fa-btn fa-sign-out"></i> {{ trans('app.logout') }}</a></li>
                    </ul>
                    @endif @endif

                    <?php 
						$url = '';
						foreach (request()->segments() as $segment) {
							if ($segment != 'en' && $segment != 'bg') {
								$url .= '/'.$segment;
							}
						}
                    ?>

                        @if(request()->segment(1) == 'bg')
                        <a href="{{ url('/en' . $url) }}" class="change-localization"><img src="{{ URL::asset($cdn.'images/en.png') }}"></a>
                        @else
                        <a href="{{ url('/bg' . $url) }}" class="change-localization"><img src="{{ URL::asset($cdn.'images/bg.png') }}"></a>
                        @endif

                        <a id="envelope" data-toggle="modal" data-target="#envelope-modal"><i class="fa fa-envelope-o" aria-hidden="true"></i></a>

                        <i id="help" class="fa fa-info {{ Auth::check() ? 'm4' : '' }}" aria-hidden="true"></i>
                        <!-- Right Side Of Navbar -->
                        <ul class="nav navbar-nav navbar-right not-mobile">
                            <!-- Authentication Links -->
                            @if (Auth::guest())
                            <li><a href="{{ url($lang.'/login') }}">{{ trans('app.sign_in') }}</a></li>
                            <li>
                                <a href="{{ url($lang.'/register') }}">
                                    <button class="btn-primary">{{ trans('app.register') }}</button>
                                </a>
                            </li>
                            @else @if (isset($header_data))
                            <li class="dropdown">
                                <div class="dropdown-toggle">
                                    <a href="{{ url($lang.'/profile/me') }}">
                                        <div class="user-header">
                                            <div class="main">
                                                <span class="name">{{ $header_data['user']->name }}</span>
                                                <div class="progress-value">
                                                    <div class="inner" style="width: {{ $header_data['progress']['percents'] }}%"></div>
                                                    <div class="value-text">
                                                        {{ $header_data['progress']['current_points'] }}{{ trans('pts') }}
                                                    </div>
                                                </div>
                                            </div>
                                            <i class="fa fa-caret-down" aria-hidden="true"></i>
                                            <div class="photo" style="background-image: url('{{ $header_data['user']->image }}');"></div>
                                        </div>
                                    </a>

                                    <ul class="dropdown-menu" role="menu">
                                        <li><a href="{{ url($lang.'/profile/me') }}"><i class="fa fa-user" aria-hidden="true"></i> {{ trans('app.profile') }}</a></li>
                                        <li><a href="{{ url($lang.'/logout') }}"><i class="fa fa-btn fa-sign-out"></i> {{ trans('app.logout') }}</a></li>
                                    </ul>
                                </div>
                            </li>
                            @endif @endif
                        </ul>
                </div>
            </div>
        </nav>
        <div id="start-popup" class="start-popup {{ ((!isset($_COOKIE['start-popup']) || !$_COOKIE['start-popup']) && Auth::check()) ? 'active' : '' }}">
            <i class="fa fa-times close-btn" aria-hidden="true"></i>
            <div class="title">{{ trans('app.welcome_to_spacesport') }}</div>
            {!! trans('app.welcome_to_spacesport_description') !!}
        </div>

        <?php
            if (Auth::check()) {
                setcookie('start-popup', 1, time() + (86400 * 365)); // 86400 = 1 day
            }
        ?>

            @yield('content') @include('partials.envelope_modal')

            <!-- JavaScripts -->
            <script src="{{ URL::asset(env('CDN').'js/webfont.js') }}"></script>
            <script src="{{ URL::asset(env('CDN').'js/jquery-2.2.3.min.js') }}"></script>

            @if (!empty($home)) @if (empty($mobile))
            <script type="text/javascript" src="{{ URL::asset(env('CDN').'js/3D/Tween.js') }}"></script>
            <script type="text/javascript" src="{{ URL::asset(env('CDN').'js/3D/three.js') }}"></script>
            @endif
            <script type="text/javascript" src="{{ URL::asset(env('CDN').'js/3D/es6-promise.js') }}"></script>
            @endif

            <script src="{{ URL::asset(env('CDN').'js/jquery-ui.min.js') }}"></script>
            <script type="text/javascript" src="{{ URL::asset(env('CDN')).'js/jquery.ui.touch-punch.min.js' }}"></script>
            <script src="{{ URL::asset(env('CDN').'js/app.js') }}"></script>
            <script src="{{ URL::asset(env('CDN').'js/slick.min.js') }}"></script>

            <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDeC8D8lFfkFLXtiGAF2VK_GCwbk7C6J6w&libraries=places"></script>
            <script src="{{ URL::asset(env('CDN').'js/progressbar.min.js') }}"></script>
            <script src="{{ URL::asset(env('CDN').'js/dmuploader.min.js') }}"></script>

            <script src="https://www.youtube.com/player_api"></script>
            <script>
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date();
                    a = s.createElement(o),
                        m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m)
                })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

                ga('create', 'UA-80246406-4', 'auto');
                ga('send', 'pageview');
            </script>
            <div id="fb-root"></div>

            @if (!empty($home)) @if (empty($mobile))
            <script type="text/javascript" src="{{ URL::asset(env('CDN').'js/3D/functions3D.js') }}"></script>
            @endif
            <script type="text/javascript" src="{{ URL::asset(env('CDN').'js/3D/scene.js') }}"></script>
            @endif

            <script>
                //make sure that Service Workers are supported.
                //            if (navigator.serviceWorker) {
                //                navigator.serviceWorker.register('worker/service-worker.js', {scope: './'})
                //                        .then(function (registration) {
                //                            console.log(registration);
                //                        })
                //                        .catch(function (e) {
                //                            console.error(e);
                //                        })
                //            } else {
                //                console.log('Service Worker is not supported in this browser.');
                //            }
            </script>
</body>

</html>