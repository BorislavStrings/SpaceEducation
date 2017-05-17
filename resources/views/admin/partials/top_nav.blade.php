<div class="top_nav">
    <div class="nav_menu">
        <nav>
            <div class="nav toggle">
                <a id="menu_toggle"><i class="fa fa-bars"></i></a>
            </div>

            <ul class="nav navbar-nav navbar-right">
                <li class="">
                    <a href="javascript:;" class="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false" style="color: #fff !important;">
                        <img src="images/img.jpg" alt="">
                        {{ Auth::guard('admin')->user()->email }}
                        <span class=" fa fa-angle-down"></span>
                    </a>
                    <ul class="dropdown-menu dropdown-usermenu pull-right">
                        <li>
{{--                            <a href="{{ route('admin.profile') }}"> {{ trans('top_nav.profile') }}</a>--}}
                        </li>
                        <li>
                            <a href="{{ url('admin/logout') }}"><i class="fa fa-sign-out pull-right"></i>
                                Logout
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    </div>
</div>