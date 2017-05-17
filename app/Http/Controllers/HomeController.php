<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\UserSceneUpdates;
use App\SceneModels;
use Illuminate\Http\Request;
use App\Categories;
use App\Units;
use App\User;
use App\UnitsRelations;
use Illuminate\Support\Facades\Cache;
use JavaScript;
use Auth;
use Redirect;
use Mail;
use Cookie;
use App\MobileDetect;
use Illuminate\Cookie\CookieJar;
use App\Http\Requests\EnvelopeRequest;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */

    use HeaderProgressTrait;

    public $tree_pattern = [
        ['top' =>0, 'left' => 0],
        ['top' => 60, 'left' => 90],
        ['top' => 53, 'left' => 35],
        ['top' => 30, 'left' => 10],
        ['top' => 0, 'left' => 70],
        ['top' => 100, 'left' => 45]
    ];

    public $home_tree_pattern = [
        ['top' =>0, 'left' => 10,'inx' => 'space_science'],
        ['top' => 50, 'left' => 60,'inx' => 'robotics_ai'],
        ['top' => 70, 'left' => 30,'inx' => 'biology'],
        ['top' => 50, 'left' => 40,'inx' => 'applications'],
        ['top' => 30, 'left' => 0,'inx' => 'engineering'],
        ['top' => 100, 'left' => 20,'inx' => 'exploration']
    ];

    private $lang;

    public function __construct(Request $request)
    {
        $this->lang = $request->attributes->get('lang');
    }

    public function index(Request $request, CookieJar $cookieVal)
    {
        $logedin = 0;
        $show_popup = false;
        $user_updates = [];
        $user_categories_points = [];
        $user_credits = 0;

        if (Auth::check()) {
            $logedin = 1;
            $value = $request->cookie('spacechappenges_first_login');
            if (empty($value)) {
                $show_popup = true;
            }

            $user = User::find(Auth::user()->ID);
            $user_credits = $user->credits;
            $user_updates = UserSceneUpdates::where(['user_id' => $user->ID])->get();
            $user_categories_points = $user->computeUserPointsByCategory();
        }

        $all_updates = SceneModels::with(['imageData', 'categories'])->get();
        $mobile = false;

        // 1 - hq
        // 2 - medium
        // 3 - low
        $definition = 2;
        $has_option = false;

        if (!empty($request->input('q'))) {
            $definition = (int)$request->input('q');
            $has_option = true;
        } elseif ($request->session()->has('definition')) {
            $definition = (int)$request->session()->get('definition');
            $has_option = true;
        }

        if ($definition > 3 || $definition < 1) {
            $definition = 2;
            $has_option = false;
        }

        $definition++;

        $detect = new MobileDetect();
        if ($detect->isMobile() || $detect->isTablet()) {
            $mobile = true;
        }

        if ($definition == 4) {
            $mobile = true;
        }

        if ($mobile) {
            $definition = 4;
        }

        $request->session()->put('definition', ($definition - 1));

        $data = Cache::tags('queries')->remember('home_index', env('CACHE_TIMEOUT'), function () {
            return [
                'all_categories' => Categories::with(['imageData', 'subCategories'])->get(),
                'all_units' => Units::with('imageData')->get(),
                'units_relations' => UnitsRelations::all()
            ];
        });

        $header_data = $this->getUserHeaderData();

        JavaScript::put([
            'all_categories' => $data['all_categories'],
            'all_units' => $data['all_units'],
            'units_relations' => $data['units_relations'],
            'definition' => $definition,
            'logedin' => $logedin,
            'categories_url' => url($this->lang.'/missions'),
            'is_mobile' => $mobile,
            'user_updates' => $user_updates,
            'scene_updates' => $all_updates,
            'user_credits' => $user_credits,
            'lang' => $this->lang,
            'user_categories_points' => $user_categories_points,
            'buy_update_url' => url('/update/buy', ['model_id' => "_MODEL_ID_"]),
            'sell_update_url' => url('/update/sell', ['model_id' => "_MODEL_ID_"]),
        ]);

        if ($show_popup) {
            $cookieVal->queue(cookie('spacechappenges_first_login', true, time() + 60 * 60 * 24 * 30));
        }

        if ($this->lang == 'bg') {
            // foreach ($data['all_categories'] as $key => $categorie) {
            //     $data['all_categories'][$key]->name = $data['all_categories'][$key]->name_bg;
            //     $data['all_categories'][$key]->questions = $data['all_categories'][$key]->questions_bg;
            // }

            // foreach ($data['all_units'] as $key => $unit) {
            //     $data['all_units'][$key]->name = $data['all_units'][$key]->name_bg;
            //     $data['all_units'][$key]->description = $data['all_units'][$key]->description_bg;
            // }
        }

        if($_SERVER["REMOTE_ADDR"]=='130.204.213.58'){
            
        }

        return view('home', [
            'categories' => $data['all_categories'],
            'units_relations' => $data['units_relations'],
            'units' => $data['all_units'],
            'black' => true,
            'header_data' => $header_data,
            'tree_pattern' => $this->tree_pattern,
            'home_tree_pattern' => $this->home_tree_pattern,
            'definition' => $definition,
            'video_background' => true,
            'show_popup' => $show_popup,
            'mobile' => $mobile,
            'home' => true,
            'lang' => $this->lang,
            'records_lang' => localize_records($this->lang)
        ]);
    }

    public function error404() {

        $header_data = [];

        if (Auth::check()) {
            $header_data = $this->getUserHeaderData();
        }

        return view('errors.404', [
            'black' => true,
            'header_data' => $header_data
        ]);
    }

    public function error() {
        echo "Error Screen";
    }

    public function send_mail(Request $request)
    {

        $this->validate($request, [
            'sender' => 'required|email',
            'subject' => 'required|string|max:255',
            'content' => 'required|string|max:1000',
        ]);

        $data = $request->all();

        $mail = Mail::send('emails.envelope', $data, function ($m) use($data) {
            $m->from('contacts@spaceport.com', 'Spaceport');
            $m->to('mario@spaceedu.net', 'Mario')->subject($data['subject']);
        });

        return $request->all();
    }

    public function users_count()
    {
        dd(User::count());
    }
}
