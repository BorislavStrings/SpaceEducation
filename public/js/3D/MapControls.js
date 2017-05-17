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
