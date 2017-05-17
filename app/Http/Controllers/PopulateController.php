<?php

namespace App\Http\Controllers;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class PopulateController extends Controller
{

    public function categories_description()
    {
        $categories = [
            2 => 'Fundamental science is essential in Space since it aims to discover the principles that the Universe follows, providing Engineering and all other branches with the required tools to solve their respective problems and progress. If you have knowledge about the physics of Space - how the Universe works, what are the orbital laws that all satellites and bodies follow and how do we detect particles from huge cosmic events, then you deserve the title of Chief Scientist!',
            3 => 'It is in humanity’s nature to explore further, to try to find out as much as possible, to be curious. If you are curious about how astronauts and robots explore space, what have they found so far and how will that effort continue in the future, then this is the field for you. By finding out more about exploration, you yourself can claim the title of Galactic Explorer!',
            4 => 'Scientists study the world as it is but engineers create a world that never was. In this field, you must learn about the engineering, construction and even operations of spacecraft and their systems. To do that you will have to pass through all the different aspects - the spaceship itself but also the launcher and the ground segment and all of the modern robotic systems that go along with them. Only after learning about all of this, will you be worthy of the title Space Architect!',
            5 => 'Biology in Space has become important today and will be absolutely crucial for our future there. For that reason, you must learn about the different challenges with life in Space and how to handle them, about the different environments in Space and what life may inhabit them, and also about our future survival on Mars and other worlds, before being granted the title of Terraformer!',
            6 => 'To become a commander you must, while not being an expert in every topic, at least have sufficient knowledge to see the whole picture. For that reason, only the most patient and determined can reach that here - only by completing all of our other challenges will you earn the rank of Space Commander!'
        ];

        foreach ($categories as $key => $cat) {
            DB::table('sp_course_categories')->where('ID', $key)->update([
                'description' => $cat,
            ]);
        }
    }

    public function database_localization()
    {
        $records = [];

         foreach($records as $key => $record){
             // dd($record);
             DB::table('sp_course_exam')->where('ID', $key)->update([
                 'name_bg' => isset($record['name_bg']) ? $record['name_bg'] : '',
                 'description_bg' => isset($record['description_bg']) ? $record['description_bg'] : ''
             ]);
         }
//         Cache::flush();
        dd('DONE');
        
    }

    public function install() {
         $records = [];
         $this->alter_table('sp_course_answers', $records, ['name_bg' => 'string']);
         $this->alter_table('sp_course_categories', $records, ['name_bg' => 'string', 'questions_bg' => 'text']);
         $this->alter_table('sp_course_exam', $records, ['name_bg' => 'string', 'description_bg' => 'string']);
         $this->alter_table('sp_course_medals', $records, ['name_bg' => 'string', 'description_bg' => 'text']);
         $this->alter_table('sp_course_questions', $records, ['name_bg' => 'string', 'description_bg' => 'text']);
         $this->alter_table('sp_course_units', $records, ['name_bg' => 'string', 'description_bg' => 'text']);
         $this->alter_table('sp_course_videos', $records, ['title_bg' => 'string', 'short_description_bg' => 'text', 'long_description_bg' => 'text']);

         $this->create_cache_table();

         $this->reorder_categories();
    }

    private function reorder_categories()
    {
        if (!Schema::hasColumn('sp_course_categories', 'class_name')) {
            Schema::table('sp_course_categories', function($table){
                $table->string('class_name');
            });
        }

        if (!Schema::hasColumn('sp_course_categories', 'mindmap_order')) {
            Schema::table('sp_course_categories', function($table){
                $table->integer('mindmap_order')->unsigned();
            });
        }

        $mindmap_orders = [
            19 => [1 => 'map-top'],
            21 => [2 => 'map-left'],
            22 => [4 => 'map-left'],
            23 => [3 => 'map-right'],
            24 => [6 => 'map-bottom'],
            25 => [1 => 'right-section straight center'],
            26 => [3 => 'right-section'],
            27 => [2 => 'left-section'],
            28 => [1 => 'right-section'],
            29 => [2 => 'right-section bottom split'],
            30 => [3 => 'right-section bottom straight'],
            31 => [1 => 'left-section'],
            32 => [2 => 'left-section bottom'],
            33 => [1 => 'left-section'],
            34 => [2 => 'left-section bottom'],
            35 => [1 => 'right-section'],
            36 => [2 => 'right-section bottom'],
            37 => [1 => 'left-section bottom'],
            38 => [4 => 'right-section bottom straight center'],
            39 => [2 => 'right-section bottom'],
            40 => [3 => 'left-section bottom straight center'],
            41 => [5 => 'right-section bottom straight center'],
            44 => [5 => 'map-right'],
        ];

        foreach ($mindmap_orders as $key => $order) {
            $order_key = key($order);
            $order_number = 0;
            if (intval($key) == 19) {
                $order_number = 1;
            }
            if (intval($key) == 21) {
                $order_number = 2;
            }

            DB::table('sp_course_categories')->where('ID', $key)->update([
                'mindmap_order' => $order_key,
                'order_number' => $order_number,
                'class_name' => $order[$order_key]
            ]);
        }
    }

