
// boilerplate set up stuff

// Set up the canvas and context
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth * 1;
canvas.height = window.innerHeight * 1;

// grab the HTML elements
var upperLeftScoreDisplay = document.querySelector('#score'); // score stuff
var ammoDisplay = document.querySelector('#ammo');
var bigScoreDisplay = document.querySelector('#bigScoreDisplay'); // this displays the score on the start game screen
var startGameButton = document.querySelector('#startGameButton'); // this controls when the user clicks start game
var viewTutorialButton = document.querySelector('#viewTutorialButton');
var startGameBlock = document.querySelector('#startGameBlock'); // this controls when the end game / start game screen pops up
scoreUpperRight.style.display= 'none'; // dont display the score in the upper left until the game starts
ammoUpperLeft.style.display = 'none';
// tutorial stuff
var nextButton1 = document.querySelector('#nextButton1');
var nextButton2 = document.querySelector('#nextButton2');
var skipTutorialButton1 = document.querySelector('#skipTutorialButton1');
var skipTutorialButton2 = document.querySelector('#skipTutorialButton2');
var skipTutorialButton3 = document.querySelector('#skipTutorialButton3');
var tutorialPg1 = document.querySelector('#tutorialPg1');
var tutorialPg2 = document.querySelector('#tutorialPg2');
var tutorialPg3 = document.querySelector('#tutorialPg3');
var tutorialBlock = document.querySelector('#tutorialBlock');



// event listeners

// view tutorial button in the start screen
viewTutorialButton.addEventListener('click', () => {
    tutorialPg3.style.display = 'flex';
    tutorialPg2.style.display = 'flex';
    tutorialPg1.style.display = 'flex';
});

// skip and done button in the tutorial
skipTutorialButton1.addEventListener('click', () => {
    tutorialPg1.style.display = 'none';
    tutorialPg2.style.display = 'none';
    tutorialPg3.style.display = 'none';
});
skipTutorialButton2.addEventListener('click', () => {
    tutorialPg2.style.display = 'none';
    tutorialPg3.style.display = 'none';
});
skipTutorialButton3.addEventListener('click', () => {
    tutorialPg3.style.display = 'none';
});

// next button in the tutorial
nextButton1.addEventListener('click', () => {
    tutorialPg1.style.display = 'none';
});
nextButton2.addEventListener('click', () => {
    tutorialPg2.style.display = 'none';
});

// start game button on start screen
startGameButton.addEventListener('click', () => {
    startGame();
});

// mouse click
canvas.addEventListener('mousedown', function(event) {
    shootProjectile(event);
});

// Set up an array to store all key events (this will cover listening for the entire keyboard, just check the keys array to see whats pressed)
var keys = {};
document.addEventListener('keydown', function(event) {
keys[event.code] = true; // whatever key you press down, the corresponding cell in the key array will register it
});
document.addEventListener('keyup', function(event) {
keys[event.code] = false;
});



// define variables

// define the player
var player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: playerRadius,
    speed: playerSpeed,
    color: 'blue',
    innerRadius: playerRadius / 2,
    innerColor: 'black'
};

// define the entity arrays
var projectileArray = [], enemyArray = [], particleArray = [], ammoBlobArray = [], bombArray = [], starArray = [], spaceShipImageArray = [], spaceShipImageColorArray = ['#ff1414', '#80dc54', '#40b4fc', '#d06ce4'];

// define values for the game (this lets me change game values much easier)
var scale = .65; // with this one variable, i can adjust the scale of the entire game
var playerRadius = 20*scale, playerSpeed = 6.5*scale, innerDotScale = .5;
var projRadius = 7*scale, projSpeed = 9*scale;
var enemyRadiusMin = 15*scale, enemyRadiusMax = 45*scale, enemyMinBrightness = 40, enemySpawnFreq = 0.000005*time, enemySpeed = 1*scale, enemyShrinkOrDeleteSize = 25*scale, enemyShrinkBy = 15*scale, particleRadiusMin = 1*scale, particleRadiusMax = 4*scale, particleSpeed = 6*scale;
var ammoRadius = 13*scale, ammoSpawnFreq, ammoSpawnFreq1 = 0.0014, ammoStart = 50, ammoIncrements = 25;
var bombRadius = 28*scale, bombSpawnFreq = .0003;
var starRadius = 0.01, starOpacity = .12;

