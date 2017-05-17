@extends('layouts.app')
{{-- */$cdn=env('CDN');/* --}}

@section('content')
    <div class="container-fluid planet">
        <div id="intro-video">
            <div class="container">
                <div class="skip">
                    <i class="fa fa-angle-double-right" aria-hidden="true"></i>
                    Skip intro
                </div>
            </div>
            <video autoplay>
                <source src="{{ URL::asset($cdn.'images/sample.mp4') }}" type='video/mp4; codecs="avc1.4D401E, mp4a.40.2"'>
            </video>
        </div>
        <div class="row">
            <div class="col-lg-2"></div>
            <div id="categories-intro" class="col-lg-4">
                <h1 class="title">{!! trans('common.intro.learn') !!}</h1>
                <svg id="edges" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
                <div class="nodes">
                    @if ($categories)
                        <?php $connect_parent = 0; ?>
                        @foreach ($categories AS $i => $category)
                            @if ($category->parent_id == 0)
                                <?php
                                    $min_l = -20;
                                    $max_l = 60;
                                    $min_r = 0;
                                    $max_r = 30;
                                    if ($i == 0) {
                                        $min_l = 0;
                                        $max_l = 0;
                                        $min_r = 0;
                                        $max_r = 0;
                                    }
                                ?>
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div style="margin-left:{{ rand($min_l, $max_l) }}px; margin-top:{{ rand($min_r, $max_r) }}px"  class="top table">
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
                                @if (isset($show_categories))
                                    <?php $sub_categories = $category->subCategories; ?>
                                    @while ($sub_categories)
                                        <div class="sub">
                                            @foreach ($sub_categories AS $children)
                                                <div class="row">
                                                    <div class="col-lg-4 table">
                                                        <div class="row">
                                                            <div class="cell">
                                                                <div class="name">
                                                                    {{ $children->name }}
                                                                </div>
                                                                <div id="category{{ $children->ID }}" class="circle"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            @endforeach
                                        </div>
                                    @endwhile
                                @endif
                            @endif
                        @endforeach
                    @endif
                </div>
            </div>
            <div id="sub-categories" class="col-lg-6">
                <div class="container"></div>
                <div class="paging-container"></div>
            </div>
            <div class="f-clear"></div>
        </div>
    </div>
    @extends('spacescene')

@endsection