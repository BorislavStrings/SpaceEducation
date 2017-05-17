<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\User;
use App\UserExams;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    const MONTHS = [
        1   => 'January',
        2   => 'February',
        3   => 'March',
        4   => 'April',
        5   => 'May',
        6   => 'June',
        7   => 'July',
        8   => 'August',
        9   => 'September',
        10  => 'October',
        11  => 'November',
        12  => 'December',
    ];

    const MONTH_COLORS = [
        1   => '#1abc9c',
        2   => '#3498db',
        3   => '#9b59b6',
        4   => '#27ae60',
        5   => '#f1c40f',
        6   => '#e67e22',
        7   => '#d35400',
        8   => '#e74c3c',
        9   => '#34495e',
        10  => '#95a5a6',
        11  => '#c0392b',
        12  => '#ecf0f1',
    ];

    public function index()
    {
        $users_data = self::users();
        $user_exams_data = self::userExams();

        return view('admin.dashboard.index', [
            'users' => $users_data,
            'user_exams_data' => $user_exams_data
        ]);
    }

    public static function users()
    {
        $users = User::where('create_date', '!=', '0000-00-00 00:00:00')
            ->select(DB::raw('count(ID) as `data`, COUNT(*) as count'),
                DB::raw("DATE_FORMAT(create_date, '%m-%Y') new_date"),
                DB::raw('YEAR(create_date) year, MONTH(create_date) month'))
            ->groupby('year','month')
            ->get();

        $labels = [];
        $colors = [];

        foreach ($users as $user) {
            $labels[] = $user->year . ' ' . self::MONTHS[$user->month];
            $colors[] = self::MONTH_COLORS[$user->month];
        }

        return [
            'data' => json_encode($users->pluck('count')->toArray()),
            'labels' => json_encode($labels),
            'colors' => json_encode($colors),
            'total' => User::count()
        ];
    }

    public function userExams()
    {
        //Passed
        $passed = UserExams::where('passed', 1)->count();

        $passed_last_week = UserExams::where('passed', 1)->where('create_date', '<', Carbon::now()->subWeek())
            ->where('create_date', '>', Carbon::now()->subWeek(2))->count(); //2

        $passed_this_week = UserExams::where('passed', 1)
            ->where('create_date', '>', Carbon::now()->subWeek())->count(); // null

        $passed_percent = 0;
        if ($passed_last_week != 0 ) {
            $passed_percent = ($passed_this_week - $passed_last_week) / $passed_last_week * 100;
        }

        //Failed
        $failed_last_week = UserExams::where('passed', 0)->where('create_date', '<', Carbon::now()->subWeek())
            ->where('create_date', '>', Carbon::now()->subWeek(2))->count(); //2

        $failed_this_week = UserExams::where('passed', 0)
            ->where('create_date', '>', Carbon::now()->subWeek())->count(); // null

        $failed_percent = 0;
        if ($failed_last_week != 0) {
            $failed_percent = ($failed_this_week - $failed_last_week) / $failed_last_week * 100;
        }

        $failed = UserExams::where('passed', 0)->count();

        return [
            'passed' => $passed,
            'passed_percent' => round($passed_percent, 2),
            'passed_number_class' => ($passed_percent < 0) ? 'red' : 'green',
            'passed_arrow_class' => ($passed_percent < 0) ? 'fa fa-sort-desc' : 'fa fa-sort-asc',
            'failed' => $failed,
            'failed_percent' => round($failed_percent, 2),
            'failed_number_class' => ($failed_percent < 0) ? 'red' : 'green',
            'failed_arrow_class' => ($failed_percent < 0) ? 'fa fa-sort-desc' : 'fa fa-sort-asc',
            'data' => json_encode([
                $failed,
                $passed,
            ])
        ];
    }
}
