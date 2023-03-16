/*
    This file stores features that I coded but decided not to implement
*/

// allow the player to move (with acceleration effect)
var prevW = 0, prevA = 0, prevS = 0, prevD = 0, accelTime = 40;
if (keys.KeyW) { // it knows the event code for the key and checks if keys[event code] == true (key pressed) this is all built in with the way i set up the key array down below
    if (player.y > 3 + player.radius) { // this and the 3 other if statements prevent the player from going off screen
            if (prevW < accelTime) {
            player.y -= (player.speed * prevW + 10) / accelTime;
        }
        else {
            player.y -= player.speed;
            }
    }
        prevW++;
}
    else {
    prevW = 0;
}
if (keys.KeyS) {
    if (player.y < canvas.height - player.radius - 3) {
            if (prevS < accelTime) {
            player.y += (player.speed * prevS + 10) / accelTime;
        }
        else {
            player.y += player.speed;
            }
    }
        prevS++;
}
    else {
    prevS = 0;
}
if (keys.KeyA) {
    if (player.x > player.radius + 3) {
            if (prevA < accelTime) {
            player.x -= (player.speed * prevA + 10) / accelTime;
        }
        else {
            player.x -= player.speed;
            }
    }
        prevA++;
}
    else {
    prevA = 0;
}
if (keys.KeyD) {
    if (player.x < canvas.width - player.radius - 3) {
            if (prevD < accelTime) {
            player.x += (player.speed * prevD + 10) / accelTime;
        }
        else {
            player.x += player.speed;
            }
    }
        prevD++;
}
    else {
    prevD = 0;
}