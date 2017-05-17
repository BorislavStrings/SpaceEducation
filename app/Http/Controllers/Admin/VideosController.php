<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\Exam;
use App\Models\Unit;
use App\Models\Video;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VideoRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class VideosController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'title'  => 'Title',
        ];

        $this->form_builder['filter_columns'] = [
            'title'
        ];

        $this->form_builder['module_title'] = 'Video';
        $this->form_builder['form_path'] = 'admin.videos._form';
        $this->form_builder['create_url'] = route('admin.videos.create');
        $this->form_builder['edit_url'] = 'admin.videos.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.videos.destroy';
        $this->form_builder['common_form_path'] = 'admin.videos._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.grid', [
            'records' => Video::getAll(),
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $this->form_builder['form_route'] = route('admin.videos.store');
        $units = Unit::lists('name');

        return view('admin.partials.form',
            [
                'units' => $units,
                'form_builder' => $this->form_builder
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param VideoRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(VideoRequest $request)
    {
        Video::createRecord($request->all());

        return redirect(route('admin.videos.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Video $video
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Video $video)
    {
        $this->form_builder['form_route'] = route('admin.videos.update', $video);
        $units = Unit::lists('name');

        return view('admin.partials.form', [
            'record' => $video,
            'units' => $units,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param VideoRequest $request
     * @param Video $video
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(VideoRequest $request, Video $video)
    {
        $video->updateRecord($request->all());

        return redirect(route('admin.videos.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Video $video
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Video $video)
    {
        $video->delete();

        return redirect(route('admin.videos.index'))->with('success', trans('common.success_delete'));
    }
}
