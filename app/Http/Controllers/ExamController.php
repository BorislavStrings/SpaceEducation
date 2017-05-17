<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Exam;
use App\User;
use App\Videos;
use App\Units;
use App\UserVideos;
use App\UserExams;
use App\UserExamsAnswers;
use App\UserMedals;
use JavaScript;
use Auth;
use App\Medals;
use DB;

class ExamController extends Controller
{

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function getExam($unit_id) {
        $user = Auth::user();

        $exam = Exam::where('unit_id', $unit_id)
            ->with(['questions' => function($q) {
                    $q->with('answers');
                }
            ])
            ->first();

        $user_exam = UserExams::where(['user_id' => $user->ID, 'passed' => 1, 'exam_id' => $exam->ID])->first();
        if (!empty($user_exam) && !empty($user_exam->ID)) {
            return response()->json(['error' => 2, 'data' => []]);
        }

        // has user watched all unit videos
        $unit_videos = Videos::where(['unit_id' => $exam->unit_id])->get();
        $user_unit_videos = UserVideos::userVideosByUnit($user->ID, $exam->unit_id);

        if ($exam && !empty($exam->questions) && sizeof($user_unit_videos) >= sizeof($unit_videos)) {

            $current_attempts = UserExams::userExamCount($user->ID, $exam->ID);
            $remaining_attempts = UserExams::$exam_attempts - $current_attempts;

            $exam['remaining_attempts'] = $remaining_attempts;

            foreach ($exam->questions AS $inx => $question) {
                if (!empty($question->answers)) {
                    $question_answers = [];
                    $answers_temp = [];
                    foreach ($question->answers AS $inx_a => $answer) {
                        if ($answer->is_correct) {
                            unset($answer->is_correct);
                            $question_answers[] = $answer;
                        } else {
                            unset($answer->is_correct);
                            $answers_temp[] = $answer;
                        }
                    }

                    shuffle($answers_temp);
                    foreach ($answers_temp AS $a) {
                        if (sizeof($question_answers) < 4) {
                            $question_answers[] = $a;
                        }
                    }

                    shuffle($question_answers);
                    unset($exam->questions[$inx]->answers);
                    $exam->questions[$inx]->answers = $question_answers;
                }
            }

            return response()->json(['error' => 0, 'data' => $exam]);
        }

        return response()->json(['error' => 1, 'data' => []]);
    }

