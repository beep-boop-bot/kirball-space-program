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

// create renderer
var render = Render.create({
	element: document.getElementById("world"),
	engine: engine,
	options: {
		width: 800,
		height: 600,
		showAxes: false,
		wireframes: false,
		background: "#fce4ef",
	}
});

// add walls
Composite.add(world, [
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: { fillStyle: '#e05b8f' } }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: { fillStyle: '#e05b8f' } }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: { fillStyle: '#e05b8f' } })
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

// add balls on click
// TODO: rate-limit ball spawning
var mouse = Mouse.create(render.canvas);
render.canvas.addEventListener('click', () => {
    World.add(world, Bodies.circle(mouse.position.x, 0, 10*val, { 
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
})
render.mouse = mouse;

// prevent objects from clipping into the wall
// TODO: a function that takes bodyA position and bodyB position
// tries their average position
// checks for wall locations, checks for other body positions
// makes room above if necessary
// or use Body.scale() over a certain timescale
// TODO: prevent clips through the floor

// combine balls on collision if they are the same size
Events.on(engine, 'collisionStart', (event) => {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        if (pair.bodyA.render.fillStyle==pair.bodyB.render.fillStyle) {
            World.remove(world, pair.bodyA);
            World.remove(world, pair.bodyB);
            var newVal = pair.bodyB.circleRadius/10 + 1
            World.add(world, Bodies.circle(
                    (pair.bodyA.position.x+pair.bodyB.position.x)/2,
                    (pair.bodyA.position.y+pair.bodyB.position.y)/2,
                    10*newVal,
                    { 
                        render: { 
                            sprite: {
                                texture: `./assets/agape_${nextDict[newVal]}.svg`,
                                xScale: 0.13*newVal,
                                yScale: 0.13*newVal
                            }, 
                        fillStyle: colorsDict[newVal] 
                        },
                        label: 'kirball' 
                    }
                ))
            highVal = newVal > highVal ? newVal : highVal;
            score += 2*newVal;
            updateScore(score, highVal);
        }
    }
})

Events.on(engine, 'beforeUpdate', (event) => {
    for (var i = 0; i < Composite.allBodies(world).length; i++) {
        var body = Composite.allBodies(world)[i]
        if (body.label == 'kirball') {
            var kirballVal = body.circleRadius/10;
            if (body.speed > 0.3 || body.angular > 0.1) {
                body.render.sprite.texture = `./assets/agape_${nextDict[kirballVal]}.svg`;
            }
            else {
                body.render.sprite.texture = `./assets/smile_${nextDict[kirballVal]}.svg`;
            }
        }
    }
})

// check if the game has ended

// instructions
// with the kirby pointing to presentation meme

// move ufo dropper and flip it based on the direction of the mouse
// adjust so that the walls are not at the top of the world
// clicking on the ufo does not work
var mouseX = 0;
$(document).mousemove(function(e) {
  $("#ufo").css({
    position: 'absolute',
    left: e.pageX-$('#ufo').width()/2,
    width: '5%', 
    height: 'auto',
    transform: `scaleX(${mouseX < e.pageX ? 1 : -1})`
  });
  $("#world").css({
    paddingTop: $('#ufo').height()
  });
  mouseX = e.pageX;
});

// TODO: rearrange so 2 and 8 have higher contrast
// TODO: scores with suika seem to be 2,4,6,8,etc so change accordingly

// TODO: add sound effects
// should be the same sound effect for combinations, but change in tone for combos
// TODO: play around with friction

// TODO: update the probabilities for the next kirball

// run engine and renderer
var runner = Engine.run(engine);
Render.run(render);