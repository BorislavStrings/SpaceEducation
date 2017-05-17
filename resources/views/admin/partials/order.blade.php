@if(isset($sortables) && isset($record))
    <div class="clearfix"></div>
    <hr>
    <div class="x_panel">
        <div class="x_title">
            <h2>{{ $form_builder['order_title'] ?? '' }} <i class="fa fa-sort-amount-asc"></i></h2>
            <div class="clearfix"></div>
        </div>
        <ul id="sortable">
                @foreach($sortables->sortBy('order_number')->all() as $key => $sortable)
                    <li class="custom-sortable-item">
                        <span class="fa fa-sort"></span> {{ $sortable->title ?? $sortable->name ?? '' }}
                        {!! Form::hidden('sortable[]', $sortable->ID) !!}
                        <i class="label label-primary sort-old-number">Previous number ({{ $key + 1 }})</i>
                    </li>
                @endforeach
        </ul>
    </div>
    <div class="clearfix"></div>
@endif