    private function create_cache_table()
    {
        if (Schema::hasTable('cache_token')) {
            return;
        }

        Schema::create('cache_token',function($table)
        {
            $table->increments('id');
            $table->string('tag');
            $table->string('token');
        });
    }

    private function alter_table($table_name, $records = [], $columns = [])
    {
        $exists = false;
        foreach ($columns as $column_name => $column_type) {
            if (Schema::hasColumn($table_name, $column_name)) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            Schema::table($table_name, function($table) use($columns){
                foreach ($columns as $column_name => $column_type) {
                    $table->{$column_type}($column_name);
                }
            });
        }

        foreach ($records as $id => $record) {
            DB::table($table_name)->where('ID', $id)->update($record);
        }
    }

    public function text_files()
    {
        $this->generate_localization_file('sp_course_answers', 'ID', ['name'], 'bg', 'answers.txt');
        $this->generate_localization_file('sp_course_categories', 'ID', ['name', 'questions'], 'bg', 'categories.txt');
        $this->generate_localization_file('sp_course_exam', 'ID', ['name'], 'bg', 'exam.txt');
        $this->generate_localization_file('sp_course_medals', 'ID', ['name', 'description'], 'bg', 'medals.txt');
        $this->generate_localization_file('sp_course_questions', 'ID', ['name', 'description'], 'bg', 'questions.txt');
        $this->generate_localization_file('sp_course_units', 'ID', ['name', 'description'], 'bg', 'units.txt');
        $this->generate_localization_file('sp_course_videos', 'ID', ['title', 'short_description', 'long_description'], 'bg', 'videos.txt');
    }

    private function generate_localization_file($table, $id, $columns = [], $lang, $filename)
    {
        $select = $columns;
        $select[count($select)] = $id;

        $string = '[';
        $records = DB::table($table)->select($select)->get();
        $translated = [
            0 => [
                'title' => 'Introduction to Spacecraft Technology - Part 1'
            ]
        ];

        foreach ($records as $record) {
            $string .= '
            '.$record->ID.' => [
            ';
            foreach ($columns as $column) {

                $exists = $this->is_translated($record->{$column}, $column, $translated);
                if ($exists['translated'] == true) {
                    $translated[$record->ID][$column] = $exists['record'];
                    continue;
                } else {
                    $translated[$record->ID][$column] = $record->{$column};
                }

                $string .=
                '"'.$column.'" => "' . $record->{$column} . '",
                "'.$column.'_'.$lang.'" => "",
               ';
            }

            $string .= '
            ],';
        }

        $string .= '
        ]';

        file_put_contents(base_path().'/resources/views/localization/' . $filename, $string);
    }

    private function is_translated($item, $column, $translated)
    {
        $translated_key = array_search($item, array_column($translated, $column));
        if ($translated_key !== false) {
            return ['translated' => true, 'record' => $item];
        }

        return ['translated' => false];
    }

    public function populate_admin()
    {
//        Schema::create('sp_admins', function(Blueprint $table){
//            $table->increments('ID');
//            $table->string('name')->nullable();
//            $table->string('email');
//            $table->string('password');
//            $table->tinyInteger('super_admin')->default(0);
//            $table->tinyInteger('active')->default(1);
//            $table->string('remember_token')->nullable();
//            $table->timestamps();
//        });

        Schema::create('sp_course_users_linkedin', function(Blueprint $table){
            $table->increments('ID');
            $table->integer('user_id')->unsigned()->nullable();
            $table->string('linkedin_id');
            $table->string('name')->nullable();
            $table->string('avatar')->nullable();
            $table->string('avatar_original')->nullable();
            $table->string('gender')->nullable();
            $table->string('token')->nullable();
            $table->timestamp('create_date')->nullable();
        });
//
//        Schema::table('sp_course_units_relations', function(Blueprint $table){
//            $table->renameColumn('unit_id_one', 'child_id');
//            $table->renameColumn('unit_id_two', 'parent_id');
//        });

//        DB::table('sp_admins')->insert([
//            'name' => 'Admin',
//            'email' => 'admin@spaceport.com',
//            'password' => Hash::make('admin123'),
//            'super_admin' => 1,
//            'active' => 1,
//        ]);

    }
}
