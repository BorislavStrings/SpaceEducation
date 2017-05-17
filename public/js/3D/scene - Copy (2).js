(function() {


    function gizmoController(mesh, scene, camera, renderer, name) {

            return false;

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
                x:  5815.560937062276,
                y:  -1963.9115513891593,
                z: 1907.2763804512656
            },

            cast_shadow = true,
            shadowCameraNear = data.shadowCameraNear || 500,
            shadowCameraFar = data.shadowCameraFar || 10000,
            shadowCameraLeft = data.shadowCameraLeft || -4000,
            shadowCameraRight = data.shadowCameraRight || 5000,
            shadowCameraTop = data.shadowCameraTop || 3000,
            shadowCameraBottom = data.shadowCameraBottom || -4000,
            shadowCameraVisible = data.shadowCameraVisible || true,
            shadowMapWidth = data.shadowMapWidth || 2048,
            shadowMapHeight = data.shadowMapHeight || 2048;

            var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
            directionalLight.position.set(position.x, position.y, position.z);
            directionalLight.castShadow = true;
            directionalLight.shadowCameraVisible = true;
            directionalLight.intensity = 1.5;

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

            this.object = new THREE.Mesh(geometry, material);
            this.object.rotation.set(1,0,1);

            return this.object;
        }
    }

    var Objects = {

        set: function(scene, render, control, camera, renderer) {
            var loader_ice = new THREE.JSONLoader();
            loader_ice.load('terrain/ice.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshPhongMaterial({
                    normalMap: THREE.ImageUtils.loadTexture('terrain/ice-normal.jpg'),
                    map: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_diffuse.png'),
                    shininess: 100,
                    reflectivity: 0.2,
                    refractionRatio: 0.4,
                    envMap: THREE.ImageUtils.loadTexture("terrain/Moon_baseColorv3.png"),
                    //aoMap: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_normals.png')
                });

                var material2 = new THREE.MeshStandardMaterial( {
                    opacity: 0.70,
                    color: new THREE.Color(0xb3e0ff),
                    //map: THREE.ImageUtils.loadTexture('terrain/Chiseled_Ice.jpg'),
                    premultipliedAlpha: true,
                    transparent: true,
                    normalMap: THREE.ImageUtils.loadTexture('terrain/ice-normal.jpg'),
                } );

                var textureLoader = new THREE.TextureLoader();
                textureLoader.load("terrain/Chiseled_Ice.jpg", function ( map ) {
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

                render();
            });

            var loader_lander = new THREE.JSONLoader();
            loader_lander.load('lander/lander.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('lander/LANDER_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('lander/LAnder1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('lander/LAnder1_metallic.png'),
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

                var bluePoint = new THREE.PointLight(0x8AD7FF, 6, 140);
                bluePoint.position.set(-1333.982025077149, -2504.6529050588724, 334.78873312963054);
                scene.add(bluePoint);
                //scene.add(new THREE.PointLightHelper(bluePoint, 3));

                var bluePoint2 = new THREE.PointLight(0x8AD7FF, 6, 140);
                bluePoint2.position.set(-997.5165067150376, -2524.3871967864548, 356.65294271407464);
                scene.add(bluePoint2);
                //scene.add(new THREE.PointLightHelper(bluePoint2, 3));

                var bluePoint3 = new THREE.PointLight(0x8AD7FF, 6, 140);
                bluePoint3.position.set(-1354.7080828208075, -2839.2458413177355, 348.7656507474024);
                scene.add(bluePoint3);
                //scene.add(new THREE.PointLightHelper(bluePoint3, 3));

                /*
                var bluePoint4 = new THREE.PointLight(0x8AD7FF, 6, 140);
                bluePoint4.position.set(-988.628336738545, -2870.93599043925, 359.83038342041);
                scene.add(bluePoint4);
                scene.add(new THREE.PointLightHelper(bluePoint4, 3));
                 gizmoController(bluePoint4, scene, camera, renderer, 'point')
                */

                render();

            });

            var loader_solar = new THREE.JSONLoader();
            loader_solar.load('base/solar.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base/BASE1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base/BASE1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base/BASE1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base/base1_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                geometry_event.computeFaceNormals();
                geometry_event.computeVertexNormals();


                geometry_event.computeFaceNormals();
                geometry_event.computeVertexNormals();

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(1580.2162987054971, -1892.9959390858985, 389.5555566605302)
                mesh.rotation.set(-2.9321142031743506, -0.043261971898644606, -0.23373677526209646);
                mesh.scale.set(109, 109, 109);
                mesh.castShadow = true;
                
                scene.add(mesh);

                // create a mesh with models geometry and material
                var mesh2 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh2.position.set(2248.0795608199346, -1608.605573836514, 398.0878023223412)
                mesh2.rotation.set(-2.7477668396776265, -0.15978229076673842, -0.47781640660766506);
                mesh2.scale.set(109, 109, 109);
                mesh2.castShadow = true;

                scene.add(mesh2);

                // create a mesh with models geometry and material
                var mesh3 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh3.position.set(2103.6293598533316, -2123.8086516541516, 363.9946609278576)
                mesh3.rotation.set(-2.90367410232185, -0.06776075174363687, -0.3848729907452809);
                mesh3.scale.set(109, 109, 109);
                mesh3.castShadow = true;

                scene.add(mesh3);

                //gizmoController(mesh3, scene, camera, renderer, 'solar')

                render();

            });

            var loader_rover = new THREE.JSONLoader();
            loader_rover.load('vehicle/rover.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/ROVER2_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('vehicle/rover2_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('vehicle/rover2_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('vehicle/rover2_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(2091.3348166746973, -3529.119105341411, 363.1317365444028)
                mesh.rotation.set(3.040377083129375, 0.0050550108925334, 0.02753247964043185);
                mesh.scale.set(149, 149, 149);
                mesh.castShadow = true;

                scene.add(mesh);

                var mesh2 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh2.position.set(-3279.1801510903438, -1065.9262065504288, 209.98814840852577);
                mesh2.rotation.set(3.0571908323685997, -0.014503688536034247, -0.5122683879602181);
                mesh2.scale.set(149, 149, 149);
                mesh2.castShadow = true;

                scene.add(mesh2);

                /*
                control.attach(mesh2);

                control.addEventListener('change', function() {
                    console.log("Position")
                    console.log(mesh2.position.x + ', ' + mesh2.position.y + ', ' + mesh2.position.z);
                    console.log("Rotation")
                    console.log(mesh2.rotation.x + ', ' + mesh2.rotation.y + ", " + mesh2.rotation.z);
                    console.log("Scale")
                    console.log(mesh2.scale.x + ', ' + mesh2.scale.y + ", " + mesh2.scale.z);
                    render();
                });

                scene.add( control );
                */


                render();

            });

            var loader_camp = new THREE.JSONLoader();
            loader_camp.load('base2/camp.json', function (geometry_event, materials) {
                geometry_event.computeVertexNormals();
                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base2/BASE1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base2/base1_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
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
                var bluePoint3 = new THREE.PointLight(0x8AD7FF, 8, 140);
                bluePoint3.position.set(-692.4371144453452, -3720.83612149132, 509.95857914019655);
                scene.add(bluePoint3);
                //scene.add(new THREE.PointLightHelper(bluePoint3, 3));
                //gizmoController(bluePoint3, scene, camera, renderer, 'point')

                render();
            });

            var loader_earth = new THREE.JSONLoader();
            loader_earth.load('terrain/earth.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('terrain/1_earth_2k.jpg'),
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

                render();
            });

            var loader_antena = new THREE.JSONLoader();
            loader_antena.load('base2/antena.json', function (geometry_event, materials) {
                geometry_event.computeVertexNormals();
                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base2/BASE1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base2/base1_specular_mix.png'),
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

                gizmoController(mesh, scene, camera, renderer, 'spot light')

                render();

            });

            var loader_astronaut = new THREE.JSONLoader();
            loader_astronaut.load('base2/astronaut.json', function (geometry_event, materials) {
                geometry_event.computeVertexNormals();
                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base2/BASE1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base2/BASE1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base2/base1_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(-710.1034623949946, -3343.0974221810798, 381.77938605751353);
                mesh.rotation.set(-3.1207029935336696, -0.06314659469563595, 2.5161092783486687);
                mesh.scale.set(26, 26, 26);
                mesh.castShadow = true;

                scene.add(mesh);

                var mesh2 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh2.position.set(-541.5392951615735, -3512.833402549815, 381.77938605751353);
                mesh2.rotation.set(-3.1207029935336696, -0.06314659469563595, 2.5161092783486687);
                mesh2.scale.set(26, 26, 26);
                mesh2.castShadow = true;

                scene.add(mesh2);

                var mesh3 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh3.position.set(-291.04562894078424, -3364.930028587068, 374.5399789619356);
                mesh3.rotation.set(3.077743162454491, 0.018628041034888288, 0.34210231832633775);
                mesh3.scale.set(26, 26, 26);
                mesh3.castShadow = true;

                scene.add(mesh3);

                /*
                control.attach(mesh3);

                control.addEventListener('change', function() {
                    console.log("Position")
                    console.log(mesh3.position.x + ', ' + mesh3.position.y + ', ' + mesh3.position.z);
                    console.log("Rotation")
                    console.log(mesh3.rotation.x + ', ' + mesh3.rotation.y + ", " + mesh3.rotation.z);
                    console.log("Scale")
                    console.log(mesh3.scale.x + ', ' + mesh3.scale.y + ", " + mesh3.scale.z);
                    render();
                });

                scene.add( control );
                */
                render();

            });

            var loader_sattelite = new THREE.JSONLoader();
            loader_sattelite.load('base3/satellite.json', function (geometry) {
                geometry.computeVertexNormals();
                var material = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base3/Satelite_diffuse.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base3/Satelite_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base3/Satelite_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base3/Satelite_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry,
                    material
                );
                
                mesh.position.set(-2901.9087460402475, -3166.1549699013394, 223.47552964309668);
                mesh.rotation.set(3.031611662535413, -0.05307759717215287, -0.5433183252860815);
                mesh.scale.set(123, 123, 123);
                mesh.castShadow = true;
                scene.add(mesh);

                gizmoController(mesh, scene, camera, renderer, 'Satellite');

                render();
            });

            var loader_asteroid = new THREE.JSONLoader();
            loader_asteroid.load('base4/asteroid.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base4/Terrain_meshes&rocks_diffuse.png'),
                    normalMap: THREE.ImageUtils.loadTexture('base4/Terrain_meshes&rocks_normals.png'),
                    shininess: 30
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

                var spotLight = new THREE.SpotLight(0xF7F131, 2, 600, 0.45, 0.4);
                spotLight.position.set(-3445.7725490157222, -936.6166292295972, 420.4770632509405);
                spotLight.castShadow = true;
                spotLight.target = mesh;

                scene.add(spotLight);

                var spotLight2 = new THREE.SpotLight(0xF7F131, 2, 600, 0.45, 0.4);
                spotLight2.position.set(-3836.824249271646, -1181.734066574996, 420.4770632509405);
                spotLight2.castShadow = true;
                spotLight2.target = mesh;

                scene.add(spotLight2);

                //gizmoController(spotLight, scene, camera, renderer, 'spot light')

                //spotLight.shadow.camera.near = 1000;
                //spotLight.shadow.camera.far = 8000;
                //spotLight.shadow.camera.fov = 30;

                render();
            });

            var loader_driller = new THREE.JSONLoader();
            loader_driller.load('vehicle/driller.json', function (geometry_event, materials) {
                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/DRILLER_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('vehicle/driller_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('vehicle/driller_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('vehicle/driller_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
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
                mesh_event.scale.set(185, 185, 185);
                mesh_event.castShadow = true;
                scene.add(mesh_event);

                var mesh2 = new THREE.Mesh(geometry_event, material_event);
                mesh2.position.set(-2250.2254184125404, 2831.0630981102518, -258.2685488666977);
                mesh2.rotation.set(-3.0841573126655057, -0.06734690407265365, 2.2778467885560194);
                mesh2.scale.set(185, 185, 185);
                mesh2.castShadow = true;
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
                mesh.castShadow = true;
                scene.add(mesh);

                var mesh2 = new THREE.Mesh(geometry_event, material_event);
                mesh2.castShadow = true;
                mesh2.position.set(-2102.980218109571, 2415.175991910018, -160.65496682689258);
                mesh2.rotation.set(3.1175339557670414, -0.08515874930147171, -1.7044845922767207);
                mesh2.scale.set(200, 200, 200);
                mesh2.castShadow = true;
                scene.add(mesh2);

                var mesh3 = new THREE.Mesh(geometry_event, material_event);
                mesh3.castShadow = true;
                mesh3.position.set(-1692.3375184932886, 2601.673767139308, -182.08329775612637);
                mesh3.rotation.set(3.0553355966403806, -0.01975150306229844, -2.7750243096181);
                mesh3.scale.set(200, 200, 200);
                mesh3.castShadow = true;
                scene.add(mesh3);

                var mesh4 = new THREE.Mesh(geometry_event, material_event);
                mesh4.castShadow = true;
                mesh4.position.set(-3843.5051622988817, -1197.8557778049133, 321.56210542667884);
                mesh4.rotation.set(-3.060248576994929, 0.03486053362680123, 0.5460257266958075);
                mesh4.scale.set(200, 200, 200);
                mesh4.castShadow = true;
                scene.add(mesh4);

                var mesh5 = new THREE.Mesh(geometry_event, material_event);
                mesh5.castShadow = true;
                mesh5.position.set(-3539.956516452432, -978.0494883370933, 272.90484180350325);
                mesh5.rotation.set(-3.1305341644622198, 0.08779213329380738, 1.5873485818091957);
                mesh5.scale.set(200, 200, 200);
                mesh4.castShadow = true;
                scene.add(mesh5);

                // add lamp lights
                /*
                var bluePoint = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint.position.set(-1847.690991794874, 2707.5260344284075, -160.4461710221736);
                scene.add(bluePoint);
                */
                var bluePoint2 = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint2.position.set(-2140.052802461263, 2573.232646980367, -167.82436322130133);
                scene.add(bluePoint2);
                //scene.add(new THREE.PointLightHelper(bluePoint2, 3));

                var bluePoint3 = new THREE.PointLight(0x8AD7FF, 10, 100);
                bluePoint3.position.set(-2515.922138886294, 2633.498063236924, -90.3229184592114);
                scene.add(bluePoint3);
                //scene.add(new THREE.PointLightHelper(bluePoint3, 3));

                //gizmoController(bluePoint, scene, camera, renderer, 'blue point 1');
                //gizmoController(bluePoint2, scene, camera, renderer, 'blue point 2');
                //gizmoController(bluePoint3, scene, camera, renderer, 'lamp 4');


                render();
            });

            var loader_driller3 = new THREE.JSONLoader();
            loader_driller3.load('vehicle/driller3.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/ROVER3_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('vehicle/Rover3_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('vehicle/Rover3_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('vehicle/rover3_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(-2256.682139575714, -582.3776972094093, 134.3535874394895);
                mesh.rotation.set(3.108661188559257, 0.08214251796061826, -1.3798043208658213);
                mesh.scale.set(142, 142, 142);
                mesh.castShadow = true;
                scene.add(mesh);

                var mesh2 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh2.position.set(1229.1610845179728, -1194.781915043161, 143.86125197112548);
                mesh2.rotation.set(2.9415720106608045, -0.016042678504802968, 2.3642718387917814);
                mesh2.scale.set(130, 130, 130);
                mesh2.castShadow = true;
                scene.add(mesh2);

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

                render();
            });

            var loader_buggy = new THREE.JSONLoader();
            loader_buggy.load('vehicle/buggy.json', function (geometry_event, materials) {

                var material_event = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('vehicle/ROVER1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('vehicle/rover1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('vehicle/rover1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('vehicle/rover1_specular_mix.png'),
                    shininess: 70,
                    roughness: 0.2,
                    metalness: 0.9
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh.position.set(-1442.0700675521832, 520.3081992152929, 85.82987398097332);
                mesh.rotation.set(3.0130708448514247, 0.08073792814970265, 0.5434126602022696);
                mesh.scale.set(164, 164, 164);
                mesh.castShadow = true;
                scene.add(mesh);

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

                //gizmoController(mesh5, scene, camera, renderer, 'gizmo');

                render();

            });

            var loader_platform = new THREE.JSONLoader();
            loader_platform.load('base/platform.json', function (geometry) {

                var material = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base/PLATFORM_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base/PLATFORM_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base/PLATFORM_Metalic_FINAL.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base/PLATFORM_specular_mix.png'),
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

                var redPoint = new THREE.PointLight(0xFF4242, 10, 150);
                redPoint.position.set(1392.54502266413, 496.7025603409263, 6.157350554849103);
                scene.add(redPoint);
                //scene.add(new THREE.PointLightHelper(redPoint, 3));

                var redPoint1 = new THREE.PointLight(0xFF4242, 10, 150);
                redPoint1.position.set(1883.7285842526867, 41.31665417124851, 82.40439900778269);
                scene.add(redPoint1);
                //scene.add(new THREE.PointLightHelper(redPoint1, 3));

                //gizmoController(redPoint, scene, camera, renderer, 'point');

                render();
            });

            var loader_shuttle = new THREE.JSONLoader();
            loader_shuttle.load('base/shuttle.json', function (geometry) {

                var material = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base/SHUTTLE_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base/SHUTTLE_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base/SHUTTLE_Metalic_FINAL.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base/SHUTTLE_specular_mix.png'),
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

                render();
            });

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

            var loader_moon_rocks = new THREE.JSONLoader();
            loader_moon_rocks.load('terrain/moonrock.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_diffuse.png'),
                    normalMap: THREE.ImageUtils.loadTexture('terrain/Terrain_meshes&rocks_normals.png'),
                    shininess: 30
                });

                geometry.computeVertexNormals();

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(-2328.312986414617, -1712.2997371561191, 223.0265979295336);
                mesh.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                mesh.scale.set(100, 100, 100);
                mesh.castShadow = true;
                scene.add(mesh);

                var mesh2 = new THREE.Mesh(geometry, material);
                mesh2.position.set(-2312.5231500235564, -1765.717271824868, 270.79719495526297);
                mesh2.rotation.set(3.08116403781128, 0.12110828239825468, -0.5172186562182214);
                mesh2.scale.set(70, 70, 70);
                mesh2.castShadow = true;
                scene.add(mesh2);

                var mesh3 = new THREE.Mesh(geometry, material);
                mesh3.position.set(-2301.4467361776606, -1713.4910014054753, 270.79719495526297);
                mesh3.rotation.set(-3.035625785916709, 0.0842530952654609, -1.8829624122415007);
                mesh3.scale.set(100, 100, 100);
                mesh3.castShadow = true;
                scene.add(mesh3);

                var mesh4 = new THREE.Mesh(geometry, material);
                mesh4.position.set(-1233.8006656034659, -3177.204569510493, 380.54466947979427);
                mesh4.rotation.set(-3.035625785916709, 0.0842530952654609, -1.8829624122415007);
                mesh4.scale.set(100, 100, 100);
                mesh4.castShadow = true;
                scene.add(mesh4);

                var mesh5 = new THREE.Mesh(geometry, material);
                mesh5.position.set(-1086.7482479411244, -3307.0089271142842, 410.58143190980644);
                mesh5.rotation.set(-3.055501634506803, -0.10448108368955746, -2.417666514467502);
                mesh5.scale.set(82, 82, 82);
                mesh5.castShadow = true;
                scene.add(mesh5);

                var mesh6 = new THREE.Mesh(geometry, material);
                mesh6.position.set(-183.98158262177006, -3339.257435528338, 407.492282601606);
                mesh6.rotation.set(-3.055501634506803, -0.10448108368955746, -2.417666514467502);
                mesh6.scale.set(167, 167, 167);
                mesh6.castShadow = true;
                scene.add(mesh6);

                var mesh7 = new THREE.Mesh(geometry, material);
                mesh7.position.set(-253.50749279198948, -2724.882612127914, 363.22028880555956);
                mesh7.rotation.set(-3.135540934774521, -0.13514642818269548, -3.064086003098199);
                mesh7.scale.set(142, 142, 142);
                mesh7.castShadow = true;
                scene.add(mesh7);

                var mesh8 = new THREE.Mesh(geometry, material);
                mesh8.position.set(-52.106795023553474, -2559.1014261601395, 394.3494175502253);
                mesh8.rotation.set(-3.0555016419704915, -0.10448109118099023, -1.2194945760128038);
                mesh8.scale.set(83, 83, 83);
                mesh8.castShadow = true;
                scene.add(mesh8);

                var mesh9 = new THREE.Mesh(geometry, material);
                mesh9.position.set(-1633.626139115006, -339.3288228294936, 148.8503864139436);
                mesh9.rotation.set(-3.130953635159007, 0.10188314355901416, -1.2195931998362577);
                mesh9.scale.set(191, 191, 191);
                mesh9.castShadow = true;
                scene.add(mesh9);

                var mesh10 = new THREE.Mesh(geometry, material);
                mesh10.position.set(-1539.0269077466523, -671.7358987484251, 146.96237335136058);
                mesh10.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                mesh10.scale.set(169, 169, 169);
                mesh10.castShadow = true;
                scene.add(mesh10);

                var mesh11 = new THREE.Mesh(geometry, material);
                mesh11.position.set(-505.04705345683755, 1246.2381120820703, 48.69776665635181);
                mesh11.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                mesh11.scale.set(332, 332, 332);
                mesh11.castShadow = true;
                scene.add(mesh11);

                var mesh12 = new THREE.Mesh(geometry, material);
                mesh12.position.set(-2414.111459609236, 2000.019514933828, -139.91041487011873);
                mesh12.rotation.set(3.0521027623158186, -0.049911764106283237, 0.9628826594102685);
                mesh12.scale.set(107, 107, 107);
                mesh12.castShadow = true;
                scene.add(mesh12);

                var mesh13 = new THREE.Mesh(geometry, material);
                mesh13.position.set(-2604.776885587, 2046.3951490215172, -138.25409282686402);
                mesh13.rotation.set(-3.0883315771493374, -0.08754129990470265, 2.573797874460198);
                mesh13.scale.set(80, 80, 80);
                mesh13.castShadow = true;
                scene.add(mesh13);

                //gizmoController(mesh13, scene, camera, renderer, 'rock');

                render();
            });

            var loader_boxes = new THREE.JSONLoader();
            loader_boxes.load('base2/boxes.json', function (geometry) {
                var material = new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('base2/BASE1_DIFFUSE_FINAL.png'),
                    specularMap: THREE.ImageUtils.loadTexture('base/base1_specular_mix.png'),
                    shininess: 30
                });

                // create a mesh with models geometry and material
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(1813.3790482673069, -269.2569951004197, 21.754769935148484);
                mesh.rotation.set(3.01304324231785, -0.042259388165002194, 0.905180711206935);
                mesh.scale.set(11.61, 11.61, 11.61);
                mesh.castShadow = true;
                scene.add(mesh);

                var mesh2 = new THREE.Mesh(geometry, material);
                mesh2.position.set(1844.6618133022241, -338.1878356833019, 27.947927254277);
                mesh2.rotation.set(3.105276147399598, -0.032676267831790326, 2.8871311099577612);
                mesh2.scale.set(11.61, 11.61, 11.61);
                mesh2.castShadow = true;
                scene.add(mesh2);

                var mesh3 = new THREE.Mesh(geometry, material);
                mesh3.position.set(125.56025149992954, -3860.551532888839, 413.4845043620769);
                mesh3.rotation.set(3.105276147399598, -0.032676267831790326, 2.8871311099577612);
                mesh3.scale.set(11.61, 11.61, 11.61);
                mesh3.castShadow = true;
                scene.add(mesh3);

                var mesh4 = new THREE.Mesh(geometry, material);
                mesh4.position.set(69.00182107077647, -3825.9452443203877, 413.4845043620769);
                mesh4.rotation.set(3.125918066578487, 0.04626705702886343, 0.9107399022904402);
                mesh4.scale.set(11.61, 11.61, 11.61);
                mesh4.castShadow = true;
                scene.add(mesh4);

                var mesh5 = new THREE.Mesh(geometry, material);
                mesh5.position.set(-3713.7730582012077, -1006.7391632425139, 249.87315127496584);
                mesh5.rotation.set(3.03307579866708, -0.024515618309992125, 0.909630960959743);
                mesh5.scale.set(11.61, 11.61, 11.61);
                mesh5.castShadow = true;
                scene.add(mesh5);

                var mesh6 = new THREE.Mesh(geometry, material);
                mesh6.position.set(-3777.974700278944, -1049.1197833216677, 249.87315127496584);
                mesh6.rotation.set(3.0053412819371674, -0.03353300642327122, -0.858415094090414);
                mesh6.scale.set(11.61, 11.61, 11.61);
                mesh6.castShadow = true;
                scene.add(mesh6);

                render();
            });

            var loader_base1 = new THREE.JSONLoader();
            loader_base1.load('base/base.json', function (geometry) {

                var material = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base/BASE1_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base/BASE1_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base/BASE1_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base/base1_specular_mix.png'),
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

                render();
            });

            var loader_base2 = new THREE.JSONLoader();
            loader_base2.load('base/base2.json', function (geometry) {

                var material = new THREE.MeshStandardMaterial({
                    map: THREE.ImageUtils.loadTexture('base/BASE2_DIFFUSE_FINAL.png'),
                    roughnessMap: THREE.ImageUtils.loadTexture('base/base2_roughness.png'),
                    metalnessMap: THREE.ImageUtils.loadTexture('base/base2_metallic.png'),
                    //specularMap: THREE.ImageUtils.loadTexture('base/base2_specular_mix.png'),
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

                var maxAnisotropy = renderer.getMaxAnisotropy();
                maxAnisotropy = maxAnisotropy || 1;

                var groundBump = THREE.ImageUtils.loadTexture('terrain/TerrainDetail_NM_512x512.png');
                var ground_map = THREE.ImageUtils.loadTexture("terrain/Moon_baseColorv3.png");
                ground_map.anisotropy = maxAnisotropy;

                var material_event = new THREE.MeshPhongMaterial({
                    map: ground_map,
                    aoMap: THREE.ImageUtils.loadTexture("terrain/ao.png"),
                    aoMapIntensity: 1,
                    normalMap: THREE.ImageUtils.loadTexture("terrain/moonTerrain&tracks.png"),
                    bumpMap: groundBump,
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
                //mesh_event.castShadow = true;
                mesh_event.receiveShadow = true;
                mesh_event.scale.set(10000, 10000, 10000);
                scene.add(mesh_event);

                var mesh_bottom = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh_bottom.position.set(0, 0, -1059.193358198944);
                mesh_bottom.rotation.set(-3.1218695997895907, -0.0862635463414383, 1.7958678807097355);
                mesh_bottom.scale.set(20000, 20000, 20000);
                scene.add(mesh_bottom);

                var mesh_bottom2 = new THREE.Mesh(
                    geometry_event,
                    material_event
                );

                mesh_bottom2.position.set(0, 0, -2366.868264174072);
                mesh_bottom2.rotation.set(-3.121869614743458, -0.08626353138466195, -1.516899777401994);
                mesh_bottom2.scale.set(29175, 29175, 29175);
                scene.add(mesh_bottom2);

                //gizmoController(mesh_bottom2, scene, camera, renderer, 'aaaaaaa');
                scene.add(mesh_bottom2)

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




                //ActiveObjects.mesh_array.push(mesh_event);
                //ActiveObjects.camera = camera;

                //document.addEventListener('mousedown', ActiveObjects.onClick1, false);



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
            var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 50000);
            //camera.position.zoom = 30;
            camera.position.set(0, -2000, 1500);


            var camera_orientation_vector = new THREE.Vector3(0, 0, 800)
            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.set(camera_orientation_vector);
            scene.add( cube );
            scene.fog = new THREE.Fog(0x000000, 1, 22000);
            camera.lookAt(camera_orientation_vector);

            //camera.lookAt(camera_orientation_vector);

            // Set Renderer
            var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
            renderer.setClearColor( 0x000000, 0 );
            renderer.setSize(window.innerWidth, window.innerHeight);

            renderer.shadowMap.enabled = true;
            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            renderer.shadowMapEnabled = true;
            renderer.shadowMapSoft = true;

            renderer.shadowMapBias = 0.0039;



            //renderer.gammaInput = true;
            //renderer.gammaOutput = true;
            document.body.appendChild(renderer.domElement);

            //var control = new THREE.TransformControls( camera, renderer.domElement );
            var control = null;

            var bg = SphereBackground.init({
                map: 'terrain/Skybox_texture.jpg',
                radius: 30000
            })

            /*
            scene.add(
                bg
            );
            */


            // Set Scene Lights
            var light = Lights.setDirectionalLight();

            scene.add(light);

            //dlightHelper = new THREE.DirectionalLightHelper(light, 500);
            //scene.add(dlightHelper);
            gizmoController(light, scene, camera, renderer, 'Light');

            //var helper = new THREE.CameraHelper( light.shadow.camera );
            //scene.add( helper );

            //scene.add(Lights.setDirectionalLight());

            /*
            scene.add(Lights.setAmbient({
                intensity: 2
            }));
            */
            scene.add( new THREE.AmbientLight( 0xffffff, 0.2 ) );

            //var controls = new THREE.OrbitControls( camera, renderer.domElement, camera_orientation_vector );
            //controls.enableDamping = true;
            //controls.dampingFactor = 0.25;
            //controls.enableZoom = true;


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
            //scene.add( spotLight );


            /*
            scene.add(Lights.setAmbient({
                intensity: 0.3
            }));
            */


            // intersection plane
            var geometry1 = new THREE.PlaneGeometry(Terrain.width, Terrain.height, 4, 4);

            // Create Material
            var terrain_material = new THREE.MeshPhongMaterial();
            terrain_material.color = new THREE.Color(0xff0000);

            // Create Plane
            var object_mesh = new THREE.Mesh(geometry1, terrain_material);
            object_mesh.position.set(0, 0, -3000);
            scene.add(object_mesh);

            //var C = new THREE.OrbitControls(camera, scene, renderer.domElement);
            //var controls = new THREE.DeviceOrientationControls( camera );

            new THREE.MapControls(camera, render, renderer.domElement, object_mesh, camera_orientation_vector)

            // *********** set model pyramid
            // Load Event Model


            Objects.set(scene, render, control, camera, renderer);


            setTimeout(function() {
                //alert('show');
                render();
            }, 5000)

            renderer.render(scene, camera);
            function render() {

                //renderer.shadowMap.enabled = true;
                //control.update();
                //requestAnimationFrame(render);

                //TWEEN.update();

                /*
                var position = camera.position;
                camera.position.set(position.x + 10, position.y + 10, position.z);
                camera.updateMatrix();
                */
                renderer.render(scene, camera);
            }

            window.addEventListener( 'resize', onWindowResize, false );

            function onWindowResize(){

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            var stats = new Stats();
            stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild( stats.dom );

            function animate() {
                requestAnimationFrame( animate );
                stats.begin();

                // monitored code goes here

                stats.end();

                //controls.update();

                render();



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
        }
    }

    Scene.init();

}());