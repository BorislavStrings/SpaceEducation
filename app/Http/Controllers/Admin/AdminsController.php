<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminRequest;
use App\Models\Admin\Admin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminsController extends Controller
{
    protected $form_builder;

    public function __construct()
    {
        $this->form_builder = [];
        $this->form_builder['columns'] = [
            'name' => 'Name',
            'email' => 'Email',
        ];

        $this->form_builder['filter_columns'] = [
            'name', 'email'
        ];

        $this->form_builder['module_title'] = 'Administrators';
        $this->form_builder['form_path'] = 'admin.admins._form';
        $this->form_builder['create_url'] = route('admin.admins.create');
        $this->form_builder['edit_url'] = 'admin.admins.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.admins.destroy';
        $this->form_builder['common_form_path'] = 'admin.admins._common_form';

    }

    public function profile()
    {
        $admin = Admin::find(Auth::id());

        return view('admin.partials.profile', compact('admin'));
    }

    public function index()
    {
        return view('admin.partials.index', [
            'records' => Admin::getAll(),
            'form_builder' => $this->form_builder
        ]);
    }

    public function create()
    {
        $this->form_builder['form_route'] = route('admin.admins.store');

        return view('admin.partials.form',
            [
                'form_builder' => $this->form_builder
            ]
        );
    }

    public function store(AdminRequest $request)
    {
        $recordRequest = $request->all();

        $recordRequest['password'] = Hash::make($recordRequest['password']);

        Admin::create($recordRequest);

        return redirect(route('admin.admins.index'));
    }

    public function edit(Admin $admin)
    {
        $this->form_builder['form_route'] = route('admin.admins.update', $admin);

        return view('admin.partials.form', [
            'record' => $admin,
            'form_builder' => $this->form_builder
        ]);
    }

    public function update(Admin $admin, AdminRequest $request)
    {
        $recordRequest = $request->all();

        unset($recordRequest['password']);

        $admin->update([
            'name' => $recordRequest['name'],
            'email' => $recordRequest['email']
        ]);

        return redirect()->back();
    }
}
