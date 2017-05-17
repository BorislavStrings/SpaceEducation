@include('admin.partials.tabs')
<hr>
<div class="form-group">
    {!! Form::label('exam_id', 'Exam') !!}
    {!! Form::select('exam_id', $exams ?? [], null, ['class' => 'form-control select2']) !!}
</div>
@include('admin.partials.order')