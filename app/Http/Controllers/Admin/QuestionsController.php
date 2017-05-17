<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\Exam;
use App\Models\Question;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\QuestionRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class QuestionsController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name'  => 'Name',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'points'
        ];

        $this->form_builder['module_title'] = 'Questions';
        $this->form_builder['order_title'] = 'Answers order';
        $this->form_builder['form_path'] = 'admin.questions._form';
        $this->form_builder['create_url'] = route('admin.questions.create');
        $this->form_builder['edit_url'] = 'admin.questions.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.questions.destroy';
        $this->form_builder['common_form_path'] = 'admin.questions._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.index', [
            'records' => Question::getAll(),
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
        $this->form_builder['form_route'] = route('admin.questions.store');
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
     * @param QuestionRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(QuestionRequest $request)
    {
        Question::createRecord($request->all());

        return redirect(route('admin.questions.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Question $question
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Question $question)
    {
        $this->form_builder['form_route'] = route('admin.questions.update', $question);
        $exams = Exam::lists('name');

        return view('admin.partials.form', [
            'record' => $question,
            'exams' => $exams,
            'sortables' => $question->answers,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param QuestionRequest $request
     * @param Question $question
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(QuestionRequest $request, Question $question)
    {
        $question->updateRecord($request->all());

        return redirect(route('admin.questions.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Question $question
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Question $question)
    {
        $question->delete();

        return redirect(route('admin.questions.index'))->with('success', trans('common.success_delete'));
    }
}
