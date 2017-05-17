<div class="col-md-3 left_col">
    <div class="left_col scroll-view">
        <div class="navbar nav_title" style="border: 0;">
            <a href="{{ route('admin.dashboard') }}" class="site_title">
                <span><img src="https://cdn.spaceedu.net/images/logo.png" alt="" width="200"></span>
            </a>
        </div>

        <div class="clearfix"></div>

        <!-- menu profile quick info -->
        <div class="profile clearfix">
            <div class="profile_pic">
                <img src="{{ Auth::guard('admin')->user()->image ?? asset('assets/admin/images/profile.png') }}" alt="..." class="img-circle profile_img">

            </div>
            <div class="profile_info">
                <span>Welcome,</span>
                <h2>{{ Auth::guard('admin')->user()->name }}</h2>
            </div>
        </div>
        <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
            <div class="menu_section">
                @if(Auth::guard('admin')->user()->super_admin)
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-user"></i> CMS Users <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.admins.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.admins.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                @endif
                @if(Auth::guard('admin')->user()->super_admin)
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-users"></i> Users <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.users.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.users.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                @endif
                @if(Auth::guard('admin')->user()->super_admin)
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-database"></i> Missions <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.categories.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.categories.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                @endif
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-newspaper-o"></i> Exams <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.exams.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.exams.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-question-circle"></i> Questions <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.questions.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.questions.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-tags"></i> Answers <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.answers.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.answers.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-star"></i> Medals <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.medals.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.medals.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav side-menu">
                        <li><a><i class="fa fa-circle-o"></i> Units <span class="fa fa-chevron-down"></span></a>
                            <ul class="nav child_menu">
                                <li><a href="{{ route('admin.units.index') }}">View all</a></li>
                                <li><a href="{{ route('admin.units.create') }}">Create new</a></li>
                            </ul>
                        </li>
                    </ul>

                <ul class="nav side-menu">
                    <li><a><i class="fa fa-video-camera"></i> Videos <span class="fa fa-chevron-down"></span></a>
                        <ul class="nav child_menu">
                            <li><a href="{{ route('admin.videos.index') }}">View all</a></li>
                            <li><a href="{{ route('admin.videos.create') }}">Create new</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
