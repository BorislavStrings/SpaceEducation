@extends('layouts.app', ['header_data' => $header_data])
{{-- */$cdn=env('CDN');/* --}}
@section('content')
    <div id="video" class="container-fluid">
        <div class="">
            <div id="video-container" class="">
                <?php
                    $image = '';
                    if ($video->unit->imageData) {
                        $image = $video->unit->imageData->url;
                    } else if ($video->unit->image) {
                        $image = $video->unit->image;
                    }
                ?>
                <div style="background-image: url('{{ $image }}');" id="player"></div>
                <div class="video-end top col-md-6">
                    <button class="btn-primary {{ in_array($video->ID, $watched_videos) ? 'disabled' : '' }}">
                        <i class="fa fa-check" aria-hidden="true"></i>
                        {{ in_array($video->ID, $watched_videos) ? 'Watched' : 'Complete' }}
                    </button>
                </div>
                <div class="unit-videos">
                    <i class="fa fa-chevron-left hide-arrow show-arrow" aria-hidden="true"></i>
                    <h2>
                        {{ $video->unit->{'name'.$records_lang} }}
                        <i class="fa fa-chevron-right hide-arrow" aria-hidden="true"></i>
                    </h2>
                    <div class="row">
                        <div class="progress-box col-md-12">
                            <div class="value">{{ trans('profile.total_progress') }} <span>{{ round($unit_progress) }}</span>%</div>
                            <div class="border">
                                <div style="width: {{ $unit_progress }}%" class="inner"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row rel">
                    <?php $next_video = 0; $next = false; $prev_video = 0; $prev = true; ?>
                    @if ($unit_videos)
                        @foreach ($unit_videos AS $unit_video)
                            <?php
                                $video_image = $unit_video->imageFile && !empty($unit_video->imageFile->url) ? $unit_video->imageFile->url : $unit_video->image;
                                if ($next) {
                                    $next_video = $unit_video->ID;
                                    $next = false;
                                }

                                if ($unit_video->ID == $video->ID) {
                                    $next = true;
                                    $prev = false;
                                }

                                if ($prev) {
                                    $prev_video = $unit_video->ID;
                                }
                            ?>
                            <a id="related_{{ $unit_video->ID }}" href="{{ url($lang.'/video', ['video_id' => $unit_video->ID]) }}"
                               class="video {{ in_array($unit_video->ID, $watched_videos) ? 'seen' : '' }} {{ ($unit_video->ID == $video->ID) ? 'current' : '' }} col-md-4 col-sm-6 col-xs-12"
                            >
                                <div class="image" style="background-image: url('{{ $video_image }}');">
                                    <div class="seen-box">
                                        <i class="fa fa-check" aria-hidden="true"></i>
                                    </div>
                                </div>
                                <div class="name">{{ $unit_video->{'title'.$records_lang} }}</div>
                            </a>
                        @endforeach
                    @endif
                    @if ($video->unit->exam)
                        <a href="{{ $exam_passed ? '#' : url('unit?exam=start', ['unit_id' => $video->unit->ID]) }}" class="video col-md-4 col-sm-6 col-xs-12 exam-box {{ !$unlock_test ? 'disabled' : '' }} {{ $exam_passed ? 'seen' : '' }} ">
                            <div class="image test" style="background-image: url('{{ $image }}');">
                                <div class="mask">
                                    Unit Test
                                </div>
                                <div class="seen-box">
                                    <i class="fa fa-check" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div class="name">{{ $video->unit->exam->name }}</div>
                        </a>
                    @endif
                    </div>
                    @if ($next_video)
                    <div class="row next-video">
                        <div class="col-lg-12">
                            <a href="{{ url($lang.'/video', ['video_id' => $next_video]) }}" >
                                <button class="btn-primary">
                                    {{ trans('profile.next_video') }}
                                </button>
                            </a>
                        </div>
                    </div>
                @endif
                </div>
                <div id="video_details">
                    <div class="row">
                        <div class="col-md-4">
                            @if ($prev_video)
                            <a href="{{ url($lang.'/video', ['video_id' => $prev_video]) }}" >
                                <i class="fa fa-backward" aria-hidden="true"></i>
                            </a>
                            @endif
                        </div>
                        <div class="col-md-4 more">
                            <div class="video-end col-md-6">
                                <button class="btn-primary {{ in_array($video->ID, $watched_videos) ? 'disabled' : '' }}">
                                    <i class="fa fa-check" aria-hidden="true"></i>
                                    {{ in_array($video->ID, $watched_videos) ? trans('video.watched') : trans('video.complete') }}
                                </button>
                            </div>
                            <div class="col-md-6 link">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                                <span class="text"> {{ trans('video.show_more') }} </span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            @if ($next_video)
                            <a href="{{ url($lang.'/video', ['video_id' => $next_video]) }}" >
                                <i class="fa fa-forward" aria-hidden="true"></i>
                            </a>
                            @endif
                        </div>
                    </div>
                </div>
                <div class="related-categories"></div>
                {{ csrf_field() }}
            </div>
        </div>
        <div id="video-information">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <a class="back" href="{{ url($lang.'/missions') }}">
                            <i class="fa fa-chevron-circle-left" aria-hidden="true"></i>
                            <span class="text">{{ trans('video.back_to_category_tree') }}</span>
                        </a>
                    </div>
                </div>
                <div id="video-tabs" class="row">
                    <div class="col-lg-12">
                        <ul class="tabs">
                            <li data-tab="#description" class="active">{{ trans('video.more_info') }}</li>
                            <li data-tab="#downloads">{{ trans('video.downloads') }}</li>
                            <li data-tab="#links">{{ trans('video.links') }}</li>
                            <li data-tab="#related_topics">{{ trans('video.related_topics') }}</li>
                        </ul>
                    </div>
                </div>
                <div class="row tab-content">
                    <h2 data-tab="#description" class="tab-title active">{{ trans('video.more_info') }}</h2>
                    <div id="description" class="description tab col-lg-12 active">
                        {!! $video->{'long_description'.$records_lang} !!}
                    </div>

                    @if (($files))
                    <h2 class="tab-title" data-tab="#downloads">{{ trans('video.downloads') }}</h2>
                    <div id="downloads" class="files tab col-lg-12">
                        @foreach ($files AS $file)
                            <a class="file" href="{{ url($lang.'/file', ['file_id' => $file->ID]) }}">
                                <div class="file-content">
                                    <img src="{{ URL::asset($cdn.'images/file.png') }}" alt="{{ $file->name }}" />
                                    <div class="type">{{ pathinfo($file->file->url, PATHINFO_EXTENSION) }}</div>
                                </div>
                                <div class="name">{{ $file->name }}</div>
                            </a>
                        @endforeach
                    </div>
                    @endif

                    @if ($video->links)
                    <h2 class="tab-title" data-tab="#links">{{ trans('video.links') }}</h2>
                    <div id="links" class="tab col-lg-12">
                        @foreach ($video->links AS $link)
                            <div class="link">
                                <a href="{{ $link->link }}" target="_blank" class="link-container">
                                    <div class="name">{{ $link->{'name'.$records_lang} }}</div>
                                    <div class="description">{{ $link->{'description'.$records_lang} }}</div>
                                </a>
                            </div>
                        @endforeach
                    </div>
                    @endif

                    @if ($unit_relations)
                    <h2 class="tab-title" data-tab="#related_topics">{{ trans('video.related_topics') }}</h2>
                    <div id="related_topics" class="tab col-lg-12">
                        @foreach ($unit_relations AS $unit)
                            @if ($video->unit->ID == $unit->unitOne->ID)
                                <?php $u = $unit->unitTwo ?>
                            @else
                                <?php $u = $unit->unitOne ?>
                            @endif

                            <?php
                                $image = '';
                                if ($u->imageData && $u->imageData->url) {
                                    $image = $u->imageData->url;
                                }  else if ($u->image) {
                                    $image = $u->image;
                                }
                            ?>

                                <a href="{{ url($lang.'/unit', ['unit_id' => $u->ID]) }}" class="video col-md-4 col-lg-3 col-xs-12">
                                    <div class="image" style="background-image: url('{{ $image }}');">
                                        <div class="name">{{ $u->{'name'.$records_lang} }}</div>
                                        <div class="mask"></div>
                                    </div>
                                </a>
                        @endforeach
                        <div class="f-clear"></div>
                    </div>
                    @endif
                </div>
                <div class="row">
                    <div class="social col-lg-12">
                        <div class="item share-video col-xs-6 col-sm-6">
                            <i class="fa fa-share-square-o" aria-hidden="true"></i> {{ trans('video.share_this_video') }}
                        </div>
                        <div class="item like col-xs-6 col-sm-6">
                            <div class="fb-like" data-href="{{ Request::fullUrl() }}" data-width="400px" data-layout="button" data-action="like" data-size="large" data-show-faces="false" data-share="false">

                            </div>
                            <i class="fa fa-heart-o" aria-hidden="true"></i>
                            <i class="fa fa-heart" aria-hidden="true"></i> {{ trans('video.like') }}
                        </div>
                        <div id="comments_number" data-value="{{ sizeof($comments) }}" class="item col-xs-12 col-md-12 comments_number">
                            <i class="fa fa-comment" aria-hidden="true"></i>
                            Comments(<span>{{ sizeof($comments) }}</span>)</div>
                    </div>
                </div>

                <h2 class="tab-title comments" data-value="{{ sizeof($comments) }}" data-tab="#comments">Comments(<span>{{ sizeof($comments) }}</span>)</h2>
                <div id="comments" class="row">
                    <div class="col-lg-12">
                        <div class="row">
                            <div class="col-lg-12 comments-container">
                        @if ($comments)
                            <?php $counter = 0; ?>
                            @foreach ($comments AS $comment)
                                <div id="{{ 'comment' . $comment->ID }}" class="comment {{ $counter++ < $max_items_per_page ? '' : 'hide' }}">
                                    <?php
                                        $image = '';
                                        if ($comment->user->imageData) {
                                            $image = $comment->user->imageData->url;
                                        } else if ($comment->user->facebook) {
                                            $image = $comment->user->facebook->avatar;
                                        } else {
                                            $image = URL::asset($cdn.'images/user.png');
                                        }
                                    ?>
                                    <div class="image col-xs-12" style="background-image:url('{{ $image }}')"></div>
                                    <div class="comment-container col-xs-12">
                                        <div class="user">{{ $comment->user->name }} <span class="date"> on {{ date("F d, Y H:i", strtotime($comment->create_date)) }}</span> </div>
                                        <div class="text">{{ $comment->text }}</div>
                                    </div>
                                </div>
                            @endforeach
                        @endif
                            </div>
                            @if ($comments)
                                <div class="paging">
                                    <?php
                                    $pages_count = ceil(sizeof($comments) / $max_items_per_page);
                                    ?>
                                    @for ($i = 1; $i <= $pages_count; $i++)
                                        <div data-value="{{ $i }}" class="page page{{$i}} {{ $i == 1 ? 'current' : '' }}">{{  $i }}</div>
                                    @endfor
                                </div>
                            @endif
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="comment your-comment">
                                    <?php
                                    $image = '';
                                    if ($me->imageData) {
                                        $image = $me->imageData->url;
                                    } else if ($me->facebook) {
                                        $image = $me->facebook->avatar;
                                    } else {
                                        $image = URL::asset($cdn.'images/user.png');
                                    }
                                    ?>
                                    <div data-image="{{ $image }}" class="image col-xs-12" style="background-image:url('{{ $image }}')"></div>
                                    <div class="comment-container col-xs-12">
                                        <div class="user">{{ $me->name }}</div>
                                        <div class="text">
                                            <textarea id="your-text" placeholder="Your comment..."></textarea>
                                            <button id="your-comment" class="btn-primary">{{ trans('video.send') }}</button>
                                            {{ csrf_field() }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row video-end">
                    <div class="col-lg-12">
                        <span clas="top">{{ trans('video.helpful') }}</span>
                        <button class="btn-primary {{ in_array($video->ID, $watched_videos) ? 'disabled' : '' }}">
                            <i class="fa fa-check" aria-hidden="true"></i>
                            {{ in_array($video->ID, $watched_videos) ? trans('video.watched') : trans('video.mark_as_complete') }}
                        </button>
                    </div>
                </div>
            </div>
            @include('footer')
        </div>
    </div>
@endsection
