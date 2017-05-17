<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\Admin\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
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

        $this->form_builder['module_title'] = 'Users';
        $this->form_builder['form_path'] = 'admin.users._form';
        $this->form_builder['create_url'] = route('admin.users.create');
        $this->form_builder['edit_url'] = 'admin.users.edit';
        $this->form_builder['files'] = true;
        $this->form_builder['destroy_url'] = 'admin.users.destroy';
        $this->form_builder['common_form_path'] = 'admin.users._common_form';

    }

    public function profile()
    {
        $user = User::find(Auth::id());

        return view('admin.partials.profile', compact('user'));
    }

    public function index()
    {
        return view('admin.partials.index', [
            'records' => User::getAll(),
            'form_builder' => $this->form_builder
        ]);
    }

    public function create()
    {
        $this->form_builder['form_route'] = route('admin.users.store');

        return view('admin.partials.form',
            [
                'form_builder' => $this->form_builder
            ]
        );
    }

    public function store(UserRequest $request)
    {
        $recordRequest = $request->all();

        $recordRequest['password'] = Hash::make($recordRequest['password']);

        User::create($recordRequest);

        return redirect(route('admin.users.index'));
    }

    public function edit(User $user)
    {
        $this->form_builder['form_route'] = route('admin.users.update', $user);

        return view('admin.partials.form', [
            'record' => $user,
            'form_builder' => $this->form_builder
        ]);
    }

    public function update(User $user, UserRequest $request)
    {
        $recordRequest = $request->all();

        unset($recordRequest['password']);

        $user->update([
            'name' => $recordRequest['name'],
            'email' => $recordRequest['email']
        ]);

        return redirect()->back();
    }
}
