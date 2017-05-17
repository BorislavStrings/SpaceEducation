@extends('layouts.app', ['header_data' => $header_data])

@section('content')
    <div id="video" class="container-fluid unit">
        <div class="row">
            <div id="video-container" class="col-lg-12">
                <?php
                $image = '';
                if ($unit->imageData) {
                    $image = $unit->imageData->url;
                } else if ($unit->image) {
                    $image = $unit->image;
                }
                ?>
                <?php
                $url = '';
                if (!empty($unit_videos) && !empty($unit_videos[0])) {
                    $video = $unit_videos[0];
                    $url = url($lang.'/video', ['video_id' => $video->ID]);
                    $image = $video->image;
                }
                ?>
                <a href="{{ $url }}" style="background-image: url('{{ $image }}');" id="player">
                    <div class="play-button"></div>
                </a>
                <div class="unit-videos">
                    <h2>{{ $unit->{'name'.$records_lang} }}</h2>
                    <div class="points">{{ $unit->points . ($unit->points < 2 ? 'pt.' : 'pts.') }}</div>
                    <div class="row">
                        <div class="progress-box col-md-12">
                            <div class="value">{{ trans('unit.progress') }} {{ round($unit_progress) }}%</div>
                            <div class="border">
                                <div style="width: {{$unit_progress }}%" class="inner"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row rel2">
                    <?php $next_video_id = 0; ?>
                    @if ($unit_videos)
                        @foreach ($unit_videos AS $unit_video)
                            <?php
                                $video_image = $unit_video->imageFile && !empty($unit_video->imageFile->url) ? $unit_video->imageFile->url : $unit_video->image;
                                $seen = in_array($unit_video->ID, $watched_videos) ? true : false;
                                if (!$seen && $next_video_id == 0) {
                                    $next_video_id = $unit_video->ID;
                                }
                            ?>
                            <a id="related_{{ $unit_video->ID }}" href="{{ url($lang.'/video', ['video_id' => $unit_video->ID]) }}"
                               class="video {{ $seen ? 'seen' : '' }} col-md-4 col-sm-6 col-xs-12"
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

                    @if ($unit->exam)
                        <div id="show_exam" class="video col-md-4 col-sm-6 col-xs-12 exam-box {{ !$unlock_test ? 'disabled' : '' }} {{ $exam_passed ? 'seen' : '' }} ">
                            <div class="image test" style="background-image: url('{{ $image }}');">
                                <div class="mask">
                                    Unit Test
                                </div>
                                <div class="seen-box">
                                    <i class="fa fa-check" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div class="name">{{ $unit->exam->{'name'.$records_lang} }}</div>
                        </div>
                    @endif
                    </div>
                </div>
                <div id="video_details" class="unit-type" style="height: 88px;">
                    <div class="row">
                        <div class="col-md-4">&nbsp;</div>
                        <div class="col-md-4 more">
                            <div class="link">
                                <i class="fa fa-info-circle" aria-hidden="true"></i>
                                <span class="text"> {{ trans('unit.show_more') }} </span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            @if ($next_video_id > 0)
                            <a href="{{ url($lang.'/video', ['video_id' => $next_video_id]) }}">
                                <i class="fa fa-forward" aria-hidden="true"></i>
                            </a>
                            @else
                                &nbsp;
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="video-information" class="container ">
            <div id="video-tabs" class="row">
                <div class="col-lg-12">
                    <ul class="tabs">
                        <li data-tab="#description" class="active">{{ trans('unit.more_info') }}</li>
                    </ul>
                </div>
            </div>
            <div class="row tab-content">
                @if ($unit->{'description'.$records_lang} != '')
                    <div id="description" class="description tab col-lg-12">
                        {{ $unit->{'description'.$records_lang} }}
                    </div>
                @endif
            </div>

            <div id="exam" class="row">
                <div id="exam_token">{{ csrf_field() }}</div>
                <div id="exam_token_set">{{ csrf_field() }}</div>
                <div class="col-lg-12">
                    <div id="loading">
                        <div class="bg"></div>
                        <div class="loading"></div>
                    </div>
                    <div class="row" style="position: relative;">
                        <div class="col-md-9">
                            <h1 class="test-name"></h1>
                        </div>
                        <div class="col-md-3" style="position: static;">
                            <div id="share">
                                <i class="fa fa-facebook" aria-hidden="true"></i>
                                Share
                            </div>
                        </div>
                    </div>
                    <div id="questions_container">
                        <div class="main-container">
                            <div class="container"></div>
                            <div id="slick_question_arrows"></div>
                            <div id="slick_question_numbers">
                                <h5>Complete all questions to submit the test</h5>
                                <button id="submit_exam" class="btn-primary disabled">Complete test</button>
                            </div>
                        </div>

                        <div class="results">
                            <div id="test-passed">
                                <div class="row">
                                    <div class="col-md-12">
                                        <div id="test-title" class="success"></div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 col-xs-12">
                                        <div id="passed" class="success">
                                            Exam Passed!
                                        </div>
                                        <div class="circle"></div>
                                        <div class="score">Score</div>
                                    </div>
                                    <div class="col-md-8 col-xs-12">
                                        <div class="row medals">
                                        </div>
                                    </div>
                                    <div class="col-md-12 col-xs-12">
                                        <div class="row marks">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="test-failed">
                                <div class="row">
                                    <div class="col-md-4 col-xs-12">
                                        <div class="error">
                                            Exam Failed!
                                        </div>
                                        <div class="circle"></div>
                                        <div class="score">Score</div>
                                        <div class="repeat">
                                            <button class="btn-primary">Repeat the test</button>
                                            <div class="fail">
                                                Not enough attempts! <br />
                                                All unit videos will be set to unseen!
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-8 col-xs-12">
                                        <div class="row marks">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            @include('footer')
        </div>
    </div>
@endsection

