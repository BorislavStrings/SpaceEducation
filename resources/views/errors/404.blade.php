<!DOCTYPE html>
<html>
<head>
    {{-- */$cdn=env('CDN');/* --}}
    @if(!isset($lang))
        {{-- */ $lang = ''; /* --}}
    @endif
    <meta charset="UTF-8">
    <title>Spaceport - The biggest FREE online Space knowledge powered by Space Challenges</title>

    <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700' rel='stylesheet' type='text/css'>
    <style>
        body {font-family: 'Montserrat', sans-serif !important;}
    </style>
    <script type="text/javascript" src="{{$cdn}}js/webfont.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" integrity="sha384-XdYbMnZ/QjLh6iI4ogqCTaIjrFk87ip+ekIjefZch0Y+PvJ8CDYtEs1ipDmPorQ+" crossorigin="anonymous">
<!-- <link rel="stylesheet" type="text/css" href="{{ $cdn }}css/font-awesome.css"> -->
    <link rel="stylesheet" href="{{$cdn}}css/bootstrap.min.css">
    <link rel="stylesheet" href="{{$cdn}}css/normalize.css">
    <link rel="stylesheet" href="{{$cdn}}css/slick.css">
    <link rel="stylesheet" href="{{$cdn}}css/styles.css">
    <link rel="stylesheet" href="{{$cdn}}css/custom.css">
    <link rel="stylesheet" href="{{$cdn}}css/fixes.css">
    <style type="text/css">
        body.error-body{
            background-image: url("{{ URL::asset('images/poster1.jpg') }}");
            background-position: center center;
            background-size: cover;
            background-attachment: fixed;
        }
    </style>
</head>

<body class="error-body">
<div class="container-fluid planet relative"
     style="overflow-x: hidden;">
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
            </div>
        </div>
    </nav>
    <div class="container">
        <div class="row">
            <div class="errors" class="col-md-12">
                <div class="box">
                    {{--<img src="{{ URL::asset('images/logo-small.png') }}" alt="logo" />--}}
                    <h1 class="title">Houston, We Have a Problem!</h1>
                    <h2>Page not found</h2>
                    <a href="{{ route('home') }}" style="font-size: 20px; padding-top: 30px;">Back to homepage</a>
                </div>
            </div>
        </div>
    </div>
</div>
</body>

</html>
