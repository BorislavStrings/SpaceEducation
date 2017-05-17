@extends('layouts.admin')

@section('content')
    @include('admin.partials.filter', [
        'filter_columns' => [
            'name', 'email'
        ]
    ])
    <table class="table table-striped jambo_table bulk_action">
        <thead>
            <tr class="headings">
                <th class="column-title">Name</th>
                <th class="column-title">Email</th>
                <th class="column-title">Created At</th>
                <th class="column-title">Updated At</th>
                <th class="column-title">Options</th>
            </tr>
        </thead>
        <tbody>
            @foreach($admins as $admin)
                <tr>
                    <td>{{ $admin->name }}</td>
                    <td>{{ $admin->email }}</td>
                    <td>{{ $admin->created_at }}</td>
                    <td>{{ $admin->updated_at }}</td>
                    <td>
                        <a href="{{ route('admin.edit', ['admin' => $admin]) }}"
                           title="{{ trans('common.edit') }}"
                           data-toggle="tooltip"
                           data-placement="bottom"
                           class="btn btn-sm btn-warning">
                            <i class="fa fa-edit"></i>
                        </a>

                        <a href="javascript:void(0);"
                           data-href="{{ route('admin.destroy', ['admin' => $admin]) }}"
                           title="{{ trans('common.destroy') }}"
                           data-toggle="modal"
                           data-placement="bottom"
                           data-target="#confirm-modal"
                           class="btn btn-sm btn-danger confirm-modal">
                            <i class="fa fa-close"></i>
                        </a>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    {{ $admins->links() }}
    @include('admin.modals.confirm_modal', [
        'modal_title' => trans('modals.destroy.title'),
        'modal_body' => trans('modals.destroy.body'),
    ])
@endsection
