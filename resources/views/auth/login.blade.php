@extends('layouts.app')

@section('content')
{{-- */$lang=Request::get('lang');/* --}}
<div id="auth" class="container">
    <div class="row">
        <div class="col-md-6 login">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('common.login.sign_in') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url($lang.'/login') }}">
                        <?php
                            $register_active = false;
                            $login_active = false;
                            if (!empty(old('form')) && old('form') == 'register') {
                                $register_active = true;
                            } else {
                                $login_active = true;
                            }
                        ?>
                        {!! csrf_field() !!}

                        <div class="panel">
                            <div class="form-group">
                                <div class="col-md-12">
                                    <a class="social-btn" href="{{ url($lang.'/auth/facebook/login') }}">
                                        <button type="button" class="btn btn-primary">
                                            <i class="fa fa-facebook-square" aria-hidden="true"></i>
                                            {{ trans('common.login.sign_in_using_facebook') }}
                                        </button>
                                    </a>
                                    <a class="social-btn" href="{{ url($lang.'/auth/linkedin/login') }}">
                                        <button type="button" class="btn btn-info">
                                            <i class="fa fa-linkedin-square" aria-hidden="true"></i>
                                            {{ trans('common.login.sign_in_using_linkedin') }}
                                        </button>
                                    </a>
                                </div>
                                <div class="col-md-12">
                                    <div class="big separator"><span class="text">{{ trans('common.register.or') }}</span></div>
                                </div>
                            </div>
                        </div>
                        @if ($errors->has('csrf_error') && $login_active)
                        <div class="form-group has-error">
                            <div class="col-md-12">
                                <span class="help-block">
                                    <strong>{{ $errors->first('csrf_error') }}</strong>
                                </span>
                            </div>
                        </div>
                        @endif
                        <div class="form-group{{ $errors->has('email') && $login_active ? ' has-error' : '' }}">
                            <label for="email" class="col-md-12 control-label">{{ trans('common.login.your_email') }}</label>

                            <div class="col-md-12">
                                <input id="email" type="email" class="form-input" name="email" value="{{ old('email') }}">

                                @if ($errors->has('email') && $login_active)
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') && $login_active ? ' has-error' : '' }}">
                            <label for="password" class="col-md-12 control-label">{{ trans('common.login.password') }}</label>

                            <div class="col-md-12">
                                <input id="password" type="password" class="form-input" name="password">

                                @if ($errors->has('password') && $login_active)
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="remember" class="col-md-12 control-label"> {{ trans('common.login.remember_me') }}
                                <input id="remember" type="checkbox" value="1" name="remember" checked/></label>

                        </div>

                        <div class="form-group actions">
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-primary">
                                    {{ trans('common.login.login') }}
                                </button>

                                <a class="btn btn-link" href="{{ url($lang.'/password/reset') }}">{{ trans('common.login.forgot_password') }}</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="col-md-6 register">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('common.login.create_new_profile') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body">
                    <form class="form-horizontal" role="form" method="POST" action="{{ url($lang.'/register') }}">
                        {!! csrf_field() !!}
                        <input type="hidden" name="form" value="register" />
                        <div class="panel">
                            <div class="form-group">
                                <div class="col-md-12">
                                    <a class="social-btn" href="{{ url($lang.'/auth/facebook/register') }}">
                                        <button type="button" class="btn btn-primary">
                                            <i class="fa fa-facebook-square" aria-hidden="true"></i>
                                            {{ trans('common.register.register_using_facebook') }}
                                        </button>
                                    </a>
                                    <a class="social-btn" href="{{ url($lang.'/auth/linkedin/register') }}">
                                        <button type="button" class="btn btn-info">
                                            <i class="fa fa-linkedin-square" aria-hidden="true"></i>
                                            {{ trans('common.register.register_using_linkedin') }}
                                        </button>
                                    </a>
                                </div>
                                <div class="col-md-12">
                                    <div class="big separator"><span class="text">OR</span></div>
                                </div>
                            </div>
                        </div>
                        @if ($errors->has('csrf_error') && $register_active)
                            <div class="form-group has-error">
                                <div class="col-md-12">
                                <span class="help-block">
                                    <strong>{{ $errors->first('csrf_error') }}</strong>
                                </span>
                                </div>
                            </div>
                        @endif
                        <div class="form-group{{ $errors->has('name') && $register_active ? ' has-error' : '' }}">
                            <label for="name" class="col-md-12 control-label">{{ trans('common.login.your_name') }}</label>
                            <div class="col-md-12">
                                <input id="name" type="text" class="form-input" name="name" value="{{ old('name') }}">

                                @if ($errors->has('name') && $register_active)
                                    <span class="help-block">
                                    <strong>{{ $errors->first('name') }}</strong>
                                </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('email') && $register_active ? ' has-error' : '' }}">
                            <label for="email" class="col-md-12 control-label">{{ trans('common.register.email_address') }}</label>
                            <div class="col-md-12">
                                <input id="email" type="email" class="form-input" name="email" value="{{ old('email') }}">

                                @if ($errors->has('email') && $register_active)
                                    <span class="help-block">
                                    <strong>{{ $errors->first('email') }}</strong>
                                </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password') && $register_active ? ' has-error' : '' }}">
                            <label for="password" class="col-md-12 control-label">{{ trans('common.register.password') }}</label>

                            <div class="col-md-12">
                                <input id="password" type="password" class="form-input" name="password">

                                @if ($errors->has('password') && $register_active)
                                    <span class="help-block">
                                    <strong>{{ $errors->first('password') }}</strong>
                                </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group{{ $errors->has('password_confirmation')&& $register_active ? ' has-error' : '' }}">
                            <label for="password-confirm" class="col-md-12 control-label">{{ trans('common.register.confirm_password') }}</label>

                            <div class="col-md-12">
                                <input id="password-confirm" type="password" class="form-input" name="password_confirmation">

                                @if ($errors->has('password_confirmation') && $register_active)
                                    <span class="help-block">
                                    <strong>{{ $errors->first('password_confirmation') }}</strong>
                                </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group help-text">
                            <div class="col-md-12">
                                <label class="col-md-12 control-label">
                                    {{ trans('common.register.correct_email') }}
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="col-md-7">
                                <label class="control-label">
                                    {!! trans('common.tos') !!}
                                </label>
                            </div>
                            <div class="col-md-5">
                                <button type="submit" class="btn btn-primary">
                                    {{ trans('common.register.register') }}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
