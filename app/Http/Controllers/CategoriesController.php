<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use App\Categories;
use App\UserEnrollments;
use App\Http\Requests;
use App\Units;
use App\UnitsRelations;
use App\UserVideos;
use App\Exam;
use Illuminate\Support\Facades\Cache;
use JavaScript;
use Auth;
use App\UserMedals;
use App\Medals;
use Request as Test;
use DB;

class CategoriesController extends Controller
{
    use HeaderProgressTrait;

    /*
    public $tree_pattern = [
        ['top' =>0, 'left' => 0],
        ['top' => 60, 'left' => 90],
        ['top' => 53, 'left' => 35],
        ['top' => 30, 'left' => 10],
        ['top' => 0, 'left' => 70],
        ['top' => 100, 'left' => 45]
    ];
    */

    public $tree_pattern = [
        ['top' =>30, 'left' => -20],
        ['top' => 60, 'left' => -50],
        ['top' => 53, 'left' => -20],
        ['top' => 30, 'left' => 30],
        ['top' => 0, 'left' => -40],
        ['top' => 100, 'left' => 0]
    ];

    private $lang;

    public function __construct(Request $asd)
    {
        $this->lang = $asd->attributes->get('lang');
    }

    public function intro() {
        $all_categories = Categories::with('imageData')->get();
        $all_units = Units::with('videos')->get();

		foreach ($all_units as $key => $unit) {
        	$all_units[$key]['image_data'] = $unit->videos->first();
        }
        
        $units_relations = UnitsRelations::all();

        JavaScript::put([
            'all_categories' => $all_categories,
            'all_units' => $all_units,
            'units_relations' => $units_relations
        ]);

        return view('auth.intro', [
            'categories' => $all_categories,
            'units_relations' => $units_relations,
            'units' => $all_units,
            'black' => true,
            'tree_parent' => $this->tree_pattern,
            'video_background' => true
        ]);
    }

    public function categories(Request $request) {
        $default_category = 0;
        if (!empty($request->input('cat'))) {
            $default_category = (int)$request->input('cat');
        }

        $user = Auth::user();
        $data = Cache::tags('queries')->remember('categories_intro', env('CACHE_TIMEOUT'), function () {
            return [
                'all_categories' => Categories::with(['imageData', 'subCategories'])->get(),
                'all_units' => Units::with('videos')->orderBy('category_id', 'ASC')->get()
            ];
        });

        foreach ($data['all_units'] as $key => $unit) {
        	$data['all_units'][$key]['image_data'] = $unit->videos->first();
        }

        $user_videos = UserVideos::where(['user_id' => $user->ID])->pluck('video_id')->toArray();
        $header_data = $this->getUserHeaderData();
        $unit_url = url($this->lang.'/unit/');

        $this->setAllUnitsProgress($all_units);

        JavaScript::put([
            'all_categories' => $data['all_categories'],
            'all_units' => $data['all_units'],
            'user_videos' => $user_videos,
            'unit_url' => $unit_url,
            'default_category' => $default_category,
            'lang' => $this->lang,
            'records_lang' => localize_records($this->lang)
        ]);

        return view('auth.categories', [
            'categories' => $data['all_categories'],
            'header_data' => $header_data,
            'black' => true,
            'tree_pattern' => $this->tree_pattern,
            'video_background' => true,
            'lang' => $this->lang,
            'records_lang' => localize_records($this->lang)
        ]);
    }

    public function units($user_id) {

        $data = Cache::tags('queries')->remember('categories_units', env('CACHE_TIMEOUT'), function () {
            return [
                'all_categories' => Categories::with('imageData')->get(),
                'all_units' => Units::with('videos')->get()
            ];
        });

        foreach ($data['all_units'] as $key => $unit) {
        	$data['all_units'][$key]['image_data'] = $unit->videos->first();
        }

        JavaScript::put([
            'all_categories' => $data['all_categories'],
            'all_units' => $data['all_units'],
        ]);

        return view('auth.intro', [
            'categories' => $data['all_categories'],
            'units' => $data['all_units'],
            'black' => true,
            'show_categories' => true,
            'lang' => $this->lang
        ]);
    }

