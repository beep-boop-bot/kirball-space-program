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
        `<div class="card text-white bg-${nextDict[val]} mb-3" style="max-width: 20rem;">
            <div class="card-header">ネクスト</div>
            <div class="card-body">
                <img src="./assets/smile_${nextDict[val]}.svg" style="height: auto; width: ${0.13*val*55}%">
            </div>
        </div>
        `
    );
    $('#ufo').attr('src', `./assets/ufo_${nextDict[val]}.svg`);
}

// TODO: this is just the next ball
// I need to show the next next ball also
// the ufo color will indicate the next ball
// the side info will show the next next ball

const getNextVal = () => {
    return Math.floor(Math.random() * 5) + 1;
}

// show the next ball
var val = getNextVal();
updateNext(val);

// update score
var score = 0;
var highVal = val;
const updateScore = (score, highVal) => {
    $('#score').html(
        `<li class="list-group-item list-group-item-${nextDict[highVal]} d-flex justify-content-between align-items-center">
            スコア
            <button type="button" class="btn btn-${nextDict[highVal]} btn-lg" disabled>${score}</button>
        </li>`
    )
}
updateScore(score, highVal);

const updateHighScores = (currHigh) => {
    var pastFirst = parseInt(localStorage.getItem("first")) || 0;
    var pastSecond = parseInt(localStorage.getItem("second")) || 0;
    var pastThird = parseInt(localStorage.getItem("third")) || 0;
    var highs = [pastFirst, pastSecond, pastThird, currHigh];
    highs.sort((a, b) => b - a);
    $('#high').html(
        `<div class="card text-white bg-primary mb-3" style="max-width: 20rem;">
            <div class="card-header">ハイスコア</div>
            <div class="card-body">
                1: <button type="button" class="btn btn-blue">${highs[0]}</button>
                <br>
                2: <button type="button" class="btn btn-purple">${highs[1]}</button>
                <br>
                3: <button type="button" class="btn btn-cyan">${highs[2]}</button>
            </div>
        </div>`
    );
} 
updateHighScores(score);

// TODO: try making the box a different color than the background and the walls the same color as the background
// maybe pink on black?

// add balls on spacebar

var canDrop = true;

var mouse = Mouse.create(render.canvas);
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && canDrop) {
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
        val = getNextVal();
        updateNext(val);
        canDrop = false;
        setTimeout(() => { canDrop=true; }, 1000)
    }
})
render.mouse = mouse;

// combine balls on collision if they are the same size
Events.on(engine, 'collisionStart', (event) => {
    var pairs = event.pairs;

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        if (pair.bodyA.label=='kirball' && pair.bodyB.label=='kirball') {
            if (pair.bodyA.position.y < 50 || pair.bodyB.position.y < 50) {
                alert(`
⠀⠀⠀⠀⠀⠀⣠⢤⠀⠀⠀⠀⣠⢤⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣅⣨⣇⠀⠀⠀⣇⣀⣇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⣿⡷⠀⠀⠀⣿⣿⣿⠀⠀⠀⠀⠀
⢠⠒⠀⠒⢤⠘⢯⡽⠁⠀⠀⠀⢷⣭⠇⢀⠤⠀⠠⢄
⠈⠒⠀⠘⠊⠀⠀⠀⠈⠒⠒⠊⠀⠀⠀⠈⠂⠭⠭⠞⠀⠀⠀⠀⠀⠀⠀⠀⠀

                ゲームオーバー！ スコア：${score}
                `);
                runner.enabled = false;
                if (score > localStorage.getItem("first")) {
                    localStorage.setItem("third", localStorage.getItem("second"));
                    localStorage.setItem("second", localStorage.getItem("first"));
                    localStorage.setItem("first", score.toString());
                } else if (score > localStorage.getItem("second")) {
                    localStorage.setItem("third", localStorage.getItem("second"));
                    localStorage.setItem("second", score.toString());
                } else if (score > localStorage.getItem("third")) {
                    localStorage.setItem("third", score.toString())
                }
                $("#retry").html(
                    `<button type="button" class="btn btn-warning btn-lg" onClick="window.location.reload()">↻</button>`
                )
            }
        }
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
            updateHighScores(score);
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

// run engine and renderer
var runner = Engine.run(engine);
Render.run(render);