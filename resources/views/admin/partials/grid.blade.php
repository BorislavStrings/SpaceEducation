@extends('layouts.admin')

@section('content')
    <div class="col-sm-12">
        @if(isset($form_builder['filter_columns']) && !empty($form_builder['filter_columns']))
            @include('admin.partials.filter', [
                'filter_columns' => $form_builder['filter_columns']
            ])
        @endif
        <a href="{{ $form_builder['create_url'] }}" class="btn btn-primary pull-right">
            <i class="fa fa-plus"></i> Create
        </a>
        @if (count($errors) > 0)
            <div class="alert alert-danger">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif
        <div class="clearfix"></div>
        {!! $records->links() !!}
        <div class="clearfix"></div>
        @foreach($records as $record)
            <div class="col-sm-3 grid-element">
                @foreach($form_builder['columns'] as $column_name => $column)
                    <div>
                        @if($column_name == 'image_path')
                            <img src="{{ url($record->{$column_name}) }}"
                                 alt="{{ $record->{$column_name} }}" width="200">
                        @elseif($column_name == 'name')
                            <div class="grid-name">{!! $record->{$column_name} !!}</div>
                        @else
                            <div class="grid-column">
                                {!! $record->{$column_name} !!}
                            </div>
                        @endif
                    </div>
                @endforeach
                <div class="grid-options">
                    @if(isset($form_builder['edit_url']))
                        <a href="{{ route($form_builder['edit_url'], $record->ID)}}"
                           title="Edit"
                           data-toggle="tooltip"
                           data-placement="bottom"
                           class="btn btn-sm btn-warning">
                            <i class="fa fa-edit"></i>
                        </a>
                    @endif
                    @if(isset($form_builder['destroy_url']))
                        <a href="javascript:void(0);"
                           data-href="{{ route($form_builder['destroy_url'], $record->ID) }}"
                           title="Delete"
                           data-toggle="modal"
                           data-placement="bottom"
                           data-target="#confirm-modal"
                           class="btn btn-sm btn-danger confirm-modal">
                            <i class="fa fa-close"></i>
                        </a>
                    @endif
                </div>
            </div>
        @endforeach
        <div class="clearfix"></div>

        {!! $records->links() !!}
    </div>
    @include('admin.modals.confirm_modal')
    <div class="clearfix"></div>
@endsection

