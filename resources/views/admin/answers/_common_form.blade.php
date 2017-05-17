@include('admin.partials.tabs')
<hr>
<div class="form-group">
    {!! Form::label('question_id', 'Question') !!}
    {!! Form::select('question_id', $questions ?? [], null, ['class' => 'form-control select2']) !!}
</div>

<div class="form-group checkbox-wrapper">
    {!! Form::checkbox('is_correct', 1) !!}
    {!! Form::label('is_correct', 'Correct answer') !!}
</div>
