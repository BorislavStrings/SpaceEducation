<div class="form-group">
    {!! Form::label('name' . $tail, 'Name ' . $local) !!}
    {!! Form::text('name' . $tail, null, ['class' => 'form-control']) !!}
</div>

<div class="form-group">
    {!! Form::label('questions' . $tail, 'Questions ' . $local) !!}
    {!! Form::textarea('questions' . $tail, null, ['class' => 'form-control trans']) !!}
</div>