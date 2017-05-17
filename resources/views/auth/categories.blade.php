@extends('layouts.app', ['header_data' => $header_data])

@section('content')
    <div class="container-fluid planet relative catgories-container" style="overflow-x: hidden;">
    <div class="container">
        <div id="main_row" class="row">
            <h1 class="title">{{ trans('missions.choose_mission') }}</h1>
            <div class="categories-list" class="col-md-5 col-sm-12 col-xs-12 mobile">
                @if ($categories)
                    @foreach ($categories AS $i => $category)
                        @if ($category->parent_id == 0)
                            <?php
                            $positions = $tree_pattern[$i % sizeof($tree_pattern)];
                            ?>
                            <div class="row main">
                                <div class="col-lg-12">
                                    <div class="top table">
                                        <div data-id="{{ $category->ID }}" class="row category">
                                            <div class="cell">
                                                <div class="circle smaller"></div>
                                            </div>
                                            <div class="cell">
                                                <div class="name">
                                                    {{ $category->{'name' . $records_lang} }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-12 sub table">
                                    <?php $sub_categories = $category->subCategories; ?>
                                    @if ($sub_categories)
                                        @foreach ($sub_categories AS $inx => $children)
                                            <?php
                                            $positions = $tree_pattern[$inx % sizeof($tree_pattern)];
                                            ?>
                                            <div class="row node-container">
                                                <div class="col-lg-4 table">
                                                    <div data-id="{{ $children->ID }}" class="row category">
                                                        <div class="cell">
                                                            <div class="circle"></div>
                                                        </div>
                                                        <div class="cell">
                                                            <div class="name">
                                                                {{ $children->{'name' . $records_lang} }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                            </div>
                        @endif
                    @endforeach
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="top table">
                                    <div class="row category">
                                        <div class="cell">
                                            <a class="navigation btn-primary" href="{{ url($lang.'/mindmap') }}"><i class="fa fa-plus-circle" aria-hidden="true"></i>{{ trans('missions.full_navigation') }}</a>
                                        </div>
                                        <div class="cell"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                @endif
            </div>
            <div id="categories" class="no-mobile">
                <div class="elements">
                    <svg id="edges" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
                    <div class="nodes">
                        @if ($categories)
                            @foreach ($categories AS $i => $category)
                                @if ($category->parent_id == 0)
                                    <?php
                                    $positions = $tree_pattern[$i % sizeof($tree_pattern)];
                                    ?>
                                    <div class="wrapper">
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <div style="margin-left:{{ $positions['left'] }}px; margin-top:{{ $positions['top'] - 10 }}px"  class="top table">
                                                    <div data-id="{{ $category->ID }}" class="row category">
                                                        <div class="cell">
                                                            <div class="name">
                                                                {{ $category->{'name' . $records_lang} }}
                                                            </div>
                                                        </div>
                                                        <div class="cell">
                                                            <div id="category{{ $category->ID }}" class="circle smaller"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-lg-12">
                                                <?php $sub_categories = $category->subCategories; ?>
                                                @if ($sub_categories)
                                                    <div class="sub">
                                                        @foreach ($sub_categories AS $inx => $children)
                                                            <?php
                                                            $positions = $tree_pattern[$inx % sizeof($tree_pattern)];
                                                            ?>
                                                            <div class="row node-container">
                                                                <div style="margin-top: {{ $positions['top'] / 3 }}px; left: {{$positions['left']}}px" class="col-lg-4 table">
                                                                    <div data-id="{{ $children->ID }}" class="row category">
                                                                        <div class="cell">
                                                                            <div class="name">
                                                                                {{ $children->{'name' . $records_lang} }}
                                                                            </div>
                                                                            <div id="category{{ $children->ID }}" class="circle"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            @endforeach
                        @endif
                        <a style="margin-left:{{ !empty($positions) ? $positions['left'] : '0' }}px" class="navigation btn-primary" href="{{ url($lang.'/mindmap') }}"><i class="fa fa-plus-circle" aria-hidden="true"></i>
                        {{ trans('missions.full_navigation') }}</a>
                    </div>
                </div>
            </div>
            <div id="categories-units" class="col-md-8 col-sm-12 col-xs-12">
                <h1 class="title">{!! trans('missions.units') !!}</h1>
                <h1 class="category">{!! trans('missions.units') !!}</h1>
                <div class="container"></div>
                <div class="paging-container"></div>
                <div class="units-mask">
                    <div class="close-units">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
            <div class="f-clear"></div>
        </div>
    </div>
    </div>
@endsection