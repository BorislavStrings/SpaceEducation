/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.RenderableObject = function () {

    this.id = 0;

    this.object = null;
    this.z = 0;
    this.renderOrder = 0;

};

//

THREE.RenderableFace = function () {

    this.id = 0;

    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();
    this.v3 = new THREE.RenderableVertex();

    this.normalModel = new THREE.Vector3();

    this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
    this.vertexNormalsLength = 0;

    this.color = new THREE.Color();
    this.material = null;
    this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

    this.z = 0;
    this.renderOrder = 0;

};

//

THREE.RenderableVertex = function () {

    this.position = new THREE.Vector3();
    this.positionWorld = new THREE.Vector3();
    this.positionScreen = new THREE.Vector4();

    this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {

    this.positionWorld.copy( vertex.positionWorld );
    this.positionScreen.copy( vertex.positionScreen );

};

//

THREE.RenderableLine = function () {

    this.id = 0;

    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();

    this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
    this.material = null;

    this.z = 0;
    this.renderOrder = 0;

};

//

THREE.RenderableSprite = function () {

    this.id = 0;

    this.object = null;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.rotation = 0;
    this.scale = new THREE.Vector2();

    this.material = null;
    this.renderOrder = 0;

};

//

THREE.Projector = function () {

    var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
        _vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
        _face, _faceCount, _facePool = [], _facePoolLength = 0,
        _line, _lineCount, _linePool = [], _linePoolLength = 0,
        _sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,

        _renderData = { objects: [], lights: [], elements: [] },

        _vector3 = new THREE.Vector3(),
        _vector4 = new THREE.Vector4(),

        _clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
        _boundingBox = new THREE.Box3(),
        _points3 = new Array( 3 ),
        _points4 = new Array( 4 ),

        _viewMatrix = new THREE.Matrix4(),
        _viewProjectionMatrix = new THREE.Matrix4(),

        _modelMatrix,
        _modelViewProjectionMatrix = new THREE.Matrix4(),

        _normalMatrix = new THREE.Matrix3(),

        _frustum = new THREE.Frustum(),

        _clippedVertex1PositionScreen = new THREE.Vector4(),
        _clippedVertex2PositionScreen = new THREE.Vector4();

    //

    this.projectVector = function ( vector, camera ) {

        console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
        vector.project( camera );

    };

    this.unprojectVector = function ( vector, camera ) {

        console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
        vector.unproject( camera );

    };

    this.pickingRay = function ( vector, camera ) {

        console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

    };

    //

    var RenderList = function () {

        var normals = [];
        var uvs = [];

        var object = null;
        var material = null;

        var normalMatrix = new THREE.Matrix3();

        function setObject( value ) {

            object = value;
            material = object.material;

            normalMatrix.getNormalMatrix( object.matrixWorld );

            normals.length = 0;
            uvs.length = 0;

        }

        function projectVertex( vertex ) {

            var position = vertex.position;
            var positionWorld = vertex.positionWorld;
            var positionScreen = vertex.positionScreen;

            positionWorld.copy( position ).applyMatrix4( _modelMatrix );
            positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

            var invW = 1 / positionScreen.w;

            positionScreen.x *= invW;
            positionScreen.y *= invW;
            positionScreen.z *= invW;

            vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
                positionScreen.y >= - 1 && positionScreen.y <= 1 &&
                positionScreen.z >= - 1 && positionScreen.z <= 1;

        }

        function pushVertex( x, y, z ) {

            _vertex = getNextVertexInPool();
            _vertex.position.set( x, y, z );

            projectVertex( _vertex );

        }

        function pushNormal( x, y, z ) {

            normals.push( x, y, z );

        }

        function pushUv( x, y ) {

            uvs.push( x, y );

        }

        function checkTriangleVisibility( v1, v2, v3 ) {

            if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

            _points3[ 0 ] = v1.positionScreen;
            _points3[ 1 ] = v2.positionScreen;
            _points3[ 2 ] = v3.positionScreen;

            return _clipBox.intersectsBox( _boundingBox.setFromPoints( _points3 ) );

        }

        function checkBackfaceCulling( v1, v2, v3 ) {

            return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
                ( v2.positionScreen.y - v1.positionScreen.y ) -
                ( v3.positionScreen.y - v1.positionScreen.y ) *
                ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

        }

        function pushLine( a, b ) {

            var v1 = _vertexPool[ a ];
            var v2 = _vertexPool[ b ];

            _line = getNextLineInPool();

            _line.id = object.id;
            _line.v1.copy( v1 );
            _line.v2.copy( v2 );
            _line.z = ( v1.positionScreen.z + v2.positionScreen.z ) / 2;
            _line.renderOrder = object.renderOrder;

            _line.material = object.material;

            _renderData.elements.push( _line );

        }

        function pushTriangle( a, b, c ) {

            var v1 = _vertexPool[ a ];
            var v2 = _vertexPool[ b ];
            var v3 = _vertexPool[ c ];

            if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

            if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

                _face = getNextFaceInPool();

                _face.id = object.id;
                _face.v1.copy( v1 );
                _face.v2.copy( v2 );
                _face.v3.copy( v3 );
                _face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
                _face.renderOrder = object.renderOrder;

                // use first vertex normal as face normal

                _face.normalModel.fromArray( normals, a * 3 );
                _face.normalModel.applyMatrix3( normalMatrix ).normalize();

                for ( var i = 0; i < 3; i ++ ) {

                    var normal = _face.vertexNormalsModel[ i ];
                    normal.fromArray( normals, arguments[ i ] * 3 );
                    normal.applyMatrix3( normalMatrix ).normalize();

                    var uv = _face.uvs[ i ];
                    uv.fromArray( uvs, arguments[ i ] * 2 );

                }

                _face.vertexNormalsLength = 3;

                _face.material = object.material;

                _renderData.elements.push( _face );

            }

        }

        return {
            setObject: setObject,
            projectVertex: projectVertex,
            checkTriangleVisibility: checkTriangleVisibility,
            checkBackfaceCulling: checkBackfaceCulling,
            pushVertex: pushVertex,
            pushNormal: pushNormal,
            pushUv: pushUv,
            pushLine: pushLine,
            pushTriangle: pushTriangle
        }

    };

    var renderList = new RenderList();

    this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

        _faceCount = 0;
        _lineCount = 0;
        _spriteCount = 0;

        _renderData.elements.length = 0;

        if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
        if ( camera.parent === null ) camera.updateMatrixWorld();

        _viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
        _viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

        _frustum.setFromMatrix( _viewProjectionMatrix );

        //

        _objectCount = 0;

        _renderData.objects.length = 0;
        _renderData.lights.length = 0;

        scene.traverseVisible( function ( object ) {

            if ( object instanceof THREE.Light ) {

                _renderData.lights.push( object );

            } else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite ) {

                var material = object.material;

                if ( material.visible === false ) return;

                if ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) {

                    _object = getNextObjectInPool();
                    _object.id = object.id;
                    _object.object = object;

                    _vector3.setFromMatrixPosition( object.matrixWorld );
                    _vector3.applyProjection( _viewProjectionMatrix );
                    _object.z = _vector3.z;
                    _object.renderOrder = object.renderOrder;

                    _renderData.objects.push( _object );

                }

            }

        } );

        if ( sortObjects === true ) {

            _renderData.objects.sort( painterSort );

        }

        //

        for ( var o = 0, ol = _renderData.objects.length; o < ol; o ++ ) {

            var object = _renderData.objects[ o ].object;
            var geometry = object.geometry;

            renderList.setObject( object );

            _modelMatrix = object.matrixWorld;

            _vertexCount = 0;

            if ( object instanceof THREE.Mesh ) {

                if ( geometry instanceof THREE.BufferGeometry ) {

                    var attributes = geometry.attributes;
                    var groups = geometry.groups;

                    if ( attributes.position === undefined ) continue;

                    var positions = attributes.position.array;

                    for ( var i = 0, l = positions.length; i < l; i += 3 ) {

                        renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

                    }

                    if ( attributes.normal !== undefined ) {

                        var normals = attributes.normal.array;

                        for ( var i = 0, l = normals.length; i < l; i += 3 ) {

                            renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

                        }

                    }

                    if ( attributes.uv !== undefined ) {

                        var uvs = attributes.uv.array;

                        for ( var i = 0, l = uvs.length; i < l; i += 2 ) {

                            renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

                        }

                    }

                    if ( geometry.index !== null ) {

                        var indices = geometry.index.array;

                        if ( groups.length > 0 ) {

                            for ( var o = 0; o < groups.length; o ++ ) {

                                var group = groups[ o ];

                                for ( var i = group.start, l = group.start + group.count; i < l; i += 3 ) {

                                    renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

                                }

                            }

                        } else {

                            for ( var i = 0, l = indices.length; i < l; i += 3 ) {

                                renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

                            }

                        }

                    } else {

                        for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {

                            renderList.pushTriangle( i, i + 1, i + 2 );

                        }

                    }

                } else if ( geometry instanceof THREE.Geometry ) {

                    var vertices = geometry.vertices;
                    var faces = geometry.faces;
                    var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

                    _normalMatrix.getNormalMatrix( _modelMatrix );

                    var material = object.material;

                    var isFaceMaterial = material instanceof THREE.MultiMaterial;
                    var objectMaterials = isFaceMaterial === true ? object.material : null;

                    for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

                        var vertex = vertices[ v ];

                        _vector3.copy( vertex );

                        if ( material.morphTargets === true ) {

                            var morphTargets = geometry.morphTargets;
                            var morphInfluences = object.morphTargetInfluences;

                            for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

                                var influence = morphInfluences[ t ];

                                if ( influence === 0 ) continue;

                                var target = morphTargets[ t ];
                                var targetVertex = target.vertices[ v ];

                                _vector3.x += ( targetVertex.x - vertex.x ) * influence;
                                _vector3.y += ( targetVertex.y - vertex.y ) * influence;
                                _vector3.z += ( targetVertex.z - vertex.z ) * influence;

                            }

                        }

                        renderList.pushVertex( _vector3.x, _vector3.y, _vector3.z );

                    }

                    for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

                        var face = faces[ f ];

                        material = isFaceMaterial === true
                            ? objectMaterials.materials[ face.materialIndex ]
                            : object.material;

                        if ( material === undefined ) continue;

                        var side = material.side;

                        var v1 = _vertexPool[ face.a ];
                        var v2 = _vertexPool[ face.b ];
                        var v3 = _vertexPool[ face.c ];

                        if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

                        var visible = renderList.checkBackfaceCulling( v1, v2, v3 );

                        if ( side !== THREE.DoubleSide ) {

                            if ( side === THREE.FrontSide && visible === false ) continue;
                            if ( side === THREE.BackSide && visible === true ) continue;

                        }

                        _face = getNextFaceInPool();

                        _face.id = object.id;
                        _face.v1.copy( v1 );
                        _face.v2.copy( v2 );
                        _face.v3.copy( v3 );

                        _face.normalModel.copy( face.normal );

                        if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

                            _face.normalModel.negate();

                        }

                        _face.normalModel.applyMatrix3( _normalMatrix ).normalize();

                        var faceVertexNormals = face.vertexNormals;

                        for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

                            var normalModel = _face.vertexNormalsModel[ n ];
                            normalModel.copy( faceVertexNormals[ n ] );

                            if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

                                normalModel.negate();

                            }

                            normalModel.applyMatrix3( _normalMatrix ).normalize();

                        }

                        _face.vertexNormalsLength = faceVertexNormals.length;

                        var vertexUvs = faceVertexUvs[ f ];

                        if ( vertexUvs !== undefined ) {

                            for ( var u = 0; u < 3; u ++ ) {

                                _face.uvs[ u ].copy( vertexUvs[ u ] );

                            }

                        }

                        _face.color = face.color;
                        _face.material = material;

                        _face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
                        _face.renderOrder = object.renderOrder;

                        _renderData.elements.push( _face );

                    }

                }

            } else if ( object instanceof THREE.Line ) {

                if ( geometry instanceof THREE.BufferGeometry ) {

                    var attributes = geometry.attributes;

                    if ( attributes.position !== undefined ) {

                        var positions = attributes.position.array;

                        for ( var i = 0, l = positions.length; i < l; i += 3 ) {

                            renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

                        }

                        if ( geometry.index !== null ) {

                            var indices = geometry.index.array;

                            for ( var i = 0, l = indices.length; i < l; i += 2 ) {

                                renderList.pushLine( indices[ i ], indices[ i + 1 ] );

                            }

                        } else {

                            var step = object instanceof THREE.LineSegments ? 2 : 1;

                            for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

                                renderList.pushLine( i, i + 1 );

                            }

                        }

                    }

                } else if ( geometry instanceof THREE.Geometry ) {

                    _modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

                    var vertices = object.geometry.vertices;

                    if ( vertices.length === 0 ) continue;

                    v1 = getNextVertexInPool();
                    v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );

                    var step = object instanceof THREE.LineSegments ? 2 : 1;

                    for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {

                        v1 = getNextVertexInPool();
                        v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );

                        if ( ( v + 1 ) % step > 0 ) continue;

                        v2 = _vertexPool[ _vertexCount - 2 ];

                        _clippedVertex1PositionScreen.copy( v1.positionScreen );
                        _clippedVertex2PositionScreen.copy( v2.positionScreen );

                        if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {

                            // Perform the perspective divide
                            _clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
                            _clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

                            _line = getNextLineInPool();

                            _line.id = object.id;
                            _line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
                            _line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

                            _line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );
                            _line.renderOrder = object.renderOrder;

                            _line.material = object.material;

                            if ( object.material.vertexColors === THREE.VertexColors ) {

                                _line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
                                _line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

                            }

                            _renderData.elements.push( _line );

                        }

                    }

                }

            } else if ( object instanceof THREE.Sprite ) {

                _vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
                _vector4.applyMatrix4( _viewProjectionMatrix );

                var invW = 1 / _vector4.w;

                _vector4.z *= invW;

                if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

                    _sprite = getNextSpriteInPool();
                    _sprite.id = object.id;
                    _sprite.x = _vector4.x * invW;
                    _sprite.y = _vector4.y * invW;
                    _sprite.z = _vector4.z;
                    _sprite.renderOrder = object.renderOrder;
                    _sprite.object = object;

                    _sprite.rotation = object.rotation;

                    _sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
                    _sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

                    _sprite.material = object.material;

                    _renderData.elements.push( _sprite );

                }

            }

        }

        if ( sortElements === true ) {

            _renderData.elements.sort( painterSort );

        }

        return _renderData;

    };

    // Pools

    function getNextObjectInPool() {

        if ( _objectCount === _objectPoolLength ) {

            var object = new THREE.RenderableObject();
            _objectPool.push( object );
            _objectPoolLength ++;
            _objectCount ++;
            return object;

        }

        return _objectPool[ _objectCount ++ ];

    }

    function getNextVertexInPool() {

        if ( _vertexCount === _vertexPoolLength ) {

            var vertex = new THREE.RenderableVertex();
            _vertexPool.push( vertex );
            _vertexPoolLength ++;
            _vertexCount ++;
            return vertex;

        }

        return _vertexPool[ _vertexCount ++ ];

    }

    function getNextFaceInPool() {

        if ( _faceCount === _facePoolLength ) {

            var face = new THREE.RenderableFace();
            _facePool.push( face );
            _facePoolLength ++;
            _faceCount ++;
            return face;

        }

        return _facePool[ _faceCount ++ ];


    }

    function getNextLineInPool() {

        if ( _lineCount === _linePoolLength ) {

            var line = new THREE.RenderableLine();
            _linePool.push( line );
            _linePoolLength ++;
            _lineCount ++;
            return line;

        }

        return _linePool[ _lineCount ++ ];

    }

    function getNextSpriteInPool() {

        if ( _spriteCount === _spritePoolLength ) {

            var sprite = new THREE.RenderableSprite();
            _spritePool.push( sprite );
            _spritePoolLength ++;
            _spriteCount ++;
            return sprite;

        }

        return _spritePool[ _spriteCount ++ ];

    }

    //

    function painterSort( a, b ) {

        if ( a.renderOrder !== b.renderOrder ) {

            return a.renderOrder - b.renderOrder;

        } else if ( a.z !== b.z ) {

            return b.z - a.z;

        } else if ( a.id !== b.id ) {

            return a.id - b.id;

        } else {

            return 0;

        }

    }

    function clipLine( s1, s2 ) {

        var alpha1 = 0, alpha2 = 1,

        // Calculate the boundary coordinate of each vertex for the near and far clip planes,
        // Z = -1 and Z = +1, respectively.
            bc1near =  s1.z + s1.w,
            bc2near =  s2.z + s2.w,
            bc1far =  - s1.z + s1.w,
            bc2far =  - s2.z + s2.w;

        if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

            // Both vertices lie entirely within all clip planes.
            return true;

        } else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

            // Both vertices lie entirely outside one of the clip planes.
            return false;

        } else {

            // The line segment spans at least one clip plane.

            if ( bc1near < 0 ) {

                // v1 lies outside the near plane, v2 inside
                alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

            } else if ( bc2near < 0 ) {

                // v2 lies outside the near plane, v1 inside
                alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

            }

            if ( bc1far < 0 ) {

                // v1 lies outside the far plane, v2 inside
                alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

            } else if ( bc2far < 0 ) {

                // v2 lies outside the far plane, v2 inside
                alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

            }

            if ( alpha2 < alpha1 ) {

                // The line segment spans two boundaries, but is outside both of them.
                // (This can't happen when we're only clipping against just near/far but good
                //  to leave the check here for future usage if other clip planes are added.)
                return false;

            } else {

                // Update the s1 and s2 vertices to match the clipped line segment.
                s1.lerp( s2, alpha1 );
                s2.lerp( s1, 1 - alpha2 );

                return true;

            }

        }

    }

};


