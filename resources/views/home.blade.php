@extends('layouts.app')
 {{--*/$cdn=env('CDN');/* --}}

@section('content')
    <div class="container-fluid planet relative catgories-container">
        <div id="intro-video">
            <div class="container">
                <div class="skip">
                    <i class="fa fa-angle-double-right" aria-hidden="true"></i>
                    {{ trans('home.skip_intro') }}
                </div>
            </div>
            <video id="spacechallenges-video">
                <source src="{{ URL::asset($cdn.'images/SpaceChallenges.mp4') }}">
                <source src="{{ URL::asset($cdn.'images/SpaceChallenges2.mp4') }}">
                <source src="{{ URL::asset($cdn.'images/SpaceChallenges.ogg') }}">
                <source src="{{ URL::asset($cdn.'images/SpaceChallenges.webm') }}">
            </video>
        </div>
        <div class="container">
            <button class="btn-primary" id="scene_back">
                <i class="fa fa-angle-left" aria-hidden="true"></i>
                {{ trans('home.back_to_moon') }}
            </button>
            <div id="main_row" class="row">
                <div class="categories-list" class="col-md-5 col-sm-12 col-xs-12 mobile">
                    <h1 class="title">{!! trans('home.what_to_learn') !!}</h1>
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
                                                        {{ $category->name }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    @endif
                </div>
                <div id="categories-intro" class="col-lg-4 no-mobile">
                    <h1 class="title">{!! trans('home.what_to_learn') !!}</h1>
                    <svg id="edges" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
                    <div class="nodes">
                        @if ($categories)
                            <?php $connect_parent = 0; ?>
                            @foreach ($categories AS $i => $category)
                                @if ($category->parent_id == 0)
                                    <?php
                                    $positions = $tree_pattern[$i % sizeof($tree_pattern)];
                                    ?>
                                    <div class="row">
                                        <div class="col-lg-12">
                                            <div style="margin-left:{{ $positions['left'] }}px; margin-top:{{ $positions['top'] }}px"  class="top table">
                                                <div data-id="{{ $category->ID }}" class="row category">
                                                    <div class="cell">
                                                        <div class="name">
                                                            {{ $category->name }}
                                                        </div>
                                                    </div>
                                                    <div class="cell">
                                                        <div id="category{{ $category->ID }}" class="circle smaller"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            @endforeach
                        @endif
                    </div>
                </div>
                <div id="sub-categories" class="col-lg-6">
                    <div class="container">
                        @if ($categories)
                            <?php $count = 0; ?>
                            @foreach($categories AS $category)
                                <?php $sub_categories = $category->subCategories; ?>
                                @if ($category->parent_id == 0 && sizeof($sub_categories) > 0)
                                    @foreach($sub_categories AS $sub)
                                        <?php
                                            if ($sub->imageData && $sub->imageData->url) {
                                                $image = $sub->imageData->url;
                                            } else {
                                                $image = $sub->image;
                                            }
                                        ?>
                                        <div data-index="{{$count++}}" id="box{{  $sub->ID }}" class="box">
                                            <div style="background-image:url('{{ $image }}');" class="image"></div>
                                            <div class="title">{{ $sub->name }}</div>
                                            <div class="separator"></div>
                                            <div class="description">{!! $sub->description !!}</div>
                                        </div>
                                    @endforeach
                                @endif
                            @endforeach
                        @endif
                    </div>
                    <a href="{{ url($lang.'/login') }}">
                        <button class="btn-primary"><i class="fa fa-plus-circle" aria-hidden="true"></i> {{ trans('home.enroll') }}</button>
                    </a>
                    <div class="slick-paging"></div>
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

    @include('spacescene', ['categories' => $categories, 'home_tree_pattern' => $home_tree_pattern])

@endsection