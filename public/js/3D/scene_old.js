(function() {


    var Light = {
        lights: [],
        lens: [],
        set: function() {
            var dirLight = new THREE.DirectionalLight(0xffffff, 0.05);
            dirLight.position.set(0, -1, 0).normalize();
            dirLight.color.setHSL(0.1, 0.7, 0.5);

            Light.lights.push(dirLight);

            var obj = Light.addLensFlares(0.55, 0.9, 0.5, 5000, 0, -1000);

            Light.lights.push(obj['light']);
            Light.lens.push(obj['lens']);

            obj = Light.addLensFlares(0.08, 0.8, 0.5, 0, 0, -1000);

            Light.lights.push(obj['light']);
            Light.lens.push(obj['lens']);

            obj = Light.addLensFlares(0.995, 0.5, 0.9, 5000, 5000, -1000);

            Light.lights.push(obj['light']);
            Light.lens.push(obj['lens']);

            return {lens: Light.lens, light: Light.lights};
        },
        addLensFlares: function( h, s, l, x, y, z ) {
            // lens flares
            var textureLoader = new THREE.TextureLoader();
            var textureFlare0 = textureLoader.load("images/lensflare/lensflare0.png");
            var textureFlare2 = textureLoader.load("images/lensflare/lensflare2.png");
            var textureFlare3 = textureLoader.load("images/lensflare/lensflare3.png");

            var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
            light.color.setHSL( h, s, l );
            light.position.set( x, y, z );

            var flareColor = new THREE.Color( 0xffffff );
            flareColor.setHSL( h, s, l + 0.5 );

            var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
            lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

            lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
            lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

            lensFlare.customUpdateCallback = Light.lensFlareUpdateCallback;
            lensFlare.position.copy( light.position );

            return {lens: lensFlare, light: light};
        },
        lensFlareUpdateCallback: function( object ) {

            var f, fl = object.lensFlares.length;
            var flare;
            var vecX = -object.positionScreen.x * 2;
            var vecY = -object.positionScreen.y * 2;


            for( f = 0; f < fl; f++ ) {

                flare = object.lensFlares[ f ];

                flare.x = object.positionScreen.x + vecX * flare.distance;
                flare.y = object.positionScreen.y + vecY * flare.distance;

                flare.rotation = 0;

            }

            object.lensFlares[ 2 ].y += 0.025;
            object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

        }
    }



    var Plane = {
        width: 1000,
        height: 1000,
        segments_x: 100,
        segments_y: 100,
        map: '',
        color: '',
        object: null,
        material: null,

        getHeightData: function (img, scale) {
            if (scale == undefined) scale = 1;

            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var context = canvas.getContext('2d');

            var size = img.width * img.height;
            var data = new Float32Array(size);

            context.drawImage(img, 0, 0);

            for (var i = 0; i < size; i++) {
                data[i] = 0
            }

            var imgd = context.getImageData(0, 0, img.width, img.height);
            var pix = imgd.data;

            var j = 0;
            for (var i = 0; i < pix.length; i+=4) {
                var all = pix[i] + pix[i+1] + pix[i+2];
                data[j++] = all / (12 * scale);
            }

            return data;
        },

        set: function(img) {
            /*
            // load the heightmap we created as a texture
            var texture = THREE.ImageUtils.loadTexture('images/moon.jpg');

            // load two other textures we'll use to make the map look more real
            var detailTexture = THREE.ImageUtils.loadTexture("images/moon.jpg");

            // the following configuration defines how the terrain is rendered
            var terrainShader = THREE.ShaderTerrain[ "terrain" ];
            var uniformsTerrain = THREE.UniformsUtils.clone(terrainShader.uniforms);

            // how to treat abd scale the normal texture
            uniformsTerrain[ "tNormal" ].texture = detailTexture;
            uniformsTerrain[ "uNormalScale" ].value = 1;

            // the displacement determines the height of a vector, mapped to
            // the heightmap
            uniformsTerrain[ "tDisplacement" ].texture = texture;
            uniformsTerrain[ "uDisplacementScale" ].value = 100;

            // the following textures can be use to finetune how
            // the map is shown. These are good defaults for simple
            // rendering
            uniformsTerrain[ "tDiffuse1" ].texture = detailTexture;
            uniformsTerrain[ "tDetail" ].texture = detailTexture;
            uniformsTerrain[ "enableDiffuse1" ].value = true;
            uniformsTerrain[ "enableDiffuse2" ].value = true;
            uniformsTerrain[ "enableSpecular" ].value = true;

            // diffuse is based on the light reflection
            //uniformsTerrain[ "uDiffuseColor" ].value.setHex(0xcccccc);
            //uniformsTerrain[ "uSpecularColor" ].value.setHex(0xff0000);
            // is the base color of the terrain
            //uniformsTerrain[ "uAmbientColor" ].value.setHex(0x0000cc);

            // how shiny is the terrain
            //uniformsTerrain[ "uShininess" ].value = 3;

            // handles light reflection
            uniformsTerrain[ "uRepeatOverlay" ].value.set(3, 3);

            // configure the material that reflects our terrain
            var material = new THREE.ShaderMaterial({
                uniforms:uniformsTerrain,
                vertexShader:terrainShader.vertexShader,
                fragmentShader:terrainShader.fragmentShader,
                lights:true,
                fog:false
            });

            // we use a plain to render as terrain
            var geometryTerrain = new THREE.PlaneGeometry(Plane.width, Plane.height, Plane.segments_x, Plane.segments_y);
            geometryTerrain.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
            geometryTerrain.computeFaceNormals();
            geometryTerrain.computeVertexNormals();
            geometryTerrain.computeTangents();

            // create a 3D object to add
            this.object = new THREE.Mesh(geometryTerrain, material);
            this.object.position.set(0, 0, 0);
            //terrain.rotation.x = -Math.PI / 2;


            return this.object;







            /*

            var myTexture = new THREE.ImageUtils.loadTexture("images/moon.jpg");
            var shader = THREE.ShaderLib["standard"];
            var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
            uniforms[ "enableDisplacement" ].value = true;
            uniforms[ "enableDiffuse" ].value = true;
            uniforms[ "tDisplacement" ].value = myTexture;
            uniforms[ "tDiffuse" ].value = myTexture;
            uniforms[ "uDisplacementScale" ].value = 50;
            var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, wireframe: false };
            var material = new THREE.ShaderMaterial( parameters );
            // GEOMETRY

            geometry = new THREE.PlaneGeometry(Plane.width, Plane.height, Plane.segments_x, Plane.segments_y);
            geometry.computeTangents();

            //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
            this.object = new THREE.Mesh( geometry, material );
            */

            // load the heightmap we created as a texture
            var texture = THREE.ImageUtils.loadTexture('images/moon.jpg');



            /*
            //METHOD 2
            var geometry = new THREE.PlaneGeometry(Plane.width, Plane.height, Plane.segments_x, Plane.segments_y);
            var length = geometry.vertices.length;

            for (var index = 0; index < length; index++) {
                geometry.vertices[index].z = Math.floor((Math.random() * 10) + 1);
            }

            var material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: texture,
                wireframe: false
            });

            this.object = new THREE.Mesh(geometry, material);
            //terrain.overdraw = true;

            this.object.position.set(0, 0, 0);

            */

            //get height data from img
            var data = Plane.getHeightData(img);

            // plane
            var geometry = new THREE.PlaneGeometry(Plane.width, Plane.height, Plane.segments_x, Plane.segments_y);
            var texture = THREE.ImageUtils.loadTexture('images/map.png');
            var material = new THREE.MeshLambertMaterial( { map: texture, wireframe: false } );
            this.object = new THREE.Mesh(geometry, material);

            //set height of vertices
            for (var i = 0; i < this.object.geometry.vertices.length; i++) {
                this.object.geometry.vertices[i].z = data[i];
            }

            this.object.receiveShadow = true;
            return this.object;
        }
    }
    
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    //renderer.shadowMapEnabled = true;
    document.body.appendChild( renderer.domElement );

    ambientLight = new THREE.AmbientLight( 0xffffff );
    ambientLight.castShadow = true;
    scene.add(ambientLight);


    // Set Light
    /*
    var lights = Light.set();
    for (var i = 0; i < lights.light; i++) {
        scene.add(lights.light[i]);
    }

    for (var i = 0; i < lights.lens; i++) {
        scene.add(lights.lens[i]);
    }
    */

    camera.position.zoom = 0;
    camera.position.y = 100;
    camera.position.z = 300;
    camera.lookAt(scene.position);

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    function render() {
        requestAnimationFrame( render );
        renderer.render( scene, camera );
    }




    var depth = 512;
    var width = 512;
    var spacingX = 3;
    var spacingZ = 3;
    var heightOffset = 2;
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = "images/heightmap.png";
    img.onload = function () {
        // draw on canvas
        ctx.drawImage(img, 0, 0);
        var pixel = ctx.getImageData(0, 0, width, depth);
        var geom = new THREE.Geometry();
        var output = [];
        for (var x = 0; x < depth; x++) {
            for (var z = 0; z < width; z++) {
                // get pixel
                // since we're grayscale, we only need one element
                // each pixel contains four values RGB and opacity
                var yValue = pixel.data
                        [z * 4 + (depth * x * 4)] / heightOffset;
                var vertex = new THREE.Vector3(
                    x * spacingX, yValue, z * spacingZ);
                geom.vertices.push(vertex);
            }
        }

        // we create a rectangle between four vertices, and we do
        // that as two triangles.
        for (var z = 0; z < depth - 1; z++) {
            for (var x = 0; x < width - 1; x++) {
                // we need to point to the position in the array
                // a - - b
                // | x |
                // c - - d
                var a = x + z * width;
                var b = (x + 1) + (z * width);
                var c = x + ((z + 1) * width);
                var d = (x + 1) + ((z + 1) * width);
                var face1 = new THREE.Face3(a, b, d);
                var face2 = new THREE.Face3(d, c, a);
                geom.faces.push(face1);
                geom.faces.push(face2);
            }
        }

        geom.computeVertexNormals(true);
        geom.computeFaceNormals();
        var cubeMaterial = new THREE.MeshLambertMaterial();
        cubeMaterial.map = THREE.ImageUtils.loadTexture('images/moon.png');
        var mesh = new THREE.Mesh(geom, cubeMaterial);

       // mesh.receiveShadow = true;

        scene.add(mesh);

        render();
    }



    /*
    var img = new Image();
    img.src = "images/map.png";
    img.onload = function () {
        // load img source

        scene.add(Plane.set(img));
        //scene.fog = new THREE.FogExp2(0xffffff, this.fog);

        render();
    }
    */

}());