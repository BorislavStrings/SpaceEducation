<div class="form-group">
    {!! Form::label('title' . $tail, 'Title ' . $local) !!}
    {!! Form::text('title' . $tail, null, ['class' => 'form-control trans']) !!}
</div>

<div class="form-group">
    {!! Form::label('short_description' . $tail, 'Short description ' . $local) !!}
    {!! Form::textarea('short_description' . $tail, null, ['class' => 'form-control']) !!}
</div>

<div class="form-group">
    {!! Form::label('long_description' . $tail, 'Long description ' . $local) !!}
    {!! Form::textarea('long_description' . $tail, null, ['class' => 'form-control']) !!}
</div>