/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



THREE.BokehShader = {

    uniforms: {

        "textureWidth":  { type: "f", value: 1.0 },
        "textureHeight":  { type: "f", value: 1.0 },

        "focalDepth":   { type: "f", value: 1.0 },
        "focalLength":   { type: "f", value: 24.0 },
        "fstop": { type: "f", value: 0.9 },

        "tColor":   { type: "t", value: null },
        "tDepth":   { type: "t", value: null },

        "maxblur":  { type: "f", value: 1.0 },

        "showFocus":   { type: "i", value: 0 },
        "manualdof":   { type: "i", value: 0 },
        "vignetting":   { type: "i", value: 0 },
        "depthblur":   { type: "i", value: 0 },

        "threshold":  { type: "f", value: 0.5 },
        "gain":  { type: "f", value: 2.0 },
        "bias":  { type: "f", value: 0.5 },
        "fringe":  { type: "f", value: 0.7 },

        "znear":  { type: "f", value: 0.1 },
        "zfar":  { type: "f", value: 100 },

        "noise":  { type: "i", value: 1 },
        "dithering":  { type: "f", value: 0.0001 },
        "pentagon": { type: "i", value: 0 },

        "shaderFocus":  { type: "i", value: 1 },
        "focusCoords":  { type: "v2", value: new THREE.Vector2() },


    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "#include <common>",

        "varying vec2 vUv;",

        "uniform sampler2D tColor;",
        "uniform sampler2D tDepth;",
        "uniform float textureWidth;",
        "uniform float textureHeight;",

        "uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below",
        "uniform float focalLength; //focal length in mm",
        "uniform float fstop; //f-stop value",
        "uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",

        "/*",
        "make sure that these two values are the same for your camera, otherwise distances will be wrong.",
        "*/",

        "uniform float znear; // camera clipping start",
        "uniform float zfar; // camera clipping end",

        "//------------------------------------------",
        "//user variables",

        "const int samples = SAMPLES; //samples on the first ring",
        "const int rings = RINGS; //ring count",

        "const int maxringsamples = rings * samples;",

        "uniform bool manualdof; // manual dof calculation",
        "float ndofstart = 1.0; // near dof blur start",
        "float ndofdist = 2.0; // near dof blur falloff distance",
        "float fdofstart = 1.0; // far dof blur start",
        "float fdofdist = 3.0; // far dof blur falloff distance",

        "float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)",

        "uniform bool vignetting; // use optical lens vignetting",

        "float vignout = 1.3; // vignetting outer border",
        "float vignin = 0.0; // vignetting inner border",
        "float vignfade = 22.0; // f-stops till vignete fades",

        "uniform bool shaderFocus;",
        "// disable if you use external focalDepth value",

        "uniform vec2 focusCoords;",
        "// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)",
        "// if center of screen use vec2(0.5, 0.5);",

        "uniform float maxblur;",
        "//clamp value of max blur (0.0 = no blur, 1.0 default)",

        "uniform float threshold; // highlight threshold;",
        "uniform float gain; // highlight gain;",

        "uniform float bias; // bokeh edge bias",
        "uniform float fringe; // bokeh chromatic aberration / fringing",

        "uniform bool noise; //use noise instead of pattern for sample dithering",

        "uniform float dithering;",

        "uniform bool depthblur; // blur the depth buffer",
        "float dbsize = 1.25; // depth blur size",

        "/*",
        "next part is experimental",
        "not looking good with small sample and ring count",
        "looks okay starting from samples = 4, rings = 4",
        "*/",

        "uniform bool pentagon; //use pentagon as bokeh shape?",
        "float feather = 0.4; //pentagon shape feather",

        "//------------------------------------------",

        "float penta(vec2 coords) {",
        "//pentagonal shape",
        "float scale = float(rings) - 1.3;",
        "vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
        "vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
        "vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
        "vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
        "vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
        "vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

        "vec4  one = vec4( 1.0 );",

        "vec4 P = vec4((coords),vec2(scale, scale));",

        "vec4 dist = vec4(0.0);",
        "float inorout = -4.0;",

        "dist.x = dot( P, HS0 );",
        "dist.y = dot( P, HS1 );",
        "dist.z = dot( P, HS2 );",
        "dist.w = dot( P, HS3 );",

        "dist = smoothstep( -feather, feather, dist );",

        "inorout += dot( dist, one );",

        "dist.x = dot( P, HS4 );",
        "dist.y = HS5.w - abs( P.z );",

        "dist = smoothstep( -feather, feather, dist );",
        "inorout += dist.x;",

        "return clamp( inorout, 0.0, 1.0 );",
        "}",

        "float bdepth(vec2 coords) {",
        "// Depth buffer blur",
        "float d = 0.0;",
        "float kernel[9];",
        "vec2 offset[9];",

        "vec2 wh = vec2(1.0/textureWidth,1.0/textureHeight) * dbsize;",

        "offset[0] = vec2(-wh.x,-wh.y);",
        "offset[1] = vec2( 0.0, -wh.y);",
        "offset[2] = vec2( wh.x -wh.y);",

        "offset[3] = vec2(-wh.x,  0.0);",
        "offset[4] = vec2( 0.0,   0.0);",
        "offset[5] = vec2( wh.x,  0.0);",

        "offset[6] = vec2(-wh.x, wh.y);",
        "offset[7] = vec2( 0.0,  wh.y);",
        "offset[8] = vec2( wh.x, wh.y);",

        "kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
        "kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
        "kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",


        "for( int i=0; i<9; i++ ) {",
        "float tmp = texture2D(tDepth, coords + offset[i]).r;",
        "d += tmp * kernel[i];",
        "}",

        "return d;",
        "}",


        "vec3 color(vec2 coords,float blur) {",
        "//processing the sample",

        "vec3 col = vec3(0.0);",
        "vec2 texel = vec2(1.0/textureWidth,1.0/textureHeight);",

        "col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
        "col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
        "col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",

        "vec3 lumcoeff = vec3(0.299,0.587,0.114);",
        "float lum = dot(col.rgb, lumcoeff);",
        "float thresh = max((lum-threshold)*gain, 0.0);",
        "return col+mix(vec3(0.0),col,thresh*blur);",
        "}",

        "vec3 debugFocus(vec3 col, float blur, float depth) {",
        "float edge = 0.002*depth; //distance based edge smoothing",
        "float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);",
        "float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);",

        "col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);",
        "col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);",

        "return col;",
        "}",

        "float linearize(float depth) {",
        "return -zfar * znear / (depth * (zfar - znear) - zfar);",
        "}",


        "float vignette() {",
        "float dist = distance(vUv.xy, vec2(0.5,0.5));",
        "dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);",
        "return clamp(dist,0.0,1.0);",
        "}",

        "float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
        "float rings2 = float(rings);",
        "float step = PI*2.0 / float(ringsamples);",
        "float pw = cos(j*step)*i;",
        "float ph = sin(j*step)*i;",
        "float p = 1.0;",
        "if (pentagon) {",
        "p = penta(vec2(pw,ph));",
        "}",
        "col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
        "return 1.0 * mix(1.0, i /rings2, bias) * p;",
        "}",

        "void main() {",
        "//scene depth calculation",

        "float depth = linearize(texture2D(tDepth,vUv.xy).x);",

        "// Blur depth?",
        "if (depthblur) {",
        "depth = linearize(bdepth(vUv.xy));",
        "}",

        "//focal plane calculation",

        "float fDepth = focalDepth;",

        "if (shaderFocus) {",

        "fDepth = linearize(texture2D(tDepth,focusCoords).x);",

        "}",

        "// dof blur factor calculation",

        "float blur = 0.0;",

        "if (manualdof) {",
        "float a = depth-fDepth; // Focal plane",
        "float b = (a-fdofstart)/fdofdist; // Far DoF",
        "float c = (-a-ndofstart)/ndofdist; // Near Dof",
        "blur = (a>0.0) ? b : c;",
        "} else {",
        "float f = focalLength; // focal length in mm",
        "float d = fDepth*1000.0; // focal plane in mm",
        "float o = depth*1000.0; // depth in mm",

        "float a = (o*f)/(o-f);",
        "float b = (d*f)/(d-f);",
        "float c = (d-f)/(d*fstop*CoC);",

        "blur = abs(a-b)*c;",
        "}",

        "blur = clamp(blur,0.0,1.0);",

        "// calculation of pattern for dithering",

        "vec2 noise = vec2(rand(vUv.xy), rand( vUv.xy + vec2( 0.4, 0.6 ) ) )*dithering*blur;",

        "// getting blur x and y step factor",

        "float w = (1.0/textureWidth)*blur*maxblur+noise.x;",
        "float h = (1.0/textureHeight)*blur*maxblur+noise.y;",

        "// calculation of final color",

        "vec3 col = vec3(0.0);",

        "if(blur < 0.05) {",
        "//some optimization thingy",
        "col = texture2D(tColor, vUv.xy).rgb;",
        "} else {",
        "col = texture2D(tColor, vUv.xy).rgb;",
        "float s = 1.0;",
        "int ringsamples;",

        "for (int i = 1; i <= rings; i++) {",
        "/*unboxstart*/",
        "ringsamples = i * samples;",

        "for (int j = 0 ; j < maxringsamples ; j++) {",
        "if (j >= ringsamples) break;",
        "s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
        "}",
        "/*unboxend*/",
        "}",

        "col /= s; //divide by sample count",
        "}",

        "if (showFocus) {",
        "col = debugFocus(col, blur, depth);",
        "}",

        "if (vignetting) {",
        "col *= vignette();",
        "}",

        "gl_FragColor.rgb = col;",
        "gl_FragColor.a = 1.0;",
        "} "

    ].join( "\n" )

};


