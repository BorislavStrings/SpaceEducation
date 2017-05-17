<div class="form-group">
    {!! Form::label('name' . $tail, 'Question ' . $local) !!}
    {!! Form::textarea('name' . $tail, null, ['class' => 'form-control trans']) !!}
</div>

<div class="form-group">
    {!! Form::label('description' . $tail, 'Description ' . $local) !!}
    {!! Form::textarea('description' . $tail, null, ['class' => 'form-control trans']) !!}
</div>