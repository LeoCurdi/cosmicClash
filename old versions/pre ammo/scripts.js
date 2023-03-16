
// Set up the canvas and context
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
canvas.width = window.innerWidth * 1;
canvas.height = window.innerHeight * 1;

var upperLeftScoreDisplay = document.querySelector('#score'); // score stuff
var bigScoreDisplay = document.querySelector('#bigScoreDisplay'); // this displays the score on the start game screen
var startGameButton = document.querySelector('#startGameButton'); // this controls when the user clicks start game
var startGameBlock = document.querySelector('#startGameBlock'); // this controls when the end game / start game screen pops up
scoreUpperLeft.style.display= 'none' // dont display the score in the upper left until the game starts

// define the player
var player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 6,
    color: 'blue'
};

// define the entity arrays
var projectiles = [], enemyArray = [], particles = [];

// let the player shoot projectiles. theres a lot of math here that allows the projectiles to fire in the direction of the mouse click
// first you have to calibrate the mouse pos for the canvas being smaller than the screen
canvas.addEventListener('mousedown', function(event) {
    const screen = canvas.getBoundingClientRect();
    const scaleX = canvas.width / screen.width;
    const scaleY = canvas.height / screen.height;

    var angle = Math.atan2(((event.clientY - screen.top) * scaleY) - player.y, ((event.clientX - screen.left) * scaleX) - player.x);
    var velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
    projectiles.push({ x: player.x, y: player.y, size: 7, color: '#fff', velocity });
});


let animationID;
let scoreTrack = 0, pulse = 1, ammo = 100;
function runGame() {
    // Clear the canvas each time you regenerate. skipping this gets you a sick trail effect though
    // context.clearRect(0, 0, canvas.width, canvas.height);
    // Request the next frame (loop iteration) (unless the player just died)
    animationID = window.requestAnimationFrame(runGame);
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    //context.globalAlpha = 0.5;

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
        let speed = 1; // adjust as needed
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        // update enemy direction
        enemyArray[i].dx = vx;
        enemyArray[i].dy = vy;
        enemyArray[i].x += enemyArray[i].dx; // increase x pos by whatever the specific item's x speed is
        enemyArray[i].y += enemyArray[i].dy; // same
    }

    // update position, size, and velocity of particles
    var resistance = .98
    for (var i = 0; i < particles.length; i++) {
        particles[i].dx *= resistance;
        particles[i].dy *= resistance;

        particles[i].x += particles[i].dx; // increase x pos by whatever the specific item's x speed is
        particles[i].y += particles[i].dy; // same

        particles[i].size -= 0.05; // increase x pos by whatever the specific item's x speed is
        if (particles[i].size < 0.03) {
            particles.splice(i, 1); // remove particles once they've fully shrunk
            i--; // have to decrease i if a particle gets removed becuase the particle.length value in the for condition will also decrease
        }
    }


    // make something pulse
/*     if (pulse === 1) {
        if (player.radius < 21.5) {
            player.radius += .2;
        }
        else {
            player.radius -= .2;
            pulse = -1;
        }
    }
    else if (pulse === -1) {
        if (player.radius > 18.5) {
            player.radius -= .2;
        }
        else {
            player.radius += .2;
            pulse = 1;
        }
    } */


    // remove projectiles when they go off screen so we dont infinitely overload the array
    for (var i = 0; i < projectiles.length; i++) {
        if (projectiles[i].x < 0 || projectiles[i].x > canvas.width) {
            //projectiles.splice(i, 1); // for some reason this makes the screen flicker
            //i--; // have to decrease i if a projectile gets removed becuase the projectile.length value in the for condition will also decrease
        }
        if (projectiles[i].y < 0 || projectiles[i].y > canvas.height) {
            projectiles.splice(i, 1);
            i--;
        }
    }

// end game
    // check for enemy collision with player (game over). call game over screen
    for (var i = 0; i < enemyArray.length; i++) {
        var dx = player.x - enemyArray[i].x; // center of player - center of enemy
        var dy = player.y - enemyArray[i].y; // same thing for y
        var distance = Math.sqrt(dx * dx + dy * dy); // use really hard math to calculate the enemy's distance from the center of the player
        if (distance < player.radius) { // if center of enemy is within the players circumference, game over
            cancelAnimationFrame(animationID);
            startGameBlock.style.display = 'flex';
            instructions.style.display = 'flex';
            scoreUpperLeft.style.display= 'none';
            bigScoreDisplay.innerHTML = scoreTrack;
        }
    }