/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author kaypiKun
 */

THREE.CinematicCamera = function( fov, aspect, near, far ) {

    THREE.PerspectiveCamera.call( this, fov, aspect, near, far );

    this.type = "CinematicCamera";

    this.postprocessing = { enabled	: true };
    this.shaderSettings = {
        rings: 3,
        samples: 4
    };

    this.material_depth = new THREE.MeshDepthMaterial();

    // In case of cinematicCamera, having a default lens set is important
    this.setLens();

    this.initPostProcessing();

};

THREE.CinematicCamera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
THREE.CinematicCamera.prototype.constructor = THREE.CinematicCamera;


// providing fnumber and coc(Circle of Confusion) as extra arguments
THREE.CinematicCamera.prototype.setLens = function ( focalLength, filmGauge, fNumber, coc ) {

    // In case of cinematicCamera, having a default lens set is important
    if ( focalLength === undefined ) focalLength = 35;
    if ( filmGauge !== undefined ) this.filmGauge = filmGauge;

    this.setFocalLength( focalLength );

    // if fnumber and coc are not provided, cinematicCamera tries to act as a basic PerspectiveCamera
    if ( fNumber === undefined ) fNumber = 8;
    if ( coc === undefined ) coc = 0.019;

    this.fNumber = fNumber;
    this.coc = coc;

    // fNumber is focalLength by aperture
    this.aperture = focalLength / this.fNumber;

    // hyperFocal is required to calculate depthOfField when a lens tries to focus at a distance with given fNumber and focalLength
    this.hyperFocal = ( focalLength * focalLength ) / ( this.aperture * this.coc );

};

THREE.CinematicCamera.prototype.linearize = function ( depth ) {

    var zfar = this.far;
    var znear = this.near;
    return - zfar * znear / ( depth * ( zfar - znear ) - zfar );

};

THREE.CinematicCamera.prototype.smoothstep = function ( near, far, depth ) {

    var x = this.saturate( ( depth - near ) / ( far - near ) );
    return x * x * ( 3 - 2 * x );

};

THREE.CinematicCamera.prototype.saturate = function ( x ) {

    return Math.max( 0, Math.min( 1, x ) );

};

// function for focusing at a distance from the camera
THREE.CinematicCamera.prototype.focusAt = function ( focusDistance ) {

    if ( focusDistance === undefined ) focusDistance = 20;

    var focalLength = this.getFocalLength();

    // distance from the camera (normal to frustrum) to focus on
    this.focus = focusDistance;

    // the nearest point from the camera which is in focus (unused)
    this.nearPoint = ( this.hyperFocal * this.focus ) / ( this.hyperFocal + ( this.focus - focalLength ) );

    // the farthest point from the camera which is in focus (unused)
    this.farPoint = ( this.hyperFocal * this.focus ) / ( this.hyperFocal - ( this.focus - focalLength ) );

    // the gap or width of the space in which is everything is in focus (unused)
    this.depthOfField = this.farPoint - this.nearPoint;

    // Considering minimum distance of focus for a standard lens (unused)
    if ( this.depthOfField < 0 ) this.depthOfField = 0;

    this.sdistance = this.smoothstep( this.near, this.far, this.focus );

    this.ldistance = this.linearize( 1 -	this.sdistance );

    this.postprocessing.bokeh_uniforms[ 'focalDepth' ].value = this.ldistance;

};

THREE.CinematicCamera.prototype.initPostProcessing = function () {

    if ( this.postprocessing.enabled ) {

        this.postprocessing.scene = new THREE.Scene();

        this.postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,	window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000 );

        this.postprocessing.scene.add( this.postprocessing.camera );

        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        this.postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
        this.postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

        var bokeh_shader = THREE.BokehShader;

        this.postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );

        this.postprocessing.bokeh_uniforms[ "tColor" ].value = this.postprocessing.rtTextureColor;
        this.postprocessing.bokeh_uniforms[ "tDepth" ].value = this.postprocessing.rtTextureDepth;

        this.postprocessing.bokeh_uniforms[ "manualdof" ].value = 0;
        this.postprocessing.bokeh_uniforms[ "shaderFocus" ].value = 0;

        this.postprocessing.bokeh_uniforms[ "fstop" ].value = 2.8;

        this.postprocessing.bokeh_uniforms[ "showFocus" ].value = 1;

        this.postprocessing.bokeh_uniforms[ "focalDepth" ].value = 0.1;

        console.log( this.postprocessing.bokeh_uniforms[ "focalDepth" ].value );

        this.postprocessing.bokeh_uniforms[ "znear" ].value = this.near;
        this.postprocessing.bokeh_uniforms[ "zfar" ].value = this.near;


        this.postprocessing.bokeh_uniforms[ "textureWidth" ].value = window.innerWidth;

        this.postprocessing.bokeh_uniforms[ "textureHeight" ].value = window.innerHeight;

        this.postprocessing.materialBokeh = new THREE.ShaderMaterial( {
            uniforms: this.postprocessing.bokeh_uniforms,
            vertexShader: bokeh_shader.vertexShader,
            fragmentShader: bokeh_shader.fragmentShader,
            defines: {
                RINGS: this.shaderSettings.rings,
                SAMPLES: this.shaderSettings.samples
            }
        } );

        this.postprocessing.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ), this.postprocessing.materialBokeh );
        this.postprocessing.quad.position.z = - 500;
        this.postprocessing.scene.add( this.postprocessing.quad );

    }

};

