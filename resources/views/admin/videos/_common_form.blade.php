@include('admin.partials.tabs')
<hr>
<div class="form-group">
    {!! Form::label('url', 'URL') !!}
    {!! Form::text('url', null, ['class' => 'form-control trans']) !!}
</div>
<div class="form-group">
    {!! Form::label('unit_id', 'Unit') !!}
    {!! Form::select('unit_id', $units ?? [], null, ['class' => 'form-control select2']) !!}
</div>
