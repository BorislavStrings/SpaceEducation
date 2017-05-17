@extends('layouts.admin')

@section('content')
    <div class="col-sm-12">
        @if(isset($record))
            {!! Form::model($record, [
                'url' => $form_builder['form_route'],
                'method' => 'PUT',
                'files' => $form_builder['files'] ?? false
             ]) !!}
        @else
            {!! Form::open([
                'url' => $form_builder['form_route'],
                'method' => 'POST',
                'files' => $form_builder['files'] ?? false
            ]) !!}
        @endif
        <div class="x_panel">
            <div class="x_title">
                <h2>{{ $form_builder['module_title'] ?? '' }}</h2>
                <div class="clearfix"></div>
            </div>
            @if (count($errors) > 0)
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            @if(isset($form_builder['common_form_path']))
                @include($form_builder['common_form_path'])
            @endif
            {!! Form::submit('Submit', ['class' => 'btn btn-primary col-sm-12', 'style' => 'margin-top:20px;']) !!}

        </div>
        <div class="clearfix"></div>


        {!! Form::close() !!}
    </div>
    <div class="clearfix"></div>
@endsection
