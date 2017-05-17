{{-- */$cdn=env('CDN');/* --}}
@extends('layouts.app', ['header_data' => $header_data])

@section('content')
    <div class="mask"></div>

    <div class="container relative">
        <div id="medals-mindmap" class="row">
            <div class="col-md-12">
                <h3>{{ trans('spacescene.all_medals') }}</h3>
                <div class="row center">
                @if ($all_medals)
                    @foreach ($all_medals AS $medal)
                    <?php
                    $image = '';
                    if ($medal->imageData) {
                        $image = str_replace('http://www.spaceport.spaceedu.net', 'https://www.spaceport.academy', $medal->imageData->url);
                    }

                    $image_hover = '';
                    if ($medal->imageHoverData) {
                        $image_hover = str_replace('http://www.spaceport.spaceedu.net', 'https://www.spaceport.academy', $medal->imageHoverData->url);
                    }

                    $medal_units = '';
                    foreach ($medal->exams as $exam) {
                        $unit = $all_exams->where('ID', intval($exam->exam_id))->first();
                        if ($unit) {
                            // dd($unit);
                            $medal_units .= $unit->unit_id.'|';
                        }
                    }

                    ?>
                    <div id="medal{{ $medal->ID }}" data-id="{{ $medal->ID }}" data-units="{{ $medal_units }}" class="col-md-2 col-sm-6 col-xs-6 medal {{ in_array($medal->ID, $user_medals) ? 'won' : '' }}">
                        <div class="image {{ $image_hover ? 'hover' : '' }}">
                            <img class="base" src="{{ $image }}" alt="{{ $medal->{'name'.$records_lang} }}" />
                            @if ($image_hover)
                                <img class="hover" src="{{ $image_hover }}" alt="{{ $medal->{'name'.$records_lang} }}" />
                            @endif
                            <div class="checker">
                                <i class="fa fa-check" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div class="name">{{ $medal->{'name'.$records_lang} }}</div>
                        {{-- @if($_SERVER["REMOTE_ADDR"]=='130.204.213.58') --}}
                            <div class="mobile_description content">{{ $medal->{'description'.$records_lang} }}</div>
                        {{-- @endif --}}
                    </div>
                    @endforeach
                @endif
                </div>
                <div class="clearfix"></div>
                <div class="separator"></div>
            </div>
        </div>
    </div>

    @if ($categories)
        <div class="parent">
            <div class="child-container">
                <div class="map-container draggable" id="child">
                    <img src="{{ $cdn }}images/space-challenges-spaceport-logo.png" width="320" class="center-img">
                    @foreach($categories as $key => $category)
                        <div class="map-row {{ $category->class_name }}">
                            <p class="section-name">
                                @if($category->name == 'Engineering')
                                    <span class="name">{{ $category->{'name'.$records_lang} }}</span>
                                    <span class="circle-map"></span>
                                @else
                                    <span class="circle-map"></span>
                                    <span class="name">{{ $category->{'name'.$records_lang} }}</span>
                                @endif

                            </p>
                            
                            @foreach($category->subCategories->sortBy('mindmap_order') as $subCategory)
                                <div class="{{ $subCategory->class_name }}">
                                    <div class="holder">
                                        <p>
                                            <span class="circle-map"></span>
                                            <span class="name">{{ $subCategory->{'name'.$records_lang} }}</span>
                                        </p>
                                        @foreach($subCategory->units as $unit)
                                            <?php
                                                $secondary = '';
                                                $id = $unit->ID;
                                                // $relations = $units_relations->where('parent_id', $unit->ID)->orWhere('1', $unit->ID)->all();
                                                // $relations = $units_relations->where('parent_id', $id)->all();
                                                foreach ($units_relations as $key => $relation) {
                                                    if ($relation->parent_id == $id) {
                                                        $secondary .= $relation->child_id . '|';
                                                    }
                                                }

                                                $class = '';
                                                $progress = '';
                                                $this_unit = $all_units->where('ID', intval($unit->ID))->first();
                                                if (!$this_unit) {
                                                    $this_unit = $all_units->where('ID', intval($unit->ID))->first();
                                                }

                                                if (isset($this_unit->progress)){
                                                    $this_unit = intval($this_unit->progress);
                                                } else {
                                                    $this_unit = 0;
                                                }

                                                if ($this_unit != 0) {
                                                    $class = 'info';
                                                    
                                                    if ((float)$this_unit == 100) {
                                                        $class .= ' completed';
                                                    }
                                                    $progress = round($this_unit) . '%';
                                                }
                                            ?>
                                            <p data-href="{{ url(str_replace('_', '', $records_lang).'/unit/' . $unit->ID) }}"
                                               data-points="{{ $unit->points }}"
                                               data-id="{{ $unit->ID }}"
                                               data-secondary="{{ $secondary }}"
                                               class="{{ $class }}">
                                                <span class="circle-map">{{ $progress }}</span>
                                                <span class="name">{{ $unit->{'name'.$records_lang} }}</span>
                                            </p>
                                        @endforeach
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <a href="javascript:void(0);" class="btn btn-primary" id="close_all_categories"><b>{{ trans('app.close_all') }}</b></a>
    @endif
    <div id="mindmap-tree">
        <div class="tree-container">
            <div id="unit-info" class="unit-info">
                <div class="points"></div>
                <div class="image-container">
                    <div class="image"></div>
                </div>
                <div class="title"></div>
                <div class="description"></div>
                <div class="close-btn">Go back</div>
            </div>
        </div>
    </div>
@endsection

