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
        <table class="table table-bordered table-striped table-condensed">
            <tr>
                @foreach($form_builder['columns'] as $key => $column)
                    <th>{{ $column }}</th>
                @endforeach
                <th>Options</th>
            </tr>
            @foreach($records as $record)
                <tr>
                    @foreach($form_builder['columns'] as $column_name => $column)
                        <td>
                            @if($column_name == 'image')
                                <img src="{{ url($record->{$column_name}) }}"
                                     alt="{{ $record->{$column_name} }}" width="200">
                            @else
                                {!! $record->{$column_name} !!}
                            @endif
                        </td>
                    @endforeach
                    <td>
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
                    </td>
                </tr>
            @endforeach
        </table>
        {!! $records->links() !!}
    </div>
    @include('admin.modals.confirm_modal')
    <div class="clearfix"></div>
@endsection

