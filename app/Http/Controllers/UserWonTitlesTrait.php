<?php

namespace App\Http\Controllers;
use App\SceneUpdates;
use App\UserExams;
use App\UserSceneUpdates;
use Auth;
use App\UserVideos;
use App\Videos;
use App\User;
use App\Units;
use App\Exam;
use URL;

trait HeaderProgressTrait {
    public function getUnitProgress($unit_id) {
        if (Auth::check()) {
            $passed_exam = false;
            $has_exam = false;
            $unlock_test = false;
            $user = Auth::user();
            $user_videos = UserVideos::where(['user_id' => $user->ID])->pluck('video_id')->toArray();
            $unit_videos = Videos::where(['unit_id' => $unit_id])->pluck('ID')->toArray();
            $all_exams_unit_array = Exam::pluck('unit_id')->toArray();

            $user_exams = UserExams::with('exam')
                ->where(['user_id' => $user->ID, 'passed' => 1])
                ->whereHas('exam', function($query) use ($unit_id) {
                    $query->where('unit_id', $unit_id);
                })
                ->first();

            if (empty($user_videos) || empty($unit_videos)) {
                return ['progress' => 0, 'unlock_test' => false, 'passed_exam' => false, 'has_exam' => false, 'user_videos' => [], 'unit_videos' => []];
            }

            $unit_progress = 0;

            if ($unit_id > 0) {
                foreach ($user_videos AS $video) {
                    if (in_array($video, $unit_videos)) {
                        $unit_progress++;
                    }
                }

                $unit_videos_length = sizeof($unit_videos);

                if ($unit_videos_length == $unit_progress) {
                    $unlock_test = true;
                }

                if (in_array($unit_id, $all_exams_unit_array)) {
                    $has_exam = true;
                    if (!empty($user_exams->exam)) {
                        $unit_videos_length++;
                        $passed_exam = true;
                        $unit_progress++;
                    } else {
                        $unit_videos_length++;
                    }
                }

                if ($unit_videos_length > 0) {
                    $unit_progress = $unit_progress * 100 / $unit_videos_length;
                    $unit_progress = round($unit_progress, 1);
                } else {
                    $unit_progress = 0;
                }
            }

            return ['progress' => $unit_progress, 'unlock_test' => $unlock_test, 'passed_exam' => $passed_exam, 'has_exam' => $has_exam, 'user_videos' => $user_videos, 'unit_videos' => $unit_videos];
        }

        return null;
    }

    public function setAllUnitsProgress(&$units) {
        if (Auth::check()) {
            $user = Auth::user();
            $user_watched_videos = User::userWatchedVideos($user->ID);
            $all_exams_unit_array = Exam::pluck('unit_id')->toArray();

            $user_exams = UserExams::with('exam')
                ->where(['user_id' => $user->ID, 'passed' => 1])
                ->get();

            if (empty($units) || empty($user_watched_videos)) {
                return [];
            }

            
            foreach ($units AS $u_inx => $unit) {
                $units[$u_inx]['progress'] = 0;
                if ($unit->ID > 0) {
                    $unit_videos = 0;
                    $unit_progress = 0;
                    foreach ($user_watched_videos AS $video) {
                        if ($video->unit_id == $unit->ID) {
                            $unit_videos++;
                            if ($video->watched) {
                                $unit_progress++;
                            }
                        }
                    }

                    $passed = false;
                    foreach ($user_exams AS $user_exam) {
                        if ($user_exam->exam && $user_exam->exam->unit_id == $unit->ID) {
                            $passed = true;
                            break;
                        }
                    }

                    // APPEND Unit exam to progress
                    if (in_array($unit->ID, $all_exams_unit_array)) {
                        if (!$passed) {
                            $unit_videos++;
                        } else {
                            $unit_videos++;
                            $unit_progress++;
                        }
                    }

                    if ($unit_videos > 0) {
                        $unit_progress = $unit_progress * 100 / $unit_videos;
                        $unit_progress = round($unit_progress, 1);

                        $units[$u_inx]['progress'] = $unit_progress;
                    } else {
                        $units[$u_inx]['progress'] = 0;
                    }
                }
            }
        }
    }

    public function getUserHeaderData() {
        if (Auth::check()) {
            $user = Auth::user();
            $user = User::with(['imageData', 'facebook'])->find($user->ID);
            $progress = 0;
            $all_points = 0;

            $user_exams = UserExams::where(['user_id' => $user->ID, 'passed' => 1])->with(['exam' => function($q) {
                $q->with('unit');
            }])->get();
            $units = Units::all();

            if ($units) {
                foreach ($units AS $unit) {
                    if ($unit) {
                        $all_points += $unit->points;
                    }
                }
            }

            if ($user_exams) {
                foreach ($user_exams AS $user_exam) {
                    if ($user_exam->exam && $user_exam->exam->unit) {
                        $progress += $user_exam->exam->unit->points;
                    }
                }
            }

            $has_image = false;
            $image = URL::asset('images/user.png');
            if ($user->imageData && $user->imageData->url) {
                $image = $user->imageData->url;
                $has_image = true;
            } else if ($user->facebook && $user->facebook->avatar) {
                $image = $user->facebook->avatar;
                $has_image = true;
            }

            $user['image'] = $image;

            return [
                'progress' => [
                    'current_points' => $progress,
                    'all_points' => $all_points,
                    'percents' => round(($progress  * 100) / $all_points, 1)
                ],
                'has_image' => $has_image,
                'user' => $user
            ];
        }

        return null;
    }

    public function canUnlockUpgrades($upgrades_id)
    {
        $response = true;
        $message = '';
        try {
            if (!Auth::check()) {
                throw new \Exception('Missing user');
            }

            $user = Auth::user();
            $user = User::find($user->ID);
            $upgrades = SceneModels::with('units')->findMany($upgrades_id);

            if (!$upgrades) {
                throw new \Exception('Not available updates');
            }

            $available_points = $user->credits;

            foreach ($upgrades AS $upgrade) {
                $status = true;
                $msg = [];

                // validate does he has enough points to unlock the exam?
                if ($available_points < $upgrade->points) {
                    $status = false;
                    $msg[] = 'Not enough points';
                }

                // validate does the user has finished the course
                $units_status = true;
                if ($upgrade->units) {
                    foreach ($upgrade->units AS $unit) {
                        $progress = $this->getUnitProgress($unit->ID);
                        if (!$progress['passed_exam']) {
                            $units_status = false;
                            break;
                        }
                    }
                }

                if (!$units_status) {
                    $status = false;
                    $msg[] = 'Unfinished unit';
                }

                $response[$upgrade->ID] = [
                    'success' => $status,
                    'message' => $msg
                ];
            }

            $message = 'Success';
        } catch (\Exception $e) {
            $response = false;
            $message = $e->getMessage();
        } finally {
            return compact('response', 'message');
        }
    }
}