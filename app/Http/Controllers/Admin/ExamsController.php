<?php

namespace App\Http\Controllers\Admin;

use App\Models\Exam;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ExamRequest;
use App\Models\Unit;
use Illuminate\Support\Facades\Cache;

class ExamsController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name'  => 'Name',
            'points' => 'Points',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'points'
        ];

        $this->form_builder['module_title'] = 'Exams';
        $this->form_builder['order_title'] = 'Questions order';
        $this->form_builder['form_path'] = 'admin.exams._form';
        $this->form_builder['create_url'] = route('admin.exams.create');
        $this->form_builder['edit_url'] = 'admin.exams.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.exams.destroy';
        $this->form_builder['common_form_path'] = 'admin.exams._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.index', [
            'records' => Exam::getAll(),
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
        $this->form_builder['form_route'] = route('admin.exams.store');
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
     * @param ExamRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(ExamRequest $request)
    {
        Exam::createRecord($request->all());

        return redirect(route('admin.exams.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Exam $exam
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Exam $exam)
    {
        $this->form_builder['form_route'] = route('admin.exams.update', $exam);
        $units = Unit::lists('name');

        return view('admin.partials.form', [
            'record' => $exam,
            'units' => $units,
            'sortables' => $exam->questions,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param ExamRequest $request
     * @param Exam $exam
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(ExamRequest $request, Exam $exam)
    {
        $exam->updateRecord($request->all());

        return redirect(route('admin.exams.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Exam $exam
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Exam $exam)
    {
        $exam->delete();

        return redirect(route('admin.exams.index'))->with('success', trans('common.success_delete'));
    }
}
