$(function(){
    $('.confirm-modal').on('click', function(){
        var $this = $(this);
        var action = $this.data('href');
        $('.confirm-modal-form').attr('action', action);
    });

    $('input[type=checkbox]').each(function(){
        var self = $(this),
            label = self.next(),
            label_text = label.text();

        label.remove();
        self.iCheck({
            checkboxClass: 'icheckbox_line-blue',
            radioClass: 'iradio_line-blue',
            insert: '<div class="icheck_line-icon"></div>' + label_text
        });
    });

    $(".file-input").fileinput({
        showCaption: false,
        showUpload: false,
        browseLabel: 'Добави снимка',
        removeLabel: 'Изтрий',
        browseIcon: '<i class="fa fa-image"></i>',
        removeIcon: '<i class="fa fa-ban"></i>',
        browseClass: 'btn btn-success',
        removeClass: 'btn btn-danger',
        fileActionSettings: {
            zoomIcon: '<i class="fa fa-search-plus"></i>',
            zoomTitle: 'Виж детайли'
        },
    });

    $(".doc-input").fileinput({
        showCaption: false,
        showUpload: false,
        browseLabel: 'Добави документ',
        removeLabel: 'Изтрий',
        browseIcon: '<i class="fa fa-archive"></i>',
        removeIcon: '<i class="fa fa-ban"></i>',
        browseClass: 'btn btn-success',
        removeClass: 'btn btn-danger',
        fileActionSettings: {
            zoomIcon: '<i class="fa fa-search-plus"></i>',
            zoomTitle: 'Виж детайли'
        },
    });

    $('.multiple-select').select2({
        allowClear: true,
        cache: false
    });

    $('.select2').select2();

    $('multiple-select-thumb').select2({
        templateResult: formatThumb
    });

    function formatThumb (thumb) {
        if (!thumb.id) { return thumb.text; }
        var $thumb = $(
            '<span><img src="vendor/images/flags/' + state.element.value.toLowerCase() + '.png" class="img-flag" /> ' + state.text + '</span>'
        );
        return $thumb;
    };

    $('#wizard_verticle').smartWizard({
        transitionEffect: 'fade',
        enableAllSteps: true,
        labelNext: '',
        labelPrevious: '',
        labelFinish: ''
    });

    $('.stepContainer').css('height', $('.stepContainer').height() + 145);
    $('.stepContainer, .wizard_steps').css('padding-top', 20);

    $(".file-input").fileinput({
        showCaption: false,
        showUpload: false,
        browseLabel: 'Добави снимка',
        removeLabel: 'Изтрий',
        browseIcon: '<i class="fa fa-image"></i>',
        removeIcon: '<i class="fa fa-ban"></i>',
        browseClass: 'btn btn-success',
        removeClass: 'btn btn-danger',
        fileActionSettings: {
            zoomIcon: '<i class="fa fa-search-plus"></i>',
            zoomTitle: 'Виж детайли'
        },
    });

    $('.file-change').fileinput({
        showCaption: false,
        showUpload: false,
        browseLabel: 'Промени снимка',
        removeLabel: 'Изтрий',
        browseIcon: '<i class="fa fa-image"></i>',
        removeIcon: '<i class="fa fa-ban"></i>',
        browseClass: 'btn btn-warning',
        removeClass: 'btn btn-danger',
        fileActionSettings: {
            zoomIcon: '<i class="fa fa-search-plus"></i>',
            zoomTitle: 'Виж детайли'
        },
    });

    $('#sortable').sortable();
});

$('#toggle-filter').on('click', function(){
    $('.custom-well').slideToggle();
});