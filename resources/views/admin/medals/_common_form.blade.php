@include('admin.partials.tabs')
<hr>
<div class="col-sm-6">
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
</div>
<div class="col-sm-6">
    @if(isset($record) && $record->hover_image_path)
        <div class="form-group">
            <div class="image-preview">
                <img src="{{ $record->hover_image_path }}" style="max-width: 500px;">
            </div>
        </div>
    @endif

    <div class="form-group">
        {!! Form::label('image_hover', 'Image hover') !!}
        {!! Form::file('image_hover', ['class' => 'form-control ' .(isset($record) && $record->hover_image_path) ? 'file-change' : 'file-input']) !!}
    </div>
</div>
