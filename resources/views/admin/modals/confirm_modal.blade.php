<div class="modal fade" tabindex="-1" role="dialog" id="confirm-modal">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">{{ $modal_title ?? 'Deleting record' }}</h4>
            </div>
            <div class="modal-body">
                {!! $modal_body ?? 'This record is going to be deleted permanently. Are you sure you want to proceed?' !!}
            </div>
            <div class="modal-footer">
                {!! Form::open(['url' => '',
                    'method' => 'DELETE',
                    'class' => 'confirm-modal-form']) !!}
                    <button type="button" class="btn btn-default" data-dismiss="modal">
                        {{ $modal_close ?? 'Cancel' }}
                    </button>
                    {{--<input type="hidden" name="record_id" class="record-id">--}}
                    <button type="submit" class="btn btn-danger">
                        {{ $modal_confirm ?? 'Confirm' }}
                    </button>
                {!! Form::close() !!}
            </div>
        </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
</div><!-- /.modal -->