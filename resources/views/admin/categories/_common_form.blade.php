@include('admin.partials.tabs')
<hr>
<div class="form-group">
    {!! Form::label('parent_id', 'Parent Category') !!}
    {!! Form::select('parent_id', $categories ?? [], null, ['class' => 'form-control select2']) !!}
</div>

<div class="form-group">
    {!! Form::label('description', 'Description') !!}
    {!! Form::textarea('description', null, ['class' => 'form-control']) !!}
</div>

@include('admin.partials.order')
