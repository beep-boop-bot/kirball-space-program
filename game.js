// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	World = Matter.World,
	Constraint = Matter.Constraint,
	Runner = Matter.Runner,
	Events = Matter.Events,
	Vector = Matter.Vector,
	Body = Matter.Body,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	Bodies = Matter.Bodies;

// create engine, world, runner
var engine = Engine.create(),
	runner = Runner.create(),
	world = engine.world;

var WIDTH = 350;
var HEIGHT = 600;

// create renderer
var render = Render.create({
	element: document.getElementById("world"),
	engine: engine,
	options: {
		width: WIDTH,
		height: HEIGHT,
		showAxes: false,
		wireframes: false,
		background: "#fce4ef",
	}
});

// TODO: make the world taller and narrower
// add walls
Composite.add(world, [
    Bodies.rectangle(WIDTH/2, HEIGHT, HEIGHT, 50, { isStatic: true, render: { fillStyle: '#e05b8f' } }),
    Bodies.rectangle(WIDTH, HEIGHT/2, 50, HEIGHT, { isStatic: true, render: { fillStyle: '#e05b8f' } }),
    Bodies.rectangle(0, HEIGHT/2, 50, HEIGHT, { isStatic: true, render: { fillStyle: '#e05b8f' } }),
    Bodies.rectangle(WIDTH/2, 50, WIDTH, 2, { isStatic: true, isSensor: true, render: { lineWidth: 1, fillStyle: 'transparent', strokeStyle: '#888' } })
]);

// determine colors based on value
const colorsDict = {
    1: '#78c2ad',
    2: '#f3969a',
    3: '#56cc9d',
    4: '#ff7851',
    5: '#ffce67',
    6: '#6cc3d5',
    7: '#fd7e14',
    8: '#6610f2',
    9: '#6cc3d5',
    10: '#6f42c1',
    11: '#007bff'
}

const nextDict = {
    1: 'primary',
    2: 'secondary',
    3: 'success',
    4: 'danger',
    5: 'warning',
    6: 'info',
    7: 'orange',
    8: 'indigo',
    9: 'cyan',
    10: 'purple',
    11: 'blue'
}

const updateNext = (val) => {
    $('#next').html(
        `<li class="list-group-item list-group-item-${nextDict[val]} d-flex justify-content-between align-items-center">
            ネクスト
            <span class="badge bg-${nextDict[val]} rounded-pill">${2**val}</span>
        </li>`
    );
    $('#ufo').attr('src', `./assets/ufo_${nextDict[val]}.svg`);
}

// TODO: this is just the next ball
// I need to show the next next ball also
// the ufo color will indicate the next ball
// the side info will show the next next ball

// show the next ball
var val = Math.random() < 0.7 ? 1 : Math.random() < 0.5 ? 2 : 3;
updateNext(val);

// update score
var score = 0;
var highVal = val;
const updateScore = (score, highVal) => {
    $('#score').html(
        `<li class="list-group-item list-group-item-${nextDict[highVal]} d-flex justify-content-between align-items-center">
            スコア
            <span class="badge bg-${nextDict[highVal]} rounded-pill">${score}</span>
        </li>`
    )
}
updateScore(score, highVal);

// TODO: try making the box a different color than the background and the walls the same color as the background
// maybe pink on black?

// TODO: put the score, info, and next to the side
// instead of above

// add balls on spacebar
// TODO: disable until the kirball falls all the way down
var mouse = Mouse.create(render.canvas);
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        var ufoX = $('#ufo').offset().left-$('#world').offset().left+$('#ufo').width()/2;
        World.add(world, Bodies.circle(ufoX-5*val, 0, 10*val, { 
            render: { 
                sprite: {
                    texture: `./assets/agape_${nextDict[val]}.svg`,
                    xScale: 0.13*val,
                    yScale: 0.13*val
                }, 
                fillStyle: colorsDict[val] 
            },
            label: 'kirball'
        }))
        val = Math.random() < 0.7 ? 1 : Math.random() < 0.5 ? 2 : 3;
        updateNext(val);
    }
})
render.mouse = mouse;

// TODO: modify this so that it instead allows same size kirballs
// to pass through each other for a specified timeframe, then they
// combine and grow for a specified time frame into the next size

