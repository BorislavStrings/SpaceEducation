<?php

namespace App\Http\Controllers;

use App\UserExams;
use App\UserSceneUpdates;
use Illuminate\Http\Request;
use App\Http\Requests;
use Auth;
use DB;
use App\User;
use App\UserData;
use App\UserVideos;
use App\Categories;
use App\SceneModels;
use App\UserEnrollments;
use Illuminate\Support\Facades\Cache;
use Validator;
use Session;
use JavaScript;
use App\Units;
use App\Files;
use Illuminate\Support\Facades\Redirect;
use Config;
use App\Medals;
use App\UserMedals;

class UserController extends Controller
{

    public $tree_pattern = [
        ['top' =>0, 'left' => -30],
        ['top' => 60, 'left' => -40],
        ['top' => 53, 'left' => -5],
        ['top' => 30, 'left' => 10],
        ['top' => 0, 'left' => -20],
        ['top' => 100, 'left' => -5]
    ];

    use HeaderProgressTrait;

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function buyUpdate($model_id)
    {
        $error = 0;
        try {
            DB::beginTransaction();

            $model_id = (int)$model_id;
            $scene = UserSceneUpdates::where(['user_id' => Auth::user()->ID, 'model_id' => $model_id])->first();
            if ($scene) {
                $error = 1;
                throw new \Exception('You already have this update!');
            }

            $model = SceneModels::findOrFail($model_id);

            $user = User::find(Auth::user()->ID);
            $result = $user->canUnlockUpgrades([$model_id]);

            if ($result['response'] && !empty($result['response'][$model_id]['success'])) {
                // buy the update
                UserSceneUpdates::create([
                    'user_id' => $user->ID,
                    'model_id' => $model_id
                ]);

                $user->credits -= $model->points;
                $user->save();

                DB::commit();

                return response()->json(['error' => 0, 'response' => ['points' => $user->credits]]);
            } else {
                $error = 2;
                throw new \Exception("You can't buy this update!");
            }
        } catch (\Exception $e) {
            DB::rollback();
            if (!$error) {
                $error = 1;
            }
            return response()->json(['error' => $error, 'response' => $e->getMessage()]);
        }
    }

    public function sellUpdate($model_id)
    {
        $error = 0;
        try {
            DB::beginTransaction();

            $model_id = (int)$model_id;
            $scene = UserSceneUpdates::where(['user_id' => Auth::user()->ID, 'model_id' => $model_id])->first();
            if (!$scene) {
                $error = 1;
                throw new \Exception('You have not bought this update!');
            }

            $user = User::find(Auth::user()->ID);

            if ($scene) {
                $scene->delete();

                $model = SceneModels::findOrFail($model_id);

                $user->credits += $model->points;
                $user->save();
            }

            DB::commit();

            return response()->json(['error' => 0, 'response' => ['points' => $user->credits]]);
        } catch (\Exception $e) {
            DB::rollback();
            if (!$error) {
                $error = 1;
            }
            return response()->json(['error' => $error, 'response' => $e->getMessage()]);
        }
    }

    public function me() {
        if (Auth::check())
        {
            $user = Auth::user();
            $user = User::with(['facebook', 'videos'])->where(['ID' => $user->ID])->first();

            $user_medals = UserMedals::where(['user_id' => $user->ID])->pluck('medal_id')->toArray();

            $data = Cache::tags('queries')->remember('user_me', env('CACHE_TIMEOUT'), function () {
                return [
                    'all_categories' => Categories::with(['subCategories', 'units'])->get(),
                    'all_units' => Units::with(['videos', 'imageData'])->get()
                ];
            });
            $this->setAllUnitsProgress($data['all_units']);

            //$user_enrollments = $user->enrollments;

            $user->computeUserPointsByCategory();

            // get user upgrades
            $user_scene_updates = $user->sceneUpdates;
            $scene_updates = SceneModels::with(['categories', 'imageData', 'updates' => function($q) {
                $q->with('imageData')->orderBy('order_number', 'asc');
            } ])->orderBy('order_number', 'asc')->get();

            // get locked updates
            $scene_models_locked = [];
            if ($scene_updates) {
                foreach ($scene_updates AS $model) {
                    $available = true;
                    if ($user_scene_updates) {
                        foreach ($user_scene_updates AS $update) {
                            if ($model->ID == $update->model_id) {
                                $available = false;
                                break;
                            }
                        }
                    }

                    if ($available) {
                        $scene_models_locked[] = $model->ID;
                    }
                }
            }

            $scene_updates_available = $user->canUnlockUpgrades($scene_models_locked);
            $categories_points = $user->computeUserPointsByCategory();

            $header_data = $this->getUserHeaderData();

            $all_medals = Medals::with(['exams', 'imageData'])->get();

            JavaScript::put([
                'all_categories' => $data['all_categories'],
                'all_units' => $data['all_units'],
                'user_enrollments' => UserEnrollments::userEnrollments($user->ID),
                'user_videos' => $user->videos,
                'lang' => $this->lang,
                'user_scene_updates' => $user_scene_updates,
                'scene_updates' => $scene_updates,
                'categories_points' => $categories_points,
                'scene_updates_available' => $scene_updates_available,
                'unit_url' => url('/unit', ['unit_id' => "_UNIT_ID_"]),
                'buy_update_url' => url('/update/buy', ['model_id' => "_MODEL_ID_"]),
                'sell_update_url' => url('/update/sell', ['model_id' => "_MODEL_ID_"]),
                'user_credits' => $user->credits
            ]);

            return view('auth.profile', [
                'user' => $user,
                'facebook' => $user->facebook,
                'all_categories' => $data['all_categories'],
                //'enrollments' => $user_enrollments,
                'user_videos' => $user->videos,
                'header_data' => $header_data,
                'tree_pattern' => $this->tree_pattern,
                'all_medals' => $all_medals,
                'user_medals' => $user_medals,
                'user_titles' => Units::$points,
                'black' => true,
                'lang' => $this->lang,
                'records_lang' => localize_records($this->lang),
                'user_scene_updates' => $user_scene_updates,
                'scene_updates_available' => $scene_updates_available,
                'scene_updates' => $scene_updates
            ]);
        }
    }