THREE.CinematicCamera.prototype.renderCinematic = function ( scene, renderer, camera ) {

    if ( this.postprocessing.enabled ) {

        renderer.clear();

        // Render scene into texture

        scene.overrideMaterial = null;
        renderer.render( scene, camera, this.postprocessing.rtTextureColor, true );

        // Render depth into texture

        scene.overrideMaterial = this.material_depth;
        renderer.render( scene, camera, this.postprocessing.rtTextureDepth, true );

        // Render bokeh composite

        renderer.render( this.postprocessing.scene, this.postprocessing.camera );

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

    this.renderer = renderer;

    if ( renderTarget === undefined ) {

        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        var size = renderer.getSize();
        renderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];

    if ( THREE.CopyShader === undefined )
        console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

    this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

    swapBuffers: function() {

        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;

    },

    addPass: function ( pass ) {

        this.passes.push( pass );

    },

    insertPass: function ( pass, index ) {

        this.passes.splice( index, 0, pass );

    },

    render: function ( delta ) {

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        var maskActive = false;

        var pass, i, il = this.passes.length;

        for ( i = 0; i < il; i ++ ) {

            pass = this.passes[ i ];

            if ( ! pass.enabled ) continue;

            pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

            if ( pass.needsSwap ) {

                if ( maskActive ) {

                    var context = this.renderer.context;

                    context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

                    this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

                    context.stencilFunc( context.EQUAL, 1, 0xffffffff );

                }

                this.swapBuffers();

            }

            if ( pass instanceof THREE.MaskPass ) {

                maskActive = true;

            } else if ( pass instanceof THREE.ClearMaskPass ) {

                maskActive = false;

            }

        }

    },

    reset: function ( renderTarget ) {

        if ( renderTarget === undefined ) {

            var size = this.renderer.getSize();

            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize( size.width, size.height );

        }

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    },

    setSize: function ( width, height ) {

        this.renderTarget1.setSize( width, height );
        this.renderTarget2.setSize( width, height );

    }

};


THREE.Pass = function () {

    // if set to true, the pass is processed by the composer
    this.enabled = true;

    // if set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;

    // if set to true, the pass clears its buffer before rendering
    this.clear = false;

    // if set to true, the result of the pass is rendered to screen
    this.renderToScreen = false;

};

THREE.Pass.prototype = {

    constructor: THREE.Pass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        console.error( "THREE.Pass: .render() must be implemented in derived pass." );

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

    THREE.Pass.call( this );

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.clear = true;
    this.needsSwap = false;

};

THREE.RenderPass.prototype = Object.create( THREE.Pass.prototype );

THREE.RenderPass.prototype = {

    constructor: THREE.RenderPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        this.scene.overrideMaterial = this.overrideMaterial;

        if ( this.clearColor ) {

            this.oldClearColor.copy( renderer.getClearColor() );
            this.oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor( this.clearColor, this.clearAlpha );

        }

        renderer.render( this.scene, this.camera, readBuffer, this.clear );

        if ( this.clearColor ) {

            renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

        }

        this.scene.overrideMaterial = null;

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function( shader, textureID ) {

    THREE.Pass.call( this );

    this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

    if ( shader instanceof THREE.ShaderMaterial ) {

        this.uniforms = shader.uniforms;

        this.material = shader;

    }
    else if ( shader ) {

        this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        this.material = new THREE.ShaderMaterial( {

            defines: shader.defines || {},
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        } );

    }

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = Object.create( THREE.Pass.prototype );

THREE.ShaderPass.prototype = {

    constructor: THREE.ShaderPass,

    render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        if ( this.uniforms[ this.textureID ] ) {

            this.uniforms[ this.textureID ].value = readBuffer;

        }

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        }

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function ( texture, opacity ) {

    THREE.Pass.call( this );

    if ( THREE.CopyShader === undefined )
        console.error( "THREE.TexturePass relies on THREE.CopyShader" );

    var shader = THREE.CopyShader;

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
    this.uniforms[ "tDiffuse" ].value = texture;

    this.material = new THREE.ShaderMaterial( {

        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

    } );

    this.needsSwap = false;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.TexturePass.prototype = Object.create( THREE.Pass.prototype );

THREE.TexturePass.prototype = {

    constructor: THREE.TexturePass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        this.quad.material = this.material;

        renderer.render( this.scene, this.camera, readBuffer, this.clear );

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

    uniforms: {

        "tDiffuse":   { type: "t", value: null },
        "time":       { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.5 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount":     { type: "f", value: 4096 },
        "grayscale":  { type: "i", value: 1 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "#include <common>",

        // control parameter
        "uniform float time;",

        "uniform bool grayscale;",

        // noise effect intensity value (0 = no effect, 1 = full effect)
        "uniform float nIntensity;",

        // scanlines effect intensity value (0 = no effect, 1 = full effect)
        "uniform float sIntensity;",

        // scanlines effect count value (0 = no effect, 4096 = full effect)
        "uniform float sCount;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        // sample the source
        "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

        // make some noise
        "float dx = rand( vUv + time );",

        // add noise
        "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

        // get us a sine and cosine
        "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

        // add scanlines
        "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

        // interpolate between source and result by intensity
        "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

        // convert to grayscale if desired
        "if( grayscale ) {",

        "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

        "}",

        "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

        "}"

    ].join( "\n" )

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

    THREE.Pass.call( this );

    this.scene = scene;
    this.camera = camera;

    this.clear = true;
    this.needsSwap = false;

    this.inverse = false;

};

THREE.MaskPass.prototype = Object.create( THREE.Pass.prototype );

THREE.MaskPass.prototype = {

    constructor: THREE.MaskPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        var context = renderer.context;

        // don't update color or depth

        context.colorMask( false, false, false, false );
        context.depthMask( false );

        // set up stencil

        var writeValue, clearValue;

        if ( this.inverse ) {

            writeValue = 0;
            clearValue = 1;

        } else {

            writeValue = 1;
            clearValue = 0;

        }

        context.enable( context.STENCIL_TEST );
        context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
        context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
        context.clearStencil( clearValue );

        // draw into the stencil buffer

        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        // re-enable update of color and depth

        context.colorMask( true, true, true, true );
        context.depthMask( true );

        // only render where stencil is set to 1

        context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
        context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

    }

};


THREE.ClearMaskPass = function () {

    THREE.Pass.call( this );

    this.needsSwap = false;

};

THREE.ClearMaskPass.prototype = Object.create( THREE.Pass.prototype );

THREE.ClearMaskPass.prototype = {

    constructor: THREE.ClearMaskPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        var context = renderer.context;

        context.disable( context.STENCIL_TEST );

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FilmPass = function ( noiseIntensity, scanlinesIntensity, scanlinesCount, grayscale ) {

    THREE.Pass.call( this );

    if ( THREE.FilmShader === undefined )
        console.error( "THREE.FilmPass relies on THREE.FilmShader" );

    var shader = THREE.FilmShader;

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.material = new THREE.ShaderMaterial( {

        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

    } );

    if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
    if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
    if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
    if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.FilmPass.prototype = Object.create( THREE.Pass.prototype );

THREE.FilmPass.prototype = {

    constructor: THREE.FilmPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        this.uniforms[ "tDiffuse" ].value = readBuffer;
        this.uniforms[ "time" ].value += delta;

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        }

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse":        { type: "t", value: null },
        "uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
        "cKernel":         { type: "fv1", value: [] }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

        "vec2 imageCoord = vUv;",
        "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

        "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

        "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
        "imageCoord += uImageIncrement;",

        "}",

        "gl_FragColor = sum;",

        "}"


    ].join( "\n" ),

    buildKernel: function ( sigma ) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss( x, sigma ) {

            return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

        if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
        halfWidth = ( kernelSize - 1 ) * 0.5;

        values = new Array( kernelSize );
        sum = 0.0;
        for ( i = 0; i < kernelSize; ++ i ) {

            values[ i ] = gauss( i - halfWidth, sigma );
            sum += values[ i ];

        }

        // normalize the kernel

        for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

        return values;

    }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

    THREE.Pass.call( this );

    strength = ( strength !== undefined ) ? strength : 1;
    kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
    sigma = ( sigma !== undefined ) ? sigma : 4.0;
    resolution = ( resolution !== undefined ) ? resolution : 256;

    // render targets

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

    this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
    this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

    // copy material

    if ( THREE.CopyShader === undefined )
        console.error( "THREE.BloomPass relies on THREE.CopyShader" );

    var copyShader = THREE.CopyShader;

    this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

    this.copyUniforms[ "opacity" ].value = strength;

    this.materialCopy = new THREE.ShaderMaterial( {

        uniforms: this.copyUniforms,
        vertexShader: copyShader.vertexShader,
        fragmentShader: copyShader.fragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true

    } );

    // convolution material

    if ( THREE.ConvolutionShader === undefined )
        console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

    var convolutionShader = THREE.ConvolutionShader;

    this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

    this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;
    this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

    this.materialConvolution = new THREE.ShaderMaterial( {

        uniforms: this.convolutionUniforms,
        vertexShader:  convolutionShader.vertexShader,
        fragmentShader: convolutionShader.fragmentShader,
        defines: {
            "KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
            "KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
        }

    } );

    this.needsSwap = false;

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.BloomPass.prototype = Object.create( THREE.Pass.prototype );

THREE.BloomPass.prototype = {

    constructor: THREE.BloomPass,

    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

        if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

        // Render quad with blured scene into texture (convolution pass 1)

        this.quad.material = this.materialConvolution;

        this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
        this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

        renderer.render( this.scene, this.camera, this.renderTargetX, true );


        // Render quad with blured scene into texture (convolution pass 2)

        this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
        this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

        renderer.render( this.scene, this.camera, this.renderTargetY, true );

        // Render original scene with superimposed blur to texture

        this.quad.material = this.materialCopy;

        this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

        if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

        renderer.render( this.scene, this.camera, readBuffer, this.clear );

    }

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "opacity":  { type: "f", value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "gl_FragColor = opacity * texel;",

        "}"

    ].join("\n")

};


/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "h":        { type: "f", value: 1.0 / 512.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float h;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 sum = vec4( 0.0 );",

        "sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

        "gl_FragColor = sum;",

        "}"

    ].join("\n")

};


/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "v":        { type: "f", value: 1.0 / 512.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float v;",

        "varying vec2 vUv;",

        "void main() {",

        "vec4 sum = vec4( 0.0 );",

        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
        "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

        "gl_FragColor = sum;",

        "}"

    ].join("\n")

};


/**
 * @author Jacek Jankowski / http://grey-eminence.org/
 */

// It is an adaptation of the three.js OrbitControls class to map environments

THREE.MapControls = function ( object, renderFunction, domElement, terrain, orientation_box, BounderyIntersection) {

    this.object = object;
    var camera = object;
    this.orientation_box = orientation_box;
    var mesh = terrain;
    this.mesh = terrain;
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.render = renderFunction;
    this.enabled = true;
    this.target = new THREE.Vector3();
    //this.zoomSpeed = 1;
    this.zoomSpeed = 20;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.rotateSpeed = 0.3;

    // How far you can orbit vertically, upper and lower limits.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI / 2; // radians

    // internals
    var scope = this;
    var EPS = 0.000001;
    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();
    var panStart = new THREE.Vector3();
    var panDelta = new THREE.Vector3();
    var phiDelta = 0;
    var thetaDelta = 0;
    var maxCenterDistance = 4500;

    var maxCenterDistanceA = 2100;
    var maxCenterDistanceB = 2800;

    var lastPosition = this.object.position.clone();
    var startPosition = BounderyIntersection.startPosition;
    /*
     startPosition.copy(lastPosition);
     startPosition.x = 200;
     startPosition.y = -1600;
     */
    var defaultZoomPosition = startPosition.z;
    var maxZoomPosition = 0;//startPosition.z + 600;
    var minZoomPosition = 0;//startPosition.z - 600;
    var startOrientation = this.object.rotation.clone();
    var lastOrientation = this.object.rotation.clone();
    var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2 };
    var state = STATE.NONE;
    var vector, projector, raycaster, intersects;
    var last_good_position = null;
    var that = this;

    this.update = function () {
        if ( lastPosition.distanceTo( this.object.position ) > 0 ) {
            //this.render();
            lastPosition.copy( this.object.position );

        }
    };

    this.computeCameraOrientation = function(newPosition, orientation) {
        if (
            newPosition && typeof newPosition.x !== 'undefined' && typeof newPosition.y !== 'undefined'
        ) {
            var x = newPosition.x - startPosition.x,
                y = newPosition.y - startPosition.y;

            var distance = Math.sqrt(x * x + y * y);
            var forward = 1;
            if (newPosition.y < startPosition.y) {
                forward = -1;
            }

            //orientation.x += dif_x;

            //forward orientation
            if (forward > 0) {
                //
                orientation.x = startOrientation.x - ((newPosition.y * 0.4) / 2500);
                //orientation.x = (orientation.x - 0.003);
                //orientation.y -= 2;
                //orientation.z += 2;
            } else {
                orientation.x = startOrientation.x + ((newPosition.y * 0.4) / 2500);
                //orientation.x = (orientation.x + 0.003);
                //orientation.y += 2;
                //orientation.z -= 2;
            }

            if (orientation.x < 0) {
                oreintation.x *= -1;
            }

            lastOrientation = orientation.clone();

            //console.log(orientation)
            return orientation;
        }

        return false;
    }

    this.computeCenterDistance = function(newPosition) {
        var limit = false;
        if (
            newPosition && typeof newPosition.x !== 'undefined' && typeof newPosition.y !== 'undefined'
        ) {
            var x = newPosition.x - startPosition.x,
                y = newPosition.y - startPosition.y,
                temp_start_position = {x: 0, y: 0};

            var distance = ((x * x) / (maxCenterDistanceA * maxCenterDistanceA)) + ((y * y) / (maxCenterDistanceB * maxCenterDistanceB));
            //var distance = Math.sqrt(x * x + y * y);
            //console.log(distance);
            //if (distance > maxCenterDistance) {
            if (distance > 1) {

                // line equation(slope for point (0,0))
                var slope = y / x;

                var new_x1 = Math.sqrt(
                    (Math.pow(maxCenterDistanceA, 2) * Math.pow(maxCenterDistanceB, 2)) /
                    (Math.pow(maxCenterDistanceB, 2) + Math.pow(maxCenterDistanceA, 2) * Math.pow(slope, 2))
                );

                var new_x2 = -1 * new_x1;

                var new_y1 = slope * new_x1;
                var new_y2 = slope * new_x2;

                // get closest point to last position
                var option1 = Math.sqrt(
                    (new_x1 - lastPosition.x) * (new_x1 - lastPosition.x) +
                    (new_y1 - lastPosition.y) * (new_y1 - lastPosition.y)
                )

                var option2 = Math.sqrt(
                    (new_x2 - lastPosition.x) * (new_x2 - lastPosition.x) +
                    (new_y2 - lastPosition.y) * (new_y2 - lastPosition.y)
                )

                if (option1 < option2) {
                    newPosition.x = new_x1 + startPosition.x;
                    newPosition.y = new_y1 + startPosition.y;
                } else {
                    newPosition.x = new_x2 + startPosition.x;
                    newPosition.y = new_y2 + startPosition.y;
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

    function onTouchStart( event ) {

        if ( scope.enabled === false ) { return; }
        event.preventDefault();

        state = STATE.PAN;

        var mouseX = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        var mouseY = -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

        vector = new THREE.Vector3( mouseX, mouseY, camera.near );
        //projector = new THREE.Projector();
        //projector.unprojectVector( vector, camera );
        vector.unproject(camera);

        raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        intersects = raycaster.intersectObject( mesh );

        if ( intersects.length > 0 ) {

            panStart = intersects[ 0 ].point;

        }

        scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
        scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
    }



    function onMouseDown( event ) {

        if ( scope.enabled === false ) { return; }
        event.preventDefault();

        if ( event.button === 0 ) {

            state = STATE.PAN;

            var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
            var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

            vector = new THREE.Vector3( mouseX, mouseY, camera.near );
            //projector = new THREE.Projector();
            //projector.unprojectVector( vector, camera );
            vector.unproject(camera);

            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            intersects = raycaster.intersectObject( mesh );

            if ( intersects.length > 0 ) {

                panStart = intersects[ 0 ].point;

            }

        } else if ( event.button === 2 ) {
            return false;
            state = STATE.ROTATE;

            vector = new THREE.Vector3( 0, 0, camera.near );

            //projector = new THREE.Projector();
            //projector.unprojectVector( vector, camera );
            vector.unproject(camera);

            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            intersects = raycaster.intersectObject( mesh );

            if ( intersects.length > 0 ) {
                scope.target = intersects[ 0 ].point;
            }

            rotateStart.set( event.clientX, event.clientY );

        }

        scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
        scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

    }

    function onTouchMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( state === STATE.PAN ) {

            var mouseX = (  event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
            var mouseY = -(  event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

            vector = new THREE.Vector3( mouseX, mouseY, camera.near );
            //projector = new THREE.Projector();
            //projector.unprojectVector( vector, camera );
            vector.unproject(camera);

            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
            intersects = raycaster.intersectObject( mesh );
            if ( intersects.length > 0 ) {
                panDelta = intersects[ 0 ].point;

                var delta = new THREE.Vector3();
                delta.subVectors( panStart, panDelta );
                //last_good_position = last_good_position && typeof last_good_position.pos != 'undefined' ? last_good_position : null;
                //var temp_position = scope.object.position.clone();
                //var temp_first_vector = new THREE.Vector3(temp_position.x, temp_position.y, camera.position.z);
                //var temp_second_vector = new THREE.Vector3(temp_position.x, temp_position.y, -1000);
                //raycaster = new THREE.Raycaster( temp_first_vector, temp_second_vector.sub(temp_first_vector).normalize());
                //intersects = raycaster.intersectObject( mesh );
                //if ( intersects.length > 0 ) {
                // last_good_position = {pos: scope.object.position, delta: delta};
                // check is it out if it is out of the terrain => stop and go to the edge

                var temp_position = scope.object.position.clone();
                var result = BounderyIntersection.check(lastPosition, temp_position.addVectors(scope.object.position, delta));
                //var result = that.computeCenterDistance(temp_position.addVectors(scope.object.position, delta));
                if (result) {
                    scope.object.position.set(result.position.x, result.position.y, result.position.z);


                    if (!result.limit) {
                        var rotation = that.computeCameraOrientation(result.position, camera.rotation.clone());

                        if (rotation) {
                            //scope.object.rotation.set(rotation.x, rotation.y, rotation.z);
                        }
                    }
                } else {
                    //console.log('no');
                }
                //} else {
                //  if (last_good_position) {
                //     scope.object.position.x = last_good_position.pos.x;
                //     scope.object.position.y = last_good_position.pos.y;
                //     scope.object.position.z = last_good_position.pos.z;
                //     scope.object.updateMatrix();
                // } else {
                //   alert(123);
                //}
                // }

            }

        }

        scope.update();

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( state === STATE.PAN ) {

            var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
            var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

            vector = new THREE.Vector3( mouseX, mouseY, camera.near );
            //projector = new THREE.Projector();
            //projector.unprojectVector( vector, camera );
            vector.unproject(camera);

            raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize());
            intersects = raycaster.intersectObject( scope.mesh );

            if ( intersects.length > 0 ) {
                panDelta = intersects[ 0 ].point;

                var delta = new THREE.Vector3();
                delta.subVectors( panStart, panDelta );
                //last_good_position = last_good_position && typeof last_good_position.pos != 'undefined' ? last_good_position : null;
                //var temp_position = scope.object.position.clone();
                //var temp_first_vector = new THREE.Vector3(temp_position.x, temp_position.y, camera.position.z);
                //var temp_second_vector = new THREE.Vector3(temp_position.x, temp_position.y, -1000);
                //raycaster = new THREE.Raycaster( temp_first_vector, temp_second_vector.sub(temp_first_vector).normalize());
                //intersects = raycaster.intersectObject( mesh );
                //if ( intersects.length > 0 ) {
                // last_good_position = {pos: scope.object.position, delta: delta};
                // check is it out if it is out of the terrain => stop and go to the edge

                var temp_position = scope.object.position.clone();
                var result = BounderyIntersection.check(lastPosition, temp_position.addVectors(scope.object.position, delta));
                //var result = that.computeCenterDistance(temp_position.addVectors(scope.object.position, delta));
                if (result) {
                    //scope.object.updateMatrixWorld();
                    // Position the camera to fit
                    var start_x = scope.object.rotation.x;
                    //var start_camera_position = scope.object.position.clone();
                    var tween = new TWEEN.Tween({x:scope.object.position.x, y:scope.object.position.y, z:scope.object.position.z}).to({
                        x: result.position.x,
                        y: result.position.y,
                        z: result.position.z
                    }, 0).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                        scope.orientation_box.position.set(
                            scope.orientation_box.position.x + (-scope.object.position.x + this.x),
                            scope.orientation_box.position.y + (-scope.object.position.y + this.y),
                            scope.orientation_box.position.z
                        );
                        scope.object.position.set(this.x, this.y, this.z);
                    }).onComplete(function () {
                        //console.log(scope.object.position);
                        /*
                         var tween = new TWEEN.Tween(scope.object.rotation).to({
                         x: start_x,
                         y: scope.object.rotation.y,
                         z: scope.object.rotation.z
                         }, 150).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                         //camera.lookAt(camera.target);
                         }).onComplete(function () {
                         scope.object.updateProjectionMatrix();
                         scope.object.updateMatrixWorld();
                         //camera.lookAt(camera.target.position);
                         }).start();

                         */
                        scope.object.updateProjectionMatrix();
                        scope.object.updateMatrixWorld();
                        //camera.lookAt(camera.target.position);
                    }).start();

                    return false;
                    var tween = new TWEEN.Tween(scope.object.rotation).to({
                        x: scope.object.rotation.x + 0.3,
                        y: scope.object.rotation.y,
                        z: scope.object.rotation.z
                    }, 1500).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                        //camera.lookAt(camera.target);
                    }).onComplete(function () {
                        scope.object.updateProjectionMatrix();
                        scope.object.updateMatrixWorld();
                        //camera.lookAt(camera.target.position);
                    }).start();
                    var tween = new TWEEN.Tween(scope.object.rotation).to({
                        x: result.position.x,
                        y: result.position.y,
                        z: result.position.z
                    }, 0).easing(TWEEN.Easing.Linear.None).onUpdate(function () {
                        //camera.lookAt(camera.target);
                    }).onComplete(function () {
                        scope.object.updateProjectionMatrix();
                        scope.object.updateMatrixWorld();
                        //camera.lookAt(camera.target.position);
                    }).start();


                    //scope.object.position.set(result.position.x, result.position.y, result.position.z);
                    //console.log(scope.object.target);
                    //scope.object.target.position.set(result.position.x, result.position.y, result.position.z);
                    //console.log(scope.object.position);
                    //var old_position = scope.object.position;
                    //scope.object.translateX(result.position.x);
                    //scope.object.translateY(result.position.y);
                    if (!result.limit) {
                        //var rotation = that.computeCameraOrientation(result.position, camera.rotation.clone());

                        //if (rotation) {
                        //scope.object.rotation.set(rotation.x, rotation.y, rotation.z);
                        //}
                    }
                } else {
                    //console.log('no');
                }
                //} else {
                //  if (last_good_position) {
                //     scope.object.position.x = last_good_position.pos.x;
                //     scope.object.position.y = last_good_position.pos.y;
                //     scope.object.position.z = last_good_position.pos.z;
                //     scope.object.updateMatrix();
                // } else {
                //   alert(123);
                //}
                // }

            }

        } else if ( state === STATE.ROTATE ) {

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            thetaDelta -=  2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed;
            phiDelta -=  2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed;

            var position = scope.object.position;
            var offset = position.clone().sub( scope.target );

            // angle from z-axis around y-axis
            var theta = Math.atan2( offset.x, offset.z );

            // angle from y-axis
            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

            theta += thetaDelta;
            phi += phiDelta;

            // restrict phi to be between desired limits
            phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, phi ) );

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

            var radius = offset.length();

            // restrict radius to be between desired limits
            radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, radius ) );

            offset.x = radius * Math.sin( phi ) * Math.sin( theta );
            offset.y = radius * Math.cos( phi );
            offset.z = radius * Math.sin( phi ) * Math.cos( theta );

            position.copy( scope.target ).add( offset );

            scope.object.lookAt( scope.target );

            thetaDelta = 0;
            phiDelta = 0;

            rotateStart.copy( rotateEnd );

        }

        scope.update();

    }

    function onMouseUp( /* event */ ) {

        if ( scope.enabled === false ) return;

        scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
        scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

        state = STATE.NONE;

    }

    function onTouchEnd( /* event */ ) {

        if ( scope.enabled === false ) return;

        scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );
        scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );

        state = STATE.NONE;

    }


    function onMouseWheel( event ) {
        if ( scope.enabled === false ) return;

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail;

        }

        var zoomOffset = new THREE.Vector3();
        var te = scope.object.matrix.elements;
        zoomOffset.set( te[8], te[9], te[10] );
        zoomOffset.multiplyScalar( delta * -scope.zoomSpeed * scope.object.position.z/1000 );
        var zoomResult = scope.object.position.clone();
        zoomResult.addVectors(zoomResult, zoomOffset);

        if (zoomResult.z > maxZoomPosition || zoomResult.z < minZoomPosition) {
            return false;
        }

        scope.object.position.addVectors( scope.object.position, zoomOffset );

    }

    this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
    this.domElement.addEventListener( 'mousedown', onMouseDown, false );
    this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    this.domElement.addEventListener("DOMMouseScroll", onMouseWheel, false);

    this.domElement.addEventListener( 'touchstart', onTouchStart, false );
    //this.domElement.addEventListener( 'touchstart', onTouchDown, false );
    this.domElement.addEventListener( 'touchend', onTouchEnd, false );
    this.domElement.addEventListener( 'touchmove', onTouchMove, false );

};


