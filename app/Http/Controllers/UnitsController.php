<?php

namespace App\Http\Controllers;

use App\UserExams;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Units;
use App\Videos;
use App\UnitsRelations;
use App\UserVideos;
use JavaScript;
use Auth;

class UnitsController extends Controller
{
    use HeaderProgressTrait;

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function getUnit($unit_id, Request $request) {
        $user = Auth::user();
        $unit_id = (int)$unit_id;
        $show_exam = $request->input('exam');
        if ($show_exam && $show_exam == 'start') {
            $show_exam = true;
        } else {
            $show_exam = false;
        }

        if ($unit_id < 1) {
            throw new \Exception("Incorrect Unit ID");
        }

        $unit = Units::with(['imageData', 'exam'])->find($unit_id);

        $header_data = $this->getUserHeaderData();
        $unit_progress = $this->getUnitProgress($unit_id);
        $unlock_test = $unit_progress['unlock_test'];

        $exam_passed = $unit_progress['passed_exam'];
        $has_exam = $unit_progress['has_exam'];

        if ($unit_progress) {
            $unit_progress = $unit_progress['progress'];
        } else {
            $unit_progress = 0;
        }

        if (!$unit) {
            throw new \Exception("Incorrect Unit ID");
        }

        $unit_videos = Videos::with('imageFile')->where(['unit_id' => $unit->ID])->orderBy('order_number', 'asc')->get();
        $related_units = UnitsRelations::find($unit->ID);

        $watched_videos = UserVideos::where(['user_id' => $header_data['user']->ID])->pluck('video_id')->toArray();

        JavaScript::put([
            'getExamUrl' => url('/exam/get', ['unit_id' => $unit_id]),
            'setExamUrl' => url('/exam/set?XDEBUG_SESSION_START=123', ['unit_id' => $unit_id]),
            'show_exam' => $show_exam,
            'has_exam' => $has_exam,
            'app_url' => url($this->lang.'/'),
            'records_lang' => localize_records($this->lang)
        ]);


        return view('auth.unit', [
            'unit' => $unit,
            'related_units' => $related_units,
            'unit_videos' => $unit_videos,
            'watched_videos' => $watched_videos,
            'header_data' => $header_data,
            'unit_progress' => $unit_progress,
            'exam_passed' => $exam_passed,
            'has_exam' => $has_exam,
            'unlock_test' => $unlock_test,
            'lang' => $this->lang,
            'records_lang' => localize_records($this->lang)
        ]);
    }
}
