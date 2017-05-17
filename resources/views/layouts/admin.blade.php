<!DOCTYPE html>
<html>
@include('admin.partials.head')
<body class="nav-md">
    <div class="container body">
        <div class="main_container">
            @include('admin.partials.sidebar')
            @include('admin.partials.top_nav')
            <div class="right_col">

                @if (session('success'))
                    <div class="alert alert-success col-sm-12 alert-dismissable">
                        {{ session('success') }}
                    </div>
                @endif

                @yield('content')
            </div>
            <div class="clearfix"></div>
            @include('admin.partials.footer')
            @yield('javascript')
        </div>
    </div>
</body>

</html> 