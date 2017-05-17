@extends('layouts.app')

@section('content')
    <div class="container">
        <div id="mindmap-tree2">
            <svg id="edges" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
            <svg id="related_edges" version="1.1" xmlns="http://www.w3.org/2000/svg">
            </svg>
            <div class="nodes">
                <div class="mask">
                    <div class="info">
                        <div id="close" class="close"><i class="fa fa-times" aria-hidden="true"></i></div>
                        <div id="unit-info" class="unit-info">
                            <div class="image-container">
                                <div class="image"></div>
                            </div>
                            <div class="title"></div>
                            <div class="description"></div>
                            <div class="close-btn">Go back</div>
                        </div>
                    </div>
                </div>
                @if ($categories)
                    @foreach ($categories AS $i => $category)
                        @if ($category->parent_id == 0)
                            <?php
                            $min = -40; $max = 40;
                            if ($i % 2 == 0) {
                                $min = 40;
                                $max = 120;
                            }
                            ?>
                            <div class="row">
                                <div class="col-lg-12">
                                    <div style="margin-left: {{ rand($min, $max) }}px"  class="top table">
                                        <div class="row">
                                            <div class="cell name">
                                                {{ $category->name }}
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
                                    @while ($sub_categories)
                                         <div class="sub">
                                            @foreach ($sub_categories AS $children)
                                                <div style="margin-left: {{ rand(-40, 40) }}px; margin-top: {{ rand(10, 30) }}px" class="row">
                                                    <div class="col-lg-4 table">
                                                        <div class="row">
                                                            <div class="cell">
                                                                <div class="name">
                                                                    {{ $children->name }}
                                                                </div>
                                                            </div>
                                                            <div class="cell">
                                                                <div id="category{{ $children->ID }}" class="circle"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-8">
                                                        @if ($children->units)
                                                            <?php $connect_to = 0; $number = 0; ?>
                                                            @foreach ($children->units AS $inx => $unit)
                                                                <?php
                                                                        $top = true;
                                                                    $min = -40; $max = -30;
                                                                    if ($inx % 2 == 0) {
                                                                        $min = 30;
                                                                        $max = 40;
                                                                        $top = false;
                                                                    }
                                                                ?>
                                                                <div data-id="{{ $unit->ID }}" style="margin-left: {{ rand(0, 10) }}px; margin-top: {{ rand($min, $max) }}px" class="unit">
                                                                    @if ($top)
                                                                        <div>{{ $unit->name }}</div>
                                                                        <div id="unit{{ $unit->ID }}" class="circle"></div>
                                                                    @else
                                                                        <div id="unit{{ $unit->ID }}" class="circle"></div>
                                                                        <div>{{ $unit->name }}</div>
                                                                    @endif
                                                                </div>
                                                                <?php $connect_to = $unit->ID; $number++; ?>
                                                            @endforeach
                                                            <div class="f-clear"></div>
                                                        @endif
                                                    </div>
                                                </div>
                                            @endforeach
                                        </div>
                                        <div class="f-clear"></div>
                                        <?php $sub_categories = false;//$children->subCategories; ?>
                                    @endwhile
                                </div>
                            </div>
                        @endif
                    @endforeach
                @endif
            </div>
        </div>
    </div>
@endsection