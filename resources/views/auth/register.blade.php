@extends('layouts.app')

@section('content')
    {{-- */$lang=Request::get('lang');/* --}}

    <div id="auth" class="container">
        <div class="row">
            <div class="col-md-6 register full">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        {{ trans('common.register.create_new_profile') }}
                        <div class="separator"></div>
                    </div>
                    <div class="panel-body">
                        <form class="form-horizontal" role="form" method="POST" action="{{ url($lang.'/register') }}">
                            {{ csrf_field() }}
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
                                    </div>
                                    <div class="col-md-12">
                                        <div class="big separator"><span class="text">{{ trans('common.register.or') }}</span></div>
                                    </div>
                                </div>
                            </div>
                            @if ($errors->has('csrf_error'))
                                <div class="form-group has-error">
                                    <div class="col-md-12">
                                <span class="help-block">
                                    <strong>{{ $errors->first('csrf_error') }}</strong>
                                </span>
                                    </div>
                                </div>
                            @endif
                            <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                                <label for="name" class="col-md-12 control-label">{{ trans('common.register.name') }}</label>
                                <div class="col-md-12">
                                    <input id="name" type="text" class="form-input" name="name" value="{{ old('name') }}">

                                    @if ($errors->has('name'))
                                        <span class="help-block">
                                    <strong>{{ $errors->first('name') }}</strong>
                                </span>
                                    @endif
                                </div>
                            </div>

                            <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                                <label for="email" class="col-md-12 control-label">{{ trans('common.register.email_address') }}</label>
                                <div class="col-md-12">
                                    <input id="email" type="email" class="form-input" name="email" value="{{ old('email') }}">

                                    @if ($errors->has('email'))
                                        <span class="help-block">
                                    <strong>{{ $errors->first('email') }}</strong>
                                </span>
                                    @endif
                                </div>
                            </div>

                            <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                                <label for="password" class="col-md-12 control-label">{{ trans('common.register.password') }}</label>

                                <div class="col-md-12">
                                    <input id="password" type="password" class="form-input" name="password">

                                    @if ($errors->has('password'))
                                        <span class="help-block">
                                    <strong>{{ $errors->first('password') }}</strong>
                                </span>
                                    @endif
                                </div>
                            </div>

                            <div class="form-group{{ $errors->has('password_confirmation') ? ' has-error' : '' }}">
                                <label for="password-confirm" class="col-md-12 control-label">{{ trans('common.register.confirm_password') }}</label>

                                <div class="col-md-12">
                                    <input id="password-confirm" type="password" class="form-input" name="password_confirmation">

                                    @if ($errors->has('password_confirmation'))
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
<!-- Google Code for Make a registration Conversion Page -->
<script type="text/javascript">
/* <![CDATA[ */
var google_conversion_id = 879427966;
var google_conversion_language = "en";
var google_conversion_format = "3";
var google_conversion_color = "ffffff";
var google_conversion_label = "J8NXCMjJymgQ_oKsowM";
var google_remarketing_only = false;
/* ]]> */
</script>
<script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js">
</script>
<noscript>
<div style="display:inline;">
<img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/879427966/?label=J8NXCMjJymgQ_oKsowM&amp;guid=ON&amp;script=0"/>
</div>
</noscript>
@endsection
