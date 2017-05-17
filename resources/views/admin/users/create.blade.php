@extends('layouts.admin')

@section('content')
    {!! Form::open(['url' => route('admin.store'),
        'method' => 'POST',
        'class' => 'form-horizontal form-label-left']) !!}

        <div class="form-group">
            {!! Form::label('name', trans('common.name'),
                ['class' => 'control-label col-md-3 col-sm-3 col-xs-12 col-form-label']) !!}
            <div class="col-md-6 col-sm-6 col-xs-12">
                {!! Form::text('name', null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
            </div>
        </div>

        <div class="form-group">
            {!! Form::label('email', trans('common.email'),
                ['class' => 'control-label col-md-3 col-sm-3 col-xs-12 col-form-label']) !!}
            <div class="col-md-6 col-sm-6 col-xs-12">
                {!! Form::text('email', null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
            </div>
        </div>

        <div class="form-group">
            {!! Form::label('password', trans('common.password'),
                ['class' => 'control-label col-md-3 col-sm-3 col-xs-12 col-form-label']) !!}
            <div class="col-md-6 col-sm-6 col-xs-12">
                {!! Form::password('password', ['class' => 'form-control', 'autocomplete' => 'off']) !!}
            </div>
        </div>

        <div class="form-group">
            <div class="col-md-6 col-sm-6 col-xs-12 col-md-offset-3">
                {!! Form::submit(trans('common.submit'), ['class' => 'btn btn-success']) !!}
            </div>
        </div>

    {!! Form::close() !!}
@endsection
