<html>
<head>
    <title>Admin Login</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <style>
        body{
            background-color: #2A3F54;
        }
        .login-logo{
            display: block;
            max-width: 80%;
            margin: 0 auto;
        }
        .form-signin{
            display: block;
            max-width: 380px;
            padding: 0 35px 45px;
            margin: 150px auto;
            background-color: #fff;
            border: 1px solid rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <form class="form-signin" role="form" method="POST" action="{{ url('admin/login') }}">
        <h1 class="text-center login-title">Login</h1>

        {{--{{ csrf_field() }}--}}
        <input type="hidden" name="_token" value="{{ csrf_token() }}">

        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
            <label for="email" class="col-md-12 control-label">E-Mail Address</label>

            <input id="email" type="email" class="form-control" name="email" value="{{ old('email') }}" required autofocus>

            @if ($errors->has('email'))
                <span class="help-block">
                    <strong>{{ $errors->first('email') }}</strong>
                </span>
            @endif
        </div>

        <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
            <label for="password" class="col-md-12 control-label">Password</label>

            <input id="password" type="password" class="form-control" name="password" required>

            @if ($errors->has('password'))
                <span class="help-block">
                    <strong>{{ $errors->first('password') }}</strong>
                </span>
            @endif
        </div>

        <div class="form-group">
            <div class="col-md-12">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" name="remember"> Remember Me
                    </label>
                </div>
            </div>
        </div>

        <div class="form-group">
            <button type="submit" class="col-sm-12 btn" style="background-color: #2A3F54; color: #fff;">
                Login
            </button>
        </div>
        <div class="clearfix"></div>
    </form>
</body>
</html>
