@extends('layouts.app', ['header_data' => $header_data])

@section('content')
    {{-- */$cdn=env('CDN');/* --}}
    <div class="container-fluid planet relative" style="overflow-x: hidden;">
        <div class="container">
            <div class="row">
                <div class="medals-list" class="col-md-12">
                    <h1 class="title">{{ trans('medals.medals') }}</h1>
                    <div class="table">
                        @if ($medals)
                            @foreach ($medals AS $inx => $medal)
                                <?php
                                    $image = '';
                                    if ($medal->imageData) {
                                        $image = $medal->imageData->url;
                                    }

                                    $image_hover = '';
                                    if ($medal->imageHoverData) {
                                        $image_hover = $medal->imageHoverData->url;
                                    }
                                ?>
                                @if ($inx % 2 == 0)
                                    <div class="row">
                                @endif
                                        <a href="{{ url($lang.'/mindmap?medal=' . $medal->ID) }}" class="col-md-6 col-sm-6 col-xs-6 medal">
                                            <div class="content">
                                                <div class="image">
                                                    <img src="{{ $image }}" />
                                                    <img class="hover" src="{{ $image_hover }}" />
                                                </div>
                                                <div class="name">{{ $medal->{'name'.$records_lang} }}</div>
                                                <div class="separator"></div>
                                                <div class="description">{{ $medal->{'description'.$records_lang} }}</div>
                                            </div>
                                        </a>
                                @if ($inx % 2 == 1)
                                    </div>
                                @endif
                            @endforeach
                            @if ($inx % 2 == 0)
                                </div>
                            @endif
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection