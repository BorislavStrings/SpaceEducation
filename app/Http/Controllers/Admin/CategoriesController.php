<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Unit;
use Illuminate\Support\Facades\File;

class CategoriesController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name'  => 'Name',
            'create_date' => 'Създадена на',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'name_bg'
        ];

        $this->form_builder['module_title'] = 'Categories';
        $this->form_builder['order_title'] = 'Units order';
        $this->form_builder['form_path'] = 'admin.categories._form';
        $this->form_builder['create_url'] = route('admin.categories.create');
        $this->form_builder['edit_url'] = 'admin.categories.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.categories.destroy';
        $this->form_builder['common_form_path'] = 'admin.categories._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.index', [
            'records' => Category::getAll(),
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
        $this->form_builder['form_route'] = route('admin.categories.store');
        $categories = Category::lists('name');

        return view('admin.partials.form',
            [
                'categories' => $categories,
                'form_builder' => $this->form_builder
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param CategoryRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(CategoryRequest $request)
    {
        Category::createRecord($request->all());

        return redirect(route('admin.categories.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Category $category
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Category $category)
    {
        $this->form_builder['form_route'] = route('admin.categories.update', $category);
        $categories = Category::lists('name');

        return view('admin.partials.form', [
            'record' => $category,
            'categories' => $categories,
            'sortables' => $category->units,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param CategoryRequest $request
     * @param Category $category
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $category->updateRecord($request->all());

        return redirect(route('admin.categories.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Category $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Category $category)
    {
        $files = [
            public_path('categories/' . $category->id . '.' . $category->ext),
            public_path('categories/' . $category->id . '_thumb.' . $category->ext),
            public_path('categories/' . $category->id . '_orig.' . $category->ext),
        ];

        File::delete($files);

        $category->delete();

        return redirect(route('admin.categories.index'))->with('success', trans('common.category.success_edit'));
    }
}