// load spaceship images
for (let i = 1; i <= 4; i++) {
    let ship = new Image();
    ship.src = 'pics/spaceShips/' + i + '.png';
    spaceShipImageArray.push(ship);
}




// functions

// start the game (this is when the user clicks start game from the start screen)
function startGame() {
    // initialize everything to 0 for when the player wants to play another round
    particleArray = [], enemyArray = [], projectileArray = [], ammoBlobArray = [], bombArray = [];
    scoreTrack = 0, ammoTrack = ammoStart;
    upperLeftScoreDisplay.innerHTML = scoreTrack;
    ammoDisplay.innerHTML = ammoTrack;
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: playerRadius,
        speed: playerSpeed,
        color: '#0000ff',
        innerRadius: playerRadius * innerDotScale,
        innerColor: '#0a0a49'
    };
    runGame() // Start the game loop
    // background music
    var music = document.getElementById("music");
    //var newMusic = music.cloneNode()
    music.volume = 0.35;
    music.play();
    startGameBlock.style.display = 'none' // set the start block to not display
    scoreUpperRight.style.display = 'flex' // start displaying the score in the upper left corner
    ammoUpperLeft.style.display = 'flex' // start displaying ammo
}

// let the player shoot projectiles. theres a lot of math here that allows the projectiles to fire in the direction of the mouse click
function shootProjectile(event) {
    const screen = canvas.getBoundingClientRect();
    const scaleX = canvas.width / screen.width;
    const scaleY = canvas.height / screen.height;

    // shoot a single projectile on mouse click
    var angle = Math.atan2(((event.clientY - screen.top) * scaleY) - player.y, ((event.clientX - screen.left) * scaleX) - player.x); // you have to calibrate the mouse pos for the canvas being smaller than the screen
    var velocity = { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed };
    if (ammoTrack > 0) { // keep tack of ammo. only shoot if player has ammo
        
        // load and play laser sound effect. Loading it and cloning it here is how i got it to work on rapid fire
        const shoot = document.getElementById("shoot");
        const newShoot = shoot.cloneNode()
        newShoot.volume = 0.1;
        newShoot.play()

        projectileArray.push({ x: player.x, y: player.y, size: projRadius, color: 'white', velocity });
        ammoTrack--;
        ammoDisplay.innerHTML = ammoTrack;
    }

    // then set up a function too continuously shoot when the mouse is held down
    // first add an event listener to detect when the mouse moves so you can still aim while rapid firing
    canvas.addEventListener('mousemove', (event1) => {
        const rect = canvas.getBoundingClientRect(); // get the current position of the mouse relative to the canvas
        mouseX = event1.clientX - rect.left;
        mouseY = event1.clientY - rect.top;
    });
    // the function for continuously shooting when the mouse is held down
    const intervalId = setInterval(() => {
        var angle = Math.atan2(((mouseY - screen.top) * scaleY) - player.y, ((mouseX - screen.left) * scaleX) - player.x); // update the position of the mouse at each interval
        var velocity = { x: Math.cos(angle) * projSpeed, y: Math.sin(angle) * projSpeed };
        if (ammoTrack > 0) { // keep tack of ammo. only shoot if player has ammo
                    
            // load and play laser sound effect. Loading it and cloning it here is how i got it to work on rapid fire
            const shoot = document.getElementById("shoot");
            const newShoot = shoot.cloneNode()
            newShoot.volume = 0.1;
            newShoot.play()

            projectileArray.push({ x: player.x, y: player.y, size: projRadius, color: 'white', velocity });
            ammoTrack--;
            ammoDisplay.innerHTML = ammoTrack;
        }
    }, 150); // the amount of milliseconds between each shot
    // listen for then the mouse button is release
    canvas.addEventListener('mouseup', () => { 
        clearInterval(intervalId); // stop the loop
    });
}