// combine balls on collision if they are the same size
Events.on(engine, 'collisionStart', (event) => {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        // if (pair.bodyA.render.fillStyle==pair.bodyB.render.fillStyle) {
        if (pair.bodyA.circleRadius==pair.bodyB.circleRadius) {
            var oldVal = pair.bodyB.circleRadius/10;

            // 1 is already the default, so shift everything up
            pair.bodyA.collisionFilter.category = oldVal*2;
            pair.bodyA.collisionFilter.mask = 1;
            pair.bodyB.collisionFilter.category = oldVal*2;
            pair.bodyB.collisionFilter.mask = 1;

            if (pair.bodyA.velocity.y > pair.bodyB.velocity.y) {
                pair.bodyA.label = 'kirballShrink';
                pair.bodyB.label = 'kirballGrow';
            } else {
                pair.bodyA.label = 'kirballGrow';
                pair.bodyB.label = 'kirballShrink';
            }
            // World.remove(world, pair.bodyA);
            // World.remove(world, pair.bodyB);
            var newVal = pair.bodyB.circleRadius/10 + 1
            // World.add(world, Bodies.circle(
            //         (pair.bodyA.position.x+pair.bodyB.position.x)/2,
            //         (pair.bodyA.position.y+pair.bodyB.position.y)/2,
            //         10*newVal,
            //         { 
            //             render: { 
            //                 sprite: {
            //                     texture: `./assets/smile_${nextDict[newVal]}.svg`,
            //                     xScale: 0.13*newVal,
            //                     yScale: 0.13*newVal
            //                 }, 
            //             fillStyle: colorsDict[newVal] 
            //             },
            //             label: 'kirball' 
            //         }
            //     ))
            highVal = newVal > highVal ? newVal : highVal;
            score += 2*newVal;
            updateScore(score, highVal);
        }
    }
})

Events.on(engine, 'beforeUpdate', (event) => {
    var timeScale = (event.delta || (1000 / 60)) / 1000;
    // var scaleRate = 0.1;

    for (var i = 0; i < Composite.allBodies(world).length; i++) {
        var body = Composite.allBodies(world)[i];
        if (body.label == 'kirball') {
            var kirballVal = Math.floor(body.circleRadius/10);
            // Body.scale(body, 1 + (scaleRate * timeScale), 1 + (scaleRate * timeScale));
            // body.render.sprite.xScale *= 1 + scaleRate*timeScale;
            // body.render.sprite.yScale *= 1 + scaleRate*timeScale;
            if (body.speed > 0.4 || body.angularSpeed > 0.03) {
                body.render.sprite.texture = `./assets/agape_${nextDict[kirballVal]}.svg`;
            }
            else {
                body.render.sprite.texture = `./assets/smile_${nextDict[kirballVal]}.svg`;
            }
        } else if (body.label == 'kirballShrink') {
            var kirballVal = Math.floor(body.circleRadius/10);
            if (kirballVal = 1) {
                World.remove(world, body);
                break;
            }
            var scaleRate = -1;
            Body.scale(body, 1 + (scaleRate * timeScale), 1 + (scaleRate * timeScale));
            body.render.sprite.xScale *= 1 + scaleRate*timeScale;
            body.render.sprite.yScale *= 1 + scaleRate*timeScale;
        } else if (body.label == 'kirballGrow') {
            var kirballVal = Math.floor(body.circleRadius/10);
            var scaleRate = 6;
            Body.scale(body, 1 + (scaleRate * timeScale), 1 + (scaleRate * timeScale));
            body.render.sprite.xScale *= 1 + scaleRate*timeScale;
            body.render.sprite.yScale *= 1 + scaleRate*timeScale;
            var nextKirballVal = Math.floor(body.circleRadius*(1+scaleRate*timeScale)/10);
            if (nextKirballVal > kirballVal) {
                body.label = 'kirball';
                body.collisionFilter.category = 1;
                body.collisionFilter.mask = -1;
                body.circleRadius = nextKirballVal*10;
            }
            body.render.sprite.texture = `./assets/agape_${nextDict[nextKirballVal]}.svg`;
        }
    }
})

// check if the game has ended
// TODO: use default dialog
// and the conditions are:
// - contact line with velocity going up
// or stay in contact with line for a certain amount or time
// have a line like in the sensors demo for matter js
// 

// move ufo dropper and flip it based on the direction of the mouse
// adjust so that the walls are not at the top of the world
var mouseX = 0;
$(document).mousemove(function(e) {
  $("#ufo").css({
    position: 'absolute',
    // bound the ufo to within the range of the world
    left: Math.min(
            Math.max(e.pageX-$('#ufo').width()/2, $('#world').offset().left+$('#ufo').width()/2), 
            $('#world').offset().left+0.7*$('#world').width()),
    width: '5%', 
    height: 'auto',
    transform: `scaleX(${mouseX < e.pageX ? 1 : -1})`
  });
  $("#world").css({
    paddingTop: $('#ufo').height()
  });
  mouseX = e.pageX;
});

// TODO: rearrange so 2 and 8 have higher contrast (or use a different color)

// TODO: add sound effects
// should be the same sound effect for combinations, but change in tone for combos
// TODO: play around with friction

// TODO: update the probabilities for the next kirball

// run engine and renderer
var runner = Engine.run(engine);
Render.run(render);