/**
 * @author mrdoob / http://mrdoob.com/
 */

var Stats = function () {

    var mode = 0;

    var container = document.createElement( 'div' );
    container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
    container.addEventListener( 'click', function ( event ) {

        event.preventDefault();
        showPanel( ++ mode % container.children.length );

    }, false );

    //

    function addPanel( panel ) {

        container.appendChild( panel.dom );
        return panel;

    }

    function showPanel( id ) {

        for ( var i = 0; i < container.children.length; i ++ ) {

            container.children[ i ].style.display = i === id ? 'block' : 'none';

        }

        mode = id;

    }

    //

    var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

    var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
    var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

    if ( self.performance && self.performance.memory ) {

        var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

    }

    showPanel( 0 );

    return {

        REVISION: 16,

        dom: container,

        addPanel: addPanel,
        showPanel: showPanel,

        begin: function () {

            beginTime = ( performance || Date ).now();

        },
        getFPS: function () {
            return frames;
        },
        end: function () {

            frames ++;

            var time = ( performance || Date ).now();

            msPanel.update( time - beginTime, 200 );

            if ( time > prevTime + 1000 ) {

                fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

                prevTime = time;
                frames = 0;

                if ( memPanel ) {

                    var memory = performance.memory;
                    memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

                }

            }

            return time;

        },

        update: function () {

            beginTime = this.end();

        },

        // Backwards Compatibility

        domElement: container,
        setMode: showPanel

    };

};

