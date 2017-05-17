var Config = {
    facebook_id: '1102947149780878'
}

var $lang = '';
if (typeof window.lang != 'undefined' && window.lang != null && window.lang != 'en') {
    $lang = '_'+window.lang;
}

var $language = '';
if (typeof window.language != 'undefined' && window.language != null && window.language != '_en') {
    $language = window.language;
}

var module_video = (function($) {
    'use strict'

    var object = {};

    var helpers = {
        ajax: function(url, type, data, headers, success, error) {
            $.ajax({
                url: url,
                type: type,
                dataType: 'json',
                cache: false,
                beforeSend: function (xhr) {
                    $.each(headers, function (inx, value) {
                        xhr.setRequestHeader(inx, value);
                    });
                },
                data: data,
                success: function (data) {
                    if (typeof success == 'function') {
                        success(data);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (typeof error == 'function') {
                        error(data);
                    }
                }
            });
        }
    };

    var methods = {
        youtube_id: null,
        start: -1,
        end: -1,
        watched_url: '',
        comments_url: '',
        video_id: 0,
        picture: '',
        name: '',
        description: '',
        link: '',
        user_videos: [],
        unit_videos: [],
        player: null,
        comments: [],
        max_items_per_page: 5,
        current_page: 1,
        passed_current_unit: false,
        has_exam: false,

        init: function(data) {
            this.youtube_id = data.youtube_id || null;
            this.picture = data.picture,
            this.name = data.name,
            this.description = data.description,
            this.link = data.link,
            this.video_id = data.video_id || 0,
            this.start = parseInt(data.start) || -1;
            this.end = parseInt(data.end) || -1;
            this.watched_url = data.watched_url || '';
            this.comments_url = data.comments_url || '';

            if (typeof window.unit_progress_data != 'undefined' && window.unit_progress_data) {
                this.user_videos = window.unit_progress_data['user_videos'] || [];
                this.passed_current_unit = window.unit_progress_data['passed_exam'] || false;
                this.has_exam = window.unit_progress_data['has_exam'] || false;
            }

            if (typeof window.unit_videos != 'undefined' && window.unit_videos) {
                this.unit_videos = window.unit_videos;
            }

            if (typeof window.comments != 'undefined' && window.comments.length > 0) {
                this.comments = window.comments;
            }

            if (typeof window.max_items_per_page != 'undefined' && window.max_items_per_page > 0) {
                this.max_items_per_page = parseInt(window.max_items_per_page);
            }

            this.pagingBoxes();
        },
        manageUnitProgress: function(video_id) {
            if (video_id && this.user_videos.indexOf(video_id) < 0) {
                this.user_videos.push(video_id);
            }
            if (this.unit_videos.length < 1) {
                return 0;
            }
            var $that = this;
            var progress = 0;
            $.each($that.user_videos, function(i, id) {
                $.each($that.unit_videos, function(i, unit) {
                    if (unit.ID == id) {
                        progress++;
                        return false;
                    }
                });
            });

            var length = $that.unit_videos.length;

            if (length == progress) {
                $('.exam-box').removeClass('disabled');
            } else {
                $('.exam-box').addClass('disabled');
            }

            if (this.has_exam) {
                if (this.passed_current_unit) {
                    length++;
                    progress++;
                } else {
                    length++;
                }
            }

            if (length > 0) {
                progress = Math.round((progress * 100 / length));
            } else {
                progress = 0;
            }
            return progress;
        },
        setYouTube: function() {
            var $that = this;
            var height = $('#player').height();

            if ($that.start > -1 && $that.end > -1) {
                $that.player = new YT.Player('player', {
                    width: '100%',
                    height: height,
                    videoId: $that.youtube_id,
                    playerVars: {
                        start: $that.start,
                        end: $that.end,
                        rel: 0
                    },
                    events: {
                        'onReady': methods.onPlayerReady,
                        'onStateChange': methods.onPlayerStateChange
                    }
                });
            } else {
                $that.player = new YT.Player('player', {
                    width: '100%',
                    height: height,
                    videoId: $that.youtube_id,
                    events: {
                        'onReady': methods.onPlayerReady,
                        'onStateChange': methods.onPlayerStateChange
                    }
                });
            }
        },
        shareFacebook: function() {
            var $that = this;
            FB.getLoginStatus(function(response) {
                FB.ui({
                    method: "feed",
                    display: "iframe",
                    link: $that.link,
                    caption: $that.link,
                    name: $that.name,
                    description: $that.description,
                    picture: $that.picture
                }, function(response) {

                });
            });
        },
        onPlayerReady: function(event) {
            event.target.playVideo();
        },
        onPlayerStateChange: function(event) {
            if (event.data === 0) {
                methods.watchedVideo();
            }

            if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
                $('#video-container .unit-videos').fadeIn();
            } else {
                $('#video-container .unit-videos').fadeOut();
            }
        },
        watchedVideo: function() {
            var $that = this;
            var headers = {
                'X-CSRF-TOKEN': $('#video-container input[name="_token"]').val()
            };

            helpers.ajax(methods.watched_url, 'POST', {}, headers, function(data) {
                var body = $("html, body");
                body.stop().animate({scrollTop:0}, '500', 'swing', function() {
                    $that.player.pauseVideo();
                    $('#related_' + methods.video_id).addClass('seen');
                    var progress = methods.manageUnitProgress(methods.video_id);
                    $('.unit-videos .border .inner').width(progress + '%');
                    $('.unit-videos .value span').text(progress);
                });
            }, function(data) {});
        },
        paging: function(current_page) {
            var items = this.comments;
            var max_per_page = this.max_items_per_page;
            var page_count = Math.ceil(items.length / max_per_page);
            var result = {items: [], page: 1};
            var page = 1;
            if (current_page > page_count) {
                // return last page
                page = page_count;
            } else {
                page = current_page;
            }

            this.current_page = page;
            result.page = page;
            var from = (page - 1) * max_per_page;
            var to = page * max_per_page;

            if (typeof items[from] != 'undefined') {
                while (from < to && from < items.length) {
                    result.items.push(items[from]);
                    from++;
                }
            }

            return result;
        },
        pagingBoxes: function() {
            var items = this.comments;
            var max_per_page = this.max_items_per_page;
            var page_count = Math.ceil(items.length / max_per_page);
            var total_boxes = $('#comments .page').size();

            if (total_boxes < page_count) {
                for (var i = total_boxes + 1; i <= page_count; i++) {
                    $('#comments .paging').append('' +
                        '<div data-value="' + i + '" class="page page' + i + ' ">' + i + '</div>' +
                    '');
                }
                total_boxes = page_count;
            }

            $('#comments .page').addClass('hide');
            for (var i = this.current_page - 5; i < this.current_page + 5; i++) {
                if (i > 0) {
                    $('#comments .page' + i).removeClass('hide');
                }
            }

            $('#comments .more').remove();

            if (this.current_page + 5 <= page_count) {
                $('#comments .page' + page_count).removeClass('hide');
                if (page_count -(this.current_page + 5) > 0) {
                    $('<span class="more">...</span>').insertBefore('#comments .page' + page_count);
                }
            }

            if (this.current_page - 5 >= 1) {
                $('#comments .page1').removeClass('hide');
                if (this.current_page - 5 - 1 > 0) {
                    $('<span class="more">...</span>').insertAfter('#comments .page1');
                }
            }
        },
        setNewComment: function(comment) {
            this.comments.unshift(comment);
            this.pagingBoxes();
            var result = this.paging(this.current_page);
            this.setVisibleComments(result.items);
        },
        setVisibleComments: function(items) {
            $('#comments .comments-container').children().hide();
            for (var i = 0; i < items.length; i++) {
                $('#comment' + items[i].ID).removeClass('hide').fadeIn();
            }
        }
    }

    var actions = {
        set: function() {
            $('.item.like').mousedown(function() {
                $('#video .like').addClass('ok');
            });

            $('#video .video-end button').click(function() {
               if ($(this).hasClass('disabled')) {
                   return false;
               } else {
                   $('#video .video-end button').addClass('disabled');
               }

                methods.watchedVideo();
            });

            $('#video .tab-title').on('click', function() {
                if ($(this).hasClass('active')) {
                    return false;
                }

                var tab = $(this).data('tab');
                if (tab) {
                    $('#video .tab-title').removeClass('active');
                    $(this).addClass('active');

                    $('#video .tab').slideUp();
                    $(tab).slideDown();
                }
            });

            $('#video .unit-videos .hide-arrow').on('click', function() {
                $('#video .unit-videos').addClass('not-active');
            });
            $('#video .unit-videos .show-arrow').on('click', function() {
                $('#video .unit-videos').removeClass('not-active');
            });

            $('#video .tabs li').on('click', function () {
                if ($(this).hasClass('active')) {
                    return false;
                }

                var tab = $(this).data('tab');
                if (tab) {
                    $('#video .tabs li').removeClass('active');
                    $(this).addClass('active');

                    $('#video .tab-content').children().hide();
                    $(tab).fadeIn();
                }
            });

            $('#video .share-video').on('click', function() {
                methods.shareFacebook();
            });

            $('#video_details .more .link').on('click', function() {
                $('#video-information').fadeIn();
                $('html, body').animate({
                    scrollTop: $('#video-tabs').offset().top - 20
                }, 600);
            });

            $('#comments').on('click', '.page', function() {
                var page = $(this).data('value');

                if ($(this).hasClass('current')) return false;

                var result = methods.paging(parseInt(page));
                $('#comments .page').removeClass('current');
                $(this).addClass('current');

                methods.setVisibleComments(result.items);
                methods.pagingBoxes();
            });

            $('.comments_number').on('click', function() {
                $('#comments').fadeToggle();
            });

            $(document).on('click', '.exam-box.disabled', function() {
                return false;
            });
            $(document).on('click', '.exam-box.seen', function() {
                return false;
            });

            $('#video #your-comment').on('click', function() {
                var text = $('#your-text').val();
                $('#your-text').css('border-color', '#ccc');
                if (text == '') {
                    $('#your-text').css('border-color', 'red');
                    return false;
                }

                var headers = {
                    'X-CSRF-TOKEN': $('#video .your-comment input[name="_token"]').val()
                };

                helpers.ajax(methods.comments_url, 'POST', {text: text}, headers, function(data) {
                    if (data && typeof data['error'] != 'undefined' && data['error'] == 0) {
                        $('#your-text').val('');
                        var d = new Date();

                        var month_names = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                        ];

                        var image = $('#video .your-comment .image').data('image');

                        var $box = $('\
                            <div id="comment' + data.comment.ID + '" class="comment hide">\
                                <div class="image col-xs-12" style="background-image:url(' + image + ')"></div>\
                                <div class="comment-container col-xs-12">\
                                    <div class="user">' + window.me.name + '<span class="date">on ' + month_names[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</span></div>\
                                    <div class="text">' + text + '</div>\
                                </div>\
                            </div>');

                        var number = parseInt($('.comments_number').data('value'));
                        number++;
                        $('.comments_number').data('value', number);
                        $('.comments_number span').text(number);

                        $('#comments .comments-container').prepend($box);

                        methods.setNewComment(data.comment);


                        /*if (methods.current_page == 1) {
                            $box.removeClass('hide').fadeIn();
                        }*/
                    }
                }, function(data) {});
            });
        }
    };

    object.methods = methods;
    object.helpers = helpers;
    object.actions = actions;

    return object;
})(jQuery);

var module = (function($) {
    'use strict'
    var object = {};

    var methods = {
        googleMaps: function(input_id, coordinates_input_id, input_place_id) {
            this.id = input_id;
            this.coordinates_input_id = coordinates_input_id;
            this.input_place_id = input_place_id;
            this.autocomplete = null;
            var $that = this;

            if (typeof methods.googleMaps.prototype.set === 'undefined') {
                methods.googleMaps.prototype.set = function () {
                    var $address = document.getElementById($that.id);
                    if ($address) {
                        $that.autocomplete = new google.maps.places.Autocomplete($address);
                        $that.autocomplete.addListener('place_changed', $that.changeAddress);
                    }
                }
            }

            if (typeof methods.googleMaps.prototype.changeAddress === 'undefined') {
                methods.googleMaps.prototype.changeAddress = function () {
                    var place = $that.autocomplete.getPlace();
                    document.getElementById($that.input_place_id).value = place.place_id;
                    document.getElementById($that.coordinates_input_id).value = place.geometry.location.lat() + ', ' + place.geometry.location.lng();
                }
            }
        }
    };

    var actions = {
        set: function() {
            $('#password_change').click(function() {
                if($(this).is(':checked')) {
                    $('.password').fadeIn();
                } else {
                    $('.password').fadeOut();
                }
            });

            $('#remove-action').click(function() {
                $('#image-remove').val(1);
                $('.user-photo').removeClass('active');
                $('#preview-image').css('background-image', 'url(../images/user.png)');
            });

            var url = $("#drop-area").data('url');
            var token = $("#drop-area").find('input[name="_token"]').val();
            $("#drop-area").dmUploader({
                url: url,
                dataType: 'json',
                allowedTypes: 'image/*',
                maxFileSize: 5242880,
                maxFiles: 1,
                extraData: {
                    '_token': token
                },
                method: 'POST',
                onInit: function () {},
                onBeforeUpload: function (id) {
                    $('#progress-bar .inner').width(0);
                },
                onNewFile: function (id, file) {
                },
                onComplete: function () {},
                onUploadProgress: function (id, percent) {
                    var percent_str = percent + '%';
                    $('#progress-bar .inner').width(percent_str);
                },
                onUploadSuccess: function (id, data) {
                    if (data && data['error'] == 0) {
                        $('#image-remove').val(0);
                        $('#preview-image').css('background-image', 'url(' + data.image.url + ')');
                        $('#preview-image-path').val(data.image.path);
                        $('.user-photo').addClass('active');
                    }
                },
                onUploadError: function (id, message) {

                },
                onFileTypeError: function (file) {},
                onFileSizeError: function (file) {},
                onFallbackMode: function (message) {}
            });
        }
    };

    object.methods = methods;
    object.actions = actions;

    return object;

    var Actions = {
        set: function () {

            $('.tabs').each(function() {
                var $tabs = $(this);
                $('.item', this).on('click', function() {
                    var id = $(this).data('id');
                    if (id) {
                        $tabs.children().removeClass('active');
                        $(this).addClass('active');
                        $('#' + id).addClass('active');
                    }
                });
            });

            $('#set_user').each(function () {
                $('#change_password').on('change', function () {
                    if ($(this).is(":checked")) {
                        $('#exampleInputPassword1').prop('disabled', false);
                        $('#exampleInputPassword2').prop('disabled', false);
                    } else {
                        $('#exampleInputPassword1').prop('disabled', true);
                        $('#exampleInputPassword2').prop('disabled', true);
                    }
                });
            });$


            $('.delete-image').on('click', function() {
                $('[name="delete-image"]').val(1);
                $(this).closest('.form-group').remove();
            });

            $('[data-toggle="modal"]').on('click', function () {
                var target_id = $(this).data('target');
                var $target = $('#' + target_id);
                var href = $(this).data('href');

                if (href) {
                    $target.find('a.btn').attr('href', href);
                }

                $target.addClass('in').addClass('fade');
            });

            $('[data-dismiss="modal"]').on('click', function () {
                var $target = $(this).closest('.modal');
                $target.removeClass('in').removeClass('fade');
            });

            $('#categories-tree-view').each(function () {
                var list = new Helper.listItems('categories-tree-view', 'input_parent', false, [parseInt($('[name="ID"]').val())]);
                list.initValues();
                list.setActions();
            });

            $('#units-table').each(function () {
                var list_units = new Helper.listItems('units-table', 'input_parent', false, false);
                list_units.initValues();
                list_units.setActions();
            });

            $('#categories-tree-view-multiple').each(function () {
                var list_multiple = new Helper.listItems(
                    'categories-tree-view-multiple', 'input_parent_multiple',
                    true, [], function(operation_type, category_id) {
                        if (operation_type == 'add') {
                            $('#selected_categories .row-' + category_id).removeClass('hidden');
                        } else {
                            $('#selected_categories .row-' + category_id).addClass('hidden');
                        }

                        var visible_items_count = $('#selected_categories .category-item:not(.hidden)').size();

                        if (visible_items_count > 0) {
                            $('#selected_categories .empty').addClass('hidden');
                        } else {
                            $('#selected_categories .empty').removeClass('hidden');
                        }
                    });

                list_multiple.initValues();
                list_multiple.setActions();
            });

            $('#set_video').each(function () {
                $('#input_url').on('change', function () {
                    var url = $(this).val();
                    var youtube = Helper.validateYouTubeUrl(url);
                    if (youtube) {
                        $('#youtube_preview').attr('src', 'http://www.youtube.com/embed/' + youtube + '?autoplay=0').addClass('video');
                    } else {
                        $('#youtube_preview').removeClass('video');
                    }
                });

                $('#input_url').trigger('change');
            });
        }
    };
})(jQuery);

var module_mindmap = (function($) {
    'use strict'
    var object = {};

    var helpers = {
        createEdge: function(id, x1, y1, x2, y2, width, color, hidden) {
            var line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('id', id);
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', width);

            if (hidden) {
                line.setAttribute('class', 'not-visible');
            }

            return line;
        },
        createGroup: function(id) {
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute("id", id);
            group.setAttribute("width", '100%');
            group.setAttribute("height", '100%');

            return group;
        },
        createNode: function(id, parent_id, parent, name, description, image, related, children, type, progress, points) {
            this.id = id;
            this.parent_id = parent_id;
            this.name = name;
            this.description = description;
            this.level = 0;
            this.color = '#ffffff';
            this.active = false;
            this.parent = parent || null;
            this.related = related;
            this.children = children || [];
            this.progress = progress || 0;
            this.type = type || 'category';
            this.sibling = null;
            this.image = image;
            this.points = points || 0;

            if (typeof helpers.createNode.prototype.addChilde == 'undefined') {
                helpers.createNode.prototype.addChilde = function(childe) {
                    if (childe instanceof helpers.createNode) {
                        this.children.push(childe);
                    }
                }
            }
        }
    };

    object.helpers = helpers;
    var all_nodes = [];
    var nodes_units = [];
    var root = new helpers.createNode(0, -1, null, 'ROOT', 'ROOT', 0, null, [], 'category', 0);
    root.active = true;
    var units_relations = window.units_relations || [];
    var related_units = [];
    var related_edges = [];
    var selected_unit_id = 0;
    var active_subcategories = [];
    var last_active_node = null;
    var medals = [];
    var exams_array = [];
    var $slick_units = null
    var slick_slides = 0;

    var methods = {
        slick_slides: 0,
        init: function() {
            if (typeof window.all_categories != 'undefined' && window.all_categories) {
                $.each(window.all_categories, function (inx, item) {

                    if (typeof item['name'] != 'undefined' && $language == '_bg') {
                        item['name'] = item['name_bg'];
                    }

                    if (typeof item['description'] != 'undefined' && $language == '_bg') {
                        item['description'] = item['description_bg'];
                    }

                    if (typeof item['questions'] != 'undefined' && $language == '_bg') {
                        item['questions'] = item['questions_bg'];
                    }
                    
                    var image_url = '';
                    if (typeof item['image_data'] != 'undefined' && item['image_data'] && typeof item['image_data']['url'] != 'undefined') {
                        image_url = item.image_data.image;
                    }
                    var new_node = new helpers.createNode(item.ID, item.parent_id, null, item['name'+$lang], item.description, image_url, null, []);
                    if (item.parent_id < 1) {
                        new_node.active = true;
                    }
                    all_nodes.push(new_node);
                });
            }

            if (typeof window.all_medals != 'undefined' && window.all_medals) {
                medals = window.all_medals;
            }

            if (typeof window.all_exams != 'undefined' && window.all_exams) {
                exams_array = window.all_exams;
            }

            if (typeof window.all_units != 'undefined' && window.all_units) {
                $.each(window.all_units, function (inx, item) {
                    var image_url = '';
                    if (typeof item['image_data'] != 'undefined' && item['image_data'] && typeof item['image_data']['url'] != 'undefined') {
                        image_url = item.image_data.image;
                    } else if (item['image']) {
                        image_url = item.image;
                    }

                    var progress = 0;

                    if (typeof item.progress != 'undefined') {
                        progress = item.progress
                    }

                    /*
                    if (typeof window.user_videos != 'undefined' && user_videos.length > 0 && typeof item.videos != 'undefined' && item.videos.length > 0) {
                        var u_v = window.user_videos.map(Number);
                        $.each(item.videos, function(i, n) {
                            if (u_v.indexOf(n.ID) > - 1) {
                                progress++;
                            }
                        });
                        
                        progress /= item.videos.length;
                        progress = Math.round(progress * 100);
                    }
                    */
                    nodes_units.push(new helpers.createNode(item.ID, item.category_id, null, item['name'+$lang], item.description, image_url, null, [], 'unit', progress, item.points));
                });
            }

            this.setTreeModel(all_nodes, root, 0);
        },
        scaleTree: function($inner, $outer) {
            var h_inner = $inner.height();
            var h_outer = $outer.height();
            var wants = h_outer * 0.88;

            //if (h_inner < wants) {
                $inner.css({
                    'transform': 'scale(' + wants / h_inner + ')',
                    '-webkit-transform': 'scale(' + wants / h_inner + ')',
                    '-ms-transform': 'scale(' + wants / h_inner + ')',
                    '-moz-transform': 'scale(' + wants / h_inner + ')',
                    '-o-transform': 'scale(' + wants / h_inner + ')'
                });
            //}
        },
        setCategoryUnitsContainerPosition: function($units_container, $center_element, $left_container) {
            var left_position = $left_container.offset();
            var cat_width = $left_container.get(0).getBoundingClientRect().width;
            var cat_height = $left_container.get(0).getBoundingClientRect().height;
            var height = $center_element.outerHeight();
            var units_height = $units_container.height();
            var window_height = window.innerHeight + $('nav').height();

            height += 2 * $('nav.navbar').outerHeight();
            if (cat_height > units_height) {
                $units_container.css({
                    'top': ((window_height - height) / 2) + 'px',
                    'left': (left_position.left + cat_width) + 'px',
                });
            } else {
                var $first = $('.category', $left_container).first();
                var top = $first.offset().top;
                $units_container.css({
                    'top': top + 'px'
                });
            }
        },
        showTreeMobileSubCategories: function(id, $node) {
            var node = methods.getNodeByID(id);
            var $that = this;

            if (!node || !node.id ) return false;

            $('.categories-list .sub .category').removeClass('active');
            $node.toggleClass('active');

            $node.closest('.row.main').children('.sub').slideToggle();
        },
        showCategoriesMobileChildren: function(id, $node) {
            var node = methods.getNodeByID(id);
            var $that = this;

            if (!node || !node.id ) return false;

            $('.categories-list .sub .category').removeClass('active');
            $node.toggleClass('active');

            if (node.children && node.children.length > 0) {
                $node.closest('.row.main').find('.sub').slideToggle();
            } else if (node.units && node.units.length > 0) {
                var $sub = $('#categories-units .container');
                var first = node.units[0];
                if (first) {
                    var index = $('#unit-' + first.id).data('index');
                    if (index > -1) {
                        $sub.slick('slickGoTo', parseInt(index));
                    }

                    $('#categories-units').addClass('active');
                }
            } else {
                var $sub = $('#categories-units .container');
                $('#categories-units h1').hide();
                if (methods.slick_slides > 0) {
                    for (var i = 0; i < methods.slick_slides; i++) {
                        $sub.slick('removeSlide', null, null, true);
                    }
                }
            }

            var height = $('#categories-units .slick-slider').outerHeight();
            $('#categories-units').css('margin-top', (height / -2));
        },
        showCategoriesChildren: function(id, $node) {
            var node = methods.getNodeByID(id);
            var $that = this;

            if (!node || !node.id ) return false;

            // show background video
            if (node.parent_id == 0) {
                $('#video_background .flash').fadeIn('fast', function() {
                    $('#video_background video').removeClass('active');
                    var $selected = $('#video_background video.' + node.id);
                    $selected.get(0).play();
                    $selected.addClass('active');
                    $('#video_background .flash').fadeOut('fast');
                });
            }

            // reset blue class
            var active_node = false;
            if ($node.hasClass('active')) {
                active_node = true;
            } else {
                $.each(node.children, function(i, c) {
                    if (c.active) {
                        active_node = true;
                        return false;
                    }
                });
            }

            $('#categories .category').removeClass('active');

            if (!active_node) {
                $node.addClass('active');
            }
            //$('#edges line').removeClass('blue');

            //back propagate the blue color (old)
            /*
            var current = node;
            while (current) {
                var par = current.parent || null;
                $('#' + current.type + current.id).closest('.category').addClass('active');
                if (par) {
                    $('#' + current.type + current.id + '_' + par.type + par.id).addClass('blue');
                }
                current = par;
            }
            */

            if (node.children && node.children.length > 0) {

                if (!active_node) {
                    actions.showCategoriesChildren(node.children);
                }

                if (last_active_node) {
                    var c0 = null;
                    if (last_active_node.children && last_active_node.children.length > 0) {
                        c0 = last_active_node.children[0];
                        $.each(last_active_node.children, function (i, childe) {
                            childe.active = false;
                            $.each(last_active_node.children, function(i, childe) {
                                $('#' + childe.type + childe.id).closest('.category').hide();
                            });
                        });



                        $('#' + c0.type + c0.id).closest('.sub').slideUp({
                            duration: 300,
                            step: function () {
                                $that.setCategoriesEdges(id);
                            },
                            complete: function() {
                                $that.setCategoriesEdges(id);
                            }
                        });
                    }
                }

                $.each(node.children, function(i, childe) {
                    if (active_node) {
                        childe.active = false;
                    } else {
                        childe.active = true;
                    }
                });

                /*
                $('.top.table').each(function(i, n) {
                    parent_height /
                });
                */

                var childe0 = node.children[0];

                setTimeout(function() {
                    last_active_node = node;
                    if (active_node) {

                        $.each(node.children, function(i, childe) {
                            $('#' + childe.type + childe.id).closest('.category').hide();
                        });

                        $('#' + childe0.type + childe0.id).closest('.sub').slideUp({
                            duration: 300,
                            step: function () {
                                $that.setCategoriesEdges(id);
                            },
                            complete: function() {
                                $that.setCategoriesEdges(id);
                            }
                        });
                    } else {
                        $('#' + childe0.type + childe0.id).closest('.sub').slideDown({
                            duration: 300,
                            step: function () {
                                $that.setCategoriesEdges(id);
                            },
                            complete: function() {
                                $that.setCategoriesEdges(id);
                                $.each(node.children, function(i, childe) {
                                    $('#' + childe.type + childe.id).closest('.category').fadeIn({
                                        duration: 200,
                                        step: function () {
                                            $that.setCategoriesEdges(id);
                                        },
                                        complete: function() {
                                            $that.setCategoriesEdges(id);
                                        }
                                    });
                                });
                            }
                        });
                    }
                }, 300);
            } else if (node.units && node.units.length > 0) {
                if (!active_node) {
                    actions.showCategoriesChildren([node]);
                }
                var $sub = $('#categories-units .container');
                var first = node.units[0];
                $('#categories-units h1.title').show();
                if (first) {
                    var index = $('#unit-' + first.id).data('index');
                    if (index > -1) {
                        $sub.slick('slickGoTo', parseInt(index));
                    }
                }
            } else {
                var $sub = $('#categories-units .container');
                //$('#categories-units h1').hide();
            }
        },
        showSubCategories: function(id) {
            var node = methods.getNodeByID(id);
            var $sub = $('#sub-categories .container');

            if (node.children.length > 0) {
                var first = node.children[0];
                if (first) {
                    var index = $('#box' + first.id).data('index');
                    if (index > -1) {
                        $sub.slick('slickGoTo', parseInt(index));
                    }
                }
            }
        },
        showSubCategoriesMobile: function(id) {
            var node = this.getNodeByID(id);

            if (!node || !node.children) return false;

            //var height = $('#sub-categories').outerHeight();
            //$('#sub-categories').css('margin-top', (-height / 2) + 'px');

            var $sub = $('#sub-categories .container');
            var first = node.children[0];
            if (first) {
                var index = $('#box' + first.id).data('index');
                if (index > -1) {
                    $sub.slick('slickGoTo', parseInt(index));
                }

                $('#sub-categories').addClass('active');
            }
        },
        findUnit: function(id) {
            var result = null;
            $.each(nodes_units, function(inx, node) {
                if (node.id == id) {
                    result = node;
                    return false;
                }
            });

            return result;
        },
        clearRelatedNodes: function() {
            $('#related_edges').empty().removeClass('active');
            $('#medals-mindmap .medal').removeClass('selected');
            if (related_edges.length > 0) {
                related_edges = [];
            }

            if (related_units.length > 0) {
                $.each(related_units, function(u, unit) {
                    $('#' + unit.type + unit.id).closest('.unit').removeClass('related').removeClass('center');
                });
                related_units = [];
            }

            $('#mindmap-tree .mask').fadeOut();
            // $('#unit-info').removeClass('active');
        },
        clickedMedal: function(id) {
            this.clearRelatedNodes();
            // find medal
            var current_medal = null;
            $.each(medals, function(i, medal) {
                if (medal.ID == id) {
                    current_medal = medal;
                }
            });

            if (!current_medal || !current_medal.exams || current_medal.exams.length < 1) return false;

            $.each(current_medal.exams, function(i, medal_exam) {
                $.each(exams_array, function(j, exam) {
                    if (exam.ID == medal_exam.exam_id) {
                        related_units.push({
                            id: exam.unit_id,
                            type: 'unit'
                        });
                    }
                });
            });

            var $that = this;
            $('#medal' + id).addClass('selected');

            if (related_units.length > 0) {
                var group = helpers.createGroup('group');
                $('#mindmap-tree .mask').fadeIn();
                $('#medal' + current_medal.id).addClass('selected');

                // sort units by vertical position
                var sorted_units = [];
                $.each(related_units, function(i, item) {
                    var $unit = $('#' + item.type + item.id).closest('.unit');
                    if ($unit && typeof $unit.offset() != 'undefined') {
                        sorted_units.push({
                            top: $unit.offset().top,
                            item: item
                        });
                        $unit.closest('.unit').addClass('related');
                        // create an edge and a new group
                    }
                });

                sorted_units.sort(function(a, b) {
                    return parseFloat(a.top) - parseFloat(b.top);
                });

                // add edges
                var last_unit = null;
                $.each(sorted_units, function(i, u) {
                    if (last_unit) {
                        var id = u.item.type + u.item.id;
                        var parent_id = last_unit.item.type + last_unit.item.id;

                        // set inner edges
                        var edge = $that.setEdge(id, parent_id, '#ffffff', 4);

                        if (edge) {
                            group.appendChild(edge);
                        }
                    }
                    last_unit = u;
                })

                $that.setUnitBox(sorted_units[0].item.id);

                $('#related_edges').html(group).addClass('active');

                $('html, body').animate({
                    scrollTop: sorted_units[0].top - 30 - $('nav.navbar').outerHeight()
                }, 600);
            }
        },
        setUnitBox: function(unit_id) {
            $('#unit-info').removeClass('active');
            var unit = this.findUnit(unit_id);

            if (!unit) return false;

            var $unit = $('#' + unit.type + unit.id).closest('.unit');

            if (!$unit) return false;

            $('.unit').removeClass('center');
            $unit.addClass('center');

            setTimeout(function() {
                $('#unit-info .title').text(unit['name' + $lang]);
                $('#unit-info .points').text(unit.points + (unit.points < 2 ? 'pt.' : 'pts.'));
                $('#unit-info .description').text(unit.description);
                $('#unit-info .image-container').css('background-image', 'url(' + unit.image + ')');
                $('#unit-info .unit-button').prop('href', $unit.data('href'));
                var height = $('#unit-info').outerHeight();
                var header_height = $('nav.navbar').outerHeight();
                $('#unit-info').css('margin-top', (height / -2));

                $('#unit-info').addClass('active');
            }, 500);
        },
        hasRelatedUnits: function(id) {
            var result = false;

            $.each(units_relations, function(inx, node) {
                if (node.unit_id_one == id) {
                    result = true;
                    return false;
                } else if (node.unit_id_two == id) {
                    result = true;
                    return false;
                }
            });

            return result;
        },
        clickedUnit: function(id) {
            this.clearRelatedNodes();
            var node = this.findUnit(id);

            $.each(units_relations, function(inx, node) {
                if (node.unit_id_one == id) {
                    related_units.push({
                        id: node.unit_id_two, type: 'unit'
                    });
                } else if (node.unit_id_two == id) {
                    related_units.push({
                        id: node.unit_id_one, type: 'unit'
                    });
                }
            });
            
            if (node && typeof node.type != 'undefined' && node.type == 'unit') {
                var $that = this;
                $that.setUnitBox(node.id);

                if (related_units.length > 0) {
                    var group = helpers.createGroup('group');
                    $('#mindmap-tree .mask').fadeIn();
                    $('#' + node.type + node.id).closest('.unit').addClass('center');
                    related_units.push(node);
                    var sorted_units = [];
                    $.each(related_units, function(i, item) {
                        var $unit = $('#' + item.type + item.id).closest('.unit');
                        if ($unit) {
                            sorted_units.push({
                                top: $unit.offset().top,
                                item: item
                            });
                            $unit.closest('.unit').addClass('related');
                            // create an edge and a new group
                        }
                    });

                    sorted_units.sort(function(a, b) {
                        return parseFloat(a.top) - parseFloat(b.top);
                    });

                    // add edges
                    var last_unit = null;
                    $.each(sorted_units, function(i, u) {
                        if (last_unit) {
                            var id = u.item.type + u.item.id;
                            var parent_id = last_unit.item.type + last_unit.item.id;

                            // set inner edges
                            var edge = $that.setEdge(id, parent_id, '#ffffff', 4);

                            if (edge) {
                                group.appendChild(edge);
                            }
                        }
                        last_unit = u;
                    })

                    $('#related_edges').html(group).addClass('active');

                    $('html, body').animate({
                        scrollTop: sorted_units[0].top - 30 - $('nav.navbar').outerHeight()
                    }, 600);
                }
            }
        },
        setTreeModel: function(nodes, parent, level) {
            var result = [];
            var $that = this;
            level++;
            $.each(nodes, function(inx, item) {
                if (parseInt(item.parent_id) == parseInt(parent.id)) {
                    item['parent'] = parent;
                    item['parent_id'] = parent.id;
                    item['level'] = level;
                    item['units'] = [];
                    $.each(nodes_units, function(inx, unit) {
                        if (unit.parent_id == item.id) {
                            item['units'].push(unit);
                        }
                    });

                    if (item.id > 0) {
                        parent.addChilde(item);
                        $that.setTreeModel(nodes, item, level);
                    }
                }
            });
        },
        getNodeByID: function(id) {
            var n = {};
            var queue = [root];
            var work = true;
            while (queue.length > 0 && work) {
                var for_delete = [];
                $.each(queue, function(node_inx, node) {
                    if (node.id == id) {
                        work = false;
                        n = node;
                        return false;
                    }
                    if (node.children && node.children.length > 0) {
                        $.each(node.children, function (inx, item) {
                            queue.push(item);
                        });
                    }
                    for_delete.push(node_inx);
                });

                var temp_q = [];
                $.each(queue, function(i, v) {
                    if (for_delete.indexOf(i) == -1) {
                        temp_q.push(v);
                    }
                });

                queue = temp_q;
            }

            return n;
        },
        setNodeValueByID: function(id, attribute, value) {
            var n = {};

            $.each(all_nodes, function(i, node) {
                if (node.id == id) {
                    if (typeof all_nodes[i][attribute] != 'undefined') {
                        all_nodes[i][attribute] = value;
                    }
                    n = node;
                    return false;
                }
            });

            return n;
        },
        getProgressForUnit: function(unit_id) {
            var progress = 0;

            if (unit_id) {
                $.each(nodes_units, function(i, u) {
                    if (u.id == unit_id) {
                        progress = Math.round(u.progress);
                        return false;
                    }
                });
            }

            return progress;
        },
        setProgress: function() {
            var user_progress = window.user_enrollments;
            var $that = this;
            if (typeof user_progress != 'undefined' && user_progress) {
                var parents = {};
                $.each(user_progress, function (inx, enrollment) {
                    var category = enrollment['category'],
                        units = enrollment['units'];

                    if (category && units) {
                        var node = $that.getNodeByID(category['ID']);
                        if (typeof node != 'undefined' && node instanceof helpers.createNode) {
                            var category_progress = 0;
                            $.each(units, function (key, unit) {
                                var progress = $that.getProgressForUnit(unit.ID);
                                if (progress > 0) {
                                    var $item = $('#unit' + unit['ID']);
                                    var $mobile_item = $('#mobile_unit_' + unit['ID']);
                                    $item.text(progress + '%');
                                    $item.parent().addClass('info');

                                    if (progress == 100) {
                                        $item.parent().addClass('info full');
                                    }

                                    if (typeof $mobile_item != 'undefined' && $mobile_item) {
                                        $mobile_item.text(progress + '%');
                                        $mobile_item.parent().addClass('info');

                                        if (progress == 100) {
                                            $mobile_item.parent().addClass('info full');
                                        }
                                    }
                                }
                            });

                            if (units.length > 0) {
                                category['progress'] = Math.round((category_progress));
                            } else {
                                category['progress'] = 0;
                            }

                            node.progress = category['progress'];
                            $('#category' + category['ID']).addClass('blue');
                            node.color = $('#category' + category['ID']).css('background-color');
                            parents[node.parent_id] = parents[node.parent_id] || node.parent;
                        }
                    }
                });

                // back propagate progress
                if (parents) {
                    while (Object.keys(parents).length > 0) {
                        var new_parents = {};
                        $.each(parents, function (i, parent) {
                            if (parent) {
                                if (parent.children.length > 0) {
                                    var progress = 0;
                                    $.each(parent.children, function (i, childe) {
                                        progress += childe.progress;
                                    });

                                    parent.progress = Math.round(progress / parent.children.length);
                                    if (parent.progress > 0) {
                                        $('#' + parent.type + parent.id).addClass('blue');//.text(parent.progress + '%');
                                    }
                                }

                                if (parent.parent_id == 0) {
                                    //.text(parent.progress + '%')
                                    $('#' + parent.type + parent.id).addClass('blue').closest('.row').addClass('blue');
                                    $('#' + parent.type + parent.id + '_0').addClass('blue');
                                    return true;
                                }

                                new_parents[parent.parent_id] = new_parents[parent.parent_id] || parent.parent;
                            }
                        });

                        parents = new_parents;
                    }
                }
            }
        },
        setEdge: function(id, parent_id, color, level, hidden) {
            var $node_childe = $('#' + id),
                $node_parent = $('#' + parent_id),
                hidden = hidden || false;
                level = level || 0;

            if ($node_childe.is(':hidden') || $node_parent.is(':hidden')) {
                return false;
            }

            if (
                typeof $node_parent == 'undefined' || typeof $node_childe == 'undefined' ||
                $node_parent.length == 0 || $node_childe.length == 0
            ) {
                return false;
            }

            var position = $node_childe.offset(),
                parent_positions = $node_parent.offset(),
                svg_position = $('#edges').offset(),
                height = $node_childe.outerHeight(),
                parent_height = $node_parent.outerHeight(),
                stroke = 6 - level;

            var edge = helpers.createEdge(
                id + "_" + parent_id,
                (position.left - svg_position.left + (height / 2)), (position.top - svg_position.top + (height / 2)),
                (parent_positions.left - svg_position.left + (parent_height / 2)), (parent_positions.top - svg_position.top + (parent_height / 2)),
                stroke, color, hidden
            );

            return edge;
        },
        setIntroEdges: function() {

            $('#categories-intro').css({
                'transform': 'scale(1)',
                '-ms-transform': 'scale(1)',
                '-webkit-transform': 'scale(1)',
                '-moz-transform': 'scale(1)',
                '-o-transform': 'scale(1)',
            });

            var group = helpers.createGroup('group');
            var $that = this;
            var last_node = null;
            if (root.children.length > 0) {
                $.each(root.children, function (i, node) {
                    var id = node['id'],
                        index = node['type'],
                        parent_id = -1,
                        color = node['color'],
                        children = node['children'],
                        edges = [];

                    if (last_node) {
                        parent_id = last_node.id;
                    }

                    if (id > 0 && parent_id > 0 ) {
                        id = index + id;
                        parent_id = index + parent_id;

                        var edge = $that.setEdge(id, parent_id, color, 2.5);

                        if (edge) {
                            group.appendChild(edge);
                        }
                    }
                    last_node = node;
                });
                $('#edges').html(group);

                methods.scaleTree($('#categories-intro'), $('#main_row'));
                methods.setCategoryUnitsContainerPosition($('#sub-categories'), $('#sub-categories'), $('#categories-intro'));

            }
        },
        positionNodesToParent: function(nodes, $parent) {
            if ($parent && nodes.length > 0) {
                var position = $parent.offset();
                var nodes_position = $('#categories .nodes').offset();
                var new_position = position.top - nodes_position.top - 3 * $parent.height();
                var node = nodes[0];
                var $container = $('#' + node.type + node.id).closest('.sub')
                $container.offset({top: position.top - 3 * $parent.height()});
                var bottom_position = $container.offset().top + $container.outerHeight();

                var window_height = $('#categories').offset().top + $('#categories').outerHeight();
                if (bottom_position > window_height) {
                    new_position = bottom_position - window_height;
                    $container.offset({top: ($container.offset().top - new_position) });
                }
                /*
                $.each(nodes, function(i, n) {
                    $('#' + n.type + n.id).css('top', start_position);

                    start_position += 50;
                });
                */
            }
        },
        setCategoriesEdges: function(element_id) {

            $('#categories').css({
                'transform': 'scale(1)',
                '-ms-transform': 'scale(1)',
                '-webkit-transform': 'scale(1)',
                '-moz-transform': 'scale(1)',
                '-o-transform': 'scale(1)'
            });

            $('#edges').empty();
            element_id = element_id || 0;
            var group = helpers.createGroup('group');
            var $that = this;
            var last_node = null;
            var queue = [root];
            var level = 0;
            
            var stop = false;
            while (queue.length > 0) {
                var new_queue = [];
                $.each(queue, function (i, node) {
                    var id = node['id'],
                        parent_id = -1,
                        color = node['color'],
                        children = node['children'],
                        edges = [];

                    // position nodes, relative to parent
                    level++;
                    if (children && children.length > 0) {
                        var first = children[0],
                            last = children[children.length - 1],
                            last_children = null,
                            visible_children = false;

                        $.each(children, function (i_c, c) {
                            new_queue.push(c);
                        });

                        var copy = $.merge([], children);
                        /*
                        if (node.parent_id == 0) {
                            copy.unshift(node);
                            if (node.sibling) {
                                copy.push(node.sibling);
                            }
                        }
                        */

                        $.each(copy, function (i_c, c) {
                            visible_children = false;
                            // if the last parent has visible children don't add an edge
                            if (last_children && typeof last_children.children != 'undefined' && last_children.children.length > 0) {
                                $.each(last_children.children, function(i, n) {
                                    if ((n.active || $('#' + n.type + n.id).is(':visible')) && n.parent_id > 0) {
                                        visible_children = true;
                                        return false;
                                    }
                                });
                            }

                            if (c && c.id > 0 && last_children && !visible_children) {
                                id = c.type + c.id;
                                parent_id = last_children.type + last_children.id;
                                var edge = $that.setEdge(id, parent_id, color, 2.5, true);

                                if (edge) {
                                    group.appendChild(edge);
                                }
                                last_children.sibling = c;
                            }

                            if (i_c == 0) {
                                id = c.type + c.id;
                                parent_id = node.type + node.id;
                                var edge = $that.setEdge(id, parent_id, color, 2.5, true);

                                if (edge) {
                                    group.appendChild(edge);
                                }
                            }

                            if (i_c == copy.length - 1) {
                                if (node.sibling) {
                                    parent_id = node.sibling.type + node.sibling.id;
                                    var edge = $that.setEdge(id, parent_id, color, 2.5, true);

                                    if (edge) {
                                        group.appendChild(edge);
                                    }
                                }
                            }

                            last_children = c;
                        });
                        last_children = node;
                    }
                });

                queue = new_queue;
            }
            $('#edges').append(group);

            methods.scaleTree($('#categories'), $('#main_row'));
            methods.setCategoryUnitsContainerPosition($('#categories-units'), $('#categories-units'), $('#categories'));

            setTimeout(function() {
                $('#edges').addClass('active');
                //methods.showTreeToLevel(1);
            }, 250);
        },
        setUserProfileEdgesVisibility: function(enrollemnts) {
            var $that = this;

            $.each(all_nodes, function(i, n) {
                if (n.id > 0) {
                    n.active = false;
                }
            });

            if (typeof enrollemnts != 'undefined' && enrollemnts) {
                $.each(enrollemnts, function(i, enrollment) {
                    var node = $that.getNodeByID(enrollment.category['ID']);
                    if (node) {
                        var current = node;
                        current.active = true;
                        current.parent.active = true;
                        //$that.setNodeValueByID(node.id, 'active', true);
                        //$that.setNodeValueByID(node.parent_id, 'active', true);
                        if (typeof current.units && current.units.length > 0) {
                            $.each(current.units, function(u, unit) {
                                $('#' + unit.type + unit.id).closest('.group').fadeIn();
                                $('#mobile_' + unit.type + unit.id).closest('.row.main').fadeIn();
                            });
                        }

                        while (current && current.id > 0) {
                            $('#' + current.type + current.id).closest('.group').fadeIn();
                            $('#mobile_' + current.type + current.id).closest('.row.main').fadeIn();
                            current = current.parent || null;
                        }
                    }
                });
            }
        },
        showTreeToLevel: function(level) {
            var n = {};
            var queue = [root];
            var work = true;
            var current_level = 0;
            var last_node = null;
            while (queue.length > 0 && work) {
                var temp_queue = [];
                $.each(queue, function(node_inx, node) {

                    $('#' + node.type + node.id).closest('.category').fadeTo('fast', 1, 'easeInOutExpo');
                    if (node.parent_id == 0 && last_node) {
                        $('#' + node.type + node.id + "_" + last_node.type + last_node.id).fadeTo('fast', 1, 'easeInOutExpo');
                    } else if (node.parent && node.parent.id > 0) {
                        $('#' + node.type + node.id + "_" + node.parent.type + node.parent.id).fadeTo('fast', 1, 'easeInOutExpo');
                    }

                    if (node.children && node.children.length > 0) {
                        $.each(node.children, function (inx, item) {
                            temp_queue.push(item);
                        });
                    }

                    last_node = node;
                });

                queue = temp_queue;
                current_level++;
                if (current_level > level) {
                    work = false;
                }
            }

            return n;

        },
        setUserProfileEdges: function() {
            var group = helpers.createGroup('group');
            var $that = this;
            var top_parent = 0;
            var queue = [root];
            while (queue.length > 0) {
                var new_queue = [];
                $.each(queue, function (inx, item) {
                    var id = item['id'], //$(this).data('id'),
                        parent_id = item['parent_id'],
                        index = item['type'],
                        progress = item['progress'],
                        active = item['active'],
                        color = item['color'],
                        edges = [];

                    if (active) {
                        if (item.children.length > 0) {
                            $.each(item.children, function (i, n) {
                                new_queue.push(n);
                            });
                        }

                        if (id && parent_id) {
                            id = index + id;
                            parent_id = index + parent_id;

                            // set inner edges
                            var edge = $that.setEdge(id, parent_id, color, item.level);

                            if (edge) {
                                group.appendChild(edge);
                            }

                            // set unit edges
                            if (item.units.length > 0) {
                                var last = item;
                                $.each(item.units, function (unit_inx, unit) {
                                    if (last) {
                                        index = unit.type;
                                        id = unit.type + unit.id;
                                        parent_id = last.type + last.id;
                                        edge = $that.setEdge(id, parent_id, unit.color, (item.level + 1));
                                        if (edge) {
                                            group.appendChild(edge);
                                        }
                                    }
                                    last = unit;
                                });
                            }
                        } else {
                            // set top edges
                            if (parent_id == 0 && id) {
                                if (top_parent > 0) {
                                    id = index + id;
                                    parent_id = index + top_parent;

                                    // set inner edges
                                    var edge = $that.setEdge(id, parent_id, color, item.level);

                                    if (edge) {
                                        group.appendChild(edge);
                                    }
                                }
                                if (item.active) {
                                    top_parent = item.id;
                                }
                            }
                        }
                    }
                });
                queue = new_queue;
            }
            $('#edges').html(group);
        },
        setEdges: function() {
            var group = helpers.createGroup('group');
            var $that = this;
            var top_parent = 0;
            $.each(all_nodes, function(inx, item) {
                var id = item['id'], //$(this).data('id'),
                    parent_id = item['parent_id'], //$(this).data('parent'),
                    index = item['type'], //$(this).data('inx'),
                    progress = item['progress'],
                    color = item['color'],
                    edges = [];

                if (id && parent_id) {
                    id = index + id;
                    parent_id = index + parent_id;

                    // set inner edges
                    var edge = $that.setEdge(id, parent_id, color, item.level);

                    if (edge) {
                        group.appendChild(edge);
                    }

                    // set unit edges
                    if (item.units.length > 0) {
                        var last = item;
                        $.each(item.units, function(unit_inx, unit) {
                            if (last) {
                                index = unit.type;
                                id = unit.type + unit.id;
                                parent_id = last.type + last.id;
                                edge = $that.setEdge(id, parent_id, unit.color, (item.level + 1));
                                if (edge) {
                                    group.appendChild(edge);
                                }
                            }
                            last = unit;
                        });
                    }
                } else {
                    // set top edges
                    if (parent_id == 0 && id) {
                        if (top_parent > 0) {
                            id = index + id;
                            parent_id = index + top_parent;

                            // set inner edges
                            var edge = $that.setEdge(id, parent_id, color, item.level);

                            if (edge) {
                                group.appendChild(edge);
                            }
                        }
                        top_parent = item.id;
                    }
                }
            });
            $('#edges').html(group);
        },
        setVisibility: function(level) {
            var queue = [root];
            level = level || 1;
            var current_level = 0;
            var new_children = [];
            while (queue.length > 0 && current_level <= level) {
                $.each(queue, function (i, node) {
                    var last_node = null,
                        children = node['children'];

                    if (node.sibling) {
                        $('#' + node.type + node.id + "_" + node.type + node.sibling.id).show();
                    }

                    if (children && children.length > 0) {
                        $.each(children, function(j, childe) {
                            new_children.push(childe);
                        });
                    }
                });
                queue = new_children;
                current_level++;
            }
        },
        setContainerSize: function($container) {
            var max_count = 0;
            var max_unit_width = 0;
            var sub_cat_width = 0;
            $('.sub', $container).each(function() {
                max_unit_width = Math.max(max_unit_width, $('.unit:visible', this).outerWidth());
                sub_cat_width = Math.max(sub_cat_width, $('.col-lg-4.table:visible', this).outerWidth());
            });

            var parent_units = {};
            $.each(nodes_units, function(i, n) {
                parent_units[n.parent_id] = parent_units[n.parent_id] || 0;
                parent_units[n.parent_id]++;
            });

            $.each(parent_units, function(i, n) {
                max_count = Math.max(max_count, n);
            });


            var sub_width = max_count * max_unit_width;
            var top_width = $('.top', $container).outerWidth();
            var new_width = (sub_width + top_width + sub_cat_width) + 'px';

            $container.width(new_width);
            $('.sub .row .col-lg-8', $container).width(sub_width + sub_cat_width + 'px');

            return new_width;
        }
    };

    object.methods = methods;

    var actions = {
        treeActions: function() {
            $('.categories-list .category').on('click', function () {
                var id = $(this).data('id');
                if (id && id > 0) {
                    methods.showTreeMobileSubCategories(id, $(this));
                }
            });
        },
        related: function() {
            $('.unit').click(function(event) {
                var id = $(this).data('id');

                if ($(this).hasClass('center')) {
                    return true;
                }

                event.preventDefault();

                if (typeof id != 'undefined' && id) {
                    methods.setUnitBox(id);
                }

                if (!$(this).hasClass('active') && methods.hasRelatedUnits(id)) {

                    if (typeof id != 'undefined' && id) {
                        methods.clickedUnit(id);
                    }
                }

                return false;
            });

            $('.medal').click(function() {
                if ($(this).hasClass('selected')) {
                    return true;
                }

                $(this).addClass('selected');
                var id = $(this).data('id');
                if (id) {
                    methods.clickedMedal(id)
                }
            });

            if (typeof window.medal_id != 'undefined' && window.medal_id) {
                setTimeout(function() {
                    $('#medal' + window.medal_id).trigger('click');
                }, 250);
            }

            $('#close').click(function() {
                methods.clearRelatedNodes();
            });

            $('#app-layout').click(function() {
                if ($('#unit-info').hasClass('active')) {
                    methods.clearRelatedNodes();
                }
            });

            $('.unit-info').click(function(e) {
                e.stopPropagation();
            });
            $('.unit').click(function(e) {
                e.stopPropagation();
            });

            $('.mask .close-btn').click(function() {
                //methods.clearRelatedNodes();
            });
        },
        showCategoriesChildren: function(parent_nodes) {
            var $sub = $('#categories-units .container');
            $('#categories-units .slick-slider').removeClass('active');
            var boxes = [];
            var first = false;
            var boxes_id = [];
            var count = 0;
            var nodes_array = all_nodes;

            if (typeof parent_nodes != 'undefined') {
                nodes_array = parent_nodes;
            }

            // remove old slides
            if (slick_slides > 0 && $slick_units) {
                for (var i = 0; i < slick_slides; i++) {
                    $slick_units.slick('removeSlide', null, null, true);
                }
            }
            slick_slides = 0;

            $.each(nodes_array, function(i, node) {
                if (node.units && node.units.length > 0) {
                    $.each(node.units, function (i, unit) {
                        var image = '';
                        if (unit.image) {
                            image = unit.image;
                        }
                        var box = '' +
                            '<a data-category="' + node['name'] + '" data-index="' + (count++) + '" data-progress="' + unit.progress + '" id="unit-' + unit.id + '" href="' + window.unit_url + '/' + unit.id + '" class="box round">' +
                            '<div class="border">' +
                            '<div class="mask"></div>' +
                            '<div class="unit-progress">' + Math.round(unit.progress) + '%</div>' +
                            '<div class="image" style="background-image:url(' + image + ');">' + '</div>' +
                            '</div>' +
                            '<div class="name">' + unit['name'] + '</div>' +
                            '</a>';

                        boxes_id.push(unit.id);
                        boxes.push(box);
                        slick_slides++;
                    });
                }
            });

            if (!$slick_units) {
                first = true;
                $sub.append(boxes.join(''));
                $slick_units = $sub.slick({
                    dots: true,
                    infinite: true,
                    speed: 300,
                    focusOnSelect: true,
                    prevArrow: false,
                    nextArrow: false,
                    slidesToShow: 3.6,
                    slidesToScroll: 1,
                    swipeToSlide: true,
                    centerMode: true,
                    responsive: [
                        {
                            breakpoint: 1700,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 1500,
                            settings: {
                                slidesToShow: 2.7,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 1200,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 3,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 2,
                                slidesToScroll: 1,
                            }
                        },
                        {
                            breakpoint: 400,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1,
                            }
                        }
                    ]
                });
            } else if (slick_slides > 0) {
                //add new slides
                for (var i = 0; i < slick_slides; i++) {
                    $slick_units.slick('slickAdd', boxes[i]);
                }
            }

            for (var i = 0; i < boxes_id.length; i++) {
                var $item = $('#unit-' + boxes_id[i]),
                    progress = $item.data('progress') / 100 || 0;
                var bar = new ProgressBar.Circle($item.get(0), {
                    strokeWidth: 5.5,
                    easing: 'easeInOut',
                    duration: 1400,
                    color: '#6bc3f5',
                    trailColor: '#eee',
                    trailWidth: 1,
                    svgStyle: null
                });

                bar.animate(progress);  // Number from 0.0 to 1.0
            }

            setTimeout(function() {
                $('#categories-units .slick-slider').addClass('active');
            }, 400);

            if (!$slick_units || first) {
                $('#categories .category').on('click', function () {
                    var id = $(this).data('id');
                    if (id && id > 0) {
                        methods.showCategoriesChildren(id, $(this));
                    }
                });

                $('#categories .unit').on('click', function () {
                    var id = $(this).data('id');
                    if (id && id > 0) {
                        $('#categories .category').removeClass('active');
                        $(this).addClass('active');
                        methods.showSubCategories(id);
                    }
                });

                $('.categories-list .category').on('click', function () {
                    var id = $(this).data('id');
                    if (id && id > 0) {
                        methods.showCategoriesMobileChildren(id, $(this));
                    }
                });

                $('#categories-units .close-units').on('click', function () {
                    $('#categories-units').removeClass('active');
                });


                $sub.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                    var $slide = $('#categories-units .slick-track a[data-index="' + nextSlide + '"]');
                    var cat_name = $slide.data('category');
                    $('#categories-units h1.category').text(cat_name);
                });
            } else {
                $('#categories-units .slick-dots').addClass('active').css('display', 'block !important');
            }

            methods.setCategoryUnitsContainerPosition($('#categories-units'), $('#categories-units'), $('#categories'));
            //$('#categories-units').css('margin-top', $('#categories-units').outerHeight() / - 2);
        },
        showSubCategories: function() {
            $('#sub-categories .container').slick({
                dots: true,
                infinite: true,
                speed: 300,
                focusOnSelect: true,
                prevArrow: false,
                nextArrow: false,
                slidesToShow: 3,
                appendDots: $('#sub-categories .slick-paging'),
                swipeToSlide: true,
                centerMode: true,
                slidesToScroll: 1,
                responsive: [
                    {
                        breakpoint: 1500,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                        }
                    },
                    {
                        breakpoint: 400,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    }
                ]
            });

            $('#categories-intro .category').on('click', function () {
                var id = $(this).data('id');
                if (id && id > 0) {

                    $('#video_background .flash').fadeIn('fast', function() {
                        $('#video_background video').removeClass('active');
                        var $selected = $('#video_background video.' + id);
                        $selected.get(0).play();
                        $selected.addClass('active');
                        $('#video_background .flash').fadeOut('fast');
                    });

                    $('#categories-intro .category').removeClass('active');
                    $(this).addClass('active');
                    methods.showSubCategories(id);
                }
            });

            $('.categories-list .category').on('click', function () {
                var id = $(this).data('id');
                if (id && id > 0) {
                    $('.categories-list .category').removeClass('active');
                    $(this).addClass('active');
                    methods.showSubCategoriesMobile(id);
                }
            });

            $('.close-units').click(function() {
                $('#sub-categories').removeClass('active');
            });

            $('#categories-intro .unit').on('click', function () {
                var id = $(this).data('id');
                if (id && id > 0) {
                    $('#categories-intro .category').removeClass('active');
                    $(this).addClass('active');
                    methods.showSubCategories(id);
                }
            });

            methods.setCategoryUnitsContainerPosition($('#sub-categories'), $('#sub-categories'), $('#categories-intro'));
        },
        setMapScale: function($container) {
            var win_height = window.innerHeight;
            var win_width = $(window).width();
            var container_height = $container.outerHeight();
            var offset_top = $container.offset().top;
            win_height -= offset_top;

            //module_mindmap.methods.setEdges();
            //if (win_height > container_height) {
            if (win_height < 500) {
                win_height = 500;
            }
            var scale = win_height / container_height;

            $container.css({
                'transform': 'scale(' + scale + ', ' + scale + ')',
                '-ms-transform': 'scale(' + scale + ', ' + scale + ')',
                '-webkit-transform': 'scale(' + scale + ', ' + scale + ')',
                '-moz-transform': 'scale(' + scale + ', ' + scale + ')',
                '-o-transform': 'scale(' + scale + ', ' + scale + ')'
            });

            //}
        },
        showSelectedCategory: function(category) {
            $('#categories-units').hide();
            setTimeout(function() {
                $('#category' + category).trigger('click');
                setTimeout(function() {
                    $('#categories-units').show();
                    $('#category' + category).closest('.wrapper').find('.node-container .circle').first().trigger('click');
                }, 600)
            }, 250);
        }
    };

    object.actions = actions;

    return object;
})(jQuery);

