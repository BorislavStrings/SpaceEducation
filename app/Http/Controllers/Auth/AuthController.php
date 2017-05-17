<?php

namespace App\Http\Controllers\Auth;

use App\Http\Requests\Request;
use App\User;
use App\UserFacebook;
use App\UserLinkedIn;
use League\Flysystem\Exception;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Redirect;
use Auth;
use Laravel\Socialite\Facades\Socialite;
use DB;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    /**
     * Where to redirect users after login / registration.
     *
     * @var string
     */
    protected $redirectTo = '/';

    protected $guard = 'web';

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware($this->guestMiddleware(), ['except' => 'logout']);
    }

    
    private function getSalt() {
        // generate the salt
        $size = mcrypt_get_iv_size(MCRYPT_CAST_256, MCRYPT_MODE_CFB);
        $salt = mcrypt_create_iv($size, MCRYPT_DEV_RANDOM);

        // hash the salt
        return sha1(md5($salt));
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:sp_course_users',
            'password' => 'required|min:6|confirmed'
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        //dd($data);
        //$fb_account = $this->findExistingFBAccount($data['email']);
        $user = null;
        try {
            //$salt = $this->getSalt();
            $user = User::create([
                'email' => $data['email'],
                'name' => $data['name'],
                'password' => bcrypt($data['password'])
            ]);
            //$user_data->password = password_hash($data['password'], PASSWORD_DEFAULT);
            //$user_data->salt = $salt;
        } catch(\Exception $e) {
            return redirect()->action('HomeController@error');
        }

        return $user;
    }

    protected function findExistingFBAccount($email) {
        // find facebook account
        $fb_user = UserFacebook::where(['email' => $email])->first();
        if ($fb_user) {
            return $fb_user;
        }

        return null;
    }



    /**
     * Redirect the user to the Facebook authentication page.
     *
     * @return Response
     */
    public function redirectToProvider()
    {
        return Socialite::driver('facebook')->redirect();
    }



    /**
     * Obtain the user information from Facebook.
     *
     * @return Response
     */
    public function handleProviderCallback()
    {
        try {
            $user = Socialite::driver('facebook')->fields([
                'id', 'name', 'email'
            ])->user();

            if (
                empty($user->token) || empty($user->id)
            ) {
                throw new Exception("Incorrect Facebook Data");
            }

            $fb_user = new UserFacebook();
            $fb_user->token = $user->token;
            $fb_user->fb_id = $user->id;
            $email = !empty($user->email) && !filter_var($user->email, FILTER_VALIDATE_EMAIL) === false ? $user->email : '';

            if (isset($user->name)) {
                $fb_user->name = $user->name;
            }

            if (isset($user->avatar)) {
                $fb_user->avatar = $user->avatar;
            }

            if (isset($user->gender)) {
                $fb_user->gender = $user->gender;
            }

            if (isset($user->avatar_original)) {
                $fb_user->avatar_original = $user->avatar_original;
            }

            DB::beginTransaction();

            $db_user = null;
            $facebook_model = UserFacebook::with('user')->where(['fb_id' => $user->id])->first();

            if ($facebook_model) {
                $db_user = $facebook_model->user;
            }

            // set the db user if it doesn't exists.
            if (!$db_user) {
                if ($email) {
                    $db_user = User::with('facebook')->where(['email' => $email])->first();
                }

                if (!$db_user) {
                    $db_user = new User();
                    $db_user->email = $email;
                    if (isset($user->name)) {
                        $db_user->name = $user->name;
                    }
                    $db_user->save();
                }
            }

            //$facebook_model = $db_user->facebook;

            // set update facebook user
            if (!$facebook_model) {
                User::find($db_user->ID)->facebook()->save($fb_user);
                $facebook_model = $fb_user;
            } else {
                $facebook_model->token = $fb_user->token;
                $facebook_model->name = $fb_user->name;
                $facebook_model->avatar = $fb_user->avatar;
                $facebook_model->gender = $fb_user->gender;
                $facebook_model->avatar_original = $fb_user->avatar_original;
                $facebook_model->save();
            }

            DB::commit();

            $user = $db_user;

            if (!$facebook_model || $facebook_model->ID < 1 || $user->ID < 1) {
                throw new Exception("Error Occurred");
            }

            Auth::login($user, true);

            return redirect()->action('HomeController@index');
        } catch (\Exception $e) {
            echo "<pre>";
            print_r($e->getMessage());
            exit;
            return redirect()->action('UserController@login');
        }
    }


    protected function findExistingLinkedInAccount($email) {
        // find facebook account
        $linkedin_user = UserLinkedIn::where(['email' => $email])->first();
        if ($linkedin_user) {
            return $linkedin_user;
        }

        return null;
    }



    /**
     * Redirect the user to the Facebook authentication page.
     *
     * @return Response
     */
    public function redirectToLinkedInProvider()
    {
        return Socialite::driver('linkedin')->redirect();
    }



    /**
     * Obtain the user information from Facebook.
     *
     * @return Response
     */
    public function handleLinkedInProviderCallback()
    {
        try {
            $user = Socialite::driver('linkedin')->user();
            
	    if (
                empty($user->token) || empty($user->id)
            ) {
                throw new Exception("Incorrect LinkedIn Data");
            }

            $linkedin_user = new UserLinkedIn();
            $linkedin_user->token = $user->token;
            $linkedin_user->linkedin_id = $user->id;
            $email = !empty($user->email) && !filter_var($user->email, FILTER_VALIDATE_EMAIL) === false ? $user->email : '';

            if (isset($user->name)) {
                $linkedin_user->name = $user->name;
            }

            if (isset($user->avatar)) {
                $linkedin_user->avatar = $user->avatar;
            }

            if (isset($user->gender)) {
                $linkedin_user->gender = $user->gender;
            }

            if (isset($user->avatar_original)) {
                $linkedin_user->avatar_original = $user->avatar_original;
            }

            DB::beginTransaction();

            $db_user = null;
            $linkedin_model = UserLinkedIn::with('user')->where(['linkedin_id' => $user->id])->first();

            if ($linkedin_model) {
                $db_user = $linkedin_model->user;
            }

            // set the db user if it doesn't exists.
            if (!$db_user) {
                if ($email) {
                    $db_user = User::with('linkedin')->where(['email' => $email])->first();
                }

                if (!$db_user) {
                    $db_user = new User();
                    $db_user->email = $email;
                    if (isset($user->name)) {
                        $db_user->name = $user->name;
                    }
                    $db_user->save();
                }
            }

            //$facebook_model = $db_user->facebook;

            // set update facebook user
            if (!$linkedin_model) {
                User::find($db_user->ID)->facebook()->save($linkedin_user);
                $linkedin_model = $linkedin_user;
            } else {
                $linkedin_model->token = $linkedin_user->token;
                $linkedin_model->name = $linkedin_user->name;
                $linkedin_model->avatar = $linkedin_user->avatar;
                $linkedin_model->gender = $linkedin_user->gender;
                $linkedin_model->avatar_original = $linkedin_user->avatar_original;
                $linkedin_model->save();
            }

            DB::commit();

            $user = $db_user;

            if (!$linkedin_model || $linkedin_model->ID < 1 || $user->ID < 1) {
                throw new Exception("Error Occurred");
            }

            Auth::login($user, true);

            return redirect()->action('HomeController@index');
        } catch (\Exception $e) {
            echo "<pre>";
            print_r($e->getMessage());
            exit;
            return redirect()->action('UserController@login');
        }
    }
    /*
    protected function getCredentials(\Illuminate\Http\Request $request) {
        $login_name = $this->loginUsername();
        $data = $request->only($login_name, 'password');
        $user_data = User::where($login_name, $data[$login_name])->first();

        if (empty($user_data)) {
            return false;
        }

        $data['password'] .= $user_data->salt;
        return $data;
    }
    */
}