    public function mindmap(Request $request) {
        $medal_id = 0;
        if ($request->has('medal')) {
            $medal_id = $request->input('medal');
        }

        $user = Auth::user();
        $user_id = $user->ID;
        $mindmap = Cache::tags('queries')->remember('categories_mindmap', env('CACHE_TIMEOUT'), function () {
            return [
                'all_categories' => Categories::with(['subCategories.units', 'imageData', 'units'])->orderBy('mindmap_order', 'ASC')->get(),
                'all_units' => Units::with('videos')->get(),
            ];
        });

        foreach ($mindmap['all_units'] as $key => $unit) {
        	$mindmap['all_units'][$key]['image_data'] = $unit->videos->first();
        }

        // dd($mindmap['all_units'][0]);

        // foreach ($mindmap['all_units'] as $key => $value) {
        // 	$mindmap['all_units'][$key]['imageData'] = $value->videos->first();
        // }
        // dd($mindmap['imageData']);

        // dd($mindmap['all_units'][0]);

        $this->setAllUnitsProgress($mindmap['all_units']);
        $header_data = $this->getUserHeaderData();
        $user_medals = UserMedals::where(['user_id' => $user->ID])->pluck('medal_id')->toArray();
        $data = Cache::tags('queries')->remember('categories_mindmap_medals_exams', env('CACHE_TIMEOUT'), function () {
            return [
                'units_relations' => UnitsRelations::all(),
                'all_medals' => Medals::with(['exams', 'imageData', 'imageHoverData'])->get(),
                'all_exams' => Exam::all()
            ];
        });

        // $user_enrollments = UserEnrollments::userEnrollments($user_id);

        $records_lang = localize_records($this->lang);
        JavaScript::put([
           'all_categories' => $mindmap['all_categories'],
           // 'user_enrollments' => $user_enrollments,
            'all_units' => $mindmap['all_units'],
           'units_relations' => $data['units_relations'],
           'all_medals' => $data['all_medals'],
           'medal_id' => $medal_id,
           'all_exams' => $data['all_exams'],
           'lang' => $records_lang
        ]);

        $category_tree = [];
        $all_categories = $mindmap['all_categories']->where('parent_id', 0)->sortBy('mindmap_order')->all();

        return view('auth.mindmap', [
            'categories' => $all_categories,
            'all_categories' => $mindmap['all_categories'],
            //'user_categories' => $categories_and_units,
            // 'user_enrollments' => $user_enrollments,
            'units_relations' => $data['units_relations'],
            'header_data' => $header_data,
            'tree_pattern' => $this->tree_pattern,
            'all_medals' => $data['all_medals'],
            'user_medals' => $user_medals,
            'black' => true,
            'lang' => $this->lang,
            'records_lang' => $records_lang,
            'all_exams' => $data['all_exams'],
            'all_units' => $mindmap['all_units'],
            // 'sub_categories' => $mindmap['sub_categories']
        ]);
    }

    /*
    public function mindmap($user_id) {
        $all_categories = Categories::with('imageData')->get();
        $all_units = Units::with('imageData')->get();
        //$user = Auth::user();

        $user_enrollments = $this->userEnrollments($user_id);

        JavaScript::put([
            'all_categories' => $all_categories,
            'user_enrollments' => $user_enrollments,
            'all_units' => $all_units,
        ]);

        $category_tree = [];
        //$this->constructTree($all_categories, $category_tree);

        return view('auth.mindmap2', [
            'categories' => $all_categories,
            //'user_categories' => $categories_and_units,
            'user_enrollments' => $user_enrollments,
            'black' => true
        ]);
    }
    */

    /*
    private function userEnrollments($user_id) {
        //$user = Auth::user();
        $categories_and_units = [];

        $user_enrollments = UserEnrollments::where(['user_id' => $user_id])->get();
        $inx = 0;
        if ($user_enrollments) {
            foreach ($user_enrollments AS $key => $enrollment) {
                $category_units = $enrollment->units;
                $category = $enrollment->category;
                $inx = $category->ID;
                $categories_and_units[$inx]['category'] = $category;
                if ($category_units) {
                    foreach ($category_units AS $key_unit => $unit) {
                        $category_units[$key_unit]['videos'] = $unit->userVideos($user_id);
                    }
                }

                $categories_and_units[$inx]['units'] = $category_units;
            }
        }

        return $categories_and_units;
    }
    */

    private function constructTree(&$categories, &$tree, $parent_id = 0) {
        if ($categories) {
            foreach ($categories AS $category) {
                if ($category->parent_id == $parent_id) {
                    $units = $category->units;
                    $category['children'] = [];
                    if (!$units) {
                        $this->constructTree($categories, $category['children'], $category->ID);
                    }
                    $tree[] = $category;
                }
            }
        }
    }

    public function enroll($category_id) {
        try {
            if ($category_id < 1) {
                throw new \Exception("Incorrect Category ID");
            }

            $user = Auth::user();

            $user_enrollemnts = new UserEnrollments();
            $user_enrollemnts->user_id = $user->ID;
            $user_enrollemnts->category_id = $category_id;
            $user_enrollemnts->save();

            if ($user_enrollemnts->ID < 1) {
                throw new \Exception();
            }

            return response()->json([
                'error' => 0,
                'message' => 'Success',
                'data' => Units::where(['category_id', $category_id])->get()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 1, 'message' => 'Error Occurred!']);
        }
    }

    public function unitsProgress($category_id) {
        try {
            $category_units = Units::where('category_id', $category_id)->get();
            $user = Auth::user();
            $user_videos = $user->videos;

            $unit_finished_percent = 0;
            $units_progress = [];

            if ($user_videos) {
                $user_videos_array = [];
                foreach ($user_videos AS $video) {
                    $user_videos_array[] = $video->video_id;
                }

                // validate units
                if ($category_units) {
                    foreach ($category_units AS $unit) {
                        $units_progress[$unit->ID] = 0;
                        $unit_videos = $unit->videos();
                        if ($unit_videos) {
                            $total_finished = 0;
                            foreach ($unit_videos AS $video) {
                                if (in_array($video->ID, $user_videos_array)) {
                                    $total_finished++;
                                }
                            }

                            $videos_size = sizeof($unit_videos);
                            if ($total_finished == $videos_size) {
                                $units_progress[$unit->ID] = 1;
                            } else {
                                $units_progress[$unit->ID] = $total_finished / $videos_size;
                            }
                        }
                    }
                }
            }

            return $units_progress;
        } catch (\Exception $e) {
            return [];
        }
    }
}
