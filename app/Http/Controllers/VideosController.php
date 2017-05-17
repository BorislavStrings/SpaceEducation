<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Videos;
use App\Http\Requests;
use League\Flysystem\Exception;
use Illuminate\Support\Facades\Redirect;
use Auth;
use App\VideosComments;
use App\VideosFiles;
use App\VideosRelatedCategories;
use App\UnitsRelations;
use App\UserVideos;
use JavaScript;
use App\User;
use Validator;
use App\UserEnrollments;
use App\UserExams;

class VideosController extends Controller
{
    use HeaderProgressTrait;

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function getVideo($video_id) {
        try {
            if ($video_id < 1) {
                throw new \Exception("Incorrect Video ID");
            }

            $user = Auth::user();
            $video = Videos::with(['imageFile', 'unit' => function($q) {
                $q->with(['exam', 'imageData']);
            }, 'links' => function($query) {
                $query->orderBy('order_number', 'asc');
            }])->find((int)$video_id);

            if (!$video) {
                throw new \Exception("Incorrect Video ID");
            }

            parse_str(parse_url($video->url, PHP_URL_QUERY), $my_array_of_vars);

            $unit_videos = Videos::with('imageFile')->where(['unit_id' => $video->unit_id])->orderBy('order_number', 'asc')->get();

            $youtube_id = $video->getYouTubeID();

            if (!$youtube_id) {
                throw new \Exception("Incorrect Video ID");
            }

            $header_data = $this->getUserHeaderData();
            $unit_progress_data = $this->getUnitProgress($video->unit_id);
            $unlock_test = $unit_progress_data['unlock_test'];

            $unit_progress = 0;
            if ($unit_progress_data) {
                $unit_progress = $unit_progress_data['progress'];
            }

            $video_data = [
                'youtube_id' => $youtube_id,
                'video_id' => $video->ID,
                'start' => isset($my_array_of_vars['start']) ? $my_array_of_vars['start'] : -1,
                'end' => isset($my_array_of_vars['end']) ? $my_array_of_vars['end'] : -1,
                'watched_url' => url('/video/watched', ['video_id' => $video->ID]),
                'comments_url' => url('/comment/set/video', ['video_id' => $video->ID]),
                'picture' => !empty($video->imageFile) ? $video->imageFile->url : '',
                'name' => $video->title,
                'description' => $video->description,
                'link' => url('/video', ['video_id' => $video->ID])
            ];

            $video_files = $video->getFiles();
            $video_comments = $video->getComments();

            //$video_files = $video_files = VideosFiles::with('file')->where(['video_id' => $video->ID])->get();
            //$related_units = UnitsRelations::find($video->unit->ID);
            //$unit_videos = Videos::where(['unit_id', $video->unit_id]);

            $me = User::with(['facebook', 'imageData'])->find(Auth::user()->ID);
            $watched_videos = UserVideos::where(['user_id' => $me->ID])->pluck('video_id')->toArray();

            // get relations
            $unit_relations = UnitsRelations::where(['child_id' => $video->unit->ID])
                ->orWhere(['parent_id' => $video->unit->ID])
                ->with([
                    'unitOne' => function($q) {
                        $q->with('imageData');
                    },
                    'unitTwo' => function($q) {
                        $q->with('imageData');
                    }
                ])
                ->get();

            JavaScript::put([
                'video_data' => $video_data,
                'me' => $me,
                'watched_videos' => $watched_videos,
                'unit_progress_data' => $unit_progress_data,
                'comments' => $video_comments,
                'unit_videos' => $unit_videos,
                'max_items_per_page' => 5
            ]);

            return view('auth.video', [
                'video' => $video,
                //'related_units' => $related_units,
                'files' => $video_files,
                'unit_videos' => $unit_videos,
                'comments' => $video_comments,
                'me' => $me,
                'watched_videos' => $watched_videos,
                'header_data' => $header_data,
                'unit_progress' => $unit_progress,
                'max_items_per_page' => 5,
                'unit_relations' => $unit_relations,
                'youtube_id' => $youtube_id,
                'has_exam' => $unit_progress_data['has_exam'],
                'exam_passed' => $unit_progress_data['passed_exam'],
                'unlock_test' => $unlock_test,
                'lang' => $this->lang,
                'records_lang' => localize_records($this->lang)
                //'related_categories' => $related_video_categories,
                //'unit_videos' => $unit_videos
            ]);

        } catch (\Exception $e) {
            return redirect()->action('HomeController@error');
        }
    }

    public function watchedVideo($video_id) {
        try {
            if ($video_id < 1) {
                throw new \Exception("Incorrect Video ID");
            }

            $user = Auth::user();
            $video = Videos::findOrFail($video_id);
            $watched = UserVideos::where(['video_id' => $video_id, 'user_id' => $user->ID])->first();

            if (empty($watched)) {
                $user_videos = new UserVideos();

                $user_videos->user_id = $user->ID;
                $user_videos->video_id = $video->ID;
                $user_videos->save();


                if (empty($user_videos->ID)) {
                    throw new \Exception();
                }

                $category = $video->unit->category;

                if ($category) {
                    $enrollment = UserEnrollments::where(['user_id' => $user->ID, 'category_id' => $category->ID])->first();
                    if (empty($enrollment)) {
                        $user_enrollments = new UserEnrollments();
                        $user_enrollments->user_id = $user->ID;
                        $user_enrollments->category_id = $category->ID;
                        $user_enrollments->save();
                    }
                }
            }

            return response()->json(['error' => 0, 'message' => 'Success']);
        } catch (\Exception $e) {
            return response()->json(['error' => 1, 'message' => 'Error Occurred!']);
        }
    }

    public function setVideoComment($video_id, Request $request) {
        $messages = [];
        try {
            $validation_rules = array(
                'text' => 'required|string'
            );

            $validator = Validator::make($request->all(), $validation_rules);

            if ($validator->fails()) {
                throw new \Exception();
            }

            $user = Auth::user();
            $video_comment = new VideosComments();
            $video_comment->user_id = Auth::user()->ID;
            $video_comment->video_id = (int)$video_id;
            $video_comment->text = $request->input('text');

            $video_comment->save();

            if ($video_comment->ID < 1) {
                throw new \Exception();
            }

            return response()->json(['error' => 0, 'message' => 'Success', 'comment' => $video_comment]);
        } catch (\Exception $e) {
            return response()->json(['error' => 1, 'message' => 'Error', 'errors' => $messages]);
        }
    }
}
