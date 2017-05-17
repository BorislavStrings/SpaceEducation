<div class="form-group">
    {!! Form::label('name', 'Name') !!}
    {!! Form::text('name', $admin->name ?? null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
</div>

<div class="form-group">
    {!! Form::label('email', 'Email') !!}
    {!! Form::text('email', $admin->email ?? null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
</div>

<div class="form-group">
    {!! Form::label('super_admin', 'Role') !!}
    {!! Form::select('super_admin', [0 => 'Editor', 1 => 'Admin'], null,
     ['class' => 'form-control select2']) !!}
</div>
@if(! isset($record))
    <div class="form-group">
        {!! Form::label('password', 'Password') !!}
        {!! Form::password('password', ['class' => 'form-control', 'autocomplete' => 'off']) !!}
    </div>
    <div class="form-group">
        {!! Form::label('password_confirmation', 'Confirm password') !!}
        {!! Form::password('password_confirmation', ['class' => 'form-control', 'autocomplete' => 'off']) !!}
    </div>
@endif