var module_exam = (function($) {
    'use strict'

    var exam_answers = [];
    var object = {
        question: function(id, answers) {
            this.answers = answers || [];
            this.id = id;

            if (typeof object.question.prototype.manageAnswer === 'undefined') {
                object.question.prototype.manageAnswer = function (answer_id) {
                    var index = this.answers.indexOf(answer_id);
                    if (index < 0) {
                        this.answers.push(answer_id);
                        return 'add';
                    } else {
                        this.answers.splice(index, 1);
                        return 'remove';
                    }
                }
            }
        }
    };

    var helpers = {
        ajax: function(url, type, data, headers, success, error) {
            $.ajax({
                url: url,
                type: type,
                dataType: 'json',
                cache: false,
                beforeSend: function (xhr) {
                    $.each(headers, function (inx, value) {
                        xhr.setRequestHeader(inx, value);
                    });
                },
                data: {data: data},
                success: function (data) {
                    if (typeof success == 'function') {
                        success(data);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (typeof error == 'function') {
                        error(data);
                    }
                }
            });
        }
    };

    var methods = {
        getExamUrl: '',
        setExamUrl: '',
        slides_q: null,
        init: function() {
            if (typeof window.getExamUrl != 'undefined' && window.getExamUrl) {
                this.getExamUrl = window.getExamUrl;
            }

            if (typeof window.setExamUrl != 'undefined' && window.setExamUrl) {
                this.setExamUrl = window.setExamUrl;
            }
        },
        getExam: function() {
            var token = $('#exam_token input[name="_token"]').val();
            var headers = {
                'X-CSRF-Token': token
            };
            var $that = this;
            helpers.ajax(methods.getExamUrl, 'GET', {'_token': token}, headers, function(result) {
                if (
                    typeof result != 'undefined' && result &&
                    typeof result['error'] != 'undefined' && result['error'] == 0
                ) {
                    exam_answers = [];
                    if (result.data && result.data.questions) {
                        $.each(result.data.questions, function (i, question) {
                            exam_answers.push(
                                new object.question(question.ID, [])
                            );
                        });

                        $('#exam .main-container').show();
                        $that.constructQuestions(result.data);
                    }
                }
            }, function(data) {});
        },
        constructQuestions: function(exam) {
            //set exam title, description, start button;
            //set exam questions
            var html_questions = [];
            var count = 0;

            $('#exam .test-name').html(exam['name'+$lang] + "<div class='attempts'>(Remaining attempts: <span id='attempts_left'  data-attempts='" + exam.remaining_attempts + "'>" + exam.remaining_attempts + "</span>)</div>");

            $.each(exam.questions, function(i, question) {
                var html_answers = [];
                $.each(question.answers, function(j, answers) {
                    var a = '<div class="answer" data-answer="' + answers.ID + '" data-question="' + question.ID + '"><input id="answer' + answers.ID + '" type="checkbox" /><label>' + answers.name + '</label></div>';
                    html_answers.push(a);
                });

                var q = '<div>\
                            <div class="title">' + question['name'+$lang] + '</div>\
                            <div class="answers">' + html_answers.join('') + '</div>\
                        </div>';
                html_questions.push(q);
            });

            if (methods.slides_q) {
                $('#questions_container .container').slick('unslick');
                $('#questions_container .container').empty();
            }

            $('#questions_container .container').html(html_questions.join(''));

            methods.slides_q = $('#questions_container .container').slick({
                dots: true,
                infinite: false,
                speed: 300,
                focusOnSelect: true,
                arrow: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                appendDots: $('#slick_question_numbers'),
                appendArrows: $('#slick_question_arrows'),
                prevArrow: '<div class="arrow back"><i class="fa fa-chevron-left" aria-hidden="true"></i></div>',
                nextArrow: '<div class="arrow next"><i class="fa fa-chevron-right" aria-hidden="true"></i></div>'
            });

            setTimeout(function() {
                $('#loading').fadeOut();
            }, 300);

        },
        allQuestionsHasAnswers: function() {
            var result = true;
            $.each(exam_answers, function(i, q) {
                if (!q.answers || q.answers.length < 1) {
                    result = false;
                    return false;
                }
            })

            return result;
        },
        setExam: function() {
            $('#loading').fadeIn();
            var token = $('#exam_token_set input[name="_token"]').val();
            var headers = {
                'X-CSRF-Token': token
            };
            var $that = this;
            var data = [];
            $.each(exam_answers, function(i, n) {
                data.push({
                    id: n.id,
                    answers: n.answers
                });
                data.push({
                        '_token': token
                });
            });

            helpers.ajax(methods.setExamUrl, 'POST', data, headers, function(result) {
                if (
                    typeof result != 'undefined' && result &&
                    typeof result['error'] != 'undefined' && result['error'] == 0
                ) {
                    if (result.response.passed == 1) {
                        // show success message and medals(if exist)
                        var medals_html = [];
                        var marks_html = [];

                        if (result.response.title && typeof result.response.title.title != 'undefined') {
                            $('#test-title').text(result.response.title.title);
                            $('#passed').hide();
                        } else {
                            $('#test-title').remove();
                            $('#passed').show();
                        }

                        var medal_names = [];
                        if (result.response.medals.length > 0) {
                            // show won medals
                            $.each(result.response.medals, function (m, medal) {
                                var image = '';
                                if (medal && typeof medal.image_data != 'undefined') {
                                    image = medal.image_data.url;
                                }

                                medal_names.push(medal['name'+$lang]);

                                medals_html.push(
                                    '<div class="medal col-md-4 col-xs-12">' +
                                    '<div class="image"><img src="' + image + '" alt="' + medal['name'+$lang] + '"/></div>' +
                                    '<div class="name">' + medal['name'+$lang] + '</div>' +
                                    '</div>'
                                );
                            });
                            $('#test-passed').children().removeClass('center');
                        } else {
                            $('#test-passed .medals').parent().remove();
                            $('#test-passed > .row').children().addClass('center');
                        }

                        if (result.response.marks.length > 0) {
                            // show won medals
                            var counter = 1;
                            $.each(result.response.marks, function (m, mark) {
                                var description = 'Correct answer can be found in the videos.';
                                if (mark.description) {
                                    description = mark.description;
                                }
                                marks_html.push(
                                    '<div class="mark col-md-12">' +
                                    '<div class="name">' + counter + '. ' + mark['name' + $lang] + ':</div>' +
                                    '<div class="decription">' + description + '</div>' +
                                    '</div>'
                                );
                                counter++;
                            });
                        }

                        $('#test-passed .marks').html(marks_html.join(''));
                        $('#test-passed .medals').html(medals_html.join(''));
                        var title = '';
                        if (medals_html.length == 1) {
                            title += '<div class="title">Congratulations, you just achieved a ' + medal_names[0]  + ' MEDAL!: </div>';
                        } else if (medals_html.length > 1) {
                            title += '<div class="title">Congratulations, you just achieved ' + medal_names.join(', ')  + ' MEDALS!: </div>';
                        }

                        var length = result.response.medals.length;
                        if (length > 0) {
                            $('#share').show();
                            $('#share').on('click', function () {
                                var medal = result.response.medals[length - 1];

                                var image = '';
                                if (medal && typeof medal.image_data != 'undefined') {
                                    image = medal.image_data.url;
                                }
                                FB.getLoginStatus(function (response) {
                                    FB.ui({
                                        method: "feed",
                                        display: "iframe",
                                        link: window.app_url,
                                        caption: window.app_url,
                                        name: medal['name'+$lang],
                                        description: 'I just achieved a ' + medal['name'+$lang] + ' MEDAL!',
                                        picture: image
                                    }, function (response) {

                                    });
                                });
                            });
                        }

                        $('#test-passed .medals').prepend(title);
                        $('#test-passed .circle').empty();
                        $('#test-failed').hide();

                        $('#questions_container .main-container').fadeOut(function() {
                            $('#questions_container .results').fadeIn('fast');
                            $('#test-passed').fadeIn('fast');

                            var bar = new ProgressBar.Circle($('#test-passed .circle').get(0), {
                                strokeWidth: 5.5,
                                easing: 'easeInOut',
                                duration: 1400,
                                color: '#6bc3f5',
                                trailColor: '#ccc',
                                trailWidth: 1,
                                svgStyle: null,
                                step: function(state, circle) {
                                    var value = Math.round(circle.value() * 100);
                                    if (value === 0) {
                                        circle.setText('');
                                    } else {
                                        circle.setText(value + '%');
                                    }
                                }
                            });

                            bar.animate(result.response.score);  // Number from 0.0 to 1.0

                            $('#show_exam').addClass('seen');
                            $('#video-container .progress-box .inner').width('100%');
                            $('#video-container .progress-box .value').text('PROGRESS 100%');
                        });
                    } else {
                        var marks_html = [];
                        var attempts_left = $('#attempts_left').data('attempts');
                        attempts_left = (attempts_left - 1) < 0 ? 0 : attempts_left - 1;
                        $('#attempts_left').data('attempts', attempts_left);
                        $('#attempts_left').text(attempts_left);

                        if (result.response.more_attempts) {
                            $('#test-failed .repeat button').show();
                            $('#test-failed .fail').hide();
                        } else {
                            $('#test-failed .repeat button').hide();
                            $('#test-failed .fail').show();

                            $('.unit-videos .video').removeClass('seen');
                            $('#video-container .progress-box .inner').width('0%');
                            $('#video-container .progress-box .value').text('PROGRESS 0%');
                        }

                        if (result.response.marks.length > 0) {
                            // show won medals
                            var counter = 1;
                            $.each(result.response.marks, function (m, mark) {
                                var description = 'Correct answer can be found in the videos.';
                                if (mark.description) {
                                    description = mark.description;
                                }
                                marks_html.push(
                                    '<div class="mark col-md-12">' +
                                    '<div class="name">' + counter + '. ' + mark['name' + $lang] + ':</div>' +
                                    '<div class="decription">' + description + '</div>' +
                                    '</div>'
                                );
                                counter++;
                            });
                        }

                        $('#test-failed .marks').html(marks_html.join(''));
                        var title = '';
                        if (marks_html.length > 0) {
                            title += '<div class="title">Marks: </div>';
                        }
                        $('#test-failed .marks').prepend(title);
                        $('#test-failed .circle').empty();
                        $('#test-passed').hide();

                        $('#questions_container .main-container').fadeOut(function() {
                            $('#questions_container .results').fadeIn('fast');
                            $('#test-failed').fadeIn('fast');
                            var bar = new ProgressBar.Circle($('#test-failed .circle').get(0), {
                                strokeWidth: 5.5,
                                easing: 'easeInOut',
                                duration: 1400,
                                color: '#cd000f',
                                trailColor: '#ccc',
                                text: {
                                    value: '0%'
                                },
                                trailWidth: 1,
                                svgStyle: null,
                                step: function(state, circle) {
                                    var value = Math.round(circle.value() * 100);
                                    if (value === 0) {
                                        circle.setText('0%');
                                    } else {
                                        circle.setText(value + '%');
                                    }
                                }
                            });

                            bar.animate(result.response.score);  // Number from 0.0 to 1.0
                        });
                    }
                    $('#loading').fadeOut();
                }
            }, function(data) {});
        }
    }

    var actions = {
        set: function() {
            $('#show_exam').click(function() {
                if (!$(this).hasClass('seen') && !$(this).hasClass('disabled')) {
                    if (!$(this).hasClass('active')) {
                        $('#video-information').show();
                        $(this).addClass('active')
                        $('#description').slideUp(function () {
                            $('.tabs').hide();
                            $('#exam').fadeIn();
                            $('html, body').animate({
                                scrollTop: $('#exam').offset().top - 30
                            }, 400);
                            methods.getExam();
                        });
                    } else {
                        $('html, body').animate({
                            scrollTop: $('#exam').offset().top - 30
                        }, 400);
                    }
                }
            });

            $('#test-failed .repeat button').on('click', function() {
                $('#questions_container .results').slideUp(function () {
                    $('.tabs').hide();
                    $('#exam').fadeIn();
                    $('html, body').animate({
                        scrollTop: $('#exam').offset().top - 30
                    }, 400);
                    methods.getExam();
                });
            });

            $(document).on('click', '.answer', function() {
                var answer_id = parseInt($(this).data('answer'));
                var question_id = parseInt($(this).data('question'));
                var $that = $(this);

                if (answer_id && question_id) {
                    $.each(exam_answers, function(i, question) {
                        if (question.id == question_id) {
                            var result = question.manageAnswer(answer_id);
                            if (result == 'add') {
                                $that.find('input[type="checkbox"]').prop('checked', true);
                            } else {
                                $that.find('input[type="checkbox"]').prop('checked', false);
                            }
                            return false;
                        }
                    });
                } else {
                    $that.find('input[type="checkbox"]').prop('checked', false);
                }

                if (methods.allQuestionsHasAnswers()) {
                    $('#submit_exam').removeClass('disabled');
                } else {
                    $('#submit_exam').addClass('disabled');
                }
            });

            $('#submit_exam').click(function() {
                if (!methods.allQuestionsHasAnswers()) {
                    return false;
                }

                methods.setExam();
            });
        }
    };

    object.methods = methods;
    object.helpers = helpers;
    object.actions = actions;

    return object;
})(jQuery);

jQuery(function () {
    WebFont.load({
        google: {
            families: ['Montserrat']
        }
    });

    $('.navbar-toggle').click(function() {
        $('#app-navbar-collapse').slideToggle();
    });

    $('nav #help, #start-popup .close-btn ').on('click', function() {
        $('#start-popup').toggleClass('active');
    });

    $('#start-popup').each(function() {
        var help_offset = $('nav #help').offset();
        $('#start-popup').css({
            'left': help_offset.left,
            'top': help_offset.top
        });
    });

    $('#mindmap-tree').each(function() {
        module_mindmap.methods.init();
        module_mindmap.methods.setProgress();

        module_mindmap.methods.setContainerSize($('.tree-container'));

        setTimeout(function() {
            module_mindmap.methods.setEdges();
            module_mindmap.actions.related();
        }, 250);


        module_mindmap.actions.treeActions();

        /*
        var map_width = $(this).outerWidth();
        $(this).css({
            'left': '50%',
            'margin-left': (map_width / -2) + 'px'
        });
        */

        //var size = module_mindmap.methods.setContainerSize($('.tree-container'));
        //$('#mindmap-tree').width(2000 + 'px');

        $(window).resize(function() {
            /*
            var winH = $(window).height();
            var win_width = $(window).width();

            //module_mindmap.methods.setEdges();
            if (win_width < 1140) {
                var scale = win_width / $('#ю').outerWidth();
                $("#mindmap-tree").css({
                    'transform': 'scale(' + scale + ', ' + scale + ')',
                    'transform-origin': 'top left'
                });
            } else {
                $("#mindmap-tree").css({
                    'transform': 'scale(1, 1)',
                    'transform-origin': 'top left'
                });
            }
            */
            module_mindmap.methods.setContainerSize($('.tree-container'));
            module_mindmap.methods.setEdges();
        });
    });

    $("#intro-video video").bind("ended", function() {
        $("#intro-video").fadeOut('fast', function() {
            $("#intro-video video").remove();
        });
    });

    $('#intro-video .skip').click(function() {
        $("#intro-video video").get(0).pause();
        $("#intro-video").fadeOut('fast', function() {
            $("#intro-video video").remove();
        });
    });

    $('#categories-intro').each(function() {
        module_mindmap.methods.init();
        setTimeout(function() {
            module_mindmap.actions.showSubCategories();
            module_mindmap.methods.setIntroEdges();
            setTimeout(function() {
                $('#main_row').addClass('active');
            }, 400);
        }, 250);

       // module_mindmap.actions.setMapScale($('#categories-intro'));

        $('#categories-intro .category').first().trigger('click');

        /*
        var top = $('#categories-intro .nodes').offset().top;
        $('#sub-categories').css('top', top + 'px');
        */

        $('#video_background .flash').fadeOut('slow');

        $(window).resize(function() {
            module_mindmap.methods.setIntroEdges();
            /*
            if ($('#categories-intro .nodes').is(":visible")) {
                var top = $('#categories-intro .nodes').offset().top;
                $('#sub-categories').css({
                    'top': top + 'px',
                    'margin-top': 0
                });
            }
            */
        });
    });

    $('#categories').each(function() {
        module_mindmap.methods.init();
        //module_mindmap.methods.setIntroEdges();
        /*
        var cat_height = $('#categories').height();
        var row_height = $('#main_row').height();

        var dif = row_height - cat_height;
        if (dif > 0) {
            var pad = dif / 6;
            $('#categories .wrapper').each(function() {
                $(this).css('margin-top', pad + 'px');
            })
        }
        */

        setTimeout(function() {
            module_mindmap.methods.setCategoriesEdges();
            module_mindmap.actions.showCategoriesChildren();
            setTimeout(function() {
                $('#main_row').addClass('active');
            }, 400)
        }, 250);

        if (typeof window.default_category != 'undefined' && window.default_category) {
            module_mindmap.actions.showSelectedCategory(window.default_category);
        }
        //module_mindmap.actions.setMapScale($('#categories'));
        //$('#categories-intro .category').first().trigger('click');

        $('#video_background .flash').fadeOut('slow');

        $(window).resize(function() {
            //module_mindmap.actions.setMapScale($('#categories'));
            module_mindmap.methods.setCategoriesEdges();

            /*
            var $item = $('#categories .category:visible');
            if (typeof $item != 'undefined' && $item && $item.length > 0) {
                var position = $item.first().offset();
                $('#categories-units').css('top', (position.top + 50));
            }
            */
        });
    });

    $('#video').each(function() {
        module_video.actions.set();

        var height = window.innerHeight * 0.8;
        if (!height) {
            height = 600;
        }

        var nav_height = window.innerHeight * 0.2;

        $('#player').height(height);
        $(window).resize(function() {
            $('#player').height(height);
        });

        $('#video_details').height(nav_height - $('nav').height());

        module_exam.methods.init();
        module_exam.actions.set();

        if (typeof window.show_exam != 'undefined' && window.show_exam) {
            $('#show_exam').trigger('click');
        }
    });

    $('#user-profile').each(function() {
        var google = new module.methods.googleMaps('address', 'address_coordinates', 'address_place');
        google.set();

        module.actions.set();

        // set user tree
        module_mindmap.methods.init();
        module_mindmap.methods.setUserProfileEdgesVisibility(window.user_enrollments);
        module_mindmap.methods.setProgress();
        module_mindmap.methods.setContainerSize($('.tree-container'));
        module_mindmap.actions.treeActions();

        module_updates.methods.init();

        setTimeout(function() {
            module_mindmap.methods.setUserProfileEdges();
        }, 250);

        $(window).resize(function() {
            //module_mindmap.actions.setMapScale($('#categories'));
            module_mindmap.methods.setContainerSize($('.tree-container'));
            module_mindmap.methods.setUserProfileEdges();
        });
    });

    $('#navigation').each(function() {
        $('.arrow', this).click(function() {
           $('#navigation').toggleClass('active');
        });
        $('.remove', this).click(function() {
            $('#navigation').toggleClass('active');
        });
    });

    $('.nav.not-mobile').mouseenter(function() {
        if (!$('.dropdown-menu', this).is(':visible')) {
            $('.dropdown-menu', this).slideDown();
        }
    }).mouseleave(function() {
        $('.dropdown-menu', this).slideUp();
    });
});

window.onYouTubePlayerAPIReady = function() {
    if (typeof window.video_data != 'undefined' && window.video_data) {
        module_video.methods.init(window.video_data);
        module_video.methods.setYouTube();
    }
}


window.fbAsyncInit = function () {
    FB.init({
        appId: Config.facebook_id,
        //channelUrl: '../channel.html',
        status: false,
        cookie: true,
        xfbml: true
    });
}

$(function(){
    $('.info').closest('.left-section, .right-section').addClass('started').siblings('.section-name').addClass('started');
	var width = $(window).width();

	var nodes_units = [];
	if (typeof window.all_units != 'undefined' && window.all_units) {
        $.each(window.all_units, function (inx, item) {
            console.log(item.image_data);
            var image_url = '';
            if (typeof item['image_data'] != 'undefined' && item['image_data'] && typeof item['image_data']['url'] != 'undefined') {
                image_url = item.image_data.image;
            } else if (item['image']) {
                image_url = item.image;
            }

            var progress = 0;

            if (typeof item.progress != 'undefined') {
                progress = item.progress
            }
            
            var obj = {
            	id: 			item.ID,
            	parent_id: 		item.category_id, 
            	parent: 		null, 
            	name: 			item['name'+$lang], 
            	description:    item.description, 
            	image: 			image_url, 
            	related: 		null,
            	children:  		[], 
            	type:   		'unit',
            	progress: 		progress,
            	points: 		item.points
            };

            nodes_units.push(obj);
        });
    }

	// if(width > 768) {
	// 	$('#center-scroll').scrollLeft(
	// 	  $(".map-container").width() /2  - $("#center-scroll").width() /2
	// 	);
	// }

	$('.left-section p:not(:first-child), .right-section p:not(:first-child)').on('click', function(){
		if ($(this).hasClass('first_click')) {
			window.location = $(this).data('href');
			return 0;
		} else {
            $(this).addClass('first_click');
        }

		links($(this));

		showPopUp(nodes_units, $(this));
	});

	var current_medal = findGetParameter('medal')
	if (current_medal != null && current_medal != '') {
		$('.map-row p[data-id='+ current_medal +']').click();
	}

	$('.medal').on('click', function(){
		if (! $(this).hasClass('selected')){
			$(this).addClass('selected');
			var ids = $(this).data('units').split('|');
			$('.mask').fadeIn();
			$('.map-row p').removeClass('active').closest('.right-section, .left-section').removeClass('active-section');
			for(var i in ids){
				if (ids[i] != '') {
					$('.map-row p[data-id='+ ids[i] +']').addClass('active').closest('.right-section, .left-section').addClass('active-section');
								
					if(width <= 768) {
						$('.map-row p[data-id='+ ids[i] +']').fadeIn().siblings('p').fadeIn().closest('.map-row').find('.section-name').siblings().fadeIn();
					}
				}
			}
		} else {
			$('.medal').removeClass('selected');
			$('.mask').fadeOut();
		}
	});

	function links($this) {
		var ids = $this.data('secondary').split('|');
		var id = $this.data('id');
		$('.mask').fadeIn();
		$('.map-row p').removeClass('active').closest('.right-section, .left-section').removeClass('active-section');

		$('.map-row p[data-id='+ id +']').addClass('active').closest('.right-section, .left-section').addClass('active-section');
		if(width <= 768){
			$('.map-row p[data-id='+ id +']').fadeIn().siblings('p').fadeIn().closest('.map-row').find('.section-name').siblings().fadeIn();
		}

		for(var i in ids){
			if (ids[i] != '') {
				$('.map-row p[data-id='+ ids[i] +']').addClass('active').closest('.right-section, .left-section').addClass('active-section');
			
				if(width <= 768) {
					$('.map-row p[data-id='+ ids[i] +']').fadeIn().siblings('p').fadeIn().closest('.map-row').find('.section-name').siblings().fadeIn();
				}
			}
		}

		// $this.addClass('active').closest('.right-section, .left-section').addClass('active-section');
	}

	// $('.mask').on('click', function(){
	// 	$(this).fadeOut();
	// 	$('.map-row p').removeClass('active');
	// 	$('div').removeClass('active-section');
	// 	$('.section-name').removeClass('active-name');
	// })

	if(width <= 768) {
		$('.section-name').on('click', function() {
			$(this).siblings().fadeToggle();
		});
		$('.left-section p:first-child, .right-section p:first-child').on('click', function() {
			$(this).siblings().fadeToggle();
		});
	}

	function showPopUp(nodes_units, $this)
	{
		var unit_id = $this.data('id');
        var unit = findUnit(nodes_units, unit_id);
        if (!unit) return false;

        var $unit = $('#' + unit.type + unit.id).closest('.unit');

        if (!$unit) return false;

        $('.unit').removeClass('center');
        $unit.addClass('center');

        setTimeout(function() {
            $('#unit-info .title').text(unit['name' + $lang]);
            $('#unit-info .points').text(unit.points + (unit.points < 2 ? 'pt.' : 'pts.'));
            $('#unit-info .description').text(unit.description);
            $('#unit-info .image-container').css('background-image', 'url(' + unit.image + ')');
            $('#unit-info .unit-button').prop('href', $unit.data('href'));
            var height = $('#unit-info').outerHeight();
            var header_height = $('nav.navbar').outerHeight();
            $('#unit-info').css('margin-top', (height / -2));

            $('#unit-info').addClass('active');
        }, 500);


	}

	function findUnit(nodes_units, id)
	{
		var result = null;
        $.each(nodes_units, function(inx, node) {
            if (node.id == id) {
                result = node;
                return false;
            }
        });

        return result;
	}

	function findGetParameter(parameterName) {
	    var result = null,
	        tmp = [];
	    location.search
	    .substr(1)
	        .split("&")
	        .forEach(function (item) {
	        tmp = item.split("=");
	        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
	    });
	    return result;
	}

    $('#unit-info .close-btn').on('click', function(){
        $('.map-row p').removeClass('active');
        $('div').removeClass('active-section');
        $('#unit-info').removeClass('active');
        $('.medal').removeClass('selected');
        $('.mask').fadeOut();
        $('.first_click').removeClass('first_click');
    });



	if(width > 768) {
		$("#child").draggable({
			cursor: "move",
			containment: "parent"
		});

		var pos;

		$(".mask").on('mousedown', function(e) {
			var layer = $(this);
			pos = e.pageX;
			
			layer.hide();
			
			$('#child').trigger(e);
			layer.show();
		}).on('mouseup', function(e){
			if(pos === e.pageX) {
				$(this).fadeOut();
				$('.map-row p').removeClass('active');
				$('div').removeClass('active-section');
				$('#unit-info').removeClass('active');
                $('.medal').removeClass('selected');
			}
			pos = e.pageX;
		});
	} else {
		$('.mask').on('click', function(){
			$(this).fadeOut();
			$('.map-row p').removeClass('active');
			$('div').removeClass('active-section');
			$('#unit-info').removeClass('active');
            $('.medal').removeClass('selected');
            $('.first_click').removeClass('first_click');
		});

        $('#close_all_categories').on('click', function(){
            $('.section-name').siblings().fadeOut();
            $('.left-section p:first-child, .right-section p:first-child').siblings().fadeOut();
        });
	}
});