// check for projectile collision with enemies. This is fucked because it checks each enemy against each projectile
    for (var i = 0; i < enemyArray.length; i++) {
        for (var j = 0; j < projectiles.length; j++) {
            var dx = enemyArray[i].x - projectiles[j].x; // center of enemy - center of projectile
            var dy = enemyArray[i].y - projectiles[j].y; // same
            var distance = Math.sqrt(dx * dx + dy * dy); // really hard math again
            distance -= 5; // make it a little more generous to the player
            if (distance < enemyArray[i].size) { // if center of projectile is within the enemy's circumference, shrink or delete enemy
                // particle stuff
                // Generate particles with random sizes, directions, and velocity
                var len = particles.length;
                for (var k = len; k < len + 12; k++) {
                    var x = enemyArray[i].x;
                    var y = enemyArray[i].y;
                    var dx = (Math.random() - 0.5) * 8; // get a random number [-5,5] for speed
                    var dy = (Math.random() - 0.5) * 8; // same
                    var size = Math.floor(Math.random() * 4) + 1; // get a random size 1-5
                    //var color = 'green';
                    var color = enemyArray[i].color;
                    particles.push({ x: x, y: y, size: size, dx: dx, dy: dy, color: color}); // dynamically add the new food item to the array
                }

                if (enemyArray[i].size > 25) {
                    gsap.to(enemyArray[i], {size: enemyArray[i].size - 15})
                    projectiles.splice(j, 1); // delete the projectile (this prevents 2 birds with one stone)
                    j--;
                    // score stuff
                    scoreTrack += 100;
                    upperLeftScoreDisplay.innerHTML = scoreTrack;
                }
                else {
                    enemyArray.splice(i, 1); // this removes the enemy item (i) that was hit by a projectile
                    i--; // have to decrease i if an enemy gets removed becuase the enemy.length value in the for condition will also decrease
                    projectiles.splice(j, 1); // delete the projectile (this prevents 2 birds with one stone)
                    j--;
                    // score stuff
                    scoreTrack += 150;
                    upperLeftScoreDisplay.innerHTML = scoreTrack;
                }
            }
        }     
    }


// draw stuff
    // Draw the player
    context.beginPath();
    context.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    context.fillStyle = player.color;
    context.fill();

    // draw the projectiles
    projectiles.forEach((projectile) => {
        context.fillStyle = projectile.color;
        context.beginPath();
        context.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        context.fill();
    
        projectile.x += projectile.velocity.x;
        projectile.y += projectile.velocity.y;
    });

    // draw the particles
    for (var i = 0; i < particles.length; i++) {
        context.beginPath();
        context.arc(particles[i].x, particles[i].y, particles[i].size, 0, 2 * Math.PI);
        context.fillStyle = particles[i].color;
        context.fill();
    }

    // draw the enemies
    for (var i = 0; i < enemyArray.length; i++) {
        context.beginPath();
        context.arc(enemyArray[i].x, enemyArray[i].y, enemyArray[i].size, 0, 2 * Math.PI);
        context.fillStyle = enemyArray[i].color;
        context.fill();
    }


// generate enemies
    if (Math.random() < .02) { // the number controls the frequency that food is generated. random gives u a random decimal from 0-1. so if num < .05, then we will generate a new food every 20 iterations (which is probably like 1/3 of a second)
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

        var size = Math.floor(Math.random() * 30) + 15;
        //var color = 'green';
        var color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
        enemyArray.push({ x: x, y: y, size: size, dx: dx, dy: dy, color: color });
    }
}

// Set up the key listeners
var keys = {};
document.addEventListener('keydown', function(event) {
  keys[event.code] = true; // whatever key you press down, the corresponding cell in the key array will register it
});
document.addEventListener('keyup', function(event) {
  keys[event.code] = false;
});

// start game button listener
startGameButton.addEventListener('click', () => {
    // initialize everything to 0 for when the player wants to play another round
    particles = [];
    enemyArray = [];
    projectiles = [];
    scoreTrack = 0;
    upperLeftScoreDisplay.innerHTML = scoreTrack;
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 20,
        speed: 6,
        color: 'blue'
    };
    runGame() // Start the game loop
    startGameBlock.style.display = 'none' // set the start block to not display
    instructions.style.display = 'none' // set the instructions to not display
    scoreUpperLeft.style.display= 'flex' // start displaying the score in the upper left corner
});