// check how close a color is to black by calculating the brightness
function getBrightness(color) {
    // Strip the rgb values from the color string
    const [r, g, b] = color.match(/\d+/g).map(Number);
    // Calculate the perceived brightness using the formula
    return Math.sqrt(0.299 * (r ** 2) + 0.587 * (g ** 2) + 0.114 * (b ** 2));
  }

// run game (animation) function 
var time = 0;
let animationID;
let scoreTrack = 0, ammoTrack = ammoStart;
let lastTimeStamp = 0, fps = 60, targetFrameTime = 1000 / fps; // try to normalize game speed on high refresh rate monitors
function runGame(timestamp) { // timestamp is audotmatically given by the browser

// new animation frame stuff
    // Clear the canvas each time you regenerate. skipping this gets you a sick trail effect though
    // context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Request the next frame (loop iteration) (unless the player just died)
    //animationID = window.requestAnimationFrame(runGame);

    // calculate how fast the frame rate is an set an appropriate delay
    const timeElapsed = timestamp - lastTimeStamp; // this gets us time between each frame
    lastTimeStamp = timestamp;
    const frameRateCalibration = targetFrameTime - timeElapsed; // work out if we need to delay the next frame

    // request the next frame, with the appropriate delay
    timeoutId = setTimeout(() => {
        animationID = window.requestAnimationFrame(runGame); // request frame
    }, frameRateCalibration); // delay the next frame

    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    console.log("Frame:", time, " frameLength:", timeElapsed);
    
// update the ramp-up aspects of the early game
    time++;
    if (time < 15000) { // ramp up enemy spawn rate until time hits 15k (15k / 60fps = 250 seconds)
        enemySpawnFreq = (0.01 * (time / 10000)) + 0.005 // ramp up enemy spawn rate
    }
    if (ammoTrack === 0 && ammoBlobArray.length < 4) { // decrease the odds of getting unlucky with ammo spawns
        ammoSpawnFreq = 0.004;
    }
    else if (ammoTrack > 200) {
        ammoSpawnFreq = 0.0007;
    }
    else {
        ammoSpawnFreq = ammoSpawnFreq1;
    }


// allow the player to move
    if (keys.KeyW) { // it knows the event code for the key and checks if keys[event code] == true (key pressed) this is all built in with the way i set up the key array down below
        if (player.y > 3 + player.radius) { // this and the 3 other if statements prevent the player from going off screen
            player.y -= player.speed;
        }
    }
    if (keys.KeyS) {
        if (player.y < canvas.height - player.radius - 3) {
            player.y += player.speed;
        }
    }
    if (keys.KeyA) {
        if (player.x > player.radius + 3) {
            player.x -= player.speed;
        }
    }
    if (keys.KeyD) {
        if (player.x < canvas.width - player.radius - 3) {
            player.x += player.speed;
        }
    }


// update stuff
    // Update the position of the enemies
    for (var i = 0; i < enemyArray.length; i++) {
        if (enemyArray[i].isDead === 0) {
            // Get the position of the player and enemy
            let playerX = player.x;
            let playerY = player.y;
            let enemyX = enemyArray[i].x;
            let enemyY = enemyArray[i].y;
            // Calculate the distance between the player and enemy
            let ex = playerX - enemyX;
            let ey = playerY - enemyY;
            let distance = Math.sqrt(ex*ex + ey*ey);
            // Calculate the angle between the player and enemy
            let angle = Math.atan2(ey, ex);
            // Use the angle to determine the direction that the enemy should move
            let speed = enemySpeed; // adjust as needed
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            // update enemy direction
            enemyArray[i].dx = vx;
            enemyArray[i].dy = vy;
            enemyArray[i].x += enemyArray[i].dx; // increase x pos by whatever the specific item's x speed is
            enemyArray[i].y += enemyArray[i].dy; // same
        }
        else { // if enemy is dead
            enemyArray[i].dy += .2;
            enemyArray[i].y += enemyArray[i].dy;
            if (enemyArray[i].y > canvas.height) {
                enemyArray.splice(i, 1);
            }
        }
    }

    // update position, size, and velocity of particles
    var resistance = .985
    for (var i = 0; i < particleArray.length; i++) {
        particleArray[i].dx *= resistance;
        particleArray[i].dy *= resistance;

        particleArray[i].x += particleArray[i].dx; // increase x pos by whatever the specific item's x speed is
        particleArray[i].y += particleArray[i].dy; // same

        particleArray[i].size -= 0.04; // increase x pos by whatever the specific item's x speed is
        if (particleArray[i].size < 0.03) {
            particleArray.splice(i, 1); // remove particles once they've fully shrunk
            i--; // have to decrease i if a particle gets removed becuase the particle.length value in the for condition will also decrease
        }
    }


    // make ammo blobs pulse
    for (var i = 0; i < ammoBlobArray.length; i++) {    
        if (ammoBlobArray[i].pulse === 1) {
            if (ammoBlobArray[i].radius < ammoRadius + 1.5) {
                ammoBlobArray[i].radius += .5;
            }
            else {
                ammoBlobArray[i].radius -= .15;
                ammoBlobArray[i].pulse = -1;
            }
        }
        else if (ammoBlobArray[i].pulse === -1) {
            if (ammoBlobArray[i].radius > ammoRadius - 1.5) {
                ammoBlobArray[i].radius -= .15;
            }
            else {
                ammoBlobArray[i].radius += .5;
                ammoBlobArray[i].pulse = 1;
            }
        }
    }

    // make bombs pulse
    for (var i = 0; i < bombArray.length; i++) {    
        if (bombArray[i].pulse === 1) {
            if (bombArray[i].radius < bombRadius + 1.5) {
                bombArray[i].radius += .5;
            }
            else {
                bombArray[i].radius -= .15;
                bombArray[i].pulse = -1;
            }
        }
        else if (bombArray[i].pulse === -1) {
            if (bombArray[i].radius > bombRadius - 1.5) {
                bombArray[i].radius -= .15;
            }
            else {
                bombArray[i].radius += .5;
                bombArray[i].pulse = 1;
            }
        }
    }


    // remove projectiles when they go off screen so we dont infinitely overload the array
    for (var i = 0; i < projectileArray.length; i++) {
        if (projectileArray[i].x < 0 || projectileArray[i].x > canvas.width) {
            projectileArray.splice(i, 1);
            i--; // have to decrease i if a projectile gets removed becuase the projectile.length value in the for condition will also decrease
        }
        else if (projectileArray[i].y < 0 || projectileArray[i].y > canvas.height) {
            projectileArray.splice(i, 1);
            i--;
        }
    }

    // remove stars when they go off screen so we dont infinitely overload the array
    for (var i = 0; i < starArray.length; i++) {
        if (starArray[i].x < 0 || starArray[i].x > canvas.width) {
            starArray.splice(i, 1);
            i--; // have to decrease i if a star gets removed becuase the stars.length value in the for condition will also decrease
        }
        else if (starArray[i].y < 0 || starArray[i].y > canvas.height) {
            starArray.splice(i, 1);
            i--;
        }
    }


// end game
    // check for enemy collision with player (game over). call game over screen
    for (var i = 0; i < enemyArray.length; i++) {
        var dx = player.x - enemyArray[i].x; // center of player - center of enemy
        var dy = player.y - enemyArray[i].y; // same thing for y
        var distance = Math.sqrt(dx * dx + dy * dy); // use really hard math to calculate the enemy's distance from the center of the player
        if (distance < enemyArray[i].size && enemyArray[i].isDead === 0) { // if center of player is within the enemy's circumference, and the enemy wasnt just killed by a bomb, game over
            console.log("enemies: ", enemyArray.length, " bombs: ", bombArray.length, " projectiles: ", projectileArray.length, " particles: ", particleArray.length, " ammo: ", ammoBlobArray.length, " stars: ", starArray.length);
            music.pause(); // cut the music on death
            music.currentTime = 0; // set the song back to the beginning
            cancelAnimationFrame(animationID);
            clearTimeout(timeoutId);
            startGameBlock.style.display = 'flex';
            scoreUpperRight.style.display = 'none';
            ammoUpperLeft.style.display = 'none';
            bigScoreDisplay.innerHTML = scoreTrack;
        }
    }

// check for projectile collision with enemies. This is fucked because it checks each enemy against each projectile
    for (var i = 0; i < enemyArray.length; i++) {
        for (var j = 0; j < projectileArray.length; j++) {
            var dx = enemyArray[i].x - projectileArray[j].x; // center of enemy - center of projectile
            var dy = enemyArray[i].y - projectileArray[j].y; // same
            var distance = Math.sqrt(dx * dx + dy * dy); // really hard math again
            distance -= 5; // make it a little more generous to the player
            if (distance < enemyArray[i].size) { // if center of projectile is within the enemy's circumference, shrink or delete enemy
                        
                // load and play hit sound effect. Loading it and cloning it here is how i got it to work on rapid fire
                const hit = document.getElementById("hit");
                const newHit = hit.cloneNode()
                //newHit.volume = 0.2;
                newHit.play()

                // particle stuff
                // Generate particles with random sizes, directions, and velocity
                var len = particleArray.length;
                for (var k = len; k < len + 12; k++) {
                    var x = enemyArray[i].x;
                    var y = enemyArray[i].y;
                    var dx = (Math.random() - 0.5) * particleSpeed * 2; // get a random number [-4,4] for speed
                    var dy = (Math.random() - 0.5) * particleSpeed * 2; // same
                    var size = (Math.random() * particleRadiusMax - particleRadiusMin) + particleRadiusMin; // get a random size
                    var color = enemyArray[i].color;
                    particleArray.push({ x: x, y: y, size: size, dx: dx, dy: dy, color: color}); // dynamically add the new food item to the array
                }

                if (enemyArray[i].size > enemyShrinkOrDeleteSize) {
                    gsap.to(enemyArray[i], {size: enemyArray[i].size - enemyShrinkBy})
                    projectileArray.splice(j, 1); // delete the projectile (this prevents 2 birds with one stone)
                    j--;
                    // score stuff
                    scoreTrack += 100;
                    upperLeftScoreDisplay.innerHTML = scoreTrack;
                }
                else {
                    enemyArray.splice(i, 1); // this removes the enemy item (i) that was hit by a projectile
                    if (i > 0) {
                        i--; // have to decrease i if an enemy gets removed becuase the enemy.length value in the for condition will also decrease
                    }
                    projectileArray.splice(j, 1); // delete the projectile (this prevents 2 birds with one stone)
                    j--;
                    // score stuff
                    scoreTrack += 150;
                    upperLeftScoreDisplay.innerHTML = scoreTrack;
                }
            }
        }     
    }

    // Check for player collisions with ammo blobs
    for (var i = 0; i < ammoBlobArray.length; i++) {
        var dx = player.x - ammoBlobArray[i].x; // center of player - center of ammo
        var dy = player.y - ammoBlobArray[i].y; // same thing for y
        var distance = Math.sqrt(dx * dx + dy * dy); // use really hard math to calculate the food's distance from the center of the player
        if (distance < player.radius + ammoRadius) { // if center of ammo blob is within the players circumference, add ammo
                    
            // load and play coin sound effect. Loading it and cloning it here is how i got it to work on rapid fire
            const coin = document.getElementById("ammoSound");
            const newCoin = coin.cloneNode()
            //newCoin.volume = 0.1;
            newCoin.play()

            ammoTrack += ammoIncrements;
            ammoDisplay.innerHTML = ammoTrack;
            ammoBlobArray.splice(i, 1); // this removes the food item (i) that collided with the player from the array
            i--; // have to decrease i if food gets removed becuase the food.length value in the for condition will also decrease
        }
    }

    // Check for player collisions with bombs
    for (var i = 0; i < bombArray.length; i++) {
        var dx = player.x - bombArray[i].x; // center of player - center of ammo
        var dy = player.y - bombArray[i].y; // same thing for y
        var distance = Math.sqrt(dx * dx + dy * dy); // use really hard math to calculate the food's distance from the center of the player
        if (distance < player.radius + bombRadius) { // if center of ammo blob is within the players circumference, add ammo
                                
            // load and play coin sound effect. Loading it and cloning it here is how i got it to work on rapid fire
            const explosion = document.getElementById("explosion");
            const newExplosion = explosion.cloneNode()
            //newCoin.volume = 0.1;
            newExplosion.play()

            // kill all enemies 
            for (var j = 0; j < enemyArray.length; j++) {
                enemyArray[j].dx = 0;
                enemyArray[j].dy = -3;
                enemyArray[j].isDead = 1;

                // give the player some points don't be stingy
                scoreTrack += 150;
                upperLeftScoreDisplay.innerHTML = scoreTrack;
            }

            bombArray.splice(i, 1); // this removes the food item (i) that collided with the player from the array
            i--; // have to decrease i if food gets removed becuase the food.length value in the for condition will also decrease
        }
    }


// draw stuff (in order of whats behind what in the event of overlap)
    // draw stars
    context.globalAlpha = starOpacity;
    for (var i = 0; i < starArray.length; i++) {
        context.beginPath();
        context.arc(starArray[i].x, starArray[i].y, starArray[i].radius, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();
        starArray[i].x += starArray[i].dx;
        starArray[i].y += starArray[i].dy;
        starArray[i].dx *= 1.02;
        starArray[i].dy *= 1.02;
        starArray[i].radius *= 1.0215;
    }
    context.globalAlpha = 1;
    // draw the ammo
    for (var i = 0; i < ammoBlobArray.length; i++) {
        context.beginPath();
        context.arc(ammoBlobArray[i].x, ammoBlobArray[i].y, ammoBlobArray[i].radius, 0, 2 * Math.PI);
        context.fillStyle = 'yellow';
        context.fill();
        context.beginPath();
        context.arc(ammoBlobArray[i].x, ammoBlobArray[i].y, ammoBlobArray[i].radius * innerDotScale, 0, 2 * Math.PI);
        context.fillStyle = 'black';
        context.fill();
    }
    // draw bombs
    for (var i = 0; i < bombArray.length; i++) {
        context.beginPath();
        context.arc(bombArray[i].x, bombArray[i].y, bombArray[i].radius, 0, 2 * Math.PI);
        context.fillStyle = 'green';
        context.fill();
        context.beginPath();
        context.arc(bombArray[i].x, bombArray[i].y, bombArray[i].radius * innerDotScale, 0, 2 * Math.PI);
        context.fillStyle = 'black';
        context.fill();
    }
    // Draw the player
    context.beginPath();
    context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    context.fillStyle = player.color;
    context.fill();
    context.beginPath();
    context.arc(player.x, player.y, player.innerRadius, 0, 2 * Math.PI);
    context.fillStyle = player.innerColor;
    context.fill();
    // draw the enemies
    for (var i = 0; i < enemyArray.length; i++) {
/*         context.beginPath();
        context.arc(enemyArray[i].x, enemyArray[i].y, enemyArray[i].size, 0, 2 * Math.PI);
        context.fillStyle = enemyArray[i].color;
        context.fill(); */

        var image = spaceShipImageArray[enemyArray[i].col];
        context.drawImage(image, enemyArray[i].x - enemyArray[i].size * 1.5, enemyArray[i].y - enemyArray[i].size * 1.5, enemyArray[i].size * 3, enemyArray[i].size * 3);
    }
    // draw the particles
    for (var i = 0; i < particleArray.length; i++) {
        context.beginPath();
        context.arc(particleArray[i].x, particleArray[i].y, particleArray[i].size, 0, 2 * Math.PI);
        context.fillStyle = particleArray[i].color;
        context.fill();
    }
    // draw the projectiles
    projectileArray.forEach((projectile) => {
        context.fillStyle = projectile.color;
        context.beginPath();
        context.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        context.fill();
        projectile.x += projectile.velocity.x;
        projectile.y += projectile.velocity.y;
    });



// generate stuff
    // generate enemies
    if (Math.random() < enemySpawnFreq) { // the number controls the frequency that food is generated. random gives u a random decimal from 0-1. so if num < .05, then we will generate a new food every 20 iterations (which is probably like 1/3 of a second)
        // position
        var wall = Math.floor(Math.random() * 4) + 1; // 1-4
        var x, y;
        if (wall === 1) { // left side
            y = Math.random() * canvas.height;
            x = 0;
        }
        if (wall === 2) { // right side
            y = Math.random() * canvas.height;
            x = canvas.width;
        }
        if (wall === 3) { // top side
            x = Math.random() * canvas.width;
            y = 0;
        }
        if (wall === 4) { // bottom side
            x = Math.random() * canvas.width;
            y = canvas.height;
        }
        // set direction to 0 initially because it will be updated continuously during the game loop
        var dx = 0;
        var dy = 0;

        var size = (Math.random() * (enemyRadiusMax - enemyRadiusMin)) + enemyRadiusMin;
        
        var color;
        do { // this input validation loop should ensure we get an enemy color that isn't too dark
            color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
        } while (getBrightness(color) < enemyMinBrightness);

        var isDead = 0;

        var col = Math.floor(Math.random() * spaceShipImageArray.length);
        color = spaceShipImageColorArray[col];

        enemyArray.push({ x: x, y: y, size: size, dx: dx, dy: dy, color: color, isDead: isDead, col: col});
    }

    // Generate ammo blobs
    if (Math.random() < ammoSpawnFreq) {
        var x = Math.floor(Math.random() * (canvas.width - ammoRadius)) + (ammoRadius / 2);
        var y = Math.floor(Math.random() * (canvas.height - ammoRadius)) + (ammoRadius / 2);
        var radius = ammoRadius;
        var pulse = 1;
        ammoBlobArray.push({ x: x, y: y, radius: radius, pulse: pulse});
    }

    // generate bombs
    if (enemyArray.length > 10 && bombArray.length < 2) {
        if (Math.random() < bombSpawnFreq) {
            var x = Math.floor(Math.random() * (canvas.width - bombRadius)) + (bombRadius / 2);
            var y = Math.floor(Math.random() * (canvas.height - bombRadius)) + (bombRadius / 2);
            var radius = bombRadius;
            var pulse = 1;
            bombArray.push({ x: x, y: y, radius: radius, pulse: pulse});
        }
    }

    // generate stars
    if (Math.random() < 1) { // lets you generate less then 1 star per frame
        for (var k = 0; k < 5; k++) {
            var dx, dy, speed;
            dx = (Math.random() - .5) / 10; // -.05 to .05
            dy = (Math.random() - .5) / 10;
            speed = (Math.sqrt(dx * dx + dy * dy)) * 30;
            dx /= speed, dy /= speed;
    
            starArray.push({        
                x: canvas.width / 2,
                y: canvas.height / 2,
                radius: starRadius,
                dx,
                dy
            });
        }
    }
}
