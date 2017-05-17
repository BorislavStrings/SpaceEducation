<?php

namespace App\Http\Controllers\Admin;

use App\Models\Answer;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnswerRequest;
use App\Models\Question;
use Illuminate\Support\Facades\File;

class AnswersController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name'  => 'Answer',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'name_bg'
        ];

        $this->form_builder['module_title'] = 'Answers';
        $this->form_builder['form_path'] = 'admin.answers._form';
        $this->form_builder['create_url'] = route('admin.answers.create');
        $this->form_builder['edit_url'] = 'admin.answers.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.answers.destroy';
        $this->form_builder['common_form_path'] = 'admin.answers._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.index', [
            'records' => Answer::getAll(),
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
        $this->form_builder['form_route'] = route('admin.answers.store');
        $questions = Question::lists('name');

        return view('admin.partials.form',
            [
                'questions' => $questions,
                'form_builder' => $this->form_builder
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param AnswerRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(AnswerRequest $request)
    {
        Answer::createRecord($request->all());

        return redirect(route('admin.answers.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Answer $answer
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Answer $answer)
    {
        $this->form_builder['form_route'] = route('admin.answers.update', $answer);
        $questions = Question::lists('name');

        return view('admin.partials.form', [
            'record' => $answer,
            'questions' => $questions,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param AnswerRequest $request
     * @param Answer $answer
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(AnswerRequest $request, Answer $answer)
    {
        $answer->updateRecord($request->all());

        return redirect(route('admin.answers.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Answer $answer
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Answer $answer)
    {
        $files = [
            public_path('answers/' . $answer->id . '.' . $answer->ext),
            public_path('answers/' . $answer->id . '_thumb.' . $answer->ext),
            public_path('answers/' . $answer->id . '_orig.' . $answer->ext),
        ];

        File::delete($files);

        $answer->delete();

        return redirect(route('admin.answers.index'))->with('success', trans('common.answer.success_edit'));
    }
}
