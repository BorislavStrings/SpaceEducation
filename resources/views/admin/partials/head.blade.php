<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- Meta, title, CSS, favicons, etc. -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin</title>

    <!-- Bootstrap -->
    {{ Html::style('assets/admin/css/bootstrap.min.css') }}
    {{ Html::style('assets/admin/css/select2.min.css') }}
    {{ Html::style('assets/admin/css/jquery-ui.min.css') }}
    <!-- Font Awesome -->
    {{ Html::style('assets/admin/css/font-awesome.min.css') }}
    <!-- NProgress -->
    {{ Html::style('assets/admin/css/nprogress.css') }}
    <!-- iCheck -->
    {{ Html::style('assets/admin/css/green.css') }}
    <!-- bootstrap-progressbar -->
    {{ Html::style('assets/admin/css/fbootstrap-progressbar-3.3.4.min.css') }}
    <!-- JQVMap -->
    {{ Html::style('assets/admin/css/jqvmap.min.css') }}
    <!-- bootstrap-daterangepicker -->
    {{ Html::style('assets/admin/css/daterangepicker.css') }}
    {{ Html::style('assets/admin/css/fileinput.min.css') }}
    {{ Html::style('assets/admin/js/skins/line/green.css') }}
    {{ Html::style('assets/admin/js/skins/line/blue.css') }}
    <!-- Custom Theme Style -->
    {{ Html::style('assets/admin/css/custom.min.css') }}

    {{ Html::script('assets/admin/tinymce/tinymce.min.js') }}

    {{ Html::style('assets/admin/css/custom.css') }}
    <script>
        tinymce.init({
            selector:'textarea',
            height: 200,
            plugins: [
                'advlist autolink lists link charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars fullscreen',
                'insertdatetime nonbreaking save table contextmenu directionality',
                'paste textcolor colorpicker textpattern toc'
            ],
            toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link',
            toolbar2: 'print preview | forecolor backcolor',
            content_css: [
                '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                '//www.tinymce.com/css/codepen.min.css'
            ]
        });
    </script>
</head>