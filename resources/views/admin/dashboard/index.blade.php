@extends('layouts.admin')

@section('content')
    <div class="row tile_count">
        <div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
            <span class="count_top"><i class="fa fa-user"></i> Total Users</span>
            <div class="count">{{ $users['total'] }}</div>
            <span class="count_bottom"><i class="green">4% </i> From last Week</span>
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
            <span class="count_top"><i class="fa fa-check-square-o"></i> Passed Exams</span>
            <div class="count">{{ $user_exams_data['passed'] }}</div>
            <span class="count_bottom"><i class="{{ $user_exams_data['passed_number_class'] }}">
                    <i class="{{ $user_exams_data['passed_arrow_class'] }}">
                    </i>{{ $user_exams_data['passed_percent'] }}% </i> From last Week</span>
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
            <span class="count_top"><i class="fa fa-remove"></i> Failed Exams</span>
            <div class="count">{{ $user_exams_data['failed'] }}</div>
            <span class="count_bottom"><i class="{{ $user_exams_data['failed_number_class'] }}">
                    <i class="{{ $user_exams_data['failed_arrow_class'] }}">
                    </i>{{ $user_exams_data['failed_percent'] }}% </i> From last Week</span>
        </div>
        <div class="col-md-2 col-sm-4 col-xs-6 tile_stats_count">
            <span class="count_top"><i class="fa fa-user"></i> Total Units</span>
            <div class="count">{{ $users['total'] }}</div>
            <span class="count_bottom"><i class="green">4% </i> From last Week</span>
        </div>
    </div>
    <div class="row">
        @include('admin.dashboard.users')

        @include('admin.dashboard.exams')

        @include('admin.dashboard.units')
    </div>
@endsection

@section('javascript')
    <script>
        $(function() {
            //Charts
            Chart.defaults.global.defaultFontColor = '#FFF';
            Chart.defaults.global.defaultFontSize = 14;

            var options = {
                legend: true,
                responsive: true,
            };

            new Chart(document.getElementById("users-canvas"), {
                type: 'horizontalBar',
                tooltipFillColor: "rgba(0, 0, 0, 0.55)",
                defaultFontColor: "#000",
                responsive: true,
                data: {
                    labels: JSON.parse('{{ $users['labels'] }}'.replace(/&quot;/g,'"')),
                    datasets: [{
                        label: "New users",
                        backgroundColor: JSON.parse('{{ $users['colors'] }}'.replace(/&quot;/g,'"')),
                        data: JSON.parse('{{ $users['data'] }}'.replace(/&quot;/g,'"')),
                    }]
                },
                options: options
            });

            new Chart(document.getElementById("exams-canvas"), {
                type: 'doughnut',
                tooltipFillColor: "rgba(51, 51, 51, 0.55)",
                responsive: true,
                data: {
                    labels: ['Failed', 'Passed'],
                    datasets: [{
                        label: "Exams count",
                        backgroundColor: [
                            '#ff4444',
                            '#00C851'
                        ],
                        data: JSON.parse('{{ $user_exams_data['data'] }}'.replace(/&quot;/g,'"')),
                    }]
                },
                options: options
            });

        });
    </script>
@endsection