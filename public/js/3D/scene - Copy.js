(function() {

    $(function() {
        $("canvas").on("mousedown", function (e) {
            e.preventDefault();
            $(this).addClass("mouseDown");
        }).on("mouseup", function () {
            $(this).removeClass("mouseDown");
        });

        // Events
        $('#back').on('click', function() {
            NavigationController.showCanvasPanel();
            ActiveObjects.onBack();
        });

        $('#more .item').on('click', function() {
            $('#loading').fadeIn();
            var href = $(this).data('href');
            $(this).parent().find('.item').removeClass('active');
            $(this).addClass('active');
            setTimeout(function() {
                if (typeof href != 'undefined' && href) {
                    $('#education_frame').attr('src', href).on('load', function() {
                        $('#loading').fadeOut();
                    });
                }
            }, 1000);
        });
    });

    var ActiveObjects = {
        mesh_array: [],
        last_position: null,
        last_orientation: null,
        selected_object: null,
        camera: null,

        onBack: function() {
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
                }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                    //camera.lookAt(camera.target);
                }).onComplete(function () {
                    //camera.lookAt(camera.target.position);
                }).start();

                var tween = new TWEEN.Tween(ActiveObjects.camera.rotation).to({
                    x: ActiveObjects.camera.orientation.x,
                    y: ActiveObjects.camera.orientation.y,
                    z: ActiveObjects.camera.orientation.z
                }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                }).onComplete(function () {
                    //camera.lookAt(selectedObject.position);
                }).start();
            }, 500);
        },
        onClick: function(event) {
            var projector = new THREE.Projector();
            var vector = new THREE.Vector3(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5);
            projector.unprojectVector(vector, ActiveObjects.camera);

            var raycaster = new THREE.Raycaster(
                ActiveObjects.camera.position,
                vector.sub(ActiveObjects.camera.position).normalize());
            var intersects = raycaster.intersectObjects(ActiveObjects.mesh_array);

            if (intersects.length > 0) {
                var selectedObject = intersects[0].object;
                ActiveObjects.selected_object = selectedObject;
                setTimeout(function () {

                    ActiveObjects.camera.target = new THREE.Vector3(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);

                    ActiveObjects.last_position = ActiveObjects.camera.position.clone();
                    ActiveObjects.last_orientation = ActiveObjects.camera.rotation.clone();

                    // Position the camera to fit
                    var tween = new TWEEN.Tween(ActiveObjects.camera.position).to({
                        x: selectedObject.position.x,
                        y: selectedObject.position.y,
                        z: ActiveObjects.camera.position.z
                    }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                        //ActiveObjects.camera.lookAt(ActiveObjects.camera.target);
                    }).onComplete(function () {
                        //ActiveObjects.camera.lookAt(selectedObject.position);
                        NavigationController.showEducationPanel();
                    }).start();

                    var tween = new TWEEN.Tween(ActiveObjects.camera.rotation).to({
                        x: 0,
                        y: 0,
                        z: 0
                    }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                    }).onComplete(function () {
                    }).start();
                }, 500);
            }
        }
    };

    var NavigationController = {
        $loader: $('#loading'),
        $canvas: $('canvas'),
        $education: $('#education'),

        showEducationPanel: function() {
            NavigationController.$loader.fadeIn();
            setTimeout(function() {
                NavigationController.$canvas.hide();
                NavigationController.$education.show();
                NavigationController.$loader.fadeOut();
            }, 1000);
        },

        showCanvasPanel: function() {
            NavigationController.$loader.fadeIn();
            setTimeout(function() {
                NavigationController.$education.hide();
                NavigationController.$canvas.show();
                NavigationController.$loader.fadeOut();
            }, 1000);
        }
    }

    var FlyingObject = function(data) {
        this.object = null;
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
            z: typeof data.position.z != 'undefined' ? data.position.z : 1500
        };
        this.position = position;
        this.start = {x: this.position.x, y: this.position.y};
        this.sign_one *= -1;
        this.sign_two *= -1;
        this.target = {x: Math.random() * 3000 * this.sign_one + 3000 * this.sign_one, y: Math.random() * 3000 * this.sign_two + 3000 * this.sign_two};



        if (typeof FlyingObject.prototype.set === 'undefined') {
            FlyingObject.prototype.set = function () {
                var objGeo = new THREE.SphereGeometry(50, 32, 32);
                var colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffffff, 0x1400ff, 0x619812, 0x814812];
                var inx = Math.floor(Math.random() * 7);
                inx = inx < 7 ? inx : 0;
                var objMat = new THREE.MeshPhongMaterial({color: colors[inx]});

                this.object = new THREE.Mesh(objGeo, objMat);
                this.object.position.set(this.position.x, this.position.y, this.position.z);
                this.fly();
                return this.object;
            }
        }

        if (typeof FlyingObject.prototype.fly === 'undefined') {
            FlyingObject.prototype.fly = function () {
                this.tween = new TWEEN.Tween(this.start).to(this.target, 10000);
                var that = this;
                this.tween.onUpdate(function () {
                    that.object.position.set(that.start.x, that.start.y, that.object.position.z);
                });

                console.log(this.start);

                this.tween.onComplete(function () {
                    alert(123)
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
                x:  5000,
                y:  2000,
                z: 4000
            },

            cast_shadow = true,
            shadowCameraNear = data.shadowCameraNear || 5000,
            shadowCameraFar = data.shadowCameraFar || 2000,
            shadowCameraLeft = data.shadowCameraLeft || -5000,
            shadowCameraRight = data.shadowCameraRight || 5000,
            shadowCameraTop = data.shadowCameraTop || 5000,
            shadowCameraBottom = data.shadowCameraBottom || -5000,
            shadowCameraVisible = data.shadowCameraVisible || true,
            shadowMapWidth = data.shadowMapWidth || 2048,
            shadowMapHeight = data.shadowMapHeight || 2048;

            var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
            directionalLight.position = new THREE.Vector3(position.x, position.y, position.z);
            directionalLight.castShadow = cast_shadow;
            directionalLight.intensity = 2;

            directionalLight.shadowCameraNear = shadowCameraNear;
            directionalLight.shadowCameraFar = shadowCameraFar;
            directionalLight.shadowCameraLeft = shadowCameraLeft;
            directionalLight.shadowCameraRight = shadowCameraRight;
            directionalLight.shadowCameraTop = shadowCameraTop;
            directionalLight.shadowCameraBottom = shadowCameraBottom;
            directionalLight.shadowCameraVisible = shadowCameraVisible;

            directionalLight.shadowMapWidth = shadowMapWidth;
            directionalLight.shadowMapHeight = shadowMapHeight;
            directionalLight.shadowCameraVisible = true;
            directionalLight.shadowDarkness = 2;

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

            this.object = new THREE.Mesh(geometry, material);

            return this.object;
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

            // Set Camera
            var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
            //camera.position.zoom = 30;
            camera.position.set(1500, -1000, 1500);
            var camera_orientation_vector = new THREE.Vector3(1500, 500, 0)
            camera.lookAt(camera_orientation_vector);

            // Set Renderer
            var renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
            renderer.setSize(window.innerWidth, window.innerHeight);

            renderer.shadowMap.enabled = true;
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            //renderer.gammaInput = true;
            //renderer.gammaOutput = true;
            document.body.appendChild(renderer.domElement);

            //var control = new THREE.TransformControls( camera, renderer.domElement );

            // Set Scene Lights
            var light = Lights.setDirectionalLight();
            //scene.add(light);

            //scene.add(Lights.setDirectionalLight());

            /*
            scene.add(Lights.setAmbient({
                intensity: 2
            }));
            */
            scene.add( new THREE.AmbientLight( 0xffffff, 0.2 ) );




            var spotLight = new THREE.SpotLight( 0xffffff );
            spotLight.position.set( 100, 8000, 3000 );

            spotLight.shadowDarkness = 0;

            spotLight.castShadow = true;
            spotLight.intensity = 2;

            spotLight.shadow.mapSize.width = 2048;
            spotLight.shadow.mapSize.height = 2048;

            spotLight.shadow.camera.near = 1000;
            spotLight.shadow.camera.far = 8000;
            spotLight.shadow.camera.fov = 30;
            scene.add( spotLight );



            //var helper = new THREE.CameraHelper( spotLight.shadow.camera );
            //scene.add( helper );

            /*
            scene.add(Lights.setAmbient({
                intensity: 2
            }));
            */


            // intersection plane
            var geometry1 = new THREE.PlaneGeometry(Terrain.width, Terrain.height, 4, 4);

            // Create Material
            var terrain_material1 = new THREE.MeshPhongMaterial();
            if (typeof this.color != 'undefined' && this.color) {
                terrain_material.color = 0xff0000;
            }

            // Create Plane
            var object_mesh = new THREE.Mesh(geometry1, terrain_material1);
            object_mesh.position.set(0, 0, -10);
            // scene.add(object_mesh);

            //var C = new THREE.OrbitControls(camera, scene, renderer.domElement);
            //var controls = new THREE.DeviceOrientationControls( camera );

            new THREE.MapControls(camera, render, renderer.domElement, object_mesh, camera_orientation_vector)

            // *********** set model pyramid
            // Load Event Model


            var loader_ice = new THREE.JSONLoader();
            loader_ice.load('terrain/ice.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    normalMap: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_normals.png'),
                    map: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_diffuse.png'),
                    shininess: 30,
                    //aoMap: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_normals.png')
                });

                // create a mesh with models geometry and material
                var mesh_event = new THREE.Mesh(
                    geometry_event,
                    material_event
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

                render();
            });


            var loader_lander = new THREE.JSONLoader();
            loader_lander.load('lander/lander.json', function (geometry_event, materials) {

                return false;

                var material_event = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('lander/LANDER_DIFFUSE_FINAL.png'),
                    bumpMap: THREE.ImageUtils.loadTexture('lander/LANDER_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('lander/lander_specular_mix.png'),
                    normalMap: THREE.ImageUtils.loadTexture('lander/lander_specular_mix.png'),
                    shininess: 30
                });

                geometry_event.computeFaceNormals();
                geometry_event.computeVertexNormals();

                // create a mesh with models geometry and material
                var mesh_event = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh_event.position.x = 1000;
                mesh_event.position.y = 500;
                mesh_event.position.z = 2000;
                mesh_event.rotation.x = 135;
                mesh_event.castShadow = true;
                mesh_event.scale.set(400, 400, 400);
                scene.add(mesh_event);

                render();

            });

            var loader_driller = new THREE.JSONLoader();
            loader_driller.load('vehicle/driller.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/DRILLER_DIFFUSE_FINAL.png'),
                    bumpMap: THREE.ImageUtils.loadTexture('vehicle/DRILLER_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('vehicle/driller_specular_mix.png'),
                    normalMap: THREE.ImageUtils.loadTexture('vehicle/driller_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh_event = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh_event.position.x = -2637.3717737284005;
                mesh_event.position.y = 1995.0920781689194;
                mesh_event.position.z = -202.3018476338444;
                mesh_event.rotation.x = 3.054773401897112;
                mesh_event.rotation.y = 0.01710517296739121;
                mesh_event.rotation.z = -0.19404299853379978;
                mesh_event.castShadow = true;
                mesh_event.scale.set(185, 185, 185);
                scene.add(mesh_event);

                var mesh2 = new THREE.Mesh(geometry_event, material_event);
                mesh2.position.set(-2250.2254184125404, 2831.0630981102518, -258.2685488666977);
                mesh2.rotation.set(-3.0841573126655057, -0.06734690407265365, 2.2778467885560194);
                mesh2.scale.set(185, 185, 185);
                scene.add(mesh2);

                render();

            });

            // lamp loader
            var loader_lamp = new THREE.JSONLoader();
            loader_lamp.load('terrain/lamp.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(0x999999),
                    shininess: 10
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(geometry_event, material_event);

                mesh.castShadow = true;
                mesh.position.set(-2605.2678701106656, 2536.6116276730304, -153.9111774416821);
                mesh.rotation.set(-3.0841573163931035, -0.06734690407265365, -0.7217269641424024);
                mesh.scale.set(200, 200, 200);
                scene.add(mesh);

                var mesh2 = new THREE.Mesh(geometry_event, material_event);
                mesh2.castShadow = true;
                mesh2.position.set(-2102.980218109571, 2415.175991910018, -160.65496682689258);
                mesh2.rotation.set(3.1175339557670414, -0.08515874930147171, -1.7044845922767207);
                mesh2.scale.set(200, 200, 200);
                scene.add(mesh2);

                var mesh3 = new THREE.Mesh(geometry_event, material_event);
                mesh3.castShadow = true;
                mesh3.position.set(-1692.3375184932886, 2601.673767139308, -182.08329775612637);
                mesh3.rotation.set(3.0553355966403806, -0.01975150306229844, -2.7750243096181);
                mesh3.scale.set(200, 200, 200);
                scene.add(mesh3);

                // add lamp lights
                var bluePoint = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint.position.set(-1847.690991794874, 2707.5260344284075, -221.47594408718743);
                //scene.add(bluePoint);

                var bluePoint2 = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint2.position.set(-2140.052802461263, 2573.232646980367, -167.82436322130133);
                //scene.add(bluePoint2);
                scene.add(new THREE.PointLightHelper(bluePoint2, 3));

                var bluePoint3 = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint3.position.set(-2515.922138886294, 2672.6871753180903, -167.82436322130133);
                //scene.add(bluePoint3);
                scene.add(new THREE.PointLightHelper(bluePoint3, 3));

                render();
            });


            var loader_driller3 = new THREE.JSONLoader();
            loader_driller3.load('vehicle/driller3.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/ROVER3_DIFFUSE_FINAL.png'),
                    bumpMap: THREE.ImageUtils.loadTexture('vehicle/Rover3_metallic.png'),
                    specularMap: THREE.ImageUtils.loadTexture('vehicle/rover3_specular_mix.png'),
                    normalMap: THREE.ImageUtils.loadTexture('vehicle/rover3_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(-2256.682139575714, -582.3776972094093, 134.3535874394895);
                mesh.rotation.set(3.108661188559257, 0.08214251796061826, -1.3798043208658213);
                mesh.scale.set(142, 142, 142);
                scene.add(mesh);

                render();

            });

            var loader_buggy = new THREE.JSONLoader();
            loader_buggy.load('vehicle/buggy.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/ROVER1_DIFFUSE_FINAL.png'),
                    bumpMap: THREE.ImageUtils.loadTexture('vehicle/rover1_metallic.png'),
                    specularMap: THREE.ImageUtils.loadTexture('vehicle/rover1_specular_mix.png'),
                    normalMap: THREE.ImageUtils.loadTexture('vehicle/rover1_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(-1442.0700675521832, 520.3081992152929, 85.82987398097332);
                mesh.rotation.set(3.0130708448514247, 0.08073792814970265, 0.5434126602022696);
                mesh.scale.set(164, 164, 164);
                scene.add(mesh);

                // spot light
                var g = new THREE.BoxGeometry( 1, 1, 1 );
                var m = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                var cube = new THREE.Mesh(g, m);
                cube.position.set(-1676.7651408268277, 568.1717586339375, 37.175993834848384);
                //cube.scale.set(200, 200, 200);
                scene.add(cube);


                var flashlight = new THREE.SpotLight(0x8AD7FF);
                flashlight.position.set(-1545.160602200525, 476.1996890796408, 188.99859917495758);
                flashlight.target = cube;
                flashlight.target.updateMatrixWorld();
                flashlight.intensity = 5;
                flashlight.shadow.camera.near = 500;
                flashlight.shadow.camera.far = 4000;
                flashlight.shadow.camera.fov = 30;
                //scene.add(flashlight);
                scene.add(new THREE.SpotLightHelper(flashlight));

                render();

            });

            var loader_platform = new THREE.JSONLoader();
            loader_platform.load('base/platform.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base/PLATFORM_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('base/PLATFORM_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                mesh.position.set(1757.3006975259884, 159.30232253409758, -6.964462833347263);
                mesh.rotation.set(2.986975729921738, -0.011020987812684268, 0.69493499244246);
                mesh.scale.set(67, 67, 67);
                scene.add(mesh);

                render();
            });

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

                mesh.position.set(1752.6078273845094, 170.16035582032782, 136.13966963654045);
                mesh.rotation.set(2.986975729921738, -0.011020987812684268, 0.69493499244246);
                mesh.scale.set(71, 71, 71);
                scene.add(mesh);

                render();
            });

            var loader_base1 = new THREE.JSONLoader();
            loader_base1.load('base/base.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base/BASE1_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('base/base1_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                mesh.position.set(1196.1245555923617, 72.17198194610403, 4.619589207532803);
                mesh.rotation.set(3.0539275684482554, -0.01779928350362459, 0.8072355095326471);
                mesh.scale.set(676, 676, 676);
                scene.add(mesh);

                render();
            });

            var loader_base2 = new THREE.JSONLoader();
            loader_base2.load('base/base2.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base/BASE2_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('base/base2_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry,
                    material
                );

                mesh.position.set(1793.6070843845494, -51.87996582767363, 4.6280447728193135);
                mesh.rotation.set(3.0539275684482554, -0.01779928350362459, 0.8072355095326471);
                mesh.scale.set(676, 676, 676);
                scene.add(mesh);

                /*
                control.attach(mesh);

                control.addEventListener('change', function() {
                    console.log("Position")
                    console.log(mesh.position);
                    console.log("Rotation")
                    console.log(mesh.rotation);
                    console.log("Scale")
                    console.log(mesh.scale);
                    render();
                });

                scene.add( control );
                */
                render();
            });

            var loader = new THREE.JSONLoader();

            // init loading
            loader.load('terrain/terrain.json', function (geometry_event, materials) {
                // create a new material

                //var material_event = new THREE.MeshFaceMaterial(materials);
                    /*
                    new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture("images/frontend-large.jpg"),
                    bumpMap: THREE.ImageUtils.loadTexture("images/frontend-large.jpg"),
                    ambient: 0xffffff,
                    specular: 0xffffff,
                    shininess: 100
                });
                     */

                var material_event = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(0x494d50),
                    map: THREE.ImageUtils.loadTexture("terrain/Moon_baseColorv3.png"),
                    specularMap: THREE.ImageUtils.loadTexture("terrain/TerrainDetail_NM_512x512.png"),
                    normalMap: THREE.ImageUtils.loadTexture("terrain/moonTerrain&tracks.png"),
                    bumpMap: THREE.ImageUtils.loadTexture("terrain/Moon_baseColorv3.png"),
                    bumpScale: 100,
                    shininess: 0
                });

                geometry_event.computeFaceNormals();
                geometry_event.computeVertexNormals();

                // create a mesh with models geometry and material
                var mesh_event = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh_event.rotation.x = 135;
                mesh_event.position.z = 0;
                mesh_event.position.y = 0;
                mesh_event.position.x = 0;
                mesh_event.castShadow = true;
                mesh_event.receiveShadow = true;
                mesh_event.scale.set(10000, 10000, 10000);
                scene.add(mesh_event);

                render();

                // NEW TERRAIN START
                /*
                var loader_terrain = new THREE.JSONLoader();
                loader_terrain.load('', function (geometry_terrain) {
                    // create a new material

                    //var material_event = new THREE.MeshFaceMaterial(materials);
                    var material_terrain = new THREE.MeshPhongMaterial({
                        color: new THREE.Color(0x494d50),
                        //map: THREE.ImageUtils.loadTexture("terrain/mesh_3_diffuse_3.jpg"),
                        //specularMap: THREE.ImageUtils.loadTexture("terrain/mesh_3_specular_3.jpg"),
                       // normalMap: THREE.ImageUtils.loadTexture("terrain/mesh_3_normals_2.jpg"),
                        //bumpMap: THREE.ImageUtils.loadTexture("terrain/mesh_3_normals_2.jpg"),
                        //bumpScale: 20
                        //shininess: 100
                    });

                    // create a mesh with models geometry and material
                    var mesh_terrain = new THREE.Mesh(
                        geometry_terrain,
                        material_terrain
                    );


                    mesh_terrain.rotation.x = 135;
                    mesh_terrain.position.z = 0;
                    mesh_terrain.position.y = 0;
                    mesh_terrain.position.x = 0;
                    mesh_terrain.scale.set(1000, 1000, 1000);

                    scene.add(mesh_terrain);

                });

*/
                // NEW TERRAIN FINISH




                ActiveObjects.mesh_array.push(mesh_event);
                ActiveObjects.camera = camera;

                document.addEventListener('mousedown', ActiveObjects.onClick1, false);



                /*
                function onDocumentMouseDown(event) {
                    var projector = new THREE.Projector();
                    var vector = new THREE.Vector3(
                        (event.clientX / window.innerWidth) * 2 - 1,
                        -(event.clientY / window.innerHeight) * 2 + 1,
                        0.5);
                    projector.unprojectVector(vector, camera);

                    var raycaster = new THREE.Raycaster(
                        camera.position,
                        vector.sub(camera.position).normalize());
                    var intersects = raycaster.intersectObjects(
                        [mesh_event]);

                    if (intersects.length > 0) {
                        var selectedObject = intersects[0].object;

                        setTimeout(function () {

                            camera.target = new THREE.Vector3(selectedObject.position.x, selectedObject.position.y, selectedObject.position.z);

                            // Position the camera to fit

                            var tween = new TWEEN.Tween(camera.position).to({
                                x: selectedObject.position.x,
                                y: selectedObject.position.y,
                                z: camera.position.z
                            }, 2000).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                               camera.lookAt(camera.target);
                            }).onComplete(function () {
                                //camera.lookAt(selectedObject.position);
                            }).start();

                            var tween = new TWEEN.Tween(camera.target).to({
                                x: selectedObject.position.x,
                                y: selectedObject.position.y,
                                z: selectedObject.position.z
                            }, 2000).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                            }).onComplete(function () {
                                camera.lookAt(selectedObject.position);
                                NavigationController.showEducationPanel();
                            }).start();
                        }, 500);
                    }
                }
                */



            });
            // *********** end

            renderer.render(scene, camera);
            function render() {
                alert(1)
                //renderer.shadowMap.enabled = true;
                //control.update();
                //requestAnimationFrame(render);

                //TWEEN.update();

                renderer.render(scene, camera);
            }

            window.addEventListener( 'resize', onWindowResize, false );

            function onWindowResize(){

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

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
        }
    }

    Scene.init();


    var stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );

    function animate() {

        stats.begin();

        // monitored code goes here

        stats.end();

        requestAnimationFrame( animate );

    }

    requestAnimationFrame( animate );


}());