    public function setExam($id, Request $request) {

        $user = Auth::user();
        //$user_answers = json_decode('[{"answers":[85,88],"id":49},{"answers":[93,94],"id":50},{"answers":[101,98],"id":51}]', true);
        $user_answers = $request->input('data');
        $id = (int)$id;

        $exam = Exam::where(['unit_id' => $id])
            ->with(['unit', 'questions' => function($q) {
                $q->with(['answers' => function($q) {
                    $q->where(['is_correct' => 1]);
                }]);
            }
            ])
            ->first();

        if (empty($exam)) {
            return response()->json(['error' => 1, 'response' => 'Incorrect Request']);
        }

        $user_exam = UserExams::where(['user_id' => $user->ID, 'passed' => 1, 'exam_id' => $exam->ID])->first();
        if (!empty($user_exam) && !empty($user_exam->ID)) {
            return response()->json(['error' => 2, 'data' => []]);
        }

        $unit_videos = Videos::where(['unit_id' => $exam->unit_id])->get();
        $user_unit_videos = UserVideos::userVideosByUnit($user->ID, $exam->unit_id);

        if (sizeof($unit_videos) < 1 || sizeof($user_unit_videos) < sizeof($unit_videos)) {
            return response()->json(['error' => 1, 'response' => 'Incorrect Request']);
        }

        $correct_questions = [];
        $exam_questions_count = 0;
        $descriptions = [];

        $exam_questions = $exam->questions;
        $exam_questions_count = sizeof($exam_questions);

        if ($exam_questions) {
            foreach ($exam_questions AS $question) {
                $is_correct = false;
                $question_answers = $question->answers;
                $answers = [];
                if ($question_answers) {
                    foreach ($question_answers AS $answer) {
                        $answers[] = (int)$answer->ID;
                    }
                }

                $user_answer = [];
                if ($user_answers) {
                    foreach ($user_answers AS $q) {
                        if (!empty($q['id']) && (int)$q['id'] == $question->ID) {
                            $user_answer = !empty($q['answers']) ? $q['answers'] : [];
                            array_map('intval', $user_answer);
                        }
                    }
                }

                if ($answers && $user_answer) {
                    $diff = array_diff($answers, $user_answer);
                    if (sizeof($answers) == sizeof($user_answer) && sizeof($diff) == 0) {
                        $is_correct = true;
                    }
                }

                if ($is_correct) {
                    $correct_questions[] = $question->ID;
                } else {
                    $descriptions[] = [
                        'id' => $question->ID,
                        'name' => $question->name,
                        'description' => $question->description
                    ];
                }
            }
        }

        $passed = 0;
        $percent_success = 0;
        if ($exam_questions_count > 0) {
            $percent_success = sizeof($correct_questions) / $exam_questions_count;
        }

        if (($percent_success * 100) >= $exam->percents) {
            $passed = 1;
        }

        try {

            DB::beginTransaction();


            // check for title
            $user_current_points = $user->computeUserPoints();
            $user_new_points = $user_current_points;
            if ($exam->unit) {
                $user_new_points += $exam->unit->points;
            }
            $title = Units::checkUnitTitle($user_current_points, $user_new_points);

            // Set history
            $user_exam = new UserExams();
            $user_exam->user_id = $user->ID;
            $user_exam->exam_id = $exam->ID;
            $user_exam->passed = $passed;
            $user_exam->active = 1;
            $user_exam->save();

            if (!empty($user_answers)) {
                foreach ($user_answers as $q => $question) {
                    if (!empty($question['answers']) && !empty($question['id'])) {
                        foreach ($question['answers'] AS $answer) {
                            $user_exams_answers = new UserExamsAnswers();
                            $user_exams_answers->question_id = (int)$question['id'];
                            $user_exams_answers->answer_id = (int)$answer;
                            $user_exam->answers()->save($user_exams_answers);
                        }
                    }
                }
            }

            if ($passed) {
                // check for medals
                $all_medals = Medals::with('imageData')->get();
                $won_medals = [];
                if ($all_medals) {
                    $user_passed_exams = UserExams::where(['user_id' => $user->ID, 'passed' => 1])->get();
                    $current_user_medals = UserMedals::where(['user_id' => $user->ID])->pluck('medal_id')->toArray();
                    $user_passed_exams_array = [$exam->ID];
                    if ($user_passed_exams) {
                        foreach ($user_passed_exams AS $exam) {
                            $user_passed_exams_array[] = $exam->exam_id;
                        }
                    }

                    foreach ($all_medals AS $medal) {
                        if (!in_array($medal->ID, $current_user_medals) && $medal->hasWon($user_passed_exams_array)) {
                            $won_medals[] = $medal;
                            UserMedals::create([
                                'user_id' => $user->ID,
                                'medal_id' => $medal->ID
                            ]);
                        }
                    }
                }

                // set user credits

                $user = User::find($user->ID);
                if ($user && isset($exam->unit) && !empty($exam->unit->points)) {
                    $user->credits += $exam->unit->points;
                    $user->save();
                }

                DB::commit();

                return response()->json(['error' => 0, 'response' => [
                    'passed' => 1,
                    'medals' => $won_medals,
                    'score' => round($percent_success, 2),
                    'marks' => $descriptions,
                    'title' => $title ? $title : 0
                ]]);
            } else {
                $more_attempts = false;
                if (UserExams::validateAndResetExam($user->ID, $id, $exam->ID)) {
                    $more_attempts = true;
                }

                DB::commit();
                return response()->json(['error' => 0, 'response' => [
                    'passed' => 0,
                    'marks' => $descriptions,
                    'score' => round($percent_success, 2),
                    'more_attempts' => $more_attempts
                ]]);
            }
        } catch(\Exception $e) {
            DB::rollback();

            return response()->json(['error' => 1, 'response' => 'Incorrect Request']);
        }
    }

}
//$P$Bb3KJKcj5PU/NdEy/g5uZ41uCo70Ou.