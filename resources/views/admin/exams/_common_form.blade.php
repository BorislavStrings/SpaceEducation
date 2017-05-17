@include('admin.partials.tabs')
<hr>

<div class="form-group">
    {!! Form::label('percents', 'Percents') !!}
    {!! Form::text('percents', null, ['class' => 'form-control', 'max' => 100]) !!}
</div>

<div class="form-group">
    {!! Form::label('unit_id', 'Unit') !!}
    {!! Form::select('unit_id', $units ?? [], (isset($record) && $record) ? $record->unit->ID : null,
     ['class' => 'form-control select2']) !!}
</div>

@include('admin.partials.order')