    protected function getUserVideos() {
        try {
            $user = Auth::user();

            return $user->videos();
        } catch(Exception $e) {}
    }

    public function edit(Request $request) {
        $validator = null;
        try {
            $user = Auth::user();
            $change_email = false;
            $remove_image = false;

            $validation_rules = array(
                'email' => 'email|max:255|unique:sp_course_users',
                'name' => 'required|max:255',
                'password' => 'required|min:6|confirmed',
                'password_confirmation' => 'required|min:6',
                'description' => 'string',
                'address' => 'string',
                'address_coordinates' => 'string',
                'address_place' => 'string',
                'user_image' => 'string'
            );

            if ($request->has('email')) {
                $change_email = true;
            }

            if (!$change_email) {
                unset($validation_rules['email']);
            }

            if (empty($request->input('change_password'))) {
                unset($validation_rules['password']);
                unset($validation_rules['password_confirmation']);
            }

            $validator = Validator::make($request->all(), $validation_rules);

            if ($validator->fails()) {
                Session::flash('upload_status', false);
                throw new \Exception();
            }

            $image_id = $user->image;

            if ((int)$request->input('image-remove') == 1) {
                $image_id = null;
                $remove_image = true;
            }

            if (!$remove_image) {
                $image_path = $request->input('user_image');
                if (!empty($image_path)) {
                    if (exif_imagetype($image_path)) {

                        rename($image_path, Config::get('constants.image_path_user') . basename($image_path));

                        $image_file = new Files();
                        $image_file->url = '/files/users/' . basename($image_path);
                        $image_file->save();
                        $image_id = (int)$image_file->ID;
                    }
                }
            }

            if ($change_email) {
                $user->email = trim($request->input('email'));
            }
            $user->name = trim($request->input('name'));
            $user->description = trim($request->input('description'));
            $user->address = trim($request->input('address'));
            $user->address_coordinates = trim($request->input('address_coordinates'));
            $user->address_place = trim($request->input('address_place'));
            $user->image = $image_id;

            if ((int)$request->input('image-remove') == 1) {
                $user->facebook->avatar = '';
                $user->facebook->save();
            }

            if (!empty($request->input('change_password'))) {
                $user->password = bcrypt($request->input('password'));
            }

            $user->save();

            if (isset($user->ID) && $user->ID > 0) {
                Session::flash('upload_status', true);
            }

            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()
                ->withInput()
                ->withErrors($validator);
        }
    }

    private function setImage(Request $request) {
        try {
            $image_file = '';
            if ($request->hasFile('file') && !empty($request->file('file'))) {
                if (!$request->file('file')->isValid()) {
                    return new Exception();
                }

                $file_name = md5(time() . time() . rand(10000, 99999)) . '.' . $request->file('file')->getClientOriginalExtension();
                //$destination_path = public_path() . '/profile_images/';
                //$cv_file = $destination_path . $file_name . '.' . $request->file('cv_file')->getClientOriginalExtension();
                //$image_file = url("") . '/profile_images/' . $file_name;
                $destination_path = Config::get('constants.image_path_temp');
                $destination_url = Config::get('constants.image_url_temp');
                $request->file('file')->move($destination_path, $file_name);

                return [
                    'path' => $destination_path . $file_name,
                    'url' => $destination_url . $file_name,
                ];
            } else {
                throw new \Exception();
            }
        } catch (\Exception $e) {
            return false;
        }
    }

    public function uploadImage(Request $request) {
        if ($image = $this->setImage($request)) {
            return response()->json(['error' => 0, 'message' => 'Success', 'image' => $image]);
        } else {
            return response()->json(['error' => 1, 'message' => 'Error Occurred!']);
        }
    }

    public function tempFunctionSetDefaultPoints() {
        $all_users = User::all();
        $init_boost_credit = 0;

        foreach ($all_users AS $user) {
            $passed_exams = UserExams::where(['user_id' => $user->ID, 'passed' => 1])
                ->with(['exam' => function($q) {
                        $q->with('unit');
                }])
                ->get();

            $total_points = $init_boost_credit;
            if ($passed_exams && sizeof($passed_exams) > 0) {
                foreach ($passed_exams AS $exam) {
                    if (isset($exam->exam) && isset($exam->exam->unit)) {
                        $total_points += $exam->exam->unit->points;
                    }
                }
            }

            $user->credits = $total_points;
            $user->save();

            echo $user->ID . ': ' . $total_points . '<br />';
        }

        echo "end";
        exit;
    }
}
