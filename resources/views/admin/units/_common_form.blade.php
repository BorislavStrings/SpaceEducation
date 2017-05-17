@include('admin.partials.tabs')
<hr>
@if(isset($record) && $record->image_path)
    <div class="form-group">
        <div class="image-preview">
            <img src="{{ $record->image_path }}" style="max-width: 500px;">
        </div>
    </div>
@endif

<div class="form-group">
    {!! Form::label('image', 'Image') !!}
    {!! Form::file('image', ['class' => 'form-control ' .(isset($record) && $record->image_path) ? 'file-change' : 'file-input']) !!}
</div>

<div class="form-group">
    {!! Form::label('points', 'Points') !!}
    {!! Form::text('points', null, ['class' => 'form-control']) !!}
</div>

<div class="form-group">
    {!! Form::label('category_id', 'Category') !!}
    {!! Form::select('category_id', $categories ?? [], null, ['class' => 'form-control select2']) !!}
</div>

<div class="form-group">
    {!! Form::label('related_units', 'Related Units') !!}
    {!! Form::select('related_units[]', $units ?? [], $related ?? [],
     ['class' => 'form-control select2', 'multiple' => 'multiple', 'id' => 'related_units']) !!}
</div>
