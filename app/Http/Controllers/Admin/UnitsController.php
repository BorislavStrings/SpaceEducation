<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Models\Unit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UnitRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class UnitsController extends Controller
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

        $this->form_builder['module_title'] = 'Units';
        $this->form_builder['form_path'] = 'admin.units._form';
        $this->form_builder['create_url'] = route('admin.units.create');
        $this->form_builder['edit_url'] = 'admin.units.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.units.destroy';
        $this->form_builder['common_form_path'] = 'admin.units._common_form';
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.partials.index', [
            'records' => Unit::getAll(),
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
        $this->form_builder['form_route'] = route('admin.units.store');
        $categories = Category::lists('name');
        $units = Unit::lists('name');

        return view('admin.partials.form',
            [
                'units' => $units,
                'categories' => $categories,
                'form_builder' => $this->form_builder
            ]
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param UnitRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(UnitRequest $request)
    {
        Unit::createRecord($request->all());

        return redirect(route('admin.units.index'))->with('success', trans('admin.success_create'));
    }

    /**
     * @param Unit $unit
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Unit $unit)
    {
        $this->form_builder['form_route'] = route('admin.units.update', $unit);
        $categories = Category::lists('name');
        $units = Unit::lists('name', 'ID', Unit::where('ID', '!=', $unit->ID)->get());
        $related = $unit->related->pluck('child_id')->toArray();

        return view('admin.partials.form', [
            'record' => $unit,
            'units' => $units,
            'related' => $related,
            'categories' => $categories,
            'form_builder' => $this->form_builder
        ]);
    }

    /**
     * @param UnitRequest $request
     * @param Unit $unit
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function update(UnitRequest $request, Unit $unit)
    {
        $unit->updateRecord($request->all());

        return redirect(route('admin.units.index'))->with('success', trans('admin.success_edit'));
    }

    /**
     * @param Unit $unit
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Unit $unit)
    {
        $files = [
            public_path('units/' . $unit->id . '.' . $unit->ext),
            public_path('units/' . $unit->id . '_thumb.' . $unit->ext),
            public_path('units/' . $unit->id . '_orig.' . $unit->ext),
        ];

        File::delete($files);

        $unit->delete();

        return redirect(route('admin.units.index'))->with('success', trans('common.unit.success_edit'));
    }
}
