/* script created by IlianZ ilianzapryanov@abv.bg 
 * 22.07.2015 
 *  working in chrome and firefox
 * primitive 2D engine with html5 canvas and javascript
 * no external libs used 
 * Version 1b
 * added Space as "PAUSE" button 
 * Not done:
 * 1. Laser target
 * 
 * 
 * */

//not used
var GameObjectWrapper = function() {
	
	this.newGame = function() {
		//wrap the whole game code
		//for use with toJSOn for serializing
	}
}


/*@Unused*/
function requestDataFile(dataUrl) {
	
	var xmlHttpReq ;
	if ( window.XMLHttpRequest) {
		/* opera, safari, firefox, chrome, IE9+ */
		xmlHttpReq = new XMLHttpRequest();
	} else {
		
		xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	xmlHttpReq.onreadystate = function() {
		
		if ( xmlHttpReq.readyState == 4 && 
				xmlHttpReq.status == 200 ) {
				// get the object as blob
		}
	} // end 
	xmlHttpReq.open("GET", dataUrl, true);
	xmlHttpReq.send();
}


/*@Unused*/
function drawCrosshair(x, y, w, h, rot, ctx) {
	var c = ctx;
	c.fillStyle = "red";
	c.save();
	c.translate(x, y);
	c.rotate(rot);
	c.fillRect(x, y, w, h);
	c.restore();
}

function drawCircle(x, y, radius, ctx) {
	var c = ctx;
	c.strokeStyle = "red";
	c.save();
	c.beginPath();
	c.arc(x, y, radius, 0, 2 * Math.PI);
	c.stroke();
	c.restore();
}


Array.prototype.swap = function(i, j) {
	var a = this[i];
	this[i] = this[j];
	this[j] = a;
}

/*@Unused*/
function distance(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var d  = Math.sqrt( (dx*dx) + (dy*dy) );
	return d; 
}
/*@Unused*/
var lockmove = false;		
var ctx=null;

/*[SpriteSheet] ****************************************************** */
var SpriteSheet = function(path, x, y, rot, frameW, frameH, 
				 frameSpeed, endFrame, ct) {
	
	this.setNewSprite = function(path, x, y, rot, frameW, frameH,
								frameSpeed, endFrame, ct) {
			
	}
	var image = new Image();	
	var framesPerRow;
	var self = this; 
	var _ctx = ct;
	image.onload = function() {
		framesPerRow = Math.round(image.width / frameW); 
	};
	image.src = path;
				
	var currframe = 0;
	var counter	= 0;
	
	var _x = x;
	var _y = y;
	var _r = rot;
	var _w = frameW;
	var _h = frameH;
	var _ctx = ct;
	this.setContext= function(ct) {
		_ctx = ct;
	}
	var update = function() {
		
		if ( counter == ( frameSpeed - 1 ) ) {
			currframe = (currframe+1) % endFrame;
		} 
		counter = (counter+1) % frameSpeed;
		
	};
	
	
	var row;
	var col;
	
	var draw = function() {
	   
		row = Math.floor(currframe / framesPerRow);
		col = Math.floor(currframe % framesPerRow);
		
		_ctx.save();
		_ctx.translate(_x+frameW/2, _y+frameH/2);
		_ctx.rotate(_r); /*NOTE!!! this function uses degrees
							not radians!!! */		
		_ctx.drawImage(image, 
						col*frameW, 
						row *  frameH, 
						frameW, frameH, 
						frameW/2*-1 , frameH/2*-1, 
						frameW, frameH);
		_ctx.restore();
	}	  
		  
	var renderId;
	this.render= function(s1, s2) {
		  update();
		  draw(); 
		 /* do not render here 
		  * move to mainrender() */
		 // renderId = setTimeout(self.render, 1000/60);
	  }
	  this.setXYR= function(x,y,r) {
		  _x = x; _y = y; _r = r;
	  }
	  this.getXYR = function() {
		  return {
			  "x": _x,
			  "y": _y,
			  "r": _r
		  };
	  }
	  this.stop= function() {
		  _ctx.clearRect(_x, _y, _w, _h);
		  clearTimeout(renderId);
	  }	  						   
} /* END SPRITE SHEET CLASS */


/*[Entity] ********************************************************** */
var Entity = function(x,y,w,h,r) {
	
	var _x = x, _y = y, _w = w, _h = h, _r = r; /* boundbox
													for collisions */
	var _tX, _tY; 
	
	var sprite = null;
	
	this.getSprite = function() {
		return this.sprite;
	}
	
	this.toString =  function() {
			return _x+":"+_y+":"+_r+":"+_w+":"+_h;
	}
	
	this.getTargetXY = function() {
		return { "x": _tX, "y": _tY };
	}
	
	this.setTargetXY= function(x, y) {
		_tX = x;
		_tY = y;
	}
	
	this.setXYRWH = function(x,y,r,w,h) {
		_x = x; _y = y; _r = r; _w = w; _h = h;

	}
	
	this.getXYRWH = function() {
		return {
			"x":_x, "y":_y, "r":_r, "w":_w, "h": _h
		};
	}
} // END ENTYTY


Entity.prototype.say = function() {
	console.log(this.toString()); //just a test
}

var Scene = function() {
	var entList = [];
	var entListSize = 0;
	this.addEnt = function(ent) {
		entList[entListSize++] = ent;
	};
	
	this.getEntityAt = function(index) {
		if ( index < 0 || index > entListSize ) {
			console.log("Error accessing entity");
			return null;
		} else {
			return entList[index];
		}
	};
	
/*
	this.updateAll = function(callback) {
		
		for(var i=0; i < entListSize; i++) {
			callback(entList[i]); //unimplemented for now 
		}
	}
*/
} // end scene 

/*Scene unused for now */

var events;
var context;
var world;
var scr1;
var scr2;	
var world2;		
var buffer ;

var dblctx = [];

/*[1]*/
window.onload = function(e) {
	
	world = document.getElementById("screen");
	ctx = world.getContext("2d");
	dblctx[0] = world.getContext('2d');
	
	var sniper = new Entity(10,10, 53, 63, 20) ;
	
	sniper.playAnimation = function() {	
		
		
		this.sprite.render();
		/*TODO  draw crosshair */
		
	}
	
	
	sniper.stopAnimation = function() {
		this.sprite.stop();
	}
	
	sniper.loadSprite = function() {
		
		var s = new SpriteSheet("sniper.png", this.getXYRWH().x,
								this.getXYRWH().y,
								this.getXYRWH().r,
								this.getXYRWH().w,
								this.getXYRWH().h,
								4, 8, 
							    dblctx[0]);
		this.sprite = s;
		
	}


	
/* TARGET function for sniper */
	sniper.targetTo = function() {
		x = sniper.getXYRWH().x;
		y = sniper.getXYRWH().y;
		var _tX = sniper.getTargetXY().x;
		var _tY  = sniper.getTargetXY().y;
		
		var id;
		var dx = Math.abs(_tX - x);
		var dy = Math.abs(_tY - y);
		var sx = x < _tX ? 6 : -6;
		var sy = y < _tY ? 6 : -6;
		var err = (dx > dy ? dx : dy) /2;
	
		/* using						 
		 *  Bresenham's line algorithm
		 * TODO add the get getSteps() to 
		 * travel in a pure line like missele
		 * */
		 var snipermove = 0;
		 if ( snipermove++ < dx * dy /2 ) {
				var e2 = err;
				if ( e2 >= -dx ) {
					err -=dy; 
					x += sx; 
				}
				if ( e2 <= dy) {
					err += dx;
					y += sy;
				}
				sniper.setXYRWH(x, y, sniper.getXYRWH().r, sniper.getXYRWH().w,
						sniper.getXYRWH().h );
				sniper.getSprite().setXYR(x, y, 
								sniper.getSprite().getXYR().r);
			} else {
				// none
			}
			id = setTimeout(sniper.targetTo, 1000/60);

    } //end move sniper									

/* FIRE and EXPLODE */

	function getSteps(angle) {
		var cos = Math.cos(angle),
			sine = Math.sin(angle);
			return {
				"x": cos - sine,
				"y": sine + cos
			};
	}

	/* begin clojure class */	
	sniper.fireMisseleTo = function(tx, ty) {
		/* fire */
		var m = new SpriteSheet("rocket.png", 
			sniper.getXYRWH().x + sniper.getXYRWH().w /2,
			sniper.getXYRWH().y + sniper.getXYRWH().h /2,
			sniper.getXYRWH().r, 
			26, 49, 3, 4, ctx);
		//m.render();
		var id;
		
		var x  = sniper.getXYRWH().x;
		var y = sniper.getXYRWH().y;
		
		
		var rot = sniper.getXYRWH().r;
		var steps = getSteps(rot);
		var x1 = steps.x;
		var y1 = steps.y;
		
		var _tX = tx;
		var _tY  = ty;
		var misselescount = 0;
		var rocketfly = 25;
		callbacksStack.push(m.render);
		function _mrender() {
			misselescount++;
			var dx = Math.abs(_tX - x);
			var dy = Math.abs(_tY - y);
			var sx = x < _tX ? 10 : -10;
			var sy = y < _tY ? 10 : -10;
			var err = (dx > dy ? dx : dy) /2;
			/* added more fly precission */
		if ( rocketfly <= dx*dy/2) {
			var e2 = err;
			if ( e2 > -dx ) {
				err -=dy; 
				x += sx; 
			}
			if ( e2 < dy) {
				err += dx + x1;
				y += sy + y1;
			}	
			m.setXYR(x, y, rot);
			id = setTimeout(_mrender, 1000/60);	
			} else {
				misselescount = 0;
				/* Explode */
				callbacksStack.pop();
				//clearTimeout(id);
				/* 5120 x 128 , 33 frames */
				var ex =  m.getXYR().x;
				var ey =  m.getXYR().y;
				
				var eangle = Math.floor(Math.random() * 180); /*experimental*/
				/* EXPLOSION */
				
				/* add multipe explosions
				 * to test the callbacksstack
				 * and to add more fun */
				var explosion2 = new SpriteSheet("explosion.png",
						ex+60, ey, eangle, 
						5120/40, 128-30, 4, 32, dblctx[0]);
				
				var explosion3 = new SpriteSheet("explosion.png",
						ex, ey+60, eangle, 
						5120/40, 128-30, 4, 32, dblctx[0]);
				var explosion4 = new SpriteSheet("explosion.png",
						ex-60, ey, eangle, 
						5120/40, 128-30, 4, 32, dblctx[0]);
				var explosion5 = new SpriteSheet("explosion.png",
						ex, ey-60, eangle, 
						5120/40, 128-30, 4, 32, dblctx[0]);
						
				var explosion = new SpriteSheet("explosion.png",
					ex, ey, eangle, /*play flames in the opposite of rocket destination */
					5120/40, 128-30, 4, 32, dblctx[0]); /*??? image not working proberly*/
					var frames = 0;
					var id2=null;
						
					function customRender(time) {
						console.log("Explosion:"+frames);
						if ( frames++ <= 33 ) {
							console.log("exposion frames:"+frames);
						} else {
							explosion.stop();
							clearTimeout(id2);
							console.log("Stop explosion");
							callbacksStack.pop();
							callbacksStack.pop();
							callbacksStack.pop();
							callbacksStack.pop();
							callbacksStack.pop();
							return id2;
						}
						id2 = setTimeout(customRender, time);
					}
					/* ok */
					//customRender();
					callbacksStack.push(explosion.render);
					callbacksStack.push(explosion4.render);
					callbacksStack.push(explosion2.render);
					callbacksStack.push(explosion3.render);
					callbacksStack.push(explosion5.render);
					customRender(60);
				} // ENDIF
		}
		_mrender();
	} /* end clojure class with fire and explosion*/
	
	
	sniper.setSpriteXYR = function() {
		(sniper.getSprite()).setXYR(sniper.getXYRWH().x, 
						sniper.getXYRWH().y,
						sniper.getXYRWH().r );
						
	    console.log((sniper.getSprite()).getXYR().x+":"+
					(sniper.getSprite()).getXYR().y+":"+
					(sniper.getSprite()).getXYR().r);
	    
	}
	
	sniper.loadSprite();	
	sniper.playAnimation();
/* *********************************************************************************** */


function circleAnimation(fromx, fromy, rad, steps, ms) {
	var id ;
	var i = 0;
	var r = rad;
	var self = this;
	var foo = (function() {
		if ( i++ <= steps ) {
			drawCircle(fromx, fromy, r-= r/2, dblctx[0]);
			id = setTimeout(self.foo, ms); 
		} else {
			clearTimeout(id);
		}
	})();
}

var mainRenderId = null;

var callbacksStack = [];
var isPaused = false;
/*[mainrender] */
var mainrender = function(timeout) {
		
		dblctx[0].fillStyle="black";
		dblctx[0].fillRect(0,0,600,300);
		// always render main entity sprite
		sniper.playAnimation();
		
		(function(e) {
			/* pefrom some game logic,
			 * check game conditions, etc.
			 * */
		 })(/*vaargs*/); // not implemented
		
		/* check for callbacks to be called in a stacked order */
		for (var i=0; i < callbacksStack.length; i++ ) {
			/* do not pop() here because some
			 * render functions may need to remain
			 * 
			*/ 
			callbacksStack[i]();
		}
		/* experimental pause/resume the render scene*/
		
		if ( isPaused ) clearTimeout(mainRenderId);
		else  mainRenderId = setTimeout(mainrender, timeout);
}//end mainrender
	
	mainrender(1000);
	window.onmousemove = function(e) {
		events = e;
		if ( e.clientX > 600 ||
				e.clientY >300  ) {
					/* do not capture */
					console.log("X or Y out of bounds"+e.clientX+":"+e.clientY);
			 } else {
					//follow the mouse coords 
					/* set target */
				console.log(e.clientX+":"+e.clientY);
				var spriteCenter = [sniper.getXYRWH().x + sniper.getXYRWH().w/2,
								sniper.getXYRWH().y + sniper.getXYRWH().h / 2];
				var dx = e.clientX - spriteCenter[0];
				var dy = e.clientY - spriteCenter[1];
				var dx2 = e.clientX - sniper.getXYRWH().x;
				var dy2 = e.clientY - sniper.getXYRWH().y;
			
				//var rot = Math.atan2(dx2, -dy2) * 180/ Math.PI;  /*radians - incorrect */
				var rot = Math.atan2(dx2, -dy2);  /* pass as degrees */
				sniper.getSprite().setXYR(sniper.getSprite().getXYR().x,
									sniper.getSprite().getXYR().y,
									rot);
			
				sniper.setXYRWH(sniper.getXYRWH().x, 
							sniper.getXYRWH().y,
							rot, /* only rotatoion */
							sniper.getXYRWH().w,
							sniper.getXYRWH().h);
						
			 }//endif
		}
		
		/* move to entity class */
/* Move sniper */
	function moveSniper(e) {
		console.log("MOVE");
		/* draw the red circle animation */
		var i = 0;
		var rad = 100;
		var fff = function() {
			var id = null;
			if ( i <= 100 ) {
				/*TODO remove console logger */
				console.log("DRAWING CIRCLE"+rad);
				i+=12;
				rad -= 10;
				drawCircle(e.clientX, e.clientY, rad, dblctx[0]);
				id = setTimeout(fff, 60);
				} else { 
					console.log("STOP DRAWING CIRCLE");
					clearTimeout(id);
				}
			};
			/* put it to callbacks stack */
			callbacksStack.push(fff);
							
			var dx = e.clientX - sniper.getXYRWH().x;
			var dy = e.clientY - sniper.getXYRWH().y;
			var rot = Math.atan2(dx, -dy) ;//* 180/ Math.PI;
			sniper.setXYRWH(sniper.getXYRWH().x,
							sniper.getXYRWH().y,
							rot,
							sniper.getXYRWH().w,
							sniper.getXYRWH().h);
							sniper.getSprite().setXYR(
										sniper.getSprite().getXYR().x,
										sniper.getSprite().getXYR().y,
										rot);
							
							sniper.setTargetXY(e.clientX, e.clientY);
							sniper.targetTo();
} // END MOVE SNIPER FUNCTION


		window.onclick = function(e) {
				events = e;
				
				switch (e.which) {
					case 1: /* fire missl */
							/* add variable is firing to prevent moving  */
							sniper.fireMisseleTo(e.clientX, e.clientY);
							break;
							
					case 2: /*nothing*/ break;
					
					case 3: /* MOVE TO DEST */
							/* if firefox */
							if ( ! window.chrome ) {
								moveSniper(e);
							}
							break;
					default:break;
					}		
			}

		window.oncontextmenu = function(e) {
			/* if googlechrome */
			e.preventDefault();
			console.log("#DISABLE RCLICK"+e.clientX+":"+e.clientY);
			if ( window.chrome ) {
				console.log("GOOGLE CHROME");
				moveSniper(e);
			}
	   }
		
	
		/* poor man`s pause button - SPACE */
	   var isPressed = 0;
	   window.onkeydown = function(e) {
		   if ( e.keyCode == 32 ) {
			   if ( isPressed++ % 2 == 0 ) {
				   isPaused = false;
				   mainrender(1000);
			   } else {
				   isPaused = true;
				   mainrender(1000);
			   }
		   } 
	   } // end PAUSE option
	    
}; // END wondow.onload(); 			


/*************************************************************************/
