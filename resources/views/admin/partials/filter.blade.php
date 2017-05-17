@if(isset($filter_columns) && !empty($filter_columns))
    <div class="clearfix"></div>
    <a href="javascript:void(0);" id="toggle-filter" class="btn btn-info"> <i class="fa fa-filter"></i> Filter</a>
    <form class="well custom-well" method="GET" style="margin-top: 15px;">
        @foreach($filter_columns as $filter_column)
            <div class="col-sm-4">
                <label for="{{ $filter_column }}">{{$filter_column}}</label>
                <input type="text"
                       name="{{ $filter_column }}"
                       id="{{ $filter_column }}"
                       value="{{ \Illuminate\Support\Facades\Input::get($filter_column) ?? null }}"
                       class="form-control">
            </div>
        @endforeach
        <div class="clearfix"></div>
        <div class="col-sm-12" style="margin-top: 15px;">
            <button type="submit" class="btn btn-primary">Submit</button>
        </div>
    </form>
@endif