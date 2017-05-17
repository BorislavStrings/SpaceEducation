<div class="form-group">
    {!! Form::label('name', 'Name') !!}
    {!! Form::text('name', $admin->name ?? null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
</div>

<div class="form-group">
    {!! Form::label('email', 'Email') !!}
    {!! Form::text('email', $admin->email ?? null, ['class' => 'form-control', 'autocomplete' => 'off']) !!}
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
