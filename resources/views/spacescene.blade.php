{{-- */$cdn=env('CDN');/* --}}
<div id="space_sceen" class="row">
    <div id="loading">
        <div class="content">
            <img src="{{$cdn}}images/logo-small.png" alt="logo" />
            <div class="progress-container">
                <div class="bar" id="progress_bar"></div>
            </div>
        </div>
    </div>
    <div id="prevent-click"></div>
    <canvas id="normalmap"></canvas>
    <canvas id="resize"></canvas>
    <div id="navigation" class="{{ (!Auth::guest() ? 'bigger' : '' ) }} {{ ($mobile ? '' : 'active' ) }}">
        <h1>{{ trans('spacescene.chose_mission') }}</h1>
        <svg id="edges-nav" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
        @if ($categories)
            <?php $i = 0 ?>
            <?php $navit = 1; ?>
            @foreach ($categories AS $cat)
                <?php
                $positions = $home_tree_pattern[$i % sizeof($tree_pattern)];
                ?>
                @if ($cat->parent_id == 0)
                    <div data-id="{{ $cat->ID }}" data-item="{{ isset($positions['inx']) ? $positions['inx'] : '' }}" class="row navit<?php echo $navit++; ?>" style="margin-left:{{ $positions['left'] }}px; margin-top:{{ $positions['top'] }}px">
                        <div class="circle"></div> {{ $cat->{'name'.$records_lang} }}
                    </div>
                    <?php $i++; ?>
                @endif
            @endforeach
        @endif
        <i class="fa fa-angle-left remove" aria-hidden="true"></i>
        <div class="arrow">
            <i class="fa fa-angle-right view" aria-hidden="true"></i>
        </div>
        @if (!Auth::guest())
            <a class="navigation" href="{{ url($lang.'/mindmap') }}">
                <button class="btn-primary">
                    <i class="fa fa-plus-circle" aria-hidden="true"></i> {{ trans('home_registered.full_navigation') }}
                </button>
            </a>
        @endif
    </div>
    <div id="category_popup">
        <div class="arrow">
            <i class="fa fa-angle-right view" aria-hidden="true"></i>
        </div>
        <div class="cat">
            <div class="image"></div>
            <div class="name"></div>
            <div class="separator"></div>
            <div class="questions"></div>
            <div id="see_more" class="btn-primary button">{{ trans('spacescene.go_to_topic') }}</div>
        </div>
        <div class="update">
            <div class="name-top">
                {{ trans('spacescene.upgrades_title') }}
            </div>
            <div class="image"></div>
            <div class="name"></div>
            <div class="separator"></div>
            <div class="description"></div>
            <div class="categories">
                <div class="title">{{ trans('profile.update_categories') }}</div>
                <div class="items"></div>
            </div>
            <div class="title">{{ trans('profile.update_price') }}</div>
            <div class="price item">
                {{ trans('profile.scene_update_price') }}
                <span class="value"></span>
            </div>
            <div class="current-credit item">
                <i class="fa fa-check-circle" aria-hidden="true"></i>
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
                {{ trans('profile.scene_updates_current_credit') }}
                <span class="value"></span>
            </div>
            <div class="actions">
                <button class="btn btn-primary buy">
                    <img src="{{ URL::asset($cdn.'images/loading.gif') }}" />
                    {{ trans('profile.buy') }}
                </button>
                <button class="btn btn-primary sell">
                    <img src="{{ URL::asset($cdn.'images/loading.gif') }}" />
                    {{ trans('profile.sell') }}
                </button>
            </div>
        </div>
        <div class="arrow-show">
            <i class="fa fa-angle-left view" aria-hidden="true"></i>
        </div>
    </div>
    <div class="quality">
        <a class="{{ $definition == 4 ? 'active' : '' }}" href="{{  url($lang.'/?q=3') }}" >{{ trans('spacescene.low') }}</a>
        <a class="{{ $definition == 3 ? 'active' : '' }}" href="{{  url($lang.'/?q=2') }}" >{{ trans('spacescene.medium') }}</a>
        <a class="{{ $definition == 2 ? 'active' : '' }}" href="{{  url($lang.'/?q=1') }}" >{{ trans('spacescene.high') }}</a>
    </div>
    @if (!$mobile)
    <canvas id="normalmap"></canvas>
    <canvas id="resize"></canvas>
    @else
    <div id="scroll" class="3d-image">
        <div id="scroll-map" class="map">
            <img class="map-img" src="{{ URL::asset($cdn.'3dmodels/terrain/2dterrain.jpg') }}" />
            <div class="elements">
                <div id="i1" data-id="24" style="transform: skew(2deg, 15deg);left:2068.18px;top:114.9664px;" class="active-item 24"></div>
                <div id="i2" data-id="44" style="transform: skew(2deg, 1deg);top:750px;left:1237px;" class="active-item 44"></div>
                <div id="i3" data-id="21" style="transform: skew(2deg, -5deg);top:230.9296px;left:1116.96094px;" class="active-item 21"></div>
                <!---<div id="i4" data-id="19" style="transform: skew(2deg, -8deg);top:261.6px;left:535.2px;" class="active-item 19"></div>--->
                <div id="i5" data-id="19" style="transform: skew(2deg, -8deg);top:526.456px;left:335.8656px;" class="active-item 19"></div>
                <div id="i6" data-id="23" style="transform: skew(2deg, -10deg);top:930.318px;left:359px;" class="active-item 23"></div>
                <!---<div id="i7" data-id="21" style="transform: skew(2deg, 2deg);top:748.8px;left:960px;" class="active-item 21"></div>--->
                <!---<div id="i8" data-id="24" style="transform: skew(2deg, -15deg);top:39.36px;left:1036.8px;" class="active-item 24"></div>--->
                <div id="i9" data-id="22" style="transform: skew(2deg, -12deg);top:30px;left:930.82752px;" class="active-item 22"></div>
            </div>
        </div>
    </div>
    @endif
</div>