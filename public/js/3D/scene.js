(function($) {

    var Globals = {
        loading: true,
        usePostProcessing: true,
        directory: '3dmodels/',
        render: true,
        definition: 1,
        activeNavigation: false,
        is_mobile: false
    };

    if (typeof window.is_mobile != 'undefined' && window.is_mobile) {
        Globals.is_mobile = true;
    }

    Globals.definition = window.definition;

    function gizmoController(mesh, scene, camera, renderer, name) {

         var control = new THREE.TransformControls( camera, renderer.domElement );
         control.attach(mesh);

         control.addEventListener('change', function() {
             console.log("Name: " + name);
             console.log("Position")
             console.log(mesh.position.x + ', ' + mesh.position.y + ', ' + mesh.position.z);
             console.log("Rotation")
             console.log(mesh.rotation.x + ', ' + mesh.rotation.y + ", " + mesh.rotation.z);
             console.log("Scale")
             console.log(mesh.scale.x + ', ' + mesh.scale.y + ", " + mesh.scale.z);
             console.log('.............................................');
        });

        scene.add(control);


        // delete
        window.addEventListener( 'keydown', function ( event ) {

            switch ( event.keyCode ) {

                case 81: // Q
                    control.setSpace( control.space === "local" ? "world" : "local" );
                    break;

                case 17: // Ctrl
                    control.setTranslationSnap( 100 );
                    control.setRotationSnap( THREE.Math.degToRad( 15 ) );
                    break;

                case 87: // W
                    control.setMode( "translate" );
                    break;

                case 69: // E
                    control.setMode( "rotate" );
                    break;

                case 82: // R
                    control.setMode( "scale" );
                    break;

                case 187:
                case 107: // +, =, num+
                    control.setSize( control.size + 0.1 );
                    break;

                case 189:
                case 109: // -, _, num-
                    control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                    break;

            }

        });

        window.addEventListener( 'keyup', function ( event ) {

            switch ( event.keyCode ) {

                case 17: // Ctrl
                    control.setTranslationSnap( null );
                    control.setRotationSnap( null );
                    break;

            }

        });


    }

    function ActionObj(id, objects) {
        this.id = id;
        this.objects = objects || [];

        if (typeof ActionObj.prototype.add === 'undefined') {
            ActionObj.prototype.add = function (obj) {
                this.objects.push(obj);
            }
        }
    }

    function setEdge($node_childe, $node_parent, color, level) {
        if (
            typeof $node_parent == 'undefined' || typeof $node_childe == 'undefined' ||
            $node_parent.length == 0 || $node_childe.length == 0
        ) {
            return false;
        }

        var position = $node_childe.offset(),
            parent_positions = $node_parent.offset(),
            svg_position = $('#edges-nav').offset(),
            height = $node_childe.outerHeight(),
            parent_height = $node_parent.outerHeight(),
            stroke = 5;

        var edge = createEdge(
            '',
            (position.left - svg_position.left + (height / 2)), (position.top - svg_position.top + (height / 2)),
            (parent_positions.left - svg_position.left + (parent_height / 2)), (parent_positions.top - svg_position.top + (parent_height / 2)),
            stroke, color
        );

        return edge;
    }

    function createEdge(id, x1, y1, x2, y2, width, color) {
        var line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('id', id);
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', width);

        return line;
    }

    function createGroup(id) {
        var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute("id", id);
        group.setAttribute("width", '100%');
        group.setAttribute("height", '100%');

        return group;
    }

    var BounderyIntersection = {
        camera: null,
        maxCenterDistanceA: 0,
        maxCenterDistanceB: 0,
        startPosition: typeof THREE != 'undefined' ? new THREE.Vector3() : null,
        init: function(camera, maxCenterDistanceA, maxCenterDistanceB) {
            this.camera = camera;
            var temp_position = camera.position.clone();
            this.maxCenterDistanceA = maxCenterDistanceA;
            this.maxCenterDistanceB = maxCenterDistanceB;
            this.startPosition.x = 200;
            this.startPosition.y = -1600;
            this.startPosition.z = temp_position.z;
        },
        check: function(lastPosition, newPosition) {
            var result = this.computeCenterDistance(newPosition, lastPosition);

            return result;
        },
        computeCenterDistance: function(newPosition, lastPosition) {
            var limit = false;
            if (
                newPosition && typeof newPosition.x !== 'undefined' && typeof newPosition.y !== 'undefined'
            ) {
                var x = newPosition.x - this.startPosition.x,
                    y = newPosition.y - this.startPosition.y;

                var distance = ((x * x) / (this.maxCenterDistanceA * this.maxCenterDistanceA)) + ((y * y) / (this.maxCenterDistanceB * this.maxCenterDistanceB));
                if (distance > 1) {

                    // line equation(slope for point (0,0))
                    var slope = y / x;

                    var new_x1 = Math.sqrt(
                        (Math.pow(this.maxCenterDistanceA, 2) * Math.pow(this.maxCenterDistanceB, 2)) /
                        (Math.pow(this.maxCenterDistanceB, 2) + Math.pow(this.maxCenterDistanceA, 2) * Math.pow(slope, 2))
                    );

                    var new_x2 = -1 * new_x1;

                    var new_y1 = slope * new_x1;
                    var new_y2 = slope * new_x2;

                    // get closest point to last position
                    var option1 = Math.sqrt(
                        (new_x1 - newPosition.x) * (new_x1 - newPosition.x) +
                        (new_y1 - newPosition.y) * (new_y1 - newPosition.y)
                    )

                    var option2 = Math.sqrt(
                        (new_x2 - newPosition.x) * (new_x2 - newPosition.x) +
                        (new_y2 - newPosition.y) * (new_y2 - newPosition.y)
                    )

                    if (option1 < option2) {
                        newPosition.x = new_x1 + this.startPosition.x;
                        newPosition.y = new_y1 + this.startPosition.y;
                    } else {
                        newPosition.x = new_x2 + this.startPosition.x;
                        newPosition.y = new_y2 + this.startPosition.y;
                    }

                    limit = true;
                } else {
                    limit = false;
                }

                //console.log(distance);

                return {position: newPosition, limit: limit};
            }

            return false;
        }
    }

    var ActiveObjects = {
        mesh_array: [],
        actions_array: {},
        last_position: null,
        last_orientation: null,
        selected_object: null,
        distance: 4000,
        camera: null,
        hover_object_scale: null,
        hoverObject: null,
        cameraTarget: null,
        active_animation: false,
        active_topic: '',
        current_category_id: 0,
        add: function(mesh) {
            ActiveObjects.mesh_array.push(mesh);
        },
        addAction: function(action) {
            ActiveObjects.actions_array[action.id] = action.objects;
        },
        calculateMiddlePoint: function(p0, p1, t) {
            return {
                x: p0.x + (p1.x - p0.x) * t,
                y: p0.y + (p1.y - p0.y) * t,
                z: p0.z + (p1.z - p0.z) * t
            }
        },
        findDistance: function(p0, p1) {
            var a = Math.pow((p1.x - p0.x), 2);
            var b = Math.pow((p1.y - p0.y), 2);
            var c = Math.pow((p1.z - p0.z), 2);

            return Math.sqrt(a + b + c);
        },
        onMouseOver: function(event) {
            if (Globals.activeNavigation) {
                return false;
            }

            if (ActiveObjects.camera) {
                var projector = new THREE.Projector();
                var vector = new THREE.Vector3(
                    (event.clientX / window.innerWidth) * 2 - 1,
                    -(event.clientY / window.innerHeight) * 2 + 1,
                    0.5);
                vector.unproject(ActiveObjects.camera);

                var raycaster = new THREE.Raycaster(
                    ActiveObjects.camera.position,
                    vector.sub(ActiveObjects.camera.position).normalize());
                var intersects = raycaster.intersectObjects(ActiveObjects.mesh_array);

                if (intersects.length > 0) {
                    var selectedObject = intersects[0].object;
                    /*
                    if (ActiveObjects.hoverObject != null || Object.is(selectedObject, ActiveObjects.hoverObject)) {
                        //ActiveObjects.onMouseOut();
                        return false;
                    }
                    */

                    var name = selectedObject.name;

                    if (name) {
                        ActiveObjects.active_topic = name;
                        var $item = $('.row[data-item="' + name + '"]');
                        ActiveObjects.onNavigationClick($item, true, selectedObject).then(function() {
                            var obj = selectedObject;
                            var scale = selectedObject.scale.clone();

                            if (ActiveObjects.hoverObject && ActiveObjects.hoverObject.id == obj.id) {
                                return false;
                            }

                            ActiveObjects.scaleAnimate(selectedObject.scale, {
                                x: selectedObject.scale.x + 25, y: selectedObject.scale.y + 25, z: selectedObject.scale.z + 25
                            }, 300, function() {
                                ActiveObjects.hover_object_scale = scale;
                                ActiveObjects.hoverObject = selectedObject;
                            });
                        })
                    }
                    //selectedObject.scale.set(selectedObject.scale.x + 15, selectedObject.scale.y + 15, selectedObject.scale.z + 15);
                } else {
                    //ActiveObjects.onMouseOut();
                }
            }
        },
        scaleAnimate: function(start, end, time, finish) {
            if (!ActiveObjects.active_animation) {
                ActiveObjects.active_animation = true;
                var tween = new TWEEN.Tween(start).to(end, time).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                }).onComplete(function () {
                    if (typeof finish == 'function') {
                        finish();
                        ActiveObjects.active_animation = false;
                    }
                }).start();
            }
        },
        onMouseOut: function(current_object) {
            return new Promise(function(resolve, reject) {
                if (
                    ActiveObjects.hoverObject && ActiveObjects.hover_object_scale &&
                    current_object && ActiveObjects.hoverObject.id != current_object.id
                ) {
                    ActiveObjects.scaleAnimate(ActiveObjects.hoverObject.scale, {
                        x: ActiveObjects.hover_object_scale.x,
                        y: ActiveObjects.hover_object_scale.y,
                        z: ActiveObjects.hover_object_scale.z
                    }, 50, function () {
                        ActiveObjects.hover_object_scale = null;
                        ActiveObjects.hoverObject = null;

                        resolve(true);
                    });
                } else {
                    resolve(true);
                }
            });
        },
        onBack: function() {
            $('#prevent-click').show();
            setTimeout(function () {
                ActiveObjects.camera.target = new THREE.Vector3(
                    ActiveObjects.last_position.x,
                    ActiveObjects.last_position.y,
                    ActiveObjects.last_position.z
                );

                ActiveObjects.camera.orientation = new THREE.Vector3(
                    ActiveObjects.last_orientation.x,
                    ActiveObjects.last_orientation.y,
                    ActiveObjects.last_orientation.z
                );

                // Position the camera to fit
                var tween = new TWEEN.Tween(ActiveObjects.camera.position).to({
                    x: ActiveObjects.camera.target.x,
                    y: ActiveObjects.camera.target.y,
                    z: ActiveObjects.camera.target.z
                }, 750).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                    //camera.lookAt(camera.target);
                }).onComplete(function () {
                    $('#prevent-click').hide();
                    //camera.lookAt(camera.target.position);
                }).start();


                var tween = new TWEEN.Tween(ActiveObjects.camera.rotation).to({
                    x: ActiveObjects.camera.orientation.x,
                    y: ActiveObjects.camera.orientation.y,
                    z: ActiveObjects.camera.orientation.z
                }, 750).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                }).onComplete(function () {
                    $('#prevent-click').hide();
                    //camera.lookAt(selectedObject.position);
                }).start();

                //rotate(ActiveObjects.camera);
            }, 500);
        },
        getategoryData: function(id) {
            var result = null;
            if (id && typeof window.all_categories != 'undefined') {
                $.each(window.all_categories, function (i, category) {
                    if (category.ID == id) {
                        result = category;
                        return false;
                    }
                });
            }

            return result;
        },
        onNavigationClick: function($element, skip_transition, current_object) {
            return new Promise(function(resolve, reject) {
                var item = $element.data('item');
                var id = $element.data('id');
                $element.parent().children().removeClass('active');
                $element.addClass('active');
                var object = null;
                skip_transition = skip_transition || false;
                var position = {x: 0, y: 0, z: 0};

                switch (item) {
                    case 'space_science':
                        object = ActiveObjects.actions_array['marker9'][0];
                        position = {x: -1821.676564479289, y: -1694.5164925485412, z: 200, type: 'position'};
                        break;
                    case 'robotics_ai':
                        object = ActiveObjects.actions_array['marker2'][0];
                        position = {x: -1378.7065465702162, y: -567.0976566495842, z: 200, type: 'position'};
                        break;
                    case 'biology':
                        object = ActiveObjects.actions_array['marker'][0];
                        position = {x: -1106.0244892323794, y: 1255.6855393954456, z: 200, type: 'position'};
                        break;
                    case 'applications':
                        object = ActiveObjects.actions_array['marker7'][0];
                        position = {x: -1562.9978763042723, y: -3121.3084941861366, z: 200, type: 'position'};
                        break;
                    case 'engineering':
                        object = ActiveObjects.actions_array['marker3'][0];
                        position = {x: 1159.215069032053, y: -668.55840022084, z: 200, type: 'position'};
                        break;
                    case 'exploration':
                        object = ActiveObjects.actions_array['marker6'][0];
                        position = {x: -1147.2049319778964, y: -3379.7415911295952, z: 200, type: 'position'};
                        break;
                }

                if (current_object) {
                    object = current_object;
                }

                ActiveObjects.current_category_id = 0;

                // disable click events
                if (object) {
                    Globals.activeNavigation = true;
                    ActiveObjects.onMouseOut(object).then(function () {
                        var scale = object.scale.clone();
                        ActiveObjects.showCategoryPopup(id);
                        ActiveObjects.current_category_id = id;

                        if (!skip_transition) {
                            ActiveObjects.setCameraToObject(position, 1.1, true, function () {

                                if (ActiveObjects.hoverObject && ActiveObjects.hoverObject.id == object.id) {
                                    return false;
                                }

                                ActiveObjects.scaleAnimate(object.scale, {
                                    x: object.scale.x + 25, y: object.scale.y + 25, z: object.scale.z + 25
                                }, 300, function () {
                                    ActiveObjects.hover_object_scale = scale;
                                    ActiveObjects.hoverObject = object;
                                    Globals.activeNavigation = false;
                                    resolve(true);
                                });
                            });
                        } else {
                            Globals.activeNavigation = false;
                            resolve(true);
                        }

                        ActiveObjects.current_category_id = id;
                    });
                }
            });
        },
        showCategoryPopup: function(id, hide) {
            var category = ActiveObjects.getategoryData(id);
            if (category) {
                hide = hide || false;
                var name = category.name;
                var questions = category.questions;
                var image = category.image_data ? category.image_data.url : '';

                $('#category_popup .name').text(name);
                $('#category_popup .questions').html(questions);
                if (image) {
                    $('#category_popup .image').show();
                    $('#category_popup .image').css('background-image', 'url(' + image + ')');
                } else {
                    $('#category_popup .image').hide();
                }
                var height = $('#category_popup').outerHeight();
                $('#category_popup').css('margin-top', ((height / -2) + $('nav.navbar ').height() / 2) + 'px');

                if (typeof hide == 'undefined' || !hide) {
                    setTimeout(function () {
                        $('#category_popup').addClass('active');
                    }, 400);
                }

                // show the container
            }
        },
        setCameraToObject: function(selectedObject, distance_ratio, inverse_animation, callback_finish) {
            $('#prevent-click').show();
            setTimeout(function () {
                var object_position = {x: 0, y: 0, z: 0};
                if (typeof selectedObject.type != 'undefined' && selectedObject.type == 'position') {
                    object_position = {
                        x: selectedObject.x,
                        y: selectedObject.y,
                        z: selectedObject.z
                    }
                } else {
                    object_position = {
                        x: selectedObject.position.x,
                        y: selectedObject.position.y,
                        z: selectedObject.position.z
                    }
                }

                ActiveObjects.camera.target = new THREE.Vector3(object_position.x, object_position.y, object_position.z);
                ActiveObjects.last_position = ActiveObjects.camera.position.clone();
                ActiveObjects.last_orientation = ActiveObjects.camera.rotation.clone();

                var point = ActiveObjects.calculateMiddlePoint(
                    ActiveObjects.camera.position,
                    {
                        x: object_position.x,
                        y: object_position.y,
                        z: object_position.z + 1000
                    },
                    distance_ratio
                );

                var check = BounderyIntersection.check(ActiveObjects.camera.position, point);
                point = check.position;

                // Position the camera to fit
                /*
                 var tween = new TWEEN.Tween(ActiveObjects.camera.position).to(point, 1500).easing(TWEEN.Easing.Linear.None)
                 .onUpdate(function () {
                 //ActiveObjects.camera.lookAt(ActiveObjects.camera.target);
                 }).onComplete(function () {
                 //ActiveObjects.camera.lookAt(selectedObject.position);
                 NavigationController.showEducationPanel();
                 }).start();
                 */

                var cam_dir = ActiveObjects.cameraTarget.clone();
                ActiveObjects.camera.lookAt(cam_dir.position);

                if (!inverse_animation) {
                    var tween2 = new TWEEN.Tween({x: cam_dir.position.x, y: cam_dir.position.y, z: cam_dir.position.z})
                        .to({
                            x: cam_dir.position.x,
                            y: cam_dir.position.y,
                            z: object_position.z
                        }, 500).easing(TWEEN.Easing.Linear.None)
                        .onUpdate(function () {
                            ActiveObjects.camera.lookAt(new THREE.Vector3(this.x, this.y, this.z));
                        }).onComplete(function () {
                            var tween = new TWEEN.Tween(ActiveObjects.camera.position).to(point, 250).easing(TWEEN.Easing.Linear.None)
                                .onUpdate(function () {
                                    //ActiveObjects.camera.lookAt(ActiveObjects.camera.target);
                                }).onComplete(function () {
                                    $('#prevent-click').hide();
                                    //ActiveObjects.camera.lookAt(selectedObject.position);
                                    $('#category' + ActiveObjects.current_category_id).trigger('click');
                                    NavigationController.showIntroWindow();
                                }).start();
                        }).start();
                } else {
                    var distance = ActiveObjects.findDistance(ActiveObjects.camera.position,
                        {
                            x: object_position.x,
                            y: object_position.y,
                            z: ActiveObjects.camera.position.z
                        });

                    var time = distance * 10 / 15;

                    var tween = new TWEEN.Tween({x: ActiveObjects.camera.position.x, y: ActiveObjects.camera.position.y, z: ActiveObjects.camera.position.z}).to({x: point.x, y: point.y, z: ActiveObjects.camera.position.z}, time).easing(TWEEN.Easing.Quadratic.Out)
                        .onUpdate(function () {
                            var camera_position = ActiveObjects.camera.position.clone();
                            ActiveObjects.camera.position.set(this.x, this.y, this.z);
                            ActiveObjects.cameraTarget.position.set(
                                ActiveObjects.cameraTarget.position.x + (-camera_position.x + this.x),
                                ActiveObjects.cameraTarget.position.y + (-camera_position.y + this.y),
                                ActiveObjects.cameraTarget.position.z
                            );
                            //ActiveObjects.camera.lookAt(ActiveObjects.camera.target);
                        }).onComplete(function () {
                            $('#prevent-click').hide();
                            if (typeof callback_finish == 'function') {
                                callback_finish();
                            }
                            //ActiveObjects.camera.lookAt(new THREE.Vector3(this.x, this.y, this.z));
                            //NavigationController.showIntroWindow();
                        }).start();
                }


                return false;
                // Position the camera to fit
                var tween = new TWEEN.Tween({t:0}).to({t:1}, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {

                }).onComplete(function () {
                    //ActiveObjects.camera.lookAt(selectedObject.position);
                    NavigationController.showEducationPanel();
                }).start();

                return false;

                var tween = new TWEEN.Tween(ActiveObjects.camera.rotation).to({
                    x: -0.1,
                    y: ActiveObjects.camera.rotation.y,
                    z: ActiveObjects.camera.rotation.z
                }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                }).onComplete(function () {
                }).start();

            }, 250);
        },
        onClick: function(event) {

            if (Globals.activeNavigation) {
                return false;
            }

            var projector = new THREE.Projector();
            var vector = new THREE.Vector3(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5);
            vector.unproject(ActiveObjects.camera);
            //projector.unprojectVector(vector, ActiveObjects.camera);

            var raycaster = new THREE.Raycaster(
                ActiveObjects.camera.position,
                vector.sub(ActiveObjects.camera.position).normalize());
            var intersects = raycaster.intersectObjects(ActiveObjects.mesh_array);

            if (intersects.length > 0) {

                var selectedObject = intersects[0].object;
                ActiveObjects.selected_object = selectedObject;

                var distance = ActiveObjects.findDistance(ActiveObjects.camera.position,
                    {
                        x: selectedObject.position.x,
                        y: selectedObject.position.y,
                        z: ActiveObjects.camera.position.z
                    });

                if (distance > ActiveObjects.distance) {
                    return false;
                }

                //return false;
                ActiveObjects.setCameraToObject(selectedObject, 0.3, false);
            }
        },
        onTouch: function(event) {
            if (Globals.activeNavigation) {
                return false;
            }

            var projector = new THREE.Projector();
            var vector = new THREE.Vector3(
                (event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1,
                -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1,
                0.5);
            vector.unproject(ActiveObjects.camera);
            //projector.unprojectVector(vector, ActiveObjects.camera);

            var raycaster = new THREE.Raycaster(
                ActiveObjects.camera.position,
                vector.sub(ActiveObjects.camera.position).normalize());
            var intersects = raycaster.intersectObjects(ActiveObjects.mesh_array);

            if (intersects.length > 0) {

                var selectedObject = intersects[0].object;
                ActiveObjects.selected_object = selectedObject;

                var distance = ActiveObjects.findDistance(ActiveObjects.camera.position,
                    {
                        x: selectedObject.position.x,
                        y: selectedObject.position.y,
                        z: ActiveObjects.camera.position.z
                    });

                if (distance > ActiveObjects.distance) {
                    return false;
                }

                ActiveObjects.setCameraToObject(selectedObject, 0.3, false);
            }
        }
    };

    var Optimization = {
        minimum_fps: 20,
        timer_bad: null,
        timer_good: null,
        fps_timer: null,
        max_fps: 0,
        check: function(current_fps) {
            return false;
            Optimization.max_fps = Math.max(Optimization.max_fps, current_fps);

            if (!Optimization.fps_timer) {
                Optimization.fps_timer = setTimeout(function () {
                    window.clearTimeout(Optimization.fps_timer);
                    Optimization.fps_timer = null;

                    Optimization.set(Optimization.max_fps);
                }, 1500);
            }
        },
        closeFilters: function(close) {
            if (close) {
                if (Globals.usePostProcessing) {
                    Globals.usePostProcessing = false;
                    return false;
                }
            } else {
                if (!Globals.usePostProcessing) {
                    Globals.usePostProcessing = true;
                    return false;
                }
            }
        },
        set: function(current_fps) {
            if (current_fps > Optimization.minimum_fps) {
                if (Optimization.timer_bad) {
                    window.setTimeout(Optimization.timer_bad);
                    Optimization.timer_bad = null;
                }

                if (!Optimization.timer_good) {
                    Optimization.timer_good = window.setTimeout(function () {
                        // add items
                        window.setTimeout(Optimization.timer_good);
                        Optimization.timer_good = null;
                        Optimization.closeFilters(false);
                    }, 3000);
                }
                // add items
            } else {
                if (Optimization.timer_good) {
                    window.setTimeout(Optimization.timer_good);
                    Optimization.timer_good = null;
                }

                if (!Optimization.timer_bad) {
                    Optimization.timer_bad = window.setTimeout(function () {
                        // remove items
                        window.setTimeout(Optimization.timer_bad);
                        Optimization.timer_bad = null;
                        Optimization.closeFilters(true);
                    }, 3000);
                }
            }
        }
    }

    var NavigationController = {
        $canvas: $('#space_sceen'),
        $into: $('#education'),

        showIntroWindow: function() {
            if (
                typeof window.logedin == 'undefined' || !window.logedin ||
                typeof window.categories_url == 'undefined' || !window.categories_url
            ) {
                $('#scene_back').show();
                NavigationController.$canvas.fadeOut();
                Globals.render = false;
                var v = document.getElementById("spacechallenges-video");
                if (v) {
                    v.play();
                }
            } else {
                window.location = window.categories_url + '?cat=' + ActiveObjects.current_category_id;
            }
        },
        showCanvasPanel: function() {
            if (!Globals.render) {
                $('#scene_back').hide();
                Globals.render = true;
                NavigationController.$canvas.fadeIn();

                if (!Globals.is_mobile) {
                    ActiveObjects.onBack();
                }

                return false;
            }

            return true;
        }
    }

    var FlyingObject = function(mesh, data) {
        this.object = mesh;
        this.tween = null;

        data = typeof data != 'undefined' ? data : {};

        data.position = data.position || {};

        this.sign_one = 1;
        this.sign_two = 1;
        if (Math.floor(Math.random() * 10) % 2 == 0) {
            this.sign_one = -1;
        }
        if (Math.floor(Math.random() * 10) % 2 == 0) {
            this.sign_two = -1;
        }


        var position = {
            x: typeof data.position.x != 'undefined' ? data.position.x : Math.random() * 3000 * this.sign_one + 3000 * this.sign_one,
            y: typeof data.position.y != 'undefined' ? data.position.y : Math.random() * 3000 * this.sign_two + 3000 * this.sign_two,
            z: typeof data.position.z != 'undefined' ? data.position.z : 1000
        };
        this.position = position;
        this.start = {x: this.position.x, y: this.position.y};
        this.sign_one *= -1;
        this.sign_two *= -1;
        this.target = {x: Math.random() * 5000 * this.sign_one + 5000 * this.sign_one, y: Math.random() * 5000 * this.sign_two + 5000 * this.sign_two};



        if (typeof FlyingObject.prototype.set === 'undefined') {
            FlyingObject.prototype.set = function () {
                this.object.position.set(this.position.x, this.position.y, this.position.z);
                this.fly();
                return this.object;
            }
        }

        if (typeof FlyingObject.prototype.fly === 'undefined') {
            FlyingObject.prototype.fly = function () {
                this.tween = new TWEEN.Tween(this.start).to(this.target, 20000);
                var that = this;
                this.tween.onUpdate(function () {
                    that.object.position.set(that.start.x, that.start.y, that.object.position.z);
                });

                //console.log(this.start);

                this.tween.onComplete(function () {
                    //alert(123)
                });

                this.tween.start();
                this.tween.repeat(Infinity);
            }
        }

        return this.set();
    }

    var Lights = {
        setAmbient: function(data) {
            data = typeof data != 'undefined' ? data : {};
            var intensity = data.intensity || 1,
                color = data.color || 0xffffff;

            var ambient_light = new THREE.AmbientLight(color);
            ambient_light.intensity = intensity;
            return ambient_light;
        },
        setDirectionalLight: function(data) {
            data = typeof data != 'undefined' ? data : {};
            data.position = data.position || {};
            var position = {
                x:  5815.560937062276,
                y:  -1963.9115513891593,
                z: 1907.2763804512656
            },

            cast_shadow = true,
            shadowCameraNear = data.shadowCameraNear || 500,
            shadowCameraFar = data.shadowCameraFar || 10000,
            shadowCameraLeft = data.shadowCameraLeft || -2500,
            shadowCameraRight = data.shadowCameraRight || 2500,
            shadowCameraTop = data.shadowCameraTop || 3000,
            shadowCameraBottom = data.shadowCameraBottom || -4000,
            shadowCameraVisible = data.shadowCameraVisible || true,
            shadowMapWidth = data.shadowMapWidth || 2048,
            shadowMapHeight = data.shadowMapHeight || 2048;

            var directionalLight = new THREE.DirectionalLight(0xb2c7c9);
            directionalLight.position.set(position.x, position.y, position.z);
            directionalLight.castShadow = true;
            directionalLight.shadowCameraVisible = true;
            directionalLight.intensity = 3;

            directionalLight.shadowCameraNear = shadowCameraNear;
            directionalLight.shadowCameraFar = shadowCameraFar;
            directionalLight.shadowCameraLeft = shadowCameraLeft;
            directionalLight.shadowCameraRight = shadowCameraRight;
            directionalLight.shadowCameraTop = shadowCameraTop;
            directionalLight.shadowCameraBottom = shadowCameraBottom;

            directionalLight.shadowMapWidth = shadowMapWidth;
            directionalLight.shadowMapHeight = shadowMapHeight;
            directionalLight.shadowCameraVisible = true;
            directionalLight.shadowDarkness = 10;

            return directionalLight;
        },
        pointLight: function(data) {
            data = typeof data != 'undefined' ? data : {};
            data.position = data.position || {};

            var color = data.color || 0xff0000,
                intensity = data.intensity || 5,
                distance = data.distance || 100,
                name = data.name || 'PointLight',
                position = {
                    x: data.position.x || 100,
                    y: data.position.x || 100,
                    z: data.position.x || 100
                };

            var pointLight = new THREE.PointLight();
            pointLight.color = new THREE.Color(color);
            pointLight.intensity = intensity;
            pointLight.distance = distance;
            pointLight.name = name;
            pointLight.position = new THREE.Vector3(position.x, position.y, position.z);

            return pointLight;
        }
    }

    var SphereBackground = {
        radius: 2048,
        segments_x: 32,
        segments_y: 32,
        map: '',
        object: null,
        color: '',

        init: function(data) {
            this.radius = data.radius || this.radius;
            this.map = data.map || this.map;
            this.color = data.color || this.color;
            this.segments_x = data.segments_x || this.segments_x;
            this.segments_y = data.segments_y || this.segments_y;

            var geometry = new THREE.SphereGeometry(this.radius, this.segments_x, this.segments_y);

            var material = new THREE.MeshBasicMaterial();
            if (typeof this.color != 'undefined' && this.color) {
                material.color = this.color;
            }
            if (typeof this.map != 'undefined' && this.map) {
                material.map = THREE.ImageUtils.loadTexture(this.map);
            }
            material.overdraw = 0.5;
            material.side = THREE.DoubleSide;
            material.fog = false;

            this.object = new THREE.Mesh(geometry, material);
            this.object.rotation.set(1,0,1);

            return this.object;
        }
    }

    var Objects = {

        set: function(scene, render, camera, renderer) {

            var promises = [];

            promises.push(new Promise(function(resolve, reject) {
                var loader_ice = new THREE.JSONLoader();
                loader_ice.load(Globals.directory + 'terrain/ice.json', function (geometry_event, materials) {
                    var material_event = new THREE.MeshPhongMaterial({
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/ice-normal.jpg'),
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/Terrain_meshes&rocks_diffuse.jpg'),
                        shininess: 100,
                        reflectivity: 0.2,
                        refractionRatio: 0.4,
                        envMap: THREE.ImageUtils.loadTexture(Globals.directory + "terrain/Moon_baseColorv3.jpg"),
                        //aoMap: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_normals.jpg')
                    });

                    var material2 = new THREE.MeshStandardMaterial({
                        opacity: 0.75,
                        //color: new THREE.Color(0xb3e0ff),
                        //map: THREE.ImageUtils.loadTexture('terrain/Chiseled_Ice.jpg'),
                        premultipliedAlpha: true,
                        transparent: true,
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/Terrain_meshes&rocks_normals.jpg'),
                    });

                    var textureLoader = new THREE.TextureLoader();
                    textureLoader.load(Globals.directory + "terrain/Terrain_meshes&rocks_diffuse.jpg", function (map) {
                        map.anisotropy = 8;
                        material2.map = map;
                        material2.needsUpdate = true;
                    });

                    // create a mesh with models geometry and material
                    var mesh_event = new THREE.Mesh(
                        geometry_event,
                        material2
                    );

                    mesh_event.position.x = -2222.2365689991316;
                    mesh_event.position.y = 3059.6094641430777;
                    mesh_event.position.z = -204.7866499204573;
                    mesh_event.rotation.x = 3.0531085599297465;
                    mesh_event.rotation.y = 0;
                    mesh_event.rotation.z = -1.007563447917359;
                    mesh_event.castShadow = true;
                    mesh_event.receiveShadow = true;
                    mesh_event.scale.set(750, 750, 750);
                    scene.add(mesh_event);

                    mesh_event.geometry.computeVertexNormals();


                    resolve(true);

                    //render();
                    /*
                    resolve([ new ActionObj('ice', [mesh_event])]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_lander = new THREE.JSONLoader();
                loader_lander.load(Globals.directory + 'lander/lander.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'lander/LANDER_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'lander/LAnder1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'lander/LAnder1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture('lander/lander_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    geometry_event.computeFaceNormals();
                    geometry_event.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh.position.set(-1583.7342083046117, -2692.009973163188, 332.25982910067665)
                    mesh.rotation.set(3.040377083129375, 0.0050550108925334, 0.02753247964043185);
                    mesh.scale.set(145, 145, 145);
                    mesh.castShadow = true;

                    scene.add(mesh);

                    var bluePoint = new THREE.PointLight(0x8AD7FF, 4, 333);
                    bluePoint.position.set(-1176.9761441011037, -2690.8765986776366, 457.54175378784356);
                    scene.add(bluePoint);

                    //scene.add(new THREE.PointLightHelper(bluePoint, 3));
                    //gizmoController(bluePoint, scene, camera, renderer, 'point')

                    /*
                    var bluePoint2 = new THREE.PointLight(0x8AD7FF, 6, 140);
                    bluePoint2.position.set(-997.5165067150376, -2524.3871967864548, 356.65294271407464);
                    scene.add(bluePoint2);
                    //scene.add(new THREE.PointLightHelper(bluePoint2, 3));

                    var bluePoint3 = new THREE.PointLight(0x8AD7FF, 6, 140);
                    bluePoint3.position.set(-1354.7080828208075, -2839.2458413177355, 348.7656507474024);
                    scene.add(bluePoint3);
                    */
                    //scene.add(new THREE.PointLightHelper(bluePoint3, 3));

                    /*
                     var bluePoint4 = new THREE.PointLight(0x8AD7FF, 6, 140);
                     bluePoint4.position.set(-988.628336738545, -2870.93599043925, 359.83038342041);
                     scene.add(bluePoint4);
                     scene.add(new THREE.PointLightHelper(bluePoint4, 3));
                     gizmoController(bluePoint4, scene, camera, renderer, 'point')
                     */

                    resolve(true);
                    /*
                    resolve([ new ActionObj('lander', [mesh])]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_solar = new THREE.JSONLoader();
                loader_solar.load(Globals.directory + 'base/solar.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture('base/base1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    var combined = new THREE.Geometry();

                    geometry_event.computeFaceNormals();
                    geometry_event.computeVertexNormals();


                    geometry_event.computeFaceNormals();
                    geometry_event.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh1.position.set(1580.2162987054971, -1892.9959390858985, 389.5555566605302)
                    mesh1.rotation.set(-2.9321142031743506, -0.043261971898644606, -0.23373677526209646);
                    mesh1.scale.set(109, 109, 109);
                    mesh1.castShadow = true;

                    //scene.add(mesh1);

                    // create a mesh with models geometry and material
                    var mesh2 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh2.position.set(2248.0795608199346, -1608.605573836514, 398.0878023223412)
                    mesh2.rotation.set(-2.7477668396776265, -0.15978229076673842, -0.47781640660766506);
                    mesh2.scale.set(109, 109, 109);
                    mesh2.castShadow = true;

                    //scene.add(mesh2);

                    // create a mesh with models geometry and material
                    var mesh3 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh3.position.set(2103.6293598533316, -2123.8086516541516, 363.9946609278576)
                    mesh3.rotation.set(-2.90367410232185, -0.06776075174363687, -0.3848729907452809);
                    mesh3.scale.set(109, 109, 109);
                    mesh3.castShadow = true;


                    THREE.GeometryUtils.merge(combined, mesh1);
                    THREE.GeometryUtils.merge(combined, mesh2);
                    THREE.GeometryUtils.merge(combined, mesh3);

                    var mesh = new THREE.Mesh(combined, material_event);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    //scene.add(mesh3);
                    resolve(true);
                    /*
                    resolve([ new ActionObj('solar', [mesh])]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_rover = new THREE.JSONLoader();
                loader_rover.load(Globals.directory + 'vehicle/rover.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/ROVER2_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover2_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover2_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover2_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh1.position.set(2091.3348166746973, -3529.119105341411, 363.1317365444028)
                    mesh1.rotation.set(3.040377083129375, 0.0050550108925334, 0.02753247964043185);
                    mesh1.scale.set(149, 149, 149);
                    mesh1.castShadow = true;
                    scene.add(mesh1);

                    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
                    var material_b = new THREE.MeshBasicMaterial( {color: 0x000000} );
                    var cube = new THREE.Mesh( geometry, material_b );
                    cube.position.set(1653.7823410851104, -3492.027426682178, 246.47616714907934);
                    scene.add( cube );

                    if (Globals.definition == 1 || Globals.definition == 2) {
                        var spotLight = new THREE.SpotLight(0x8AD7FF, 4, 1000, 0.5, 0.5);
                        spotLight.position.set(2088.818652140928, -3529.119105341411, 504.64147670153966);
                        spotLight.castShadow = true;
                        spotLight.target = cube;
                        scene.add(spotLight);
                    }

                    //scene.add(new THREE.SpotLightHelper(spotLight, 5));
                    //gizmoController(cube, scene, camera, renderer, 'cune')
                    //gizmoController(spotLight, scene, camera, renderer, 'point')

                    var mesh2 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh2.position.set(-3279.1801510903438, -1065.9262065504288, 209.98814840852577);
                    mesh2.rotation.set(3.0571908323685997, -0.014503688536034247, -0.5122683879602181);
                    mesh2.scale.set(149, 149, 149);
                    mesh2.castShadow = true;
                    scene.add(mesh2);

                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('rover1', [mesh1]),
                        new ActionObj('rover2', [mesh2])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_camp = new THREE.JSONLoader();
                loader_camp.load(Globals.directory + 'base2/camp.json', function (geometry_event, materials) {
                    geometry_event.computeVertexNormals();
                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/base1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.7,
                        metalness: 0
                    });

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh.position.set(-688.3981259972325, -3725.9594504971355, 424.3067668033928)
                    mesh.rotation.set(3.040377075716831, 0.005055010426866163, 0.26969491749472024);
                    mesh.scale.set(101, 101, 101);
                    mesh.castShadow = true;

                    scene.add(mesh);

                    /*
                     var bluePoint = new THREE.PointLight(0x8AD7FF, 8, 140);
                     bluePoint.position.set(-565.9422865018923, -3585.8092658097567, 430.3067668033928);
                     scene.add(bluePoint);
                     scene.add(new THREE.PointLightHelper(bluePoint, 3));

                     var bluePoint2 = new THREE.PointLight(0x8AD7FF, 8, 140);
                     bluePoint2.position.set(-647.2150732212431, -3911.722597617439, 456.46608616914943);
                     scene.add(bluePoint2);
                     scene.add(new THREE.PointLightHelper(bluePoint2, 3));
                     */
                    if (Globals.definition == 1) {
                        var bluePoint3 = new THREE.PointLight(0x8AD7FF, 8, 140);
                        bluePoint3.position.set(-692.4371144453452, -3720.83612149132, 509.95857914019655);
                        scene.add(bluePoint3);
                    }
                    //scene.add(new THREE.PointLightHelper(bluePoint3, 3));
                    //gizmoController(bluePoint3, scene, camera, renderer, 'point')

                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('camp', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                resolve(true);
                return false;
                var loader_earth = new THREE.JSONLoader();
                loader_earth.load(Globals.directory + 'terrain/earth.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/1_earth_2k.jpg'),
                        fog: false
                    });

                    geometry_event.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh.position.set(5406.362310148868, 17740.707785673498, 374.2673874589667)
                    mesh.rotation.set(3.128837511005086, 0.03414474756096673, -0.2764904403824457);
                    mesh.scale.set(1492, 1492, 1492);

                    scene.add(mesh);

                    //gizmoController(mesh, scene, camera, renderer, 'earth')

                    resolve(true);
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_marker = new THREE.JSONLoader();
                loader_marker.load(Globals.directory + 'terrain/marker_circle.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/marker.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_antenna = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/antenna.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_base = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/base.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_base2 = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/base2.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_robot = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/robot.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_rover = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/rover.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_rover2 = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/rover2.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_rover3 = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/rover3.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_rover4 = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/rover4.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_shuttle = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/shuttle.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });

                    var material_shuttle2 = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/markers/shuttle2.png'),
                        color: new THREE.Color(0xffffff),
                        metalness: 0.2,
                        roughness: 1,
                        fog: false
                    });



                    geometry_event.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(geometry_event, material_rover4);
                    mesh.id = 1;
                    mesh.position.set(-1720.090715359878, 2029.9079282393932, 400.125616013292);
                    mesh.name = 'biology';
                    mesh.rotation.set(3.128837510073296, 0.03414474756096673, -0.2705676829003382);
                    mesh.scale.set(50, 50, 50);
                    mesh.castShadow = true;

                    scene.add(mesh);

                    var mesh2 = new THREE.Mesh(geometry_event, material_rover);
                    mesh2.id = 2;
                    mesh2.position.set(-1402.472422042421, 439.3094363983164, 402.620211819868);
                    mesh2.rotation.set(3.128837510073296, 0.03414474756096673, -0.2705676829003382);
                    mesh2.scale.set(42, 42, 42);
                    mesh2.name = 'robotics_ai';
                    mesh2.castShadow = true;
                    scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(geometry_event, material_base2);
                    mesh3.id = 3;
                    mesh3.position.set(1130.1544178010722, 441.46572660061565, 490.0419029747867);
                    mesh3.rotation.set(3.1176669256061653, 0.027499056628014395, 0.08802251393764951);
                    mesh3.scale.set(42, 42, 42);
                    mesh3.castShadow = true;
                    mesh3.name = 'engineering';
                    scene.add(mesh3);

                    var mesh4 = new THREE.Mesh(geometry_event, material_shuttle);
                    mesh4.id = 4;
                    mesh4.position.set(1890.5393172793906, 65.4021224398785, 490.0419029747867);
                    mesh4.rotation.set(3.10804431551483, 0.014250599683524073, 0.5411032859635264);
                    mesh4.scale.set(42, 42, 42);
                    mesh4.castShadow = true;
                    mesh4.name = 'engineering';
                    scene.add(mesh4);

                    var mesh5 = new THREE.Mesh(geometry_event, material_rover2);
                    mesh5.id = 5;
                    mesh5.position.set(-3123.642715042483, -1003.9987989421778, 694.4377624197921);
                    mesh5.rotation.set(-3.131307550197506, 0.03496790232332318, -0.9142849071639784);
                    mesh5.scale.set(30, 30, 30);
                    mesh5.castShadow = true;
                    mesh5.name = 'space_science';
                    scene.add(mesh5);

                    var mesh6 = new THREE.Mesh(geometry_event, material_shuttle2);
                    mesh6.id = 6;
                    mesh6.position.set(-1151.2731354505847, -2637.214126859925, 800.6636739959333);
                    mesh6.rotation.set(3.1294160514665776, 0.034355249334168204, -0.28746227747340053);
                    mesh6.scale.set(26, 26, 26);
                    mesh6.castShadow = true;
                    mesh6.name = 'exploration';
                    scene.add(mesh6);

                    var mesh7 = new THREE.Mesh(geometry_event, material_antenna);
                    mesh7.id = 7;
                    mesh7.position.set(-2045.4501770269649, -2615.804377586201, 1020.7697859469681);
                    mesh7.rotation.set(-3.123875262623245, 0.031854275632658, -1.1358657272742518);
                    mesh7.scale.set(28, 28, 28);
                    mesh7.castShadow = true;
                    mesh7.name = 'applications';
                    scene.add(mesh7);

                    var mesh8 = new THREE.Mesh(geometry_event, material_base);
                    mesh8.id = 8;
                    mesh8.position.set(-719.1066403925104, -3648.3240194442915, 900.3088580467785);
                    mesh8.rotation.set(3.13143709145115, 0.03500573344631458, -0.345733556936537);
                    mesh8.scale.set(28, 28, 28);
                    mesh8.castShadow = true;
                    mesh8.name = 'robotics_ai';
                    scene.add(mesh8);

                    var mesh9 = new THREE.Mesh(geometry_event, material_rover2);
                    mesh9.id = 9;
                    mesh9.position.set(-2095.5020906810114, -859.8556088686483, 584.1693888311729);
                    mesh9.rotation.set(3.13143709145115, 0.03500573344631458, -0.345733556936537);
                    mesh9.scale.set(33, 33, 33);
                    mesh9.castShadow = true;
                    mesh9.name = 'space_science';
                    scene.add(mesh9);

                    //gizmoController(mesh9, scene, camera, renderer, 'marekr')

                    resolve([
                        new ActionObj('marker', [mesh]),
                        new ActionObj('marker2', [mesh2]),
                        new ActionObj('marker3', [mesh3]),
                        new ActionObj('marker4', [mesh4]),
                        new ActionObj('marker5', [mesh5]),
                        new ActionObj('marker6', [mesh6]),
                        new ActionObj('marker7', [mesh7]),
                        new ActionObj('marker8', [mesh8]),
                        new ActionObj('marker9', [mesh9])
                    ]);
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_antena = new THREE.JSONLoader();
                loader_antena.load(Globals.directory + 'base2/antena.json', function (geometry_event, materials) {
                    geometry_event.computeVertexNormals();
                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/base1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh.position.set(-676.4257534210346, -3482.8515547925663, 460.99765794498666)
                    mesh.rotation.set(-3.1207029935336696, -0.06314659469563595, 2.5161092783486687);
                    mesh.scale.set(101, 101, 101);
                    mesh.castShadow = true;

                    scene.add(mesh);

                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('antena', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_astronaut = new THREE.JSONLoader();
                loader_astronaut.load(Globals.directory + 'base2/astronaut.json', function (geometry_event, materials) {
                    geometry_event.computeVertexNormals();
                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/base1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    var combined = new THREE.Geometry();
                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh1.position.set(-710.1034623949946, -3343.0974221810798, 392.1248207177898);
                    mesh1.rotation.set(-3.1207029935336696, -0.06314659469563595, 2.5161092783486687);
                    mesh1.scale.set(26, 26, 26);
                    mesh1.castShadow = true;
                    //scene.add(mesh1);

                    var mesh2 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh2.position.set(-541.5392951615735, -3512.833402549815, 403.708637145953);
                    mesh2.rotation.set(-3.1207029935336696, -0.06314659469563595, 2.5161092783486687);
                    mesh2.scale.set(26, 26, 26);
                    mesh2.castShadow = true;

                    //scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh3.position.set(-291.04562894078424, -3364.930028587068, 374.5399789619356);
                    mesh3.rotation.set(3.077743162454491, 0.018628041034888288, 0.34210231832633775);
                    mesh3.scale.set(26, 26, 26);
                    mesh3.castShadow = true;

                    //scene.add(mesh3);

                    THREE.GeometryUtils.merge(combined, mesh1);
                    THREE.GeometryUtils.merge(combined, mesh2);
                    THREE.GeometryUtils.merge(combined, mesh3);

                    var mesh = new THREE.Mesh(combined, material_event);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);


                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('astronaut', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_sattelite = new THREE.JSONLoader();
                loader_sattelite.load(Globals.directory + 'base3/satellite.json', function (geometry) {
                    geometry.computeVertexNormals();
                    var material = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base3/Satelite_diffuse.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base3/Satelite_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base3/Satelite_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base3/Satelite_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(-2801.9087460402475, -3066.1549699013394, 223.47552964309668);
                    mesh.rotation.set(3.031611662535413, -0.05307759717215287, -0.5433183252860815);
                    mesh.scale.set(123, 123, 123);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    //gizmoController(mesh, scene, camera, renderer, 'Satellite');

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('satellite', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_asteroid = new THREE.JSONLoader();
                loader_asteroid.load(Globals.directory + 'base4/asteroid.json', function (geometry) {
                    var material = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base4/Terrain_meshes&rocks_diffuse.jpg'),
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base4/Terrain_meshes&rocks_normals.jpg'),
                        shininess: 30
                    });

                    var material2 = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base4/Terrain_meshes&rocks_diffuse.jpg'),
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base4/Terrain_meshes&rocks_normals.jpg'),
                        shininess: 5
                    });

                    geometry.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(-3546.169327724694, -1292.6716697763425, 171.7986461271821);
                    mesh.rotation.set(-3.1087883515180215, -0.11760323756972711, 0.8523218698205871);
                    mesh.scale.set(140, 140, 140);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    if (Globals.definition == 1) {
                        var spotLight = new THREE.SpotLight(0xF7F131, 2, 600, 0.45, 0.4);
                        spotLight.position.set(-3445.7725490157222, -936.6166292295972, 420.4770632509405);
                        spotLight.castShadow = true;
                        spotLight.target = mesh;

                        //scene.add(spotLight);

                        var spotLight2 = new THREE.SpotLight(0xF7F131, 2, 600, 0.45, 0.4);
                        spotLight2.position.set(-3836.824249271646, -1181.734066574996, 420.4770632509405);
                        spotLight2.castShadow = true;
                        spotLight2.target = mesh;
                        scene.add(spotLight2);
                    }

                    /*
                    var mesh_fly = new THREE.Mesh(
                        geometry,
                        material2
                    );

                    mesh_fly.scale.set(56, 56, 56);
                    mesh_fly.castShadow = true;
                    scene.add(mesh_fly);
                    mesh_fly.rotation.set(-3.1087883515180215, -0.11760323756972711, 0.8523218698205871);

                    var mesh_fly2 = new THREE.Mesh(
                        geometry,
                        material2
                    );

                    mesh_fly2.rotation.set(-3.1087883515180215, -0.11760323756972711, 0.8523218698205871);
                    mesh_fly2.scale.set(25, 25, 25);
                    mesh_fly2.castShadow = true;
                    scene.add(mesh_fly2);


                    var mesh_fly3 = new THREE.Mesh(
                        geometry,
                        material2
                    );

                    mesh_fly3.rotation.set(-3.1087883515180215, -0.11760323756972711, 0.8523218698205871);
                    mesh_fly3.scale.set(44, 44, 44);
                    mesh_fly3.castShadow = true;
                    scene.add(mesh_fly3);


                    var mesh_fly4 = new THREE.Mesh(
                        geometry,
                        material2
                    );
                    mesh_fly4.rotation.set(-3.1087883515180215, -0.11760323756972711, 0.8523218698205871);
                    mesh_fly4.scale.set(29, 29, 29);
                    mesh_fly4.castShadow = true;
                    scene.add(mesh_fly4);

                    new FlyingObject(mesh_fly);
                    new FlyingObject(mesh_fly2);
                    new FlyingObject(mesh_fly3);
                    new FlyingObject(mesh_fly4);
                    */
                    //gizmoController(spotLight, scene, camera, renderer, 'spot light')

                    //spotLight.shadow.camera.near = 1000;
                    //spotLight.shadow.camera.far = 8000;
                    //spotLight.shadow.camera.fov = 30;


                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('asteroid', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_driller = new THREE.JSONLoader();
                loader_driller.load(Globals.directory + 'vehicle/driller.json', function (geometry_event, materials) {
                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/DRILLER_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/driller_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/driller_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/driller_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh1.position.x = -2637.3717737284005;
                    mesh1.position.y = 1995.0920781689194;
                    mesh1.position.z = -202.3018476338444;
                    mesh1.rotation.x = 3.054773401897112;
                    mesh1.rotation.y = 0.01710517296739121;
                    mesh1.rotation.z = -0.19404299853379978;
                    mesh1.scale.set(185, 185, 185);
                    mesh1.castShadow = true;
                    scene.add(mesh1);

                    var mesh2 = new THREE.Mesh(geometry_event, material_event);
                    mesh2.position.set(-2250.2254184125404, 2831.0630981102518, -258.2685488666977);
                    mesh2.rotation.set(-3.0841573126655057, -0.06734690407265365, 2.2778467885560194);
                    mesh2.scale.set(185, 185, 185);
                    mesh2.castShadow = true;
                    scene.add(mesh2);

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('driller1', [mesh1]),
                        new ActionObj('driller2', [mesh2])
                    ]);
                    */
                });
            }));

            // lamp loader
            promises.push(new Promise(function(resolve, reject) {
                var loader_lamp = new THREE.JSONLoader();
                loader_lamp.load(Globals.directory + 'terrain/lamp.json', function (geometry_event, materials) {
                    var material_event = new THREE.MeshPhongMaterial({
                        color: new THREE.Color(0x999999),
                        shininess: 10
                    });

                    var combined = new THREE.Geometry();
                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(geometry_event, material_event);

                    mesh1.castShadow = true;
                    mesh1.position.set(-2605.2678701106656, 2536.6116276730304, -153.9111774416821);
                    mesh1.rotation.set(-3.0841573163931035, -0.06734690407265365, -0.7217269641424024);
                    mesh1.scale.set(200, 200, 200);
                    mesh1.castShadow = true;
                    //scene.add(mesh1);

                    var mesh2 = new THREE.Mesh(geometry_event, material_event);
                    mesh2.castShadow = true;
                    mesh2.position.set(-2102.980218109571, 2415.175991910018, -160.65496682689258);
                    mesh2.rotation.set(3.1175339557670414, -0.08515874930147171, -1.7044845922767207);
                    mesh2.scale.set(200, 200, 200);
                    mesh2.castShadow = true;
                    //scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(geometry_event, material_event);
                    mesh3.castShadow = true;
                    mesh3.position.set(-1692.3375184932886, 2601.673767139308, -182.08329775612637);
                    mesh3.rotation.set(3.0553355966403806, -0.01975150306229844, -2.7750243096181);
                    mesh3.scale.set(200, 200, 200);
                    mesh3.castShadow = true;
                    //scene.add(mesh3);

                    var mesh4 = new THREE.Mesh(geometry_event, material_event);
                    mesh4.castShadow = true;
                    mesh4.position.set(-3843.5051622988817, -1197.8557778049133, 321.56210542667884);
                    mesh4.rotation.set(-3.060248576994929, 0.03486053362680123, 0.5460257266958075);
                    mesh4.scale.set(200, 200, 200);
                    mesh4.castShadow = true;
                    //scene.add(mesh4);

                    var mesh5 = new THREE.Mesh(geometry_event, material_event);
                    mesh5.castShadow = true;
                    mesh5.position.set(-3539.956516452432, -978.0494883370933, 272.90484180350325);
                    mesh5.rotation.set(-3.1305341644622198, 0.08779213329380738, 1.5873485818091957);
                    mesh5.scale.set(200, 200, 200);
                    mesh5.castShadow = true;
                    //scene.add(mesh5);

                    THREE.GeometryUtils.merge(combined, mesh1);
                    THREE.GeometryUtils.merge(combined, mesh2);
                    THREE.GeometryUtils.merge(combined, mesh3);
                    THREE.GeometryUtils.merge(combined, mesh4);
                    THREE.GeometryUtils.merge(combined, mesh5);

                    var mesh = new THREE.Mesh(combined, material_event);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    // add lamp lights
                    /*
                     var bluePoint = new THREE.PointLight(0x8AD7FF, 10, 100);
                     bluePoint.position.set(-1847.690991794874, 2707.5260344284075, -160.4461710221736);
                     scene.add(bluePoint);
                     */
                    /*
                    var bluePoint2 = new THREE.PointLight(0x8AD7FF, 10, 100);
                    bluePoint2.position.set(-2140.052802461263, 2573.232646980367, -167.82436322130133);
                    scene.add(bluePoint2);
                    //scene.add(new THREE.PointLightHelper(bluePoint2, 3));

                    var bluePoint3 = new THREE.PointLight(0x8AD7FF, 10, 100);
                    bluePoint3.position.set(-2515.922138886294, 2633.498063236924, -90.3229184592114);
                    scene.add(bluePoint3);
                    //scene.add(new THREE.PointLightHelper(bluePoint3, 3));
                    */
                    //gizmoController(bluePoint, scene, camera, renderer, 'blue point 1');
                    //gizmoController(bluePoint2, scene, camera, renderer, 'blue point 2');
                    //gizmoController(bluePoint3, scene, camera, renderer, 'lamp 4');

                    resolve(true);
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_driller3 = new THREE.JSONLoader();
                loader_driller3.load(Globals.directory + 'vehicle/driller3.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/ROVER3_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/Rover3_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/Rover3_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover3_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(geometry_event, material_event);

                    mesh1.position.set(-2256.682139575714, -582.3776972094093, 134.3535874394895);
                    mesh1.rotation.set(3.108661188559257, 0.08214251796061826, -1.3798043208658213);
                    mesh1.scale.set(142, 142, 142);
                    mesh1.castShadow = true;
                    scene.add(mesh1);


                    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
                    var material_b = new THREE.MeshBasicMaterial( {color: 0x000000} );
                    var cube = new THREE.Mesh( geometry, material_b );
                    cube.position.set(-1987.1774386845666, -418.43076669704914, 13.748738413024824);
                    scene.add( cube );

                    if (Globals.definition == 1 || Globals.definition == 2) {
                        var spotLight = new THREE.SpotLight(0x8AD7FF, 3, 1000, 0.6, 0.6);
                        spotLight.position.set(-2145.7340262487915, -1012.1089933512413, 514.596834507335);
                        spotLight.castShadow = true;
                        spotLight.target = cube;
                        scene.add(spotLight);
                    }
                    //scene.add(new THREE.SpotLightHelper(spotLight, 5));
                    //gizmoController(cube, scene, camera, renderer, 'cube')
                    //gizmoController(spotLight, scene, camera, renderer, 'point')



                    var mesh2 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh2.position.set(1229.1610845179728, -1194.781915043161, 143.86125197112548);
                    mesh2.rotation.set(2.9415720106608045, -0.016042678504802968, 2.3642718387917814);
                    mesh2.scale.set(130, 130, 130);
                    mesh2.castShadow = true;
                    scene.add(mesh2);

                    var geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
                    var material_b1 = new THREE.MeshBasicMaterial( {color: 0x000000} );
                    var cube1 = new THREE.Mesh( geometry1, material_b1 );
                    cube1.position.set(1055.4891722072832, -1107.5170816464527, 47.74711275688827);
                    scene.add(cube1);

                    if (Globals.definition == 1) {
                        var spotLight1 = new THREE.SpotLight(0x8AD7FF, 3, 1000, 0.55, 0.55);
                        spotLight1.position.set(1349.9396521751273, -832.0778127586335, 224.84842070818246);
                        spotLight1.castShadow = true;
                        spotLight1.target = cube1;
                        scene.add(spotLight1);
                    }
                    //scene.add(new THREE.SpotLightHelper(spotLight1, 5));
                    //gizmoController(cube1, scene, camera, renderer, 'cube')
                    //gizmoController(spotLight1, scene, camera, renderer, 'point')


                    var mesh3 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh3.position.set(-348.36797403899874, -3310.7178499121287, 420.8810128797632);
                    mesh3.rotation.set(3.124505287048616, 0.11684645153484956, 0.8000474976920448);
                    mesh3.scale.set(111, 111, 111);
                    mesh3.castShadow = true;
                    scene.add(mesh3);

                    var mesh4 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh4.position.set(-3603.0389639768396, -1159.9638946400182, 182.38164768472518);
                    mesh4.rotation.set(2.917159517891949, -0.1139977656528539, -0.43260595785793016);
                    mesh4.scale.set(111, 111, 111);
                    mesh4.castShadow = true;
                    scene.add(mesh4);

                    //scene.add(new THREE.SpotLightHelper(spotLight1, 5));
                    //gizmoController(cube1, scene, camera, renderer, 'cube')
                    //gizmoController(spotLight1, scene, camera, renderer, 'point')

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('driller31', [mesh1]),
                        new ActionObj('driller32', [mesh2]),
                        new ActionObj('driller33', [mesh3]),
                        new ActionObj('driller34', [mesh4]),
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_buggy = new THREE.JSONLoader();
                loader_buggy.load(Globals.directory + 'vehicle/buggy.json', function (geometry_event, materials) {

                    var material_event = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/ROVER1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'vehicle/rover1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(geometry_event, material_event);

                    mesh1.position.set(-1442.0700675521832, 520.3081992152929, 85.82987398097332);
                    mesh1.rotation.set(3.0130708448514247, 0.08073792814970265, 0.5434126602022696);
                    mesh1.scale.set(164, 164, 164);
                    mesh1.castShadow = true;
                    scene.add(mesh1);

                    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
                    var material_b = new THREE.MeshBasicMaterial( {color: 0x000000} );
                    var cube = new THREE.Mesh( geometry, material_b );
                    cube.position.set(-1745.9375561317324, 628.4503723129392, 85.82987398097332);
                    scene.add( cube );

                    if (Globals.definition == 1) {
                        var spotLight = new THREE.SpotLight(0x8AD7FF, 3, 1000, 0.5, 0.5);
                        spotLight.position.set(-1453.5205693854339, 413.47584310498, 365.3923603056319);
                        //spotLight.castShadow = true;
                        spotLight.target = cube;
                        scene.add(spotLight);
                    }
                    //scene.add(new THREE.SpotLightHelper(spotLight, 5));
                    //gizmoController(cube, scene, camera, renderer, 'cube')
                    //gizmoController(spotLight, scene, camera, renderer, 'point')




                    var mesh2 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh2.position.set(1466.135750690398, 293.0415853739095, -14.177129417893404);
                    mesh2.rotation.set(2.9974850519077414, 0.053999635019278985, -2.0970577820450393);
                    mesh2.scale.set(120, 120, 120);
                    mesh2.castShadow = true;
                    scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh3.position.set(382.52858547761565, -1352.0442821268455, 307.2180541791211);
                    mesh3.rotation.set(2.8633951416742764, -0.09952847476914896, -0.7635953944934483);
                    mesh3.scale.set(120, 120, 120);
                    mesh3.castShadow = true;
                    scene.add(mesh3);

                    var geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
                    var material_b1 = new THREE.MeshBasicMaterial( {color: 0x000000} );
                    var cube1 = new THREE.Mesh( geometry1, material_b1 );
                    cube1.position.set(131.18210362734453, -1710.8959940381808, 385.4646062810681);
                    scene.add( cube1 );

                    if (Globals.definition == 1) {
                        var spotLight1 = new THREE.SpotLight(0x8AD7FF, 4, 1000, 0.5, 0.5);
                        spotLight1.position.set(463.89940972013716, -1297.0211907988337, 367.03471205135844);
                        spotLight.castShadow = true;
                        spotLight1.target = cube1;
                        scene.add(spotLight1);
                    }

                    //scene.add(new THREE.SpotLightHelper(spotLight1, 5));
                    //gizmoController(cube1, scene, camera, renderer, 'cune')
                    //gizmoController(spotLight1, scene, camera, renderer, 'point')

                    var mesh4 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh4.position.set(-2178.6858601570266, -2566.635468233153, 249.16392254034884);
                    mesh4.rotation.set(3.052687926952202, 0.0011716442302147595, -0.8164515365491853);
                    mesh4.scale.set(120, 120, 120);
                    mesh4.castShadow = true;
                    scene.add(mesh4);

                    var mesh5 = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    mesh5.position.set(2534.939172550305, 1596.9723780629322, 67.01815804582372);
                    mesh5.rotation.set(2.8149897116617746, -0.15190741363716306, 1.9894701475182768);
                    mesh5.scale.set(120, 120, 120);
                    mesh5.castShadow = true;
                    scene.add(mesh5);


                    resolve(true);
                    /*
                    resolve([
                        new ActionObj('buggy1', [mesh1]),
                        new ActionObj('buggy2', [mesh2]),
                        new ActionObj('buggy3', [mesh3]),
                        new ActionObj('buggy4', [mesh4]),
                        new ActionObj('buggy5', [mesh5]),
                    ]);
                    */

                    //gizmoController(mesh5, scene, camera, renderer, 'gizmo');
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_platform = new THREE.JSONLoader();
                loader_platform.load(Globals.directory + 'base/platform.json', function (geometry) {

                    var material = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base/PLATFORM_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/PLATFORM_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/PLATFORM_Metalic_FINAL.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/PLATFORM_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(1888.901201673611, 66.18471967914958, -4.851170313884353);
                    mesh.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                    mesh.scale.set(93, 93, 93);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    //scene.add(new THREE.PointLightHelper(redPoint, 3));

                    if (Globals.definition == 1 || Globals.definition == 2) {
                        var redPoint = new THREE.PointLight(0xFF4242, 10, 150);
                        redPoint.position.set(1392.54502266413, 496.7025603409263, 6.157350554849103);
                        scene.add(redPoint);

                        if (Globals.definition == 1) {
                            var redPoint1 = new THREE.PointLight(0xFF4242, 10, 150);
                            redPoint1.position.set(1883.7285842526867, 41.31665417124851, 82.40439900778269);
                            scene.add(redPoint1);
                        }
                        //scene.add(new THREE.PointLightHelper(redPoint1, 3));
                    }

                    //gizmoController(redPoint, scene, camera, renderer, 'point');

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('platform', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_shuttle = new THREE.JSONLoader();
                loader_shuttle.load(Globals.directory + 'base/shuttle.json', function (geometry) {

                    var material = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base/SHUTTLE_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/SHUTTLE_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/SHUTTLE_Metalic_FINAL.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/SHUTTLE_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    geometry.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(1882.645853767493, 69.1520995539387, 219.21655429345472);
                    mesh.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                    mesh.scale.set(100, 100, 100);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('shuttle', [mesh])
                    ]);
                    */
                });
            }));

            /*
            var loader_shuttle = new THREE.JSONLoader();
            loader_shuttle.load('base/shuttle.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base/SHUTTLE_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('base/SHUTTLE_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                mesh.position.set(1882.645853767493, 69.1520995539387, 219.21655429345472);
                mesh.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                mesh.scale.set(100, 100, 100);
                mesh.castShadow = true;
                scene.add(mesh);

                render();
            });
            */

            promises.push(new Promise(function(resolve, reject) {
                var loader_moon_rocks = new THREE.JSONLoader();
                loader_moon_rocks.load(Globals.directory + 'terrain/moonrock.json', function (geometry) {
                    var material = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/Terrain_meshes&rocks_diffuse.jpg'),
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/Terrain_meshes&rocks_normals.jpg'),
                        shininess: 30
                    });

                    geometry.computeVertexNormals();

                    var combined = new THREE.Geometry();

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(geometry, material);
                    mesh1.position.set(-2328.312986414617, -1712.2997371561191, 223.0265979295336);
                    mesh1.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                    mesh1.scale.set(100, 100, 100);
                    mesh1.castShadow = true;
                    //scene.add(mesh1);

                    var mesh2 = new THREE.Mesh(geometry, material);
                    mesh2.position.set(-2312.5231500235564, -1765.717271824868, 270.79719495526297);
                    mesh2.rotation.set(3.08116403781128, 0.12110828239825468, -0.5172186562182214);
                    mesh2.scale.set(70, 70, 70);
                    mesh2.castShadow = true;
                    //scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(geometry, material);
                    mesh3.position.set(-2301.4467361776606, -1713.4910014054753, 270.79719495526297);
                    mesh3.rotation.set(-3.035625785916709, 0.0842530952654609, -1.8829624122415007);
                    mesh3.scale.set(100, 100, 100);
                    mesh3.castShadow = true;
                    //scene.add(mesh3);

                    var mesh4 = new THREE.Mesh(geometry, material);
                    mesh4.position.set(-1233.8006656034659, -3177.204569510493, 380.54466947979427);
                    mesh4.rotation.set(-3.035625785916709, 0.0842530952654609, -1.8829624122415007);
                    mesh4.scale.set(100, 100, 100);
                    mesh4.castShadow = true;
                    //scene.add(mesh4);

                    var mesh5 = new THREE.Mesh(geometry, material);
                    mesh5.position.set(-1086.7482479411244, -3307.0089271142842, 410.58143190980644);
                    mesh5.rotation.set(-3.055501634506803, -0.10448108368955746, -2.417666514467502);
                    mesh5.scale.set(82, 82, 82);
                    mesh5.castShadow = true;
                    //scene.add(mesh5);

                    var mesh6 = new THREE.Mesh(geometry, material);
                    mesh6.position.set(-183.98158262177006, -3339.257435528338, 407.492282601606);
                    mesh6.rotation.set(-3.055501634506803, -0.10448108368955746, -2.417666514467502);
                    mesh6.scale.set(167, 167, 167);
                    mesh6.castShadow = true;
                    //scene.add(mesh6);

                    var mesh7 = new THREE.Mesh(geometry, material);
                    mesh7.position.set(-253.50749279198948, -2724.882612127914, 363.22028880555956);
                    mesh7.rotation.set(-3.135540934774521, -0.13514642818269548, -3.064086003098199);
                    mesh7.scale.set(142, 142, 142);
                    mesh7.castShadow = true;
                    //scene.add(mesh7);

                    var mesh8 = new THREE.Mesh(geometry, material);
                    mesh8.position.set(-52.106795023553474, -2559.1014261601395, 394.3494175502253);
                    mesh8.rotation.set(-3.0555016419704915, -0.10448109118099023, -1.2194945760128038);
                    mesh8.scale.set(83, 83, 83);
                    mesh8.castShadow = true;
                    //scene.add(mesh8);

                    var mesh9 = new THREE.Mesh(geometry, material);
                    mesh9.position.set(-1633.626139115006, -339.3288228294936, 148.8503864139436);
                    mesh9.rotation.set(-3.130953635159007, 0.10188314355901416, -1.2195931998362577);
                    mesh9.scale.set(191, 191, 191);
                    mesh9.castShadow = true;
                    //scene.add(mesh9);

                    var mesh10 = new THREE.Mesh(geometry, material);
                    mesh10.position.set(-1539.0269077466523, -671.7358987484251, 146.96237335136058);
                    mesh10.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                    mesh10.scale.set(169, 169, 169);
                    mesh10.castShadow = true;
                    //scene.add(mesh10);

                    var mesh11 = new THREE.Mesh(geometry, material);
                    mesh11.position.set(-505.04705345683755, 1246.2381120820703, 48.69776665635181);
                    mesh11.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                    mesh11.scale.set(332, 332, 332);
                    mesh11.castShadow = true;
                    //scene.add(mesh11);

                    var mesh12 = new THREE.Mesh(geometry, material);
                    mesh12.position.set(-2414.111459609236, 2000.019514933828, -139.91041487011873);
                    mesh12.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                    mesh12.scale.set(107, 107, 107);
                    mesh12.castShadow = true;
                    //scene.add(mesh12);

                    var mesh13 = new THREE.Mesh(geometry, material);
                    mesh13.position.set(-2604.776885587, 2046.3951490215172, -138.25409282686402);
                    mesh13.rotation.set(-3.0883315771493374, -0.08754129990470265, 2.573797874460198);
                    mesh13.scale.set(80, 80, 80);
                    mesh13.castShadow = true;
                    //scene.add(mesh13);

                    THREE.GeometryUtils.merge(combined, mesh1);
                    THREE.GeometryUtils.merge(combined, mesh2);
                    THREE.GeometryUtils.merge(combined, mesh3);
                    THREE.GeometryUtils.merge(combined, mesh4);
                    THREE.GeometryUtils.merge(combined, mesh5);
                    THREE.GeometryUtils.merge(combined, mesh6);
                    THREE.GeometryUtils.merge(combined, mesh7);
                    THREE.GeometryUtils.merge(combined, mesh8);
                    THREE.GeometryUtils.merge(combined, mesh9);
                    THREE.GeometryUtils.merge(combined, mesh10);
                    THREE.GeometryUtils.merge(combined, mesh11);
                    THREE.GeometryUtils.merge(combined, mesh12);
                    THREE.GeometryUtils.merge(combined, mesh13);

                    var mesh = new THREE.Mesh(combined, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);

                    //gizmoController(mesh13, scene, camera, renderer, 'rock');
                    resolve(true);
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_boxes = new THREE.JSONLoader();
                loader_boxes.load(Globals.directory + 'base2/boxes.json', function (geometry) {
                    var material = new THREE.MeshPhongMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base2/BASE1_DIFFUSE_FINAL.jpg'),
                        specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/base1_specular_mix.jpg'),
                        shininess: 30
                    });

                    var combined = new THREE.Geometry();

                    // create a mesh with models geometry and material
                    var mesh1 = new THREE.Mesh(geometry, material);
                    mesh1.position.set(1813.3790482673069, -269.2569951004197, 21.754769935148484);
                    mesh1.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                    mesh1.scale.set(11.61, 11.61, 11.61);
                    mesh1.castShadow = true;
                    //scene.add(mesh1);

                    var mesh2 = new THREE.Mesh(geometry, material);
                    mesh2.position.set(1844.6618133022241, -338.1878356833019, 27.947927254277);
                    mesh2.rotation.set(3.105276147399598, -0.032676267831790326, 2.8871311099577612);
                    mesh2.scale.set(11.61, 11.61, 11.61);
                    mesh2.castShadow = true;
                    //scene.add(mesh2);

                    var mesh3 = new THREE.Mesh(geometry, material);
                    mesh3.position.set(125.56025149992954, -3860.551532888839, 413.4845043620769);
                    mesh3.rotation.set(3.105276147399598, -0.032676267831790326, 2.8871311099577612);
                    mesh3.scale.set(11.61, 11.61, 11.61);
                    mesh3.castShadow = true;
                    //scene.add(mesh3);

                    var mesh4 = new THREE.Mesh(geometry, material);
                    mesh4.position.set(69.00182107077647, -3825.9452443203877, 413.4845043620769);
                    mesh4.rotation.set(3.125918066578487, 0.04626705702886343, 0.9107399022904402);
                    mesh4.scale.set(11.61, 11.61, 11.61);
                    mesh4.castShadow = true;
                    //scene.add(mesh4);

                    var mesh5 = new THREE.Mesh(geometry, material);
                    mesh5.position.set(-3713.7730582012077, -1006.7391632425139, 249.87315127496584);
                    mesh5.rotation.set(3.03307579866708, -0.024515618309992125, 0.909630960959743);
                    mesh5.scale.set(11.61, 11.61, 11.61);
                    mesh5.castShadow = true;
                    //scene.add(mesh5);

                    var mesh6 = new THREE.Mesh(geometry, material);
                    mesh6.position.set(-3777.974700278944, -1049.1197833216677, 249.87315127496584);
                    mesh6.rotation.set(3.0053412819371674, -0.03353300642327122, -0.858415094090414);
                    mesh6.scale.set(11.61, 11.61, 11.61);
                    mesh6.castShadow = true;
                    //scene.add(mesh6);

                    THREE.GeometryUtils.merge(combined, mesh1);
                    THREE.GeometryUtils.merge(combined, mesh2);
                    THREE.GeometryUtils.merge(combined, mesh3);
                    THREE.GeometryUtils.merge(combined, mesh4);
                    THREE.GeometryUtils.merge(combined, mesh5);
                    THREE.GeometryUtils.merge(combined, mesh6);

                    var mesh = new THREE.Mesh(combined, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);

                    resolve(true);
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_base1 = new THREE.JSONLoader();
                loader_base1.load(Globals.directory + 'base/base.json', function (geometry) {

                    var material = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE1_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/base1_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    geometry.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(1196.1245555923617, 72.17198194610403, 4.619589207532803);
                    mesh.rotation.set(3.0539275684482554, -0.01779928350362459, 0.8072355095326471);
                    mesh.scale.set(676, 676, 676);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('base', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader_base2 = new THREE.JSONLoader();
                loader_base2.load(Globals.directory + 'base/base2.json', function (geometry) {

                    var material = new THREE.MeshStandardMaterial({
                        map: THREE.ImageUtils.loadTexture(Globals.directory + 'base/BASE2_DIFFUSE_FINAL.jpg'),
                        roughnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/base2_roughness.jpg'),
                        metalnessMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/base2_metallic.jpg'),
                        //specularMap: THREE.ImageUtils.loadTexture(Globals.directory + 'base/base2_specular_mix.png'),
                        shininess: 70,
                        roughness: 0.2,
                        metalness: 0.9
                    });

                    geometry.computeVertexNormals();

                    // create a mesh with models geometry and material
                    var mesh = new THREE.Mesh(
                        geometry,
                        material
                    );

                    mesh.position.set(1793.6070843845494, -51.87996582767363, 4.6280447728193135);
                    mesh.rotation.set(3.0539275684482554, -0.01779928350362459, 0.8072355095326471);
                    mesh.scale.set(676, 676, 676);
                    mesh.castShadow = true;
                    scene.add(mesh);

                    resolve(true);

                    /*
                    resolve([
                        new ActionObj('base2', [mesh])
                    ]);
                    */
                });
            }));

            promises.push(new Promise(function(resolve, reject) {
                var loader = new THREE.JSONLoader();
                loader.load(Globals.directory + 'terrain/terrain.json', function (geometry_event, materials) {
                    var maxAnisotropy = renderer.getMaxAnisotropy();
                    maxAnisotropy = maxAnisotropy || 1;

                    var groundBump = THREE.ImageUtils.loadTexture(Globals.directory + 'terrain/noiseBumpMap.jpg');
                    var ground_map = THREE.ImageUtils.loadTexture(Globals.directory + "terrain/Moon_baseColorv3.jpg");
                    ground_map.anisotropy = maxAnisotropy;

                    // normal blend on the normal map
                    var material_event = new THREE.MeshPhongMaterial({
                        map: ground_map,
                        aoMap: THREE.ImageUtils.loadTexture(Globals.directory + "terrain/ao.png"),
                        aoMapIntensity: 1,
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + "terrain/normal.png"),
                        bumpMap: groundBump,
                        bumpScale: 0,
                        shininess: 0
                    });

                    var material_event2 = new THREE.MeshPhongMaterial({
                        map: ground_map,
                        aoMap: THREE.ImageUtils.loadTexture(Globals.directory + "terrain/ao.png"),
                        aoMapIntensity: 1,
                        normalMap: THREE.ImageUtils.loadTexture(Globals.directory + "terrain/normal.png"),
                        bumpMap: groundBump,
                        bumpScale: 0,
                        shininess: 0
                    });



                    var texture =  THREE.ImageUtils.loadTexture(Globals.directory + "terrain/TerrainDetail_NM_512x512.png");
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;


                    geometry_event.computeFaceNormals();
                    geometry_event.computeVertexNormals();


                    // create a mesh with models geometry and material
                    var mesh_event = new THREE.Mesh(
                        geometry_event,
                        material_event
                    );

                    //var box = new THREE.Box3().setFromObject( mesh_event );

                    var canvas = document.getElementById("normalmap");
                    var resize = document.getElementById("resize");
                    canvas.width  = 2048;
                    canvas.height = 2048;

                    resize.width  = 2048 / 30;
                    resize.height = 2048 / 30;

                    var context = canvas.getContext("2d");
                    var resize_context = resize.getContext("2d");
                    context.globalCompositeOperation = "source-over";


                    var image = new Image();
                    image.src = Globals.directory + "terrain/moonTerrain&tracks.png";
                    image.onload = function() {
                        context.drawImage(image, 0, 0, canvas.width, canvas.height);

                        var image2 = new Image();
                        image2.src = Globals.directory + "terrain/TerrainDetail_NM_512x512.png";
                        image2.onload = function() {
                            resize_context.drawImage(image2, 0, 0, resize.width, resize.height);
                            context.globalCompositeOperation = "hard-light";

                            //var image2_resized = resize_context.getImageData(0, 0, resize.width, resize.height);
                            //console.log(image2_resized);
                            var ptrn = context.createPattern(resize, 'repeat'); // Create a pattern with this image, and set it to "repeat".
                            context.fillStyle = ptrn;
                            context.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);

                            //context.drawImage(image2, 0, 0, canvas.width, canvas.height);

                            //var dataURL = canvas.toDataURL('image/png');
                            //button.href = dataURL;
                            //console.log(dataURL);
                            var image3 = new Image();
                            image3.src = Globals.directory + "terrain/TerrainDetail_NM_256x256.png";
                            image3.onload = function() {

                                resize.width  = 2048 / 60;
                                resize.height = 2048 / 60;

                                resize_context.drawImage(image3, 0, 0, resize.width, resize.height);
                                context.globalCompositeOperation = "hard-light";

                                var ptrn = context.createPattern(resize, 'repeat'); // Create a pattern with this image, and set it to "repeat".
                                context.fillStyle = ptrn;
                                context.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);

                                /*
                                 var d=canvas.toDataURL("image/png");
                                 var w=window.open('about:blank','image from canvas');
                                 w.document.write("<img src='"+d+"' alt='from canvas'/>");
                                 */

                                material_event.normalMap = THREE.ImageUtils.loadTexture(canvas.toDataURL());
                                material_event.needsUpdate = true;



                                mesh_event.rotation.x = 135;
                                mesh_event.position.z = 0;
                                mesh_event.position.y = 0;
                                mesh_event.position.x = 0;
                                //mesh_event.castShadow = true;
                                mesh_event.receiveShadow = true;
                                mesh_event.scale.set(10000, 10000, 10000);
                                scene.add(mesh_event);

                                var mesh_bottom = new THREE.Mesh(
                                    geometry_event,
                                    material_event2
                                );

                                mesh_bottom.position.set(0, 0, -1059.193358198944);
                                mesh_bottom.rotation.set(-3.1218695997895907, -0.0862635463414383, 1.7958678807097355);
                                mesh_bottom.scale.set(20000, 20000, 20000);
                                scene.add(mesh_bottom);

                                var mesh_bottom2 = new THREE.Mesh(
                                    geometry_event,
                                    material_event2
                                );



                                resolve(true);
                            }
                        };
                    };

                    //mesh_bottom2.position.set(0, 0, -2366.868264174072);
                    //mesh_bottom2.rotation.set(-3.121869614743458, -0.08626353138466195, -1.516899777401994);
                    //mesh_bottom2.scale.set(29175, 29175, 29175);
                    //scene.add(mesh_bottom2);

                    //gizmoController(mesh_bottom2, scene, camera, renderer, 'aaaaaaa');
                    //scene.add(mesh_bottom2);
                });
                // *********** end
            }));

            THREE.DefaultLoadingManager.onLoad = function (item, loaded, total) {
                //$('#loading').fadeOut();
                //Globals.loading = false;
            };
            THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
                $('#progress_bar').width(loaded / total * 100 + '%');
            }

            Promise.all(promises).then(function(results) {
                $.each(results, function(inx, objects) {
                    if (typeof(objects) != "boolean") {
                        $.each(objects, function(i, actions) {
                            if (actions instanceof ActionObj) {
                                ActiveObjects.addAction(actions);
                                $.each(actions.objects, function(i, obj) {
                                    if (obj instanceof THREE.Mesh) {
                                        ActiveObjects.add(obj);
                                    }
                                });
                            }
                        });
                    }
                });

                ActiveObjects.camera = camera;

                document.addEventListener('click', ActiveObjects.onClick, false);
                document.addEventListener('touchstart', ActiveObjects.onTouch, false );
                //document.addEventListener('onmousemove', ActiveObjects.onMouseOver, false);
                document.onmousemove = ActiveObjects.onMouseOver;

                render();

                $('#loading').fadeOut();
                $('#start-popup').css('z-index', 998);
                Globals.loading = false;
            });
        }
    }

    var Terrain = {
        width: 16384,
        height: 16384,
        segments_x: 127,
        segments_y: 127,
        img: '',
        bump_map: '',
        color: '',
        object: null,
        position: {x: 0, y: 0, z: 0},
        receive_shadow: true,
        cast_shadow: true,
        map: '',

        getHeightData: function(img) {
            var canvas = document.createElement( 'canvas' );
            canvas.width = 128;
            canvas.height = 128;
            var context = canvas.getContext( '2d' );

            var size = 128 * 128, data = new Float32Array( size );

            context.drawImage(img, 0, 0);

            for ( var i = 0; i < size; i ++ ) {
                data[i] = 0
            }

            var imgd = context.getImageData(0, 0, 128, 128);
            var pix = imgd.data;

            var j = 0;
            for (var i = 0, n = pix.length; i < n; i += (4)) {
                var all = pix[i]+pix[i+1]+pix[i+2];
                data[j++] = all/30;
            }

            return data;
        },

        init: function(data) {
            // Parameters
            this.width = data.width || this.width;
            this.height = data.height || this.height;
            this.segments_x = data.segments_x || this.segments_x;
            this.segments_y = data.segments_y || this.segments_y;
            this.map = data.map || this.map;
            this.bump_map = data.bump_map || this.bump_map;
            this.bump_scale = data.bump_scale || this.bump_scale;
            this.color = data.color || this.color;
            this.img = data.img || this.img;
            this.position = data.position || this.position;
            this.receive_shadow = data.receive_shadow || this.receive_shadow;
            this.cast_shadow = data.cast_shadow || this.cast_shadow;

            // Create Geometry
            var geometry = new THREE.PlaneGeometry(this.width, this.height, this.segments_x, this.segments_y);

            // Create Material
            var terrain_material = new THREE.MeshPhongMaterial();
            if (typeof this.color != 'undefined' && this.color) {
                terrain_material.color = this.color;
            }

            //terrain_material.ambient = 0xffffff;
            //terrain_material.specular = 0xffffff;


            terrain_material.color = new THREE.Color(0xb58828);
            terrain_material.specular = new THREE.Color(0x000000);
            terrain_material.emissive = new THREE.Color(0x000000);
            terrain_material.shininess = 20;


            if (typeof this.map != 'undefined' && this.map) {
                terrain_material.map = THREE.ImageUtils.loadTexture(this.map);
            }
            if (typeof this.bump_map != 'undefined' && this.bump_map) {
                terrain_material.bumpMap = THREE.ImageUtils.loadTexture(this.bump_map);
            }
            if (typeof this.bump_scale != 'undefined' && this.bump_scale) {
                terrain_material.bumpScale = this.bump_scale;
            }

            if (typeof this.normal_map != 'undefined' && this.normal_map) {
                terrain_material.normalMap = THREE.ImageUtils.loadTexture(this.normal_map);
            }

            if (typeof this.img != 'undefined' && this.img) {
                var height_data = Terrain.getHeightData(this.img);
                for (var i = 0, l = geometry.vertices.length; i < l; i++) {
                    geometry.vertices[i].z = height_data[i] * 40;
                }
            }

            // Compute Normals
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();

            // Create Plane
            this.object = new THREE.Mesh(geometry, terrain_material);
            //scene.add(Plane.set(img));
            this.object.position.set(this.position.x, this.position.y, this.position.z);
            this.object.receiveShadow = this.receive_shadow;
            this.object.castShadow = this.cast_shadow;

            return this.object;

        }
    }

    var Scene = {
        init: function() {
            // Scene
            var scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x000000, 1, 30000);

            // Set Camera
            var camera = new THREE.CinematicCamera(42, window.innerWidth / window.innerHeight, 1, 50000);
            camera.setLens(10);
            //camera.position.zoom = 30;
            camera.position.set(1373, -1464.0316441310924, 1900);
            var camera_orientation_vector = new THREE.Vector3(1000, 500, 0);
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

            var orientation_geometry = new THREE.BoxGeometry(1, 1, 1);
            var orientation_material = new THREE.MeshBasicMaterial( {color: 0x000000} );
            var orientation_box = new THREE.Mesh(orientation_geometry, orientation_material);
            orientation_box.position.set(1373, -800.98025206734, 600);
            scene.add(orientation_box);
            ActiveObjects.cameraTarget = orientation_box;

            //camera.lookAt(camera_orientation_vector);
            camera.lookAt(orientation_box.position);

            // SET boundary module
            BounderyIntersection.init(camera, 2100, 2800);

            // Set Renderer
            var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            renderer.clear();
            renderer.autoClear = false;
            renderer.setClearColor( 0xf0f0f0 );

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.sortObjects = false;
            renderer.shadowMap.enabled = true;
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            renderer.shadowMapBias = 0.0039;
            renderer.setPixelRatio( window.devicePixelRatio );


            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            document.getElementById('space_sceen').appendChild(renderer.domElement);

            /*
            var effectFXAA = new THREE.ShaderPass( THREE.ShaderExtras[ "fxaa" ] );

            effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
            effectFXAA.renderToScreen = true;

            var rendererTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {} );

            var composer = new THREE.EffectComposer( renderer, rendererTarget );

            composer.addPass( scene );
            composer.addPass( effectFXAA );
            composer.render();
            */

            //var control = new THREE.TransformControls( camera, renderer.domElement );
            //var control = null;

            var effectController  = {

                focalLength: 15,
                jsDepthCalculation: true,
                shaderFocus: false,
                //
                fstop: 2.5,
                // maxblur: 1.0,
                //
                showFocus: false,
                focalDepth: 3,
                // manualdof: false,
                // vignetting: false,
                depthblur: true,
                //
                // threshold: 0.5,
                // gain: 2.0,
                // bias: 0.5,
                // fringe: 0.7,
                //
                //ocalLength: 35,
                noise: true,
                // pentagon: false,
                //
                // dithering: 0.0001

            };

            var matChanger = function() {

                for (var e in effectController) {
                    if (e in camera.postprocessing.bokeh_uniforms)
                        camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];
                }
                camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
                camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
                camera.setLens(effectController.focalLength, camera.frameHeight ,effectController.fstop, camera.coc);
                effectController['focalDepth'] = camera.postprocessing.bokeh_uniforms["focalDepth"].value;
            };


            /*
            var gui = new dat.GUI();

            gui.add( effectController, "focalLength", 1, 135, 0.01 ).onChange( matChanger );
            gui.add( effectController, "fstop", 1.8, 22, 0.01 ).onChange( matChanger );
            gui.add( effectController, "focalDepth", 0.1, 100, 0.001 ).onChange( matChanger );
            gui.add( effectController, "showFocus", true ).onChange( matChanger );

            */

            matChanger();

            var bg = SphereBackground.init({
                map: Globals.directory + 'terrain/Skybox_texture.jpg',
                radius: 30000
            });

            scene.add(bg);

            // Set Scene Lights

            var shadow_width = 1024;
            var shadow_height = 1024;

            if (Globals.definition == 1) {
                shadow_width = 2048;
                shadow_height = 2048;
            } else if (Globals.definition == 2) {
                shadow_width = 2560;
                shadow_height = 2560;
            }

            var light = Lights.setDirectionalLight({
                shadowMapWidth: shadow_width,
                shadowMapHeight: shadow_height
            });

            scene.add(light);

            //gizmoController(light, scene, camera, renderer, 'Light');

            //var helper = new THREE.CameraHelper( light.shadow.camera );
            //scene.add( helper );

            //scene.add(Lights.setDirectionalLight());

            /*
            scene.add(Lights.setAmbient({
                intensity: 2
            }));
            */
            var ambient = new THREE.AmbientLight(0x73A7C7, 0.2)
            scene.add(ambient);

            //var controls = new THREE.OrbitControls( camera, renderer.domElement, camera_orientation_vector );
            //controls.enableDamping = true;
            //controls.dampingFactor = 0.25;
            //controls.enableZoom = true;

            // intersection plane
            var geometry1 = new THREE.PlaneGeometry(Terrain.width, Terrain.height, 4, 4);

            // Create Material
            var terrain_material = new THREE.MeshPhongMaterial();
            terrain_material.color = new THREE.Color(0x000000);

            // Create Plane
            var object_mesh = new THREE.Mesh(geometry1, terrain_material);
            object_mesh.position.set(0, 0, -3000);
            scene.add(object_mesh);

            //var controls = new THREE.OrbitControls(camera, scene, renderer.domElement);
            //var controls = new THREE.DeviceOrientationControls( camera );

            var controls = new THREE.MapControls(camera, render, renderer.domElement, object_mesh, orientation_box, BounderyIntersection);

            // *********** set model pyramid
            // Load Event Model


            Objects.set(scene, render, camera, renderer);
            //camera.focusAt(0);
            //renderer.render(scene, camera);
            camera.focusAt(11500);

            var composer = null;
            if (Globals.definition == 1) {
                //START BLUM
                composer = new THREE.EffectComposer(renderer);
                var renderPass = new THREE.RenderPass(scene, camera);
                composer.addPass(renderPass);

                //strength, kernelSize, sigma, resolution
                var bloomPass = new THREE.BloomPass(6, 25, 5, 1204);
                composer.addPass(bloomPass);

                var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
                effectCopy.renderToScreen = true;
                composer.addPass(effectCopy);
                //END BLUM
            }

            /*
            var effectFilm = new THREE.FilmPass(0.9, 0.85, 1024, false);
            effectFilm.renderToScreen = true;
            composer.addPass(effectFilm);
            */

            function render() {

                //renderer.shadowMap.enabled = true;
                //control.update();
                //requestAnimationFrame(render);

                /*
                var position = camera.position;
                camera.position.set(position.x + 10, position.y + 10, position.z);
                camera.updateMatrix();
                */

                //Globals.usePostProcessing &&
                if(camera.postprocessing.enabled && (Globals.definition == 1 || Globals.definition == 2)) {
                    //rendering Cinematic Camera effects
                    if (Globals.definition == 1) {
                        var clock = new THREE.Clock()
                        var delta = clock.getDelta();
                        composer.render(delta);
                    }
                    camera.renderCinematic(scene, renderer, camera);
                } else {
                    renderer.render(scene, camera);
                }
            }

            window.addEventListener('resize', onWindowResize, false);

            function onWindowResize(){

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

                var height = $('#category_popup').outerHeight();
                $('#category_popup').css('margin-top', ((height / -2) + $('nav.navbar ').height() / 2) + 'px');
            }

            var stats = new Stats();
            stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
            //document.body.appendChild( stats.dom );

            function animate() {
                requestAnimationFrame( animate );

                TWEEN.update();

                stats.begin();

                // monitored code goes here
                if (!Globals.loading) {
                    //Optimization.check(stats.getFPS());
                }

                stats.end();

                controls.update();
                if (Globals.render) {
                    render();
                }
            }

            requestAnimationFrame( animate );


            /*
            var start = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            };


            var target = {
                x: 1000,
                y: 1500,
                z: 800
            };
            var tween = new TWEEN.Tween(start).to(target, 10000);
            tween.onUpdate(function () {
                camera.position.set(start.x, start.y, start.z);
                camera.lookAt(new THREE.Vector3(start.x, start.y, start.z));
            });

            tween.onComplete(function () {
                alert(123)
            });

            tween.start();
            */
        },
        initMobile: function($) {
            var methods = {
                init: function() {
                    $('#loading #progress_bar').width('70%');
                    methods.setSize();

                    var theCachedImage = new Image();
                    $(theCachedImage).load(function () {
                        $('#loading #progress_bar').width('100%');
                        $('#start-popup').css('z-index', 998);
                        $('#loading').fadeOut();
                    });
                    theCachedImage.src = Globals.directory + 'terrain/2dterrain.jpg';

                    $(window).resize(function() {
                        methods.setSize();
                    });
                },
                setSize: function() {
                    // set clicable rectangles
                    var inner_width = window.innerWidth;
                    var inner_height = window.innerHeight;
                    var img_width = $('#scroll .map-img').width();
                    var new_width = inner_width * 4.5;
                    var ratio = new_width / img_width;
                    ratio = ratio > 1 ? 1.3 : ratio;
                    $('#scroll .map').css({
                        'transform': 'scale(' + ratio + ')',
                        'height': inner_height
                    });
                },
                goToItem: function($that, id, has_animation) {
                    $('#scroll .active-item').removeClass('active');

                    if (typeof $that == 'undefined' || !$that || $that.length < 1) {
                        return false;
                    }

                    var w_width = window.innerWidth;
                    var w_height = window.innerHeight;
                    var current_position = $that.position();
                    var current_scroll = {
                        top: $("#scroll").scrollTop(),
                        left: $("#scroll").scrollLeft(),
                    };

                    var go_to = $that.position();
                    go_to.left = current_position.left - w_width / 2 + $that.outerWidth() / 2;
                    go_to.top = current_position.top - w_height / 2 + $that.outerHeight() / 2;

                    if (go_to.left < 0) go_to.left = 0;
                    if (go_to.top < 0) go_to.top = 0;

                    var time = Math.sqrt(
                            Math.pow(current_scroll.left - go_to.left, 2) + Math.pow(current_scroll.top - go_to.top, 2)
                        ) * 20 / 10;

                    function callback() {
                        $('#prevent-click').hide();
                        $that.addClass('active');
                        ActiveObjects.current_category_id = id;
                        ActiveObjects.showCategoryPopup(id, (!has_animation ? true : false));
                        $('#category' + ActiveObjects.current_category_id).trigger('click');
                        // show loading and the intro video or redirect t categories page
                    }

                    if (has_animation) {
                        $("#scroll").animate({
                            scrollTop: go_to.top,
                            scrollLeft: go_to.left,
                        }, {
                            duration: time,
                            easing: 'easeOutQuart',
                            complete: function () {
                                callback();
                            }
                        });
                    } else {
                        $("#scroll").scrollTop(go_to.top);
                        $("#scroll").scrollLeft(go_to.left);
                        callback();
                    }
                }
            };
            var actions = {
                    init: function() {
                        $(document).on('click touchstart', '#scroll .active-item', function(e) {
                            e.stopPropagation();
                            $that = $(this);
                            if ($that.hasClass('active')) {
                                NavigationController.showIntroWindow();
                            } else {
                                var id = $(this).data('id');
                                if (id) {
                                    $('#prevent-click').show();
                                    methods.goToItem($that, id, true);
                                }
                            }
                        });

                        var clicking = false;
                        var previousX;
                        var previousY;

                        $("#scroll").on('mousedown', function(e) {
                            e.preventDefault();
                            previousX = e.clientX;
                            previousY = e.clientY;
                            clicking = true;
                        });

                        $("#scroll").on('mouseup', function(event) {
                            event.preventDefault();
                            previousX = event.clientX;
                            previousY = event.clientY;
                            clicking = true;
                        });


                        //var mouseX = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
                        //var mouseY = -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

                        $(document).on('mouseup', function() {
                            clicking = false;
                        });

                        $("#scroll").on('mousemove', function(e) {

                            if (clicking) {
                                e.preventDefault();
                                var currentX = 0;
                                var currentY = 0;

                                currentX = e.clientX;
                                currentY = e.clientY;

                                var directionX = (previousX - currentX) > 0 ? 1 : -1;
                                var directionY = (previousY - currentY) > 0 ? 1 : -1;

                                $("#scroll").scrollLeft($("#scroll").scrollLeft() + (previousX - currentX));
                                $("#scroll").scrollTop($("#scroll").scrollTop() + (previousY - currentY));
                                previousX = currentX;
                                previousY = currentY;
                            }
                        });

                        $("#scroll").mouseleave(function(e) {
                            clicking = false;
                        });

                        //init camera position
                        var $item = $('#i2');
                        var id = $item.data('id');
                        if (id) {
                           methods.goToItem($item, id, false);
                        }
                    }
                };

            var object = {
                methods: methods,
                actions: actions
            };

            methods.init();
            actions.init();

            return object;
        }
    }

    var mobile = null;
    if (Globals.is_mobile) {
        mobile = Scene.initMobile($);
    } else {
        Scene.init();
    }

    $(function() {
        $("body").on("mousedown", function (e) {
            e.preventDefault();
            $(this).addClass("mouseDown");
        }).on("mouseup", function () {
            $(this).removeClass("mouseDown");
        });

        $('#prevent-click').unbind();

        // Events
        $('#scene_back').on('click', function() {
            NavigationController.showCanvasPanel();
        });

        $('#see_more').on('click', function() {
            NavigationController.showIntroWindow();
        });

        $('nav .home').on('click', function(event) {
            if (NavigationController.showCanvasPanel()) {
                return true;
            } else {
                event.preventDefault();
                return false;
            }
        });

        if (typeof window.all_categories != 'undefined' && window.all_categories.length > 0) {
            ActiveObjects.showCategoryPopup(window.all_categories[0].ID, true);
        }

        function edges() {
            var group = createGroup('group');
            var last_item = null;
            $('#edges-nav').empty();
            $('#navigation .circle').each(function() {
                if (last_item) {
                    var current_item = $(this);

                    // set inner edges
                    var edge = setEdge(current_item, last_item, '#ffffff');

                    if (edge) {
                        group.appendChild(edge);
                    }
                }
                last_item = $(this);
            });

            $('#edges-nav').html(group);
        }

        setTimeout(function() {
            var last_item = null;
            $('#navigation').each(function() {
                edges();
                $(window).resize(function() {
                    edges();
                });
            });
        }, 250);

        $('#more .item').on('click', function() {
            $('#loading').fadeIn();
            var href = $(this).data('href');
            $(this).parent().find('.item').removeClass('active');
            $(this).addClass('active');
            setTimeout(function() {
                if (typeof href != 'undefined' && href) {
                    $('#education_frame').attr('src', href).on('load', function() {
                        $('#loading').fadeOut();
                        $('#start-popup').css('z-index', 998);
                    });
                }
            }, 1000);
        });

        $('#navigation').on('mouseover', function() {
            Globals.activeNavigation = true;
        });

        $('#navigation').on('mouseout', function() {
            Globals.activeNavigation = false;
        });

        $('#navigation .row').on('click', function() {
            $('#navigation .row').removeClass('active');
            $(this).addClass('active');
            if (Globals.is_mobile) {
                if (mobile) {
                    var id = $(this).data('id');
                    if (id) {
                        mobile.methods.goToItem($('#scroll .active-item.' + id).first(), id, true);
                    }
                }
            } else {
                ActiveObjects.onNavigationClick($(this));
            }
        });

        $('#category_popup').on('click', function(event) {
            event.stopPropagation();
        });

        $('#category_popup .arrow').on('click', function(event) {
            event.stopPropagation();
            $('#category_popup').removeClass('active');
        });

        $('#category_popup .arrow-show').on('click', function(event) {
            event.stopPropagation();
            $('#category_popup').addClass('active');
        });
    });


}(jQuery));