<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\Exam;
use App\Models\Medal;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MedalRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class MedalsController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name'  => 'Name',
            'image_path' => 'Image',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'points'
        ];

        $this->form_builder['module_title'] = 'Medals';
        $this->form_builder['form_path'] = 'admin.medals._form';
        $this->form_builder['create_url'] = route('admin.medals.create');
        $this->form_builder['edit_url'] = 'admin.medals.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.medals.destroy';
        $this->form_builder['common_form_path'] = 'admin.medals._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.grid', [
            'records' => Medal::getAll(),
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
        $this->form_builder['form_route'] = route('admin.medals.store');
        $exams = Exam::lists('name');

        return view('admin.partials.form',
            [
                'exams' => $exams,
                'form_builder' => $this->form_builder
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param MedalRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(MedalRequest $request)
    {
        Medal::createRecord($request->all());

        return redirect(route('admin.medals.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Medal $medal
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Medal $medal)
    {
        $this->form_builder['form_route'] = route('admin.medals.update', $medal);
        $exams = Exam::lists('name');

        return view('admin.partials.form', [
            'record' => $medal,
            'exams' => $exams,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param MedalRequest $request
     * @param Medal $medal
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(MedalRequest $request, Medal $medal)
    {
        $medal->updateRecord($request->all());

        return redirect(route('admin.medals.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Medal $medal
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Medal $medal)
    {
        $medal->delete();

        return redirect(route('admin.medals.index'))->with('success', trans('common.success_delete'));
    }
}
