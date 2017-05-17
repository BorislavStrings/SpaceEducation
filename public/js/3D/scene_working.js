(function() {

    function getHeightData(img) {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext( '2d' );

        var size = 128 * 128, data = new Float32Array( size );

        context.drawImage(img,0,0);

        for ( var i = 0; i < size; i ++ ) {
            data[i] = 0
        }

        var imgd = context.getImageData(0, 0, 128, 128);
        var pix = imgd.data;

        var j=0;
        for (var i = 0, n = pix.length; i < n; i += (4)) {
            var all = pix[i]+pix[i+1]+pix[i+2];
            data[j++] = all/30;
        }

        return data;
    }


    $(function() {
        $('#back').on('click', function() {
            $('#loading').fadeIn();
            setTimeout(function() {
                $('#education').removeClass('active');
                $('#loading').fadeOut();
            }, 1000);
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


    var Controls = {
        object: null
    }

    var Plane = {
        depth: 128,
        width: 128,
        spacing_x: 32,
        spacing_z: 32,
        height_offset: 1,
        map: '',
        color: '',
        object: null,
        material: null,

        set: function(img) {
            var canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;

            var ctx = canvas.getContext('2d');

            // draw on canvas
            ctx.drawImage(img, 0, 0);
            var pixel = ctx.getImageData(0, 0, Plane.width, Plane.depth);
            var geom = new THREE.Geometry(1024, 1024);
            var output = [];
            for (var x = 0; x < Plane.depth; x++) {
                for (var z = 0; z < Plane.width; z++) {
                    // get pixel
                    // since we're grayscale, we only need one element
                    // each pixel contains four values RGB and opacity
                    var yValue = pixel.data
                            [z * 4 + (Plane.depth * x * 4)] / Plane.height_offset;
                    var vertex = new THREE.Vector3(
                        x * Plane.spacing_x, yValue, z * Plane.spacing_z);
                    geom.vertices.push(vertex);
                }
            }

            // we create a rectangle between four vertices, and we do
            // that as two triangles.
            for (var z = 0; z < Plane.depth - 1; z++) {
                for (var x = 0; x < Plane.width - 1; x++) {
                    // we need to point to the position in the array
                    // a - - b
                    // | x |
                    // c - - d
                    var a = x + z * Plane.width;
                    var b = (x + 1) + (z * Plane.width);
                    var c = x + ((z + 1) * Plane.width);
                    var d = (x + 1) + ((z + 1) * Plane.width);
                    var face1 = new THREE.Face3(a, b, d);
                    var face2 = new THREE.Face3(d, c, a);
                    geom.faces.push(face1);
                    geom.faces.push(face2);
                }
            }

            geom.computeVertexNormals(true);
            geom.computeFaceNormals();

            var terrain_material = new THREE.MeshPhongMaterial();
            terrain_material.map = THREE.ImageUtils.loadTexture("images/moon.jpg");
            terrain_material.bumpMap = THREE.ImageUtils.loadTexture("images/moon.jpg");
            terrain_material.normalMap = THREE.ImageUtils.loadTexture("images/moon_normal_map.jpg");
            terrain_material.bumpScale = 5;

            this.object = new THREE.Mesh(geom, terrain_material);
            this.object.receiveShadow = true;
            this.object.rotation.set(0, 0, 0);
            this.object.position.set(-2048, -500, -2048);

            return this.object;
        }
    }
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000);

    var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.shadowMapEnabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    var directionalLight = new THREE.DirectionalLight();
    directionalLight.position = new THREE.Vector3(500, 300, -100);
    directionalLight.castShadow = true;

    directionalLight.shadowCameraNear = 25;
    directionalLight.shadowCameraFar = 200;
    directionalLight.shadowCameraLeft = -50;
    directionalLight.shadowCameraRight = 50;
    directionalLight.shadowCameraTop = 50;
    directionalLight.shadowCameraBottom = -50;
    directionalLight.shadowCameraVisible = true;

    directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;

    scene.add(directionalLight);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 0.15;
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight();
    pointLight.color = new THREE.Color(0xff0000);
    pointLight.intensity = 5;
    pointLight.distance = 100;
    pointLight.name = 'pointLight';
    pointLight.position = new THREE.Vector3(100,100,100);
    scene.add(pointLight);

    document.body.appendChild( renderer.domElement );

    //camera.position.zoom = 30;
    camera.position.y = -256;
    camera.position.z = 700;
    camera.lookAt(scene.position);

    var img = new Image();
    img.src = "images/moon_height.jpg";
    img.onload = function() {

        var geometry = new THREE.PlaneGeometry( 4096, 4096, 127, 127 );
        var terrain_material = new THREE.MeshPhongMaterial();
        terrain_material.map = THREE.ImageUtils.loadTexture("images/sands.png");
        terrain_material.bumpMap = THREE.ImageUtils.loadTexture("images/moon.jpg");
        //terrain_material.normalMap = THREE.ImageUtils.loadTexture("images/moon_normal_map.png");
        terrain_material.bumpScale = 10;

        var data = getHeightData(img);
        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = data[i] * 20;
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        var plane = new THREE.Mesh(geometry, terrain_material);
        //scene.add(Plane.set(img));
        plane.position.set(0, 0, 0);
        plane.receiveShadow = true;
        plane.castShadow = true;
        scene.add( plane );

        // add background
        var bg_geometry = new THREE.SphereGeometry( 2048, 32, 32 );
        var bg_material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("images/starfield.png"), overdraw: 0.5 } );
        bg_material.side = THREE.DoubleSide;
        var bg_mesh = new THREE.Mesh( bg_geometry, bg_material );
        scene.add( bg_mesh );


        var loader = new THREE.JSONLoader(); // init the loader util

        // init loading
        loader.load('model/rocket.json', function (geometry_event) {
            // create a new material

            var material_event = new THREE.MeshPhongMaterial({
                map: THREE.ImageUtils.loadTexture("images/frontend-large.jpg"),
                ambient: 0xff0000,
                specular: 0x000000,
                shininess: 70
            });

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
            //mesh_event.scale.set(200,200,200);
            scene.add(mesh_event);

            camera.lookAt(mesh_event.position);

            //var controls = new THREE.OrbitControls( camera, mesh_event, renderer.domElement );

            // Mouse Listener
            document.addEventListener('mousedown', onDocumentMouseDown, false);

            Controls.obj = new THREE.FirstPersonControls( camera, renderer.domElement );
            Controls.obj.movementSpeed = 70;
            Controls.obj.lookSpeed = 0.05;
            Controls.obj.noFly = true;
            Controls.obj.lookVertical = true;

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
                    // show loading
                    $('#loading').fadeIn();


                    var selectedObject = intersects[0].object;

                    setTimeout(function(){
                        $('#loading').fadeOut();
                        $('#education').addClass('active');

                        // Position the camera to fit
                        var tween = new TWEEN.Tween(camera.position).to({
                            x: selectedObject.position.x,
                            y: selectedObject.position.y,
                            z: 1
                        }).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                            alert(1)
                            camera.lookAt(camera.target);
                        }).onComplete(function () {
                            camera.lookAt(selectedObject.position);
                        }).start();

                        var tween = new TWEEN.Tween(camera.target).to({
                            x: selectedObject.position.x,
                            y: selectedObject.position.y,
                            z: selectedObject.position.z
                        }).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                            alert(1)
                        }).onComplete(function () {
                            camera.lookAt(selectedObject.position);
                        }).start();
                    }, 1000);
                }
            }

            render();


        });

        renderer.render(scene, camera);

        function render() {
            //Controls.obj.update();
            renderer.shadowMap.enabled = true;
            requestAnimationFrame( render );
            renderer.render( scene, camera );
        }
    }

}());