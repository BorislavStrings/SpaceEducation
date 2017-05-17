<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword;

use App\UserVideos;
use App\UserExams;
use App\Videos;
use App\SceneModels;

class User extends Model implements AuthenticatableContract, CanResetPassword {
    /**
     * The database table used by the model.
     *
     * @var string
     */

    protected $primaryKey = 'ID';

    protected $table = 'sp_course_users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'email', 'password', 'name',
        'image', 'address', 'address_place',
        'address_coordinates', 'description', 'credits'
    ];

    public function getEmailAttribute($value) {
        return stripslashes($value);
    }

    public function getNameAttribute($value) {
        return stripslashes($value);
    }

    public function getAddressAttribute($value) {
        return stripslashes($value);
    }

    public function getDescriptionAttribute($value) {
        return stripslashes($value);
    }

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'remember_token', 'password'
    ];

    public $timestamps = false;

    public function fb_account()
    {
        return $this->hasOne('App\UserFacebook');
    }

    public function facebook()
    {
        return $this->hasOne('App\UserFacebook', 'user_id');
    }

    public function linkedin()
    {
        return $this->hasOne('App\UserLinkedIn', 'user_id');
    }

    public function imageData()
    {
        return $this->belongsTo('App\Files', 'image');
    }

    public function videos()
    {
        return $this->hasMany('App\UserVideos', 'user_id');
    }

    public function enrollments()
    {
        return $this->hasMany('App\UserEnrollments', 'user_id');
    }

    public function medals()
    {
        return $this->hasMany('App\UserMedals', 'user_id');
    }

    public function computeUserPoints() {
        $user_exams = UserExams::with(['exam' => function($q) {
          $q->with('unit');
        }])->where(['passed' => 1, 'user_id' => $this->ID])->get();
        $total_points = 0;
        if ($user_exams) {
            foreach ($user_exams AS $exam) {
                if ($exam->exam && $exam->exam->unit) {
                    $total_points += $exam->exam->unit->points;
                }
            }
        }

        return $total_points;
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'email';
    }

    /**
     * Get the unique identifier for the user.
     *
     * @return mixed
     */
    public function getAuthIdentifier()
    {
        return $this->ID;
    }

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->password;
    }

    /**
     * Get the token value for the "remember me" session.
     *
     * @return string
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * Set the token value for the "remember me" session.
     *
     * @param  string $value
     * @return void
     */
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
        $this->save();
    }

    /**
     * Get the column name for the "remember me" token.
     *
     * @return string
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * Get the e-mail address where password reset links are sent.
     *
     * @return string
     */
    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    public static function userWatchedVideos($user_id)
    {
        $user_videos = UserVideos::where(['user_id' => $user_id])->pluck('video_id')->toArray();
        $videos = Videos::all();
        if ($user_videos && $videos) {
            foreach ($videos AS $inx => $video) {
                if (in_array($video->ID, $user_videos)) {
                    $videos[$inx]['watched'] = 1;
                } else {
                    $videos[$inx]['watched'] = 0;
                }
            }
        }

        return $videos;
    }

    public function sceneUpdates()
    {
        return $this->hasMany('App\UserSceneUpdates', 'user_id');
    }

    public function getPassedUnitsID()
    {
        $result = [];
        $exams = UserExams::where(['user_id' => $this->ID, 'passed' => 1])->with('exam')->get();

        if ($exams) {
            foreach ($exams AS $exam) {
                if ($exam->exam) {
                    $result[] = $exam->exam->unit_id;
                }
            }
        }

        return $result;
    }

    private function computePoints($parent_id, &$categories) {
        if ($categories) {
            $points = 0;

            foreach ($categories AS $cat) {
                if ($cat['parent_id'] == $parent_id) {
                    $children_points = 0;
                    if (isset($cat->units) && sizeof($cat->units) > 0) {
                        foreach ($cat->units AS $unit) {
                            $children_points += $unit->points;
                        }
                    }

                    $children_points += $this->computePoints($cat['ID'], $categories);

                    $cat->setPointsAttribute($children_points);
                    $points += $children_points;
                }
            }

            return $points;
        }

        return 0;
    }

    public function computeUserPointsByCategory() {

        // 1. get all units
        // 2. set an append unit parameter passed/not passed.
        // 3. compute the points in the tree
        $passed_units = $this->getPassedUnitsID();
        $categories = Categories::with(['units' => function($q) use ($passed_units) {
            $q->whereIn("ID", $passed_units);
        }])->get();

        $this->computePoints(0, $categories);

        return $categories;
    }

    private function isPassedUnit($unit_id, &$passed_units) {
        $result = 0;

        if ($unit_id > 0 && sizeof($passed_units) > 0) {
            foreach ($passed_units AS $unit) {
                if ($unit == $unit_id) {
                    $result = 1;
                    break;
                }
            }
        }

        return $result;
    }

    private function computePoints2($parent_id, &$categories) {
        if ($categories) {
            $points = 0;
            $all_passed = 1;
            foreach ($categories AS $cat) {
                if ($cat['parent_id'] == $parent_id) {

                    $children_points = 0;
                    $children_passed = 1;
                    if (isset($cat->units) && sizeof($cat->units) > 0) {
                        foreach ($cat->units AS $unit) {
                            if ($unit->passed) {
                                $children_points += $unit->points;
                            } else {
                                $children_passed = 0;
                            }
                        }
                    }

                    $result = $this->computePoints2($cat['ID'], $categories);
                    $children_points += $result['points'];

                    if ($children_passed) {
                        $children_passed = $result['passed'];
                    }

                    if ($children_passed == 0) {
                        $all_passed = 0;
                    }

                    $cat->setPassedAttribute($children_passed);
                    $cat->setPointsAttribute($children_points);
                    $points += $children_points;
                }
            }

            return ['points' => $points, 'passed' => $all_passed];
        }

        return ['points' => 0, 'passed' => 1];
    }

    public function computeUserPointsByCategory2() {

        // 1. get all units
        // 2. set an append unit parameter passed/not passed.
        // 3. compute the points in the tree
        $passed_units = $this->getPassedUnitsID();
        $categories = Categories::with(['units'])->get();

        if (sizeof($categories) > 0) {
            foreach ($categories AS $cat) {
                if (sizeof($cat->units) > 0) {
                    foreach ($cat->units AS $unit) {
                        $unit->setPassedAttribute($this->isPassedUnit($unit->ID, $passed_units));
                    }
                }
            }
        }

        $this->computePoints2(0, $categories);

        echo "asd";
        echo "<pre>";
        print_r($categories);
        exit;

        return $categories;
    }

    public function canUnlockUpgrades($upgrades_id)
    {
        $response = [];
        $message = '';
        try {
            $upgrades = SceneModels::with('categories')->findMany($upgrades_id);
            $categories_points = $this->computeUserPointsByCategory();

            if (!$upgrades) {
                throw new \Exception('Not available updates');
            }

            $available_points = $this->credits;

            foreach ($upgrades AS $upgrade) {
                $status = true;
                $msg = [];

                // validate does he has enough points to unlock the exam?
                if ($available_points < $upgrade->points) {
                    $status = false;
                    $msg[] = 'Not enough points';
                }

                // validate does the user has finished the course
                $categories_status = true;
                if ($upgrade->categories) {
                    foreach ($upgrade->categories AS $upgrade_category) {

                        $found = false;
                        foreach ($categories_points AS $category) {
                            if ($category->ID == $upgrade_category->category_id) {
                                $found = true;
                                if ($category->points < $upgrade_category->points) {
                                    $categories_status = false;
                                }
                                break;
                            }
                        }

                        if (!$found) {
                            $categories_status = false;
                        }
                    }
                }

                if (!$categories_status) {
                    $status = false;
                    $msg[] = 'Unfinished category';
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