Stats.Panel = function ( name, fg, bg ) {

    var min = Infinity, max = 0, round = Math.round;
    var PR = round( window.devicePixelRatio || 1 );

    var WIDTH = 80 * PR, HEIGHT = 48 * PR,
        TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
        GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
        GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

    var canvas = document.createElement( 'canvas' );
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    var context = canvas.getContext( '2d' );
    context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect( 0, 0, WIDTH, HEIGHT );

    context.fillStyle = fg;
    context.fillText( name, TEXT_X, TEXT_Y );
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

    return {

        dom: canvas,

        update: function ( value, maxValue ) {

            min = Math.min( min, value );
            max = Math.max( max, value );

            context.fillStyle = bg;
            context.globalAlpha = 1;
            context.fillRect( 0, 0, WIDTH, GRAPH_Y );
            context.fillStyle = fg;
            context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

            context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

            context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

        }

    };

};

if ( typeof module === 'object' ) {

    module.exports = Stats;

}


/**
 * @author arodic / https://github.com/arodic
 */
/*jshint sub:true*/

( function () {

    'use strict';


    var GizmoMaterial = function ( parameters ) {

        THREE.MeshBasicMaterial.call( this );

        this.depthTest = false;
        this.depthWrite = false;
        this.side = THREE.FrontSide;
        this.transparent = true;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }

        };

    };

    GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
    GizmoMaterial.prototype.constructor = GizmoMaterial;


    var GizmoLineMaterial = function ( parameters ) {

        THREE.LineBasicMaterial.call( this );

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;
        this.linewidth = 1;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }

        };

    };

    GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );
    GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;


    var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );


    THREE.TransformGizmo = function () {

        var scope = this;

        this.init = function () {

            THREE.Object3D.call( this );

            this.handles = new THREE.Object3D();
            this.pickers = new THREE.Object3D();
            this.planes = new THREE.Object3D();

            this.add( this.handles );
            this.add( this.pickers );
            this.add( this.planes );

            //// PLANES

            var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 2, 2 );
            var planeMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.DoubleSide } );

            var planes = {
                "XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
            };

            this.activePlane = planes[ "XYZE" ];

            planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
            planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

            for ( var i in planes ) {

                planes[ i ].name = i;
                this.planes.add( planes[ i ] );
                this.planes[ i ] = planes[ i ];

            }

            //// HANDLES AND PICKERS

            var setupGizmos = function( gizmoMap, parent ) {

                for ( var name in gizmoMap ) {

                    for ( i = gizmoMap[ name ].length; i --; ) {

                        var object = gizmoMap[ name ][ i ][ 0 ];
                        var position = gizmoMap[ name ][ i ][ 1 ];
                        var rotation = gizmoMap[ name ][ i ][ 2 ];

                        object.name = name;

                        if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                        if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

                        parent.add( object );

                    }

                }

            };

            setupGizmos( this.handleGizmos, this.handles );
            setupGizmos( this.pickerGizmos, this.pickers );

            // reset Transformations

            this.traverse( function ( child ) {

                if ( child instanceof THREE.Mesh ) {

                    child.updateMatrix();

                    var tempGeometry = child.geometry.clone();
                    tempGeometry.applyMatrix( child.matrix );
                    child.geometry = tempGeometry;

                    child.position.set( 0, 0, 0 );
                    child.rotation.set( 0, 0, 0 );
                    child.scale.set( 1, 1, 1 );

                }

            } );

        };

        this.highlight = function ( axis ) {

            this.traverse( function( child ) {

                if ( child.material && child.material.highlight ) {

                    if ( child.name === axis ) {

                        child.material.highlight( true );

                    } else {

                        child.material.highlight( false );

                    }

                }

            } );

        };

    };

    THREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );
    THREE.TransformGizmo.prototype.constructor = THREE.TransformGizmo;

    THREE.TransformGizmo.prototype.update = function ( rotation, eye ) {

        var vec1 = new THREE.Vector3( 0, 0, 0 );
        var vec2 = new THREE.Vector3( 0, 1, 0 );
        var lookAtMatrix = new THREE.Matrix4();

        this.traverse( function( child ) {

            if ( child.name.search( "E" ) !== - 1 ) {

                child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

            } else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

                child.quaternion.setFromEuler( rotation );

            }

        } );

    };

    THREE.TransformGizmoTranslate = function () {

        THREE.TransformGizmo.call( this );

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

            if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];

        };

        this.init();

    };

    THREE.TransformGizmoTranslate.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoTranslate.prototype.constructor = THREE.TransformGizmoTranslate;

    THREE.TransformGizmoRotate = function () {

        THREE.TransformGizmo.call( this );

        var CircleGeometry = function ( radius, facing, arc ) {

            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            arc = arc ? arc : 1;

            for ( var i = 0; i <= 64 * arc; ++ i ) {

                if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

            }

            geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) );
            return geometry;

        };

        this.handleGizmos = {

            X: [
                [ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            E: [
                [ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZE: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            E: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
            ],

            XYZE: [
                [ new THREE.Mesh( new THREE.Geometry() ) ]// TODO
            ]

        };

        this.setActivePlane = function ( axis ) {

            if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

            if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

        };

        this.update = function ( rotation, eye2 ) {

            THREE.TransformGizmo.prototype.update.apply( this, arguments );

            var group = {

                handles: this[ "handles" ],
                pickers: this[ "pickers" ],

            };

            var tempMatrix = new THREE.Matrix4();
            var worldRotation = new THREE.Euler( 0, 0, 1 );
            var tempQuaternion = new THREE.Quaternion();
            var unitX = new THREE.Vector3( 1, 0, 0 );
            var unitY = new THREE.Vector3( 0, 1, 0 );
            var unitZ = new THREE.Vector3( 0, 0, 1 );
            var quaternionX = new THREE.Quaternion();
            var quaternionY = new THREE.Quaternion();
            var quaternionZ = new THREE.Quaternion();
            var eye = eye2.clone();

            worldRotation.copy( this.planes[ "XY" ].rotation );
            tempQuaternion.setFromEuler( worldRotation );

            tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
            eye.applyMatrix4( tempMatrix );

            this.traverse( function( child ) {

                tempQuaternion.setFromEuler( worldRotation );

                if ( child.name === "X" ) {

                    quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Y" ) {

                    quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Z" ) {

                    quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                    child.quaternion.copy( tempQuaternion );

                }

            } );

        };

        this.init();

    };

    THREE.TransformGizmoRotate.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoRotate.prototype.constructor = THREE.TransformGizmoRotate;

    THREE.TransformGizmoScale = function () {

        THREE.TransformGizmo.call( this );

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

        };

        this.init();

    };

    THREE.TransformGizmoScale.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoScale.prototype.constructor = THREE.TransformGizmoScale;

    THREE.TransformControls = function ( camera, domElement ) {

        // TODO: Make non-uniform scale and rotate play nice in hierarchies
        // TODO: ADD RXYZ contol

        THREE.Object3D.call( this );

        domElement = ( domElement !== undefined ) ? domElement : document;

        this.object = undefined;
        this.visible = false;
        this.translationSnap = null;
        this.rotationSnap = null;
        this.space = "world";
        this.size = 1;
        this.axis = null;

        var scope = this;

        var _mode = "translate";
        var _dragging = false;
        var _plane = "XY";
        var _gizmo = {

            "translate": new THREE.TransformGizmoTranslate(),
            "rotate": new THREE.TransformGizmoRotate(),
            "scale": new THREE.TransformGizmoScale()
        };

        for ( var type in _gizmo ) {

            var gizmoObj = _gizmo[ type ];

            gizmoObj.visible = ( type === _mode );
            this.add( gizmoObj );

        }

        var changeEvent = { type: "change" };
        var mouseDownEvent = { type: "mouseDown" };
        var mouseUpEvent = { type: "mouseUp", mode: _mode };
        var objectChangeEvent = { type: "objectChange" };

        var ray = new THREE.Raycaster();
        var pointerVector = new THREE.Vector2();

        var point = new THREE.Vector3();
        var offset = new THREE.Vector3();

        var rotation = new THREE.Vector3();
        var offsetRotation = new THREE.Vector3();
        var scale = 1;

        var lookAtMatrix = new THREE.Matrix4();
        var eye = new THREE.Vector3();

        var tempMatrix = new THREE.Matrix4();
        var tempVector = new THREE.Vector3();
        var tempQuaternion = new THREE.Quaternion();
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );

        var quaternionXYZ = new THREE.Quaternion();
        var quaternionX = new THREE.Quaternion();
        var quaternionY = new THREE.Quaternion();
        var quaternionZ = new THREE.Quaternion();
        var quaternionE = new THREE.Quaternion();

        var oldPosition = new THREE.Vector3();
        var oldScale = new THREE.Vector3();
        var oldRotationMatrix = new THREE.Matrix4();

        var parentRotationMatrix  = new THREE.Matrix4();
        var parentScale = new THREE.Vector3();

        var worldPosition = new THREE.Vector3();
        var worldRotation = new THREE.Euler();
        var worldRotationMatrix  = new THREE.Matrix4();
        var camPosition = new THREE.Vector3();
        var camRotation = new THREE.Euler();

        domElement.addEventListener( "mousedown", onPointerDown, false );
        domElement.addEventListener( "touchstart", onPointerDown, false );

        domElement.addEventListener( "mousemove", onPointerHover, false );
        domElement.addEventListener( "touchmove", onPointerHover, false );

        domElement.addEventListener( "mousemove", onPointerMove, false );
        domElement.addEventListener( "touchmove", onPointerMove, false );

        domElement.addEventListener( "mouseup", onPointerUp, false );
        domElement.addEventListener( "mouseout", onPointerUp, false );
        domElement.addEventListener( "touchend", onPointerUp, false );
        domElement.addEventListener( "touchcancel", onPointerUp, false );
        domElement.addEventListener( "touchleave", onPointerUp, false );

        this.dispose = function () {

            domElement.removeEventListener( "mousedown", onPointerDown );
            domElement.removeEventListener( "touchstart", onPointerDown );

            domElement.removeEventListener( "mousemove", onPointerHover );
            domElement.removeEventListener( "touchmove", onPointerHover );

            domElement.removeEventListener( "mousemove", onPointerMove );
            domElement.removeEventListener( "touchmove", onPointerMove );

            domElement.removeEventListener( "mouseup", onPointerUp );
            domElement.removeEventListener( "mouseout", onPointerUp );
            domElement.removeEventListener( "touchend", onPointerUp );
            domElement.removeEventListener( "touchcancel", onPointerUp );
            domElement.removeEventListener( "touchleave", onPointerUp );

        };

        this.attach = function ( object ) {

            this.object = object;
            this.visible = true;
            this.update();

        };

        this.detach = function () {

            this.object = undefined;
            this.visible = false;
            this.axis = null;

        };

        this.getMode = function () {

            return _mode;

        };

        this.setMode = function ( mode ) {

            _mode = mode ? mode : _mode;

            if ( _mode === "scale" ) scope.space = "local";

            for ( var type in _gizmo ) _gizmo[ type ].visible = ( type === _mode );

            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.setTranslationSnap = function ( translationSnap ) {

            scope.translationSnap = translationSnap;

        };

        this.setRotationSnap = function ( rotationSnap ) {

            scope.rotationSnap = rotationSnap;

        };

        this.setSize = function ( size ) {

            scope.size = size;
            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.setSpace = function ( space ) {

            scope.space = space;
            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.update = function () {

            if ( scope.object === undefined ) return;

            scope.object.updateMatrixWorld();
            worldPosition.setFromMatrixPosition( scope.object.matrixWorld );
            worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

            camera.updateMatrixWorld();
            camPosition.setFromMatrixPosition( camera.matrixWorld );
            camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

            scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
            this.position.copy( worldPosition );
            this.scale.set( scale, scale, scale );

            eye.copy( camPosition ).sub( worldPosition ).normalize();

            if ( scope.space === "local" ) {

                _gizmo[ _mode ].update( worldRotation, eye );

            } else if ( scope.space === "world" ) {

                _gizmo[ _mode ].update( new THREE.Euler(), eye );

            }

            _gizmo[ _mode ].highlight( scope.axis );

        };

        function onPointerHover( event ) {

            if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

            var axis = null;

            if ( intersect ) {

                axis = intersect.object.name;

                event.preventDefault();

            }

            if ( scope.axis !== axis ) {

                scope.axis = axis;
                scope.update();
                scope.dispatchEvent( changeEvent );

            }

        }

        function onPointerDown( event ) {

            if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            if ( pointer.button === 0 || pointer.button === undefined ) {

                var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

                if ( intersect ) {

                    event.preventDefault();
                    event.stopPropagation();

                    scope.dispatchEvent( mouseDownEvent );

                    scope.axis = intersect.object.name;

                    scope.update();

                    eye.copy( camPosition ).sub( worldPosition ).normalize();

                    _gizmo[ _mode ].setActivePlane( scope.axis, eye );

                    var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

                    if ( planeIntersect ) {

                        oldPosition.copy( scope.object.position );
                        oldScale.copy( scope.object.scale );

                        oldRotationMatrix.extractRotation( scope.object.matrix );
                        worldRotationMatrix.extractRotation( scope.object.matrixWorld );

                        parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
                        parentScale.setFromMatrixScale( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

                        offset.copy( planeIntersect.point );

                    }

                }

            }

            _dragging = true;

        }

        function onPointerMove( event ) {

            if ( scope.object === undefined || scope.axis === null || _dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

            if ( planeIntersect === false ) return;

            event.preventDefault();
            event.stopPropagation();

            point.copy( planeIntersect.point );

            if ( _mode === "translate" ) {

                point.sub( offset );
                point.multiply( parentScale );

                if ( scope.space === "local" ) {

                    point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                    if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                    if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

                    point.applyMatrix4( oldRotationMatrix );

                    scope.object.position.copy( oldPosition );
                    scope.object.position.add( point );

                }

                if ( scope.space === "world" || scope.axis.search( "XYZ" ) !== - 1 ) {

                    if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                    if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                    if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

                    point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

                    scope.object.position.copy( oldPosition );
                    scope.object.position.add( point );

                }

                if ( scope.translationSnap !== null ) {

                    if ( scope.space === "local" ) {

                        scope.object.position.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    }

                    if ( scope.axis.search( "X" ) !== - 1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.translationSnap ) * scope.translationSnap;
                    if ( scope.axis.search( "Y" ) !== - 1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.translationSnap ) * scope.translationSnap;
                    if ( scope.axis.search( "Z" ) !== - 1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.translationSnap ) * scope.translationSnap;

                    if ( scope.space === "local" ) {

                        scope.object.position.applyMatrix4( worldRotationMatrix );

                    }

                }

            } else if ( _mode === "scale" ) {

                point.sub( offset );
                point.multiply( parentScale );

                if ( scope.space === "local" ) {

                    if ( scope.axis === "XYZ" ) {

                        scale = 1 + ( ( point.y ) / Math.max( oldScale.x, oldScale.y, oldScale.z ) );

                        scope.object.scale.x = oldScale.x * scale;
                        scope.object.scale.y = oldScale.y * scale;
                        scope.object.scale.z = oldScale.z * scale;

                    } else {

                        point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                        if ( scope.axis === "X" ) scope.object.scale.x = oldScale.x * ( 1 + point.x / oldScale.x );
                        if ( scope.axis === "Y" ) scope.object.scale.y = oldScale.y * ( 1 + point.y / oldScale.y );
                        if ( scope.axis === "Z" ) scope.object.scale.z = oldScale.z * ( 1 + point.z / oldScale.z );

                    }

                }

            } else if ( _mode === "rotate" ) {

                point.sub( worldPosition );
                point.multiply( parentScale );
                tempVector.copy( offset ).sub( worldPosition );
                tempVector.multiply( parentScale );

                if ( scope.axis === "E" ) {

                    point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
                    tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                    quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                } else if ( scope.axis === "XYZE" ) {

                    quaternionE.setFromEuler( point.clone().cross( tempVector ).normalize() ); // rotation axis

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
                    quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo( tempVector ) );
                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                } else if ( scope.space === "local" ) {

                    point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );

                    if ( scope.rotationSnap !== null ) {

                        quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                    } else {

                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                    }

                    if ( scope.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
                    if ( scope.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
                    if ( scope.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

                    scope.object.quaternion.copy( quaternionXYZ );

                } else if ( scope.space === "world" ) {

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                    if ( scope.rotationSnap !== null ) {

                        quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                    } else {

                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                    }

                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    if ( scope.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    if ( scope.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    if ( scope.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                }

            }

            scope.update();
            scope.dispatchEvent( changeEvent );
            scope.dispatchEvent( objectChangeEvent );

        }

        function onPointerUp( event ) {

            if ( event.button !== undefined && event.button !== 0 ) return;

            if ( _dragging && ( scope.axis !== null ) ) {

                mouseUpEvent.mode = _mode;
                scope.dispatchEvent( mouseUpEvent )

            }

            _dragging = false;
            onPointerHover( event );

        }

        function intersectObjects( pointer, objects ) {

            var rect = domElement.getBoundingClientRect();
            var x = ( pointer.clientX - rect.left ) / rect.width;
            var y = ( pointer.clientY - rect.top ) / rect.height;

            pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
            ray.setFromCamera( pointerVector, camera );

            var intersections = ray.intersectObjects( objects, true );
            return intersections[ 0 ] ? intersections[ 0 ] : false;

        }

    };

    THREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );
    THREE.TransformControls.prototype.constructor = THREE.TransformControls;



}() );


/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement, target ) {

    this.object = object;

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = target;//new THREE.Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false;
    this.dampingFactor = 0.25;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    //
    // public methods
    //

    this.getPolarAngle = function () {

        return phi;

    };

    this.getAzimuthalAngle = function () {

        return theta;

    };

    this.reset = function () {

        scope.target.copy( scope.target0 );
        scope.object.position.copy( scope.position0 );
        scope.object.zoom = scope.zoom0;

        scope.object.updateProjectionMatrix();
        scope.dispatchEvent( changeEvent );

        scope.update();

        state = STATE.NONE;

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function() {

        var offset = new THREE.Vector3();
        // so camera.up is the orbit axis
        var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 0, 1 ) );
        var quatInverse = quat.clone().inverse();

        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        return function () {

            var position = scope.object.position;

            offset.copy( position ).sub( scope.target );

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion( quat );

            // angle from z-axis around y-axis
            spherical.setFromVector3( offset );

            if ( scope.autoRotate && state === STATE.NONE ) {

                rotateLeft( getAutoRotationAngle() );

            }

            spherical.theta += sphericalDelta.theta;
            spherical.phi += sphericalDelta.phi;

            // restrict theta to be between desired limits
            spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

            // restrict phi to be between desired limits
            spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

            spherical.makeSafe();


            spherical.radius *= scale;

            // restrict radius to be between desired limits
            spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

            // move target to panned location
            scope.target.add( panOffset );

            offset.setFromSpherical( spherical );

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion( quatInverse );

            position.copy( scope.target ).add( offset );

            scope.object.lookAt( scope.target );

            if ( scope.enableDamping === true ) {

                sphericalDelta.theta *= ( 1 - scope.dampingFactor );
                sphericalDelta.phi *= ( 1 - scope.dampingFactor );

            } else {

                sphericalDelta.set( 0, 0, 0 );

            }

            scale = 1;
            panOffset.set( 0, 0, 0 );

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if ( zoomChanged ||
                lastPosition.distanceToSquared( scope.object.position ) > EPS ||
                8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

                scope.dispatchEvent( changeEvent );

                lastPosition.copy( scope.object.position );
                lastQuaternion.copy( scope.object.quaternion );
                zoomChanged = false;

                return true;

            }

            return false;

        };

    }();

    this.dispose = function() {

        scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
        scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
        scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
        scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

        scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
        scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
        scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
        document.removeEventListener( 'mouseout', onMouseUp, false );

        window.removeEventListener( 'keydown', onKeyDown, false );

        //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };

    var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    var state = STATE.NONE;

    var EPS = 0.000001;

    // current position in spherical coordinates
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.zoomSpeed );

    }

    function rotateLeft( angle ) {

        sphericalDelta.theta -= angle;

    }

    function rotateUp( angle ) {

        sphericalDelta.phi -= angle;

    }

    var panLeft = function() {

        var v = new THREE.Vector3();

        return function panLeft( distance, objectMatrix ) {

            v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
            v.multiplyScalar( - distance );

            panOffset.add( v );

        };

    }();

    var panUp = function() {

        var v = new THREE.Vector3();

        return function panUp( distance, objectMatrix ) {

            v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
            v.multiplyScalar( distance );

            panOffset.add( v );

        };

    }();

    // deltaX and deltaY are in pixels; right and down are positive
    var pan = function() {

        var offset = new THREE.Vector3();

        return function( deltaX, deltaY ) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( scope.object instanceof THREE.PerspectiveCamera ) {

                // perspective
                var position = scope.object.position;
                offset.copy( position ).sub( scope.target );
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
                panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

            } else if ( scope.object instanceof THREE.OrthographicCamera ) {

                // orthographic
                panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
                panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

            } else {

                // camera neither orthographic nor perspective
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
                scope.enablePan = false;

            }

        };

    }();

    function dollyIn( dollyScale ) {

        if ( scope.object instanceof THREE.PerspectiveCamera ) {

            scale /= dollyScale;

        } else if ( scope.object instanceof THREE.OrthographicCamera ) {

            scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
            scope.object.updateProjectionMatrix();
            zoomChanged = true;

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
            scope.enableZoom = false;

        }

    }

    function dollyOut( dollyScale ) {

        if ( scope.object instanceof THREE.PerspectiveCamera ) {

            scale *= dollyScale;

        } else if ( scope.object instanceof THREE.OrthographicCamera ) {

            scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
            scope.object.updateProjectionMatrix();
            zoomChanged = true;

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
            scope.enableZoom = false;

        }

    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate( event ) {

        //console.log( 'handleMouseDownRotate' );

        rotateStart.set( event.clientX, event.clientY );

    }

    function handleMouseDownDolly( event ) {

        //console.log( 'handleMouseDownDolly' );

        dollyStart.set( event.clientX, event.clientY );

    }

    function handleMouseDownPan( event ) {

        //console.log( 'handleMouseDownPan' );

        panStart.set( event.clientX, event.clientY );

    }

    function handleMouseMoveRotate( event ) {

        //console.log( 'handleMouseMoveRotate' );

        rotateEnd.set( event.clientX, event.clientY );
        rotateDelta.subVectors( rotateEnd, rotateStart );

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

        rotateStart.copy( rotateEnd );

        scope.update();

    }

    function handleMouseMoveDolly( event ) {

        //console.log( 'handleMouseMoveDolly' );

        dollyEnd.set( event.clientX, event.clientY );

        dollyDelta.subVectors( dollyEnd, dollyStart );

        if ( dollyDelta.y > 0 ) {

            dollyIn( getZoomScale() );

        } else if ( dollyDelta.y < 0 ) {

            dollyOut( getZoomScale() );

        }

        dollyStart.copy( dollyEnd );

        scope.update();

    }

    function handleMouseMovePan( event ) {

        //console.log( 'handleMouseMovePan' );

        panEnd.set( event.clientX, event.clientY );

        panDelta.subVectors( panEnd, panStart );

        pan( panDelta.x, panDelta.y );

        panStart.copy( panEnd );

        scope.update();

    }

    function handleMouseUp( event ) {

        //console.log( 'handleMouseUp' );

    }

    function handleMouseWheel( event ) {

        //console.log( 'handleMouseWheel' );

        var delta = 0;

        if ( event.wheelDelta !== undefined ) {

            // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail !== undefined ) {

            // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            dollyOut( getZoomScale() );

        } else if ( delta < 0 ) {

            dollyIn( getZoomScale() );

        }

        scope.update();

    }

    function handleKeyDown( event ) {

        //console.log( 'handleKeyDown' );

        switch ( event.keyCode ) {

            case scope.keys.UP:
                pan( 0, scope.keyPanSpeed );
                scope.update();
                break;

            case scope.keys.BOTTOM:
                pan( 0, - scope.keyPanSpeed );
                scope.update();
                break;

            case scope.keys.LEFT:
                pan( scope.keyPanSpeed, 0 );
                scope.update();
                break;

            case scope.keys.RIGHT:
                pan( - scope.keyPanSpeed, 0 );
                scope.update();
                break;

        }

    }

    function handleTouchStartRotate( event ) {

        //console.log( 'handleTouchStartRotate' );

        rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

    }

    function handleTouchStartDolly( event ) {

        //console.log( 'handleTouchStartDolly' );

        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

        var distance = Math.sqrt( dx * dx + dy * dy );

        dollyStart.set( 0, distance );

    }

    function handleTouchStartPan( event ) {

        //console.log( 'handleTouchStartPan' );

        panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

    }

    function handleTouchMoveRotate( event ) {

        //console.log( 'handleTouchMoveRotate' );

        rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        rotateDelta.subVectors( rotateEnd, rotateStart );

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        // rotating across whole screen goes 360 degrees around
        rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

        rotateStart.copy( rotateEnd );

        scope.update();

    }

    function handleTouchMoveDolly( event ) {

        //console.log( 'handleTouchMoveDolly' );

        var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

        var distance = Math.sqrt( dx * dx + dy * dy );

        dollyEnd.set( 0, distance );

        dollyDelta.subVectors( dollyEnd, dollyStart );

        if ( dollyDelta.y > 0 ) {

            dollyOut( getZoomScale() );

        } else if ( dollyDelta.y < 0 ) {

            dollyIn( getZoomScale() );

        }

        dollyStart.copy( dollyEnd );

        scope.update();

    }

    function handleTouchMovePan( event ) {

        //console.log( 'handleTouchMovePan' );

        panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

        panDelta.subVectors( panEnd, panStart );

        pan( panDelta.x, panDelta.y );

        panStart.copy( panEnd );

        scope.update();

    }

    function handleTouchEnd( event ) {

        //console.log( 'handleTouchEnd' );

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        if ( event.button === scope.mouseButtons.ORBIT ) {

            if ( scope.enableRotate === false ) return;

            handleMouseDownRotate( event );

            state = STATE.ROTATE;

        } else if ( event.button === scope.mouseButtons.ZOOM ) {

            if ( scope.enableZoom === false ) return;

            handleMouseDownDolly( event );

            state = STATE.DOLLY;

        } else if ( event.button === scope.mouseButtons.PAN ) {

            if ( scope.enablePan === false ) return;

            handleMouseDownPan( event );

            state = STATE.PAN;

        }

        if ( state !== STATE.NONE ) {

            document.addEventListener( 'mousemove', onMouseMove, false );
            document.addEventListener( 'mouseup', onMouseUp, false );
            document.addEventListener( 'mouseout', onMouseUp, false );

            scope.dispatchEvent( startEvent );

        }

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        if ( state === STATE.ROTATE ) {

            if ( scope.enableRotate === false ) return;

            handleMouseMoveRotate( event );

        } else if ( state === STATE.DOLLY ) {

            if ( scope.enableZoom === false ) return;

            handleMouseMoveDolly( event );

        } else if ( state === STATE.PAN ) {

            if ( scope.enablePan === false ) return;

            handleMouseMovePan( event );

        }

    }

    function onMouseUp( event ) {

        if ( scope.enabled === false ) return;

        handleMouseUp( event );

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );
        document.removeEventListener( 'mouseout', onMouseUp, false );

        scope.dispatchEvent( endEvent );

        state = STATE.NONE;

    }

    function onMouseWheel( event ) {

        if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

        event.preventDefault();
        event.stopPropagation();

        handleMouseWheel( event );

        scope.dispatchEvent( startEvent ); // not sure why these are here...
        scope.dispatchEvent( endEvent );

    }

    function onKeyDown( event ) {

        if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

        handleKeyDown( event );

    }

    function onTouchStart( event ) {

        if ( scope.enabled === false ) return;

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate

                if ( scope.enableRotate === false ) return;

                handleTouchStartRotate( event );

                state = STATE.TOUCH_ROTATE;

                break;

            case 2:	// two-fingered touch: dolly

                if ( scope.enableZoom === false ) return;

                handleTouchStartDolly( event );

                state = STATE.TOUCH_DOLLY;

                break;

            case 3: // three-fingered touch: pan

                if ( scope.enablePan === false ) return;

                handleTouchStartPan( event );

                state = STATE.TOUCH_PAN;

                break;

            default:

                state = STATE.NONE;

        }

        if ( state !== STATE.NONE ) {

            scope.dispatchEvent( startEvent );

        }

    }

    function onTouchMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate

                if ( scope.enableRotate === false ) return;
                if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

                handleTouchMoveRotate( event );

                break;

            case 2: // two-fingered touch: dolly

                if ( scope.enableZoom === false ) return;
                if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

                handleTouchMoveDolly( event );

                break;

            case 3: // three-fingered touch: pan

                if ( scope.enablePan === false ) return;
                if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

                handleTouchMovePan( event );

                break;

            default:

                state = STATE.NONE;

        }

    }

    function onTouchEnd( event ) {

        if ( scope.enabled === false ) return;

        handleTouchEnd( event );

        scope.dispatchEvent( endEvent );

        state = STATE.NONE;

    }

    function onContextMenu( event ) {

        event.preventDefault();

    }

    //

    scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

    scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
    scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
    scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

    scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
    scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
    scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

    window.addEventListener( 'keydown', onKeyDown, false );

    // force an update at start

    this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

    center: {

        get: function () {

            console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
            return this.target;

        }

    },

    // backward compatibility

    noZoom: {

        get: function () {

            console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
            return ! this.enableZoom;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
            this.enableZoom = ! value;

        }

    },

    noRotate: {

        get: function () {

            console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
            return ! this.enableRotate;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
            this.enableRotate = ! value;

        }

    },

    noPan: {

        get: function () {

            console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
            return ! this.enablePan;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
            this.enablePan = ! value;

        }

    },

    noKeys: {

        get: function () {

            console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
            return ! this.enableKeys;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
            this.enableKeys = ! value;

        }

    },

    staticMoving : {

        get: function () {

            console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
            return ! this.constraint.enableDamping;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
            this.constraint.enableDamping = ! value;

        }

    },

    dynamicDampingFactor : {

        get: function () {

            console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
            return this.constraint.dampingFactor;

        },

        set: function ( value ) {

            console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
            this.constraint.dampingFactor = value;

        }

    }

} );
