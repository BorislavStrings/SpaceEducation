@extends('layouts.app') @section('content')
{{-- */$cdn=env('CDN');/* --}}

<div id="user-profile" class="container">
    <div class="row">
        <div class="col-xs-12 col-md-4">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('profile.edit_your_profile') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-md-12">
                            {{ Form::open(array('url' => url($lang.'/profile/edit?XDEBUG_SESSION_START=session_name'), 'role' => 'form', 'class' => 'form-horizontal', 'files' => true, 'method' => 'post')) }} {{ csrf_field() }}

                            <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                                <label for="email" class="col-md-12 control-label">{{ trans('profile.email') }}</label>

                                <div class="col-md-12">
                                    <input {{ $user[ 'email'] ? 'disabled' : '' }} id="email" type="email" class="form-input {{ $user['email'] ? 'disabled' : '' }}" name="email" value="{{ old('email') ? old('email') : $user['email'] }}"> @if ($errors->has('email'))
                                    <span class="help-block">
                                                <strong>{{ $errors->first('email') }}</strong>
                                            </span> @endif
                                </div>
                            </div>

                            <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
                                <label for="name" class="col-md-12 control-label">{{ trans('profile.your_name') }}</label>

                                <div class="col-md-12">
                                    <input id="name" type="text" class="form-input" name="name" value="{{ old('name') ? old('name') : $user['name'] }}"> @if ($errors->has('name'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('name') }}</strong>
                                    </span> @endif
                                </div>
                            </div>
                            @if (false)
                            <div class="form-group{{ $errors->has('address') ? ' has-error' : '' }}">
                                <label for="address" class="col-md-12 control-label">{{ trans('profile.address') }}</label>

                                <div class="col-md-12">
                                    <input id="address" autocomplete="on" type="text" class="form-input" name="address" value="{{ old('address') ? old('address') : $user['address'] }}">
                                    <input id="address_coordinates" type="hidden" class="form-control" name="address_coordinates" value="{{ old('address_coordinates') ? old('address_coordinates') : $user['address_coordinates'] }}">
                                    <input id="address_place" type="hidden" class="form-control" name="address_place" value="{{ old('address_place') ? old('address_place') : $user['address_place'] }}"> @if ($errors->has('address'))
                                    <span class="help-block">
                                            <strong>{{ $errors->first('address') }}</strong>
                                        </span> @endif
                                </div>
                            </div>

                            <div class="form-group{{ $errors->has('description') ? ' has-error' : '' }}">
                                <label for="description" class="col-md-12 control-label">{{ trans('profile.short_desc') }}</label>

                                <div class="col-md-12">
                                    <textarea id="description" class="form-input" name="description">{{ old('description') ? old('description') : $user['description'] }}</textarea>

                                    @if ($errors->has('description'))
                                    <span class="help-block">
                                            <strong>{{ $errors->first('description') }}</strong>
                                        </span> @endif
                                </div>
                            </div>
                            @endif

                            <div class="form-group">
                                <label for="description" class="col-md-12 control-label">{{ trans('profile.change_pass') }}</label>
                                <div class="col-md-12">
                                    <input id="password_change" type="checkbox" name="change_password" value="1">
                                </div>
                            </div>

                            <div class="form-group password {{ $errors->has('password') ? ' has-error' : '' }}">
                                <label for="password" class="col-md-12 control-label">{{ trans('profile.password') }}</label>

                                <div class="col-md-12">
                                    <input id="password" type="password" class="form-input" name="password"> @if ($errors->has('password'))
                                    <span class="help-block">
                                            <strong>{{ $errors->first('password') }}</strong>
                                        </span> @endif
                                </div>
                            </div>

                            <div class="form-group password {{ $errors->has('password_confirmation') ? ' has-error' : '' }}">
                                <label for="password_confirmation" class="col-md-12 control-label">{{ trans('profile.confirm_pass') }}</label>

                                <div class="col-md-12">
                                    <input id="password_confirmation" type="password" class="form-input" name="password_confirmation"> @if ($errors->has('password_confirmation'))
                                    <span class="help-block">
                                            <strong>{{ $errors->first('password_confirmation') }}</strong>
                                        </span> @endif
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-md-12">
                                    <input type="hidden" id="preview-image-path" name="user_image" value="" />
                                    <input type="hidden" id="image-remove" name="image-remove" value="0" />
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fa fa-btn fa-user"></i> {{ trans('profile.update') }}
                                    </button>
                                </div>
                            </div>
                            {{ Form::close() }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xs-12 col-md-8">
            <div class="row">
                <div class="col-md-3 col-xs-12">
                    <div class="row photo">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label class="col-md-12 control-label">{{ trans('profile.your_photo') }}</label>
                                <div class="col-md-12">
                                    <div class="row user-photo {{ $header_data['has_image'] ? 'active' : '' }}">
                                        <div class="col-md-12 col-sm-12 col-xs-12 image-container">
                                            <div id="preview-image" style="background-image:url('{{ $header_data['user']['image'] }}');" class="image"></div>
                                            <div id="remove-action" class="remove">
                                                <i class="fa fa-times" aria-hidden="true"></i> {{ trans('profile.remove') }}
                                            </div>
                                        </div>
                                        <div class="col-md-12 col-sm-12 col-xs-12 upload-container">
                                            <div data-url="{{ url($lang.'/profile/upload') }}" id="drop-area" class="upload" style="background-image:url({{ URL::asset($cdn.'images/upload.jpg') }})">
                                                {{ csrf_field() }}
                                                <input type="file" name="image" title="Click to add Files">
                                            </div>
                                            <div id="progress-bar" class="progress-bar">
                                                <div class="inner"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-9 col-xs-12">
                    <div class="panel panel-default">
                        <div class="panel-heading">
                            {{ trans('profile.achievements') }}
                            <div class="separator"></div>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="user-progress">
                                        <div class="table">
                                            <div class="row">
                                                <div class="col-md-7 col-xs-6 col-sm-6 text">
                                                    {{ trans('profile.total_progress') }}
                                                </div>
                                                <div class="col-md-5 col-xs-6 col-sm-6 value">
                                                    <span class="points">
                                                            {{ $header_data['progress']['current_points'] . '/' . $header_data['progress']['all_points'] }}
                                                            pts.
                                                        </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="">
                                            <div class="row">
                                                <div class="prof-prog-val">
                                                    <div class="prof-inner" style="width: {{ $header_data['progress']['percents'] }}%"></div>
                                                    <div class="prof-val-text">
                                                        {{ $header_data['progress']['current_points'] }}{{ trans('profile.pts') }}
                                                    </div>
                                                </div>
                                                <div class="twentypoints allpoints">
                                                    <div class="prof-unitpoints">{{ trans('profile.20pts') }}</div>
                                                    <div class="prof-unitdesc">{{ trans('profile.space_cadet') }}</div>
                                                </div>
                                                <div class="fiftypoints allpoints">
                                                    <div class="prof-unitpoints">{{ trans('profile.50pts') }}</div>
                                                    <div class="prof-unitdesc">{{ trans('profile.advanced_space_cadet') }}</div>
                                                </div>
                                                <div class="hundredpoints allpoints">
                                                    <div class="prof-unitpoints">{{ trans('profile.100pts') }}</div>
                                                    <div class="prof-unitdesc">{{ trans('profile.space_admiral') }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <a href="{{ url($lang.'/mindmap') }}">
                                                    <button class="btn-primary">{{ trans('profile.see_full_mission_map') }}</button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="medals" class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('profile.medals') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body tree-body">
                    <div class="row">
                        <div class="col-lg-12">
                            @if ($all_medals) @foreach ($all_medals AS $medal)
                            <?php
                                        $image = '';
                                        if ($medal->imageData) {
                                            $image = str_replace('http://www.spaceport.spaceedu.net', 'https://www.spaceport.academy', $medal->imageData->url);
                                        }

                                        $image_hover = '';
                                        if ($medal->imageHoverData) {
                                            $image_hover = str_replace('http://www.spaceport.spaceedu.net', 'https://www.spaceport.academy', $medal->imageHoverData->url);
                                        }
                                        ?>
                                <div class="col-md-3 medal">
                                    <a href="{{ url($lang.'/mindmap?medal=' . $medal->ID) }}" class="medal {{ in_array($medal->ID, $user_medals) ? 'won' : '' }}">
                                        <div class="image {{ $image_hover ? 'hover' : '' }}">
                                            <img src="{{ $image }}" alt="{{ $medal->{'name'.$records_lang} }}" /> @if ($image_hover)
                                            <img class="hover" src="{{ $image_hover }}" alt="{{ $medal->{'name'.$records_lang} }}" /> @endif
                                            <div class="checker">
                                                <i class="fa fa-check" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                        <div class="name">{{ $medal->{'name'.$records_lang} }}</div>
                                    </a>
                                    <div class="share-medals-test">
                                        <span class="share-medals-button"><i class="fa fa-share-alt"></i> SHARE</span>
                                        <a target="_blank" href="http://www.linkedin.com/shareArticle?source={{$image}}&url={{ urlencode(url($lang . '/mindmap?medal=' . $medal->ID)) }}&title={{ urlencode($medal->{'name'.$records_lang}) }}&summary={{ urlencode($medal->{'description'.$records_lang}) }}">
                                            <i class="fa fa-linkedin-square"></i>
                                        </a>

                                        <a target="_blank" href='http://www.facebook.com/sharer/sharer.php?s=100&picture={{ urlencode($image) }}&u={{ urlencode(url($lang . "/mindmap?medal=" . $medal->ID)) }}&title={{ urlencode($medal->{"name".$records_lang}) }}&description={{ urlencode($medal->{"description".$records_lang}) }}'><i class="fa fa-facebook-square"></i></a>

                                        <a target="_blank" href="https://plus.google.com/share?url={{ urlencode(url($lang . '/mindmap?medal=' . $medal->ID)) }}&i={{ urlencode($image) }}">
                                            <i class="fa fa-google-plus-square"></i>
                                        </a>
                                        <a target="_blank" href="http://twitter.com/share?url={{ urlencode(url($lang . '/mindmap?medal=' . $medal->ID)) }}">
                                            <i class="fa fa-twitter-square"></i>
                                        </a>
                                    </div>
                                </div>
                                @endforeach @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="row">
        <div class="col-sm-12 model-updates">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('profile.scene_updates_title') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body tree-body">
                    <div class="row">
                        <div class="col-md-4 col-sm-12 col-xs-12">
                            <div id="upgrade-info" class="info">
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
                                        {{ trans('profile.buy') }}</button>
                                    <button class="btn btn-primary sell">
                                        <img src="{{ URL::asset($cdn.'images/loading.gif') }}" />
                                        {{ trans('profile.sell') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8 col-sm-12 col-xs-12">
                            @if ($scene_updates)
                                <?php $count = sizeof($scene_updates); ?>
                                <?php $inx = 1; ?>
                                <div class="updates-panel">
                                    @foreach ($scene_updates AS $model)
                                        @if (!$model->parent_id)
                                            <div class="column {{ ($count == (++$inx - 1)  ? 'last' : '') }}">
                                                <div id="model{{ $model->ID }}" data-id="{{ $model->ID }}" class="model">
                                                    <div class="image" style="{{ $model->imageData ? 'background-image: url(' . $model->imageData->url . ')' : '' }}">
                                                        <div class="cross-border blue"></div>
                                                        <div class="cross-border white"></div>
                                                    </div>
                                                    <div class="line horizontal"></div>
                                                    @if (sizeof($model->updates) > 0)
                                                        <div class="line vertical"></div>
                                                    @endif
                                                </div>
                                                @if ($model->updates)
                                                    <div class="updates">
                                                        @foreach ($model->updates AS $update)
                                                            <div id="model{{ $model->ID }}" data-id="{{ $update->ID }}" class="model">
                                                                <div class="image" style="{{ $model->imageData ? 'background-image: url(' . $model->imageData->url . ')' : '' }}">
                                                                    <div class="cross-border blue"></div>
                                                                    <div class="cross-border white"></div>
                                                                </div>
                                                                <div class="line vertical"></div>
                                                            </div>
                                                        @endforeach
                                                    </div>
                                                @endif
                                            </div>
                                        @endif
                                    @endforeach
                                    <div class="f-clear"></div>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    {{ trans('profile.your_missions') }}
                    <div class="separator"></div>
                </div>
                <div class="panel-body tree-body">
                    <div class="categories-list mobile-tree profile" class="col-md-5 col-sm-12 col-xs-12 mobile">
                        @if ($all_categories) @foreach ($all_categories AS $i => $category) @if ($category->parent_id == 0)
                        <div class="row main">
                            <div class="col-lg-12">
                                <div class="top table">
                                    <div data-id="{{ $category->ID }}" class="row category">
                                        <div class="cell">
                                            <div id="mobile_category{{ $category->ID }}" class="circle smaller"></div>
                                        </div>
                                        <div class="cell">
                                            <div class="name">
                                                {{ $category->{'name'.$records_lang} }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-12 sub table">
                                <?php $sub_categories = $category->subCategories; ?>
                                    @if ($sub_categories) @foreach ($sub_categories AS $inx => $children)
                                    <div class="row main node-container">
                                        <div class="col-lg-12 table">
                                            <div data-id="{{ $children->ID }}" class="row category sub-cat">
                                                <div class="cell">
                                                    <div id="mobile_category{{ $children->ID }}" class="circle"></div>
                                                </div>
                                                <div class="cell">
                                                    <div class="name">
                                                        {{ $children->{'name'.$records_lang} }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-lg-12 sub table">
                                            <?php $units = $children->units; ?>
                                                @if ($units) @foreach ($units AS $inx => $unit)
                                                <div class="row node-container">
                                                    <div class="col-lg-4 table">
                                                        <a href="{{ url($lang.'/unit', ['unit_id' => $unit->ID]) }}" class="row category">
                                                            <div class="cell unit">
                                                                <div id="mobile_unit_{{$unit->ID}}" class="circle"></div>
                                                            </div>
                                                            <div class="cell">
                                                                <div class="name">
                                                                    {{ $unit->{'name'.$records_lang} }}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </div>
                                                </div>
                                                @endforeach @endif
                                        </div>
                                    </div>
                                    @endforeach @endif
                            </div>
                        </div>
                        @endif @endforeach @endif
                    </div>






                    <div id="profile-tree" class="missions-table">
                        <div class="tree-container">
                            <svg id="edges" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
                            <div class="nodes">
                                @if ($all_categories) @foreach ($all_categories AS $i => $category) @if ($category->parent_id == 0)
                                <?php $positions = $tree_pattern[$i % sizeof($tree_pattern)]; ?>
                                    <div class="row">
                                        <div class="col-lg-12 group">
                                            <div style="left: {{ $positions['left'] }}px;" class="top table">
                                                <div class="row">
                                                    <div class="cell name">
                                                        {{ $category->{'name'.$records_lang} }}
                                                    </div>
                                                    <div class="cell">
                                                        <div id="category{{ $category->ID }}" class="circle smaller"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <?php $sub_categories = $category->subCategories; ?>
                                                @while ($sub_categories)
                                                <div class="sub">
                                                    @foreach ($sub_categories AS $children)
                                                    <div class="row">
                                                        <div class="col-lg-4 table">
                                                            <div class="row group">
                                                                <div class="cell">
                                                                    <div id="category{{ $children->ID }}" class="circle"></div>
                                                                    <div class="name">
                                                                        {{ $children->{'name'.$records_lang} }}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-lg-8">
                                                            @if ($children->units) @foreach ($children->units AS $inx => $unit)
                                                            <?php
                                                                                        $positions = $tree_pattern[$i % sizeof($tree_pattern)];
                                                                                    ?>
                                                                @if ($inx % 2 == 0)
                                                                <a href="{{ url($lang.'/unit', ['unit_id' => $unit->ID ]) }}" data-id="{{ $unit->ID }}" class="unit group">
                                                                                            <div id="unit{{ $unit->ID }}" class="circle"></div>
                                                                                            <div class="unit-name">{{ $unit->{'name'.$records_lang} }}</div>
                                                                                        </a> @else
                                                                <a href="{{ url($lang.'/unit', ['unit_id' => $unit->ID ]) }}" data-id="{{ $unit->ID }}" class="unit group">
                                                                                            <div id="unit{{ $unit->ID }}" class="circle"></div>
                                                                                            <div class="unit-name">{{ $unit->{'name'.$records_lang} }}</div>
                                                                                        </a> @endif @endforeach @endif
                                                                <div class="f-clear"></div>
                                                        </div>
                                                    </div>
                                                    @endforeach
                                                </div>
                                                <div class="f-clear"></div>
                                                <?php $sub_categories = false; ?>
                                                    @endwhile
                                        </div>
                                    </div>
                                    @endif @endforeach @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

@include('footer') @endsection