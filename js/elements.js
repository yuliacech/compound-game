game.LetterObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("center");
        // if no letter, it is a gold coin
        this.renderable = game.textureItems.createSpriteFromName("coinGold.png");
        this.char = "";
        if (!this.getShape()) {
            this.addShape(new me.Rect(new me.Vector2d(0, 0), this.width, this.height));
        }
        // update the collision shape rect
        var shape = this.getShape();
        shape.pos.x = this.renderable.width / 4;
        shape.pos.y = this.renderable.height / 4;
        shape.resize(this.renderable.width / 2, this.renderable.height / 2);
        // push into array for further references
        game.letterEntities.push(this);
        this.collidable = true;
    },
    setChar: function(char) {
        // when we set the char, the coin changes into letter
        this.char = char;
        if (this.char !== "") {
            // set renderable (coin sprite) to null
            this.renderable = null;
        }
    },
    onCollision: function() {
        // play a coin sound
        me.audio.play("coin");
        // if char is not empty it is a letter
        if (this.char !== "") {
            var ind = game.data.compoundCleaned.indexOf(this.char);
            var foundBool = game.letterHUDs[ind].found;
            // look not only for the first occurence of character in the compound
            while (foundBool) {
                ind = game.data.compoundCleaned.indexOf(this.char, ind + 1);
                foundBool = game.letterHUDs[ind].found;
            }
            // set letter HUD to true to draw it not transparent
            game.letterHUDs[ind].found = true;
            // check if all collected
            game.data.allCollected = true;
            for (var i = 0; i < game.letterHUDs.length; i++) {
                if (!game.letterHUDs[i].found) {
                    game.data.allCollected = false;
                    break;
                }
            }
            // if it is the last letter 
            if (game.data.allCollected) {
                // give a bonus of 300 points
                game.data.score += 90;
                game.data.currentLevelScore += 90;
            } else {
                // it is just a letter
                game.data.score += 50;
                game.data.currentLevelScore += 50;
            }
        } else {
            // it is a coin 
            game.data.score += 30;
            game.data.currentLevelScore += 30;
        }
        // make sure it cannot be collected "again"
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
    },
    draw: function(context) {
        this.parent(context);
        if (this.char !== "") {
            this.font.draw(context, this.char, this.pos.x + 32, this.pos.y + 16);
        }
    }
});

game.LevelGateObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        this.locked = settings.locked;
        this.level = settings.level;
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32, 0.5);
        // put this level gate object to the dict for further references
        game.levelGates[settings.level] = this;
    },
    draw: function(context) {
        // add the key sprite as renderable for the entity
        if (!this.locked) {
            this.renderable = game.textureItems.createSpriteFromName("hud_keyRed.png");
        } else {
            this.renderable = game.textureItems.createSpriteFromName("hud_keyRed_disabled.png");
        }
        this.parent(context);
        this.font.draw(context, "LEVEL " + this.level, this.pos.x, this.pos.y - 15);
    }
});


game.ExitObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
    },
    onCollision: function() {
        
        
        if (game.data.allCollected && game.data.keyFound) {
            me.audio.stopTrack();
            this.collidable = false;
            // put on pause, show text, unpause with enter
            var message = "Du hast das versteckte Wort gefunden! :)<br>";
            
            // show message
            message += (game.data.currentLevel === 1) ? "<br>Beschreibe das Wort von der Ebene<br>einem zufälligen Spieler so,<br>" +
                    "dass er/sie es erraten kann.<br>" : "<br>Weiter zur Rate-das-Wort-Runde<br>";
            message += "Dein Mitspieler wird gewählt...";
        
            // change to menu with guessing dialog
            me.state.change(me.state.DIALOG, message,true);
            
            // if not the last level, put player on the next level
            if (game.data.currentLevel !== Object.keys(game.levelGates).length) {
                game.data.currentLevel += 1;
            } else {
                // player reached last level
                game.data.won = true;
            }

        }
    }
});

game.KeyObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        game.data.keyHidden = true;
        this.parent(x, y, settings);
        this.collidable = true;
        this.renderable = game.textureItems.createSpriteFromName("keyRed.png");
        // adjust hit box
        if (!this.getShape()) {
            this.addShape(new me.Rect(new me.Vector2d(0, 0), this.width, this.height));
        }
        var shape = this.getShape();
        shape.pos.x = this.renderable.width / 4;
        shape.pos.y = this.renderable.height / 4;
        shape.resize(this.renderable.width / 2, this.renderable.height / 2);
    },
    onCollision: function() {
        // play a coin sound
        me.audio.play("coin");
        // it is alerted only on the first collision
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        var x = me.video.getWidth() / 20 * 3;
        var y = me.video.getHeight() / 20;
        me.game.world.addChild(new game.HUD.KeyItem(x, y), 300);
        game.data.keyFound = true;
        game.data.score += 100*game.data.currentLevel;
        game.data.currentLevelScore += 100*game.data.currentLevel;
    }
});

game.AlertObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
    },
    onCollision: function() {
        // it is alerted only on the first collision
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        var message = "";
        switch (game.data.currentLevel) {
            case 1:
                message = 'Sammle alle Buchstaben<br>des versteckten Wortes<br>'
                        + 'und finde den Schlüßel<br>zur nächsten Ebene.<br>Viel Spaß! :)';
                break;
            case 4:
                message = 'Dilly springt jetzt höher<br>und macht sogar Doppelsprünge!<br>Pass auf, damit er nicht runter fällt';
        }
        createAlert(message);
    }
});

game.BlockObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);
        this.collidable = true;
        this.renderable = game.textureItems.createSpriteFromName("boxItem.png");
        var shape = this.getShape();
        shape.resize(this.renderable.width, this.renderable.height + 14);
    },
    onCollision: function(res, obj) {
        if (res.y < 0 && obj.jumping) {
			me.audio.play("kill");
            this.collidable = false;
            // remove it
            me.game.world.removeChild(this);
            // choose random option what to put inside the block
            var randIndex = Math.floor((Math.random() * 10) + 1);
            if (game.data.keyHidden && randIndex === 10) {
                // change if already hidden the key
                randIndex = Math.floor((Math.random() * 9) + 1);
            }
            var surprise;
            switch (randIndex) {
                case 1:
                case 2:
                case 3:
                case 4:
                    var x = this.pos.x;
                    var y = this.pos.y;
                    surprise = me.pool.pull("gem", x, y, {width: 70, height: 70});
                    break;
                case 5:
                case 6:
                case 7:
                    var x = this.pos.x;
                    var y = this.pos.y;
                    surprise = me.pool.pull("letter", x, y, {width: 70, height: 70});
                    break;
                case 8:
                    var x = this.pos.x - 105;
                    var y = this.pos.y;
                    surprise = me.pool.pull("snail", x, y, {width: 140, height: 70, fromBlock: true});
                    break;
                case 9:
                    var x = this.pos.x - 165;
                    var y = this.pos.y;
                    surprise = me.pool.pull("slime", x, y, {width: 200, height: 70, fromBlock: true});
                    break;
                case 10:
                    var x = this.pos.x;
                    var y = this.pos.y;
                    surprise = me.pool.pull("key", x, y, {width: 70, height: 70});
                    break;
            }
            var tween = new me.Tween(surprise.pos).to({y: this.pos.y - 70}, 500);
            tween.easing(me.Tween.Easing.Quadratic.Out);
            tween.start();
            me.game.world.addChild(surprise, 5);
        }
    }
});

game.GemObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        this.renderable = game.textureItems.createSpriteFromName("gemBlue.png");
        if (!this.getShape()) {
            this.addShape(new me.Rect(new me.Vector2d(0, 0), this.width, this.height));
        }
        // adjust hit box
        var shape = this.getShape();
        shape.pos.x = this.renderable.width / 4;
        shape.pos.y = this.renderable.height / 4;
        shape.resize(this.renderable.width / 2, this.renderable.height / 2);

    },
    onCollision: function() {
        // play a coin sound
        me.audio.play("coin");
        // it is alerted only on the first collision
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        game.data.score += 70;
        game.data.currentLevelScore += 70;
    }
});


game.KeyCheckObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
    },
    onCollision: function() {
        // it is alerted only on the first collision
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        if (!game.data.keyHidden) {
            var x, y;
            switch (game.data.currentLevel) {
                case 4:
                    x = 70;
                    y = 490;
                    break;
                case 5:
                    x = 910;
                    y = 350;
                    break;
            }
            game.data.keyHidden = true;
            me.game.world.addChild(me.pool.pull("key", x, y, {width: 70, height: 70}), 300);

        }
    }
});
game.TeleportObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        // create a font
        this.font = new me.BitmapFont("32x32_font", 32, 0.5);
        this.font.set("center");
    },
    onCollision: function() {
		me.audio.play("jump");
        // it is alerted only on the first collision
        this.collidable = false;
        // remove it
        me.game.world.removeChild(this);
        game.player.teleportToInitial();
    },
    draw: function(context) {
        this.font.draw(context, "NACH UNTEN", this.pos.x, this.pos.y + 35);
    }
});

game.LavaObject = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;

    },
    onCollision: function() {

        game.player.teleportToInitial();
        game.player.addDamage();
    }
});

/**
 * a HUD container and child items
 */
game.HUD = game.HUD || {};
game.HUD.Container = me.ObjectContainer.extend({
    init: function() {
        // call the constructor
        this.parent();

        // persistent across level change
        this.isPersistent = true;

        // non collidable
        this.collidable = false;

        // make sure our object is always draw first
        this.z = Infinity;
    }
});

/** 
 * a HUD Item to display found / hidden letters
 */
game.HUD.LetterItem = me.Renderable.extend({
    /** 
     * constructor
     */
    init: function(x, y, char) {
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 10, 10);
        // create a font
        this.font = new me.Font("Gretoon", 32, "#003366", "middle");
        this.font.bold();
        // character to display
        this.char = char;
        // initially letter is not found
        this.found = false;
        // make sure we use screen coordinates
        this.floating = true;
    },
    setFound: function(foundBool) {
        this.found = foundBool;
    },
    /**
     * draw the score
     */
    draw: function(context) {
        var _gAlpha = context.globalAlpha;
        if (this.found) {
            context.globalAlpha = 1;
        } else {
            context.globalAlpha = 0.5;
        }
        this.font.draw(context, this.char, this.pos.x, this.pos.y);
        context.globalAlpha = _gAlpha;
    }
});

/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 10, 10);

        // create a font
        this.font = new me.Font("Gretoon", 32, "#003366", "right");
        this.font.bold();
        // local copy of the global score
        this.score = 0;
        // make sure we use screen coordinates
        this.floating = true;
    },
    /**
     * draw the score
     */
    draw: function(context) {
        this.font.draw(context, game.data.score, this.pos.x, this.pos.y);
    }
});

/**
 * a basic HUD item to display hits/heart
 */
game.HUD.HeartItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        this.renderable = game.textureItems.createSpriteFromName("hud_heartFull.png");
        this.x = x;
        this.y = y;
        this.renderable.pos.x = x;
        this.renderable.pos.y = y;
        // local copy of the global score
        this.hits = 0;

        // make sure we use screen coordinates
        this.floating = true;
    },
    update: function(dt) {
        // we don't draw anything fancy here, so just
        // return true if the score has been updated
        if (this.hits !== game.player.hits) {
            this.hits = game.player.hits;
            if (this.hits === 1) {
                this.renderable = game.textureItems.createSpriteFromName("hud_heartHalf.png");
                this.renderable.pos.x = this.x;
                this.renderable.pos.y = this.y;
            } else if (this.hits === 2) {
                this.renderable = game.textureItems.createSpriteFromName("hud_heartEmpty.png");
                this.renderable.pos.x = this.x;
                this.renderable.pos.y = this.y;
            }
            return true;
        }
        return false;
    },
    draw: function(context) {
        this.renderable.draw(context);
    }
});

/*
 * hud to display greeting in the menu screen
 */
game.HUD.GreetingItem = me.Renderable.extend({
    // constructor
    init: function() {
        this.floating = true;
        this.parent(new me.Vector2d(0, 0), me.game.viewport.width, me.game.viewport.height);
        // font for the scrolling text
        this.font = new me.Font("Gretoon", 32, "#003366", "middle");
        this.font.bold();
        // a tween to animate the arrow
        this.scrollertween = new me.Tween(this).to({scrollerpos: -1200}, 15000).onComplete(this.scrollover.bind(this)).start();

        this.scroller = "DILLY'S ABENTEUER IN TÜBINGEN       ";
        this.scrollerpos = 540;
    },
    // some callback for the tween objects
    scrollover: function() {
        // reset to default value
        this.scrollerpos = 540;
        this.scrollertween.to({scrollerpos: -1200}, 15000).onComplete(this.scrollover.bind(this)).start();
    },
    update: function(dt) {
        //this.parent(dt);
        return true;
    },
    draw: function(context) {
        var y = me.video.getHeight() / 6;
        //this.font.draw(context, this.scroller, this.scrollerpos, y*4.5);
        this.font.draw(context, "DILLY'S ABENTEUER IN TÜBINGEN", 140, y*4.5);
    }
});
/**
 * a basic HUD item to display key
 */
game.HUD.KeyItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        this.renderable = game.textureItems.createSpriteFromName("hud_keyRed.png");
        this.x = x;
        this.y = y;
        this.renderable.pos.x = x;
        this.renderable.pos.y = y;
        // make sure we use screen coordinates
        this.floating = true;
    },

    draw: function(context) {
        this.renderable.draw(context);
    }
});

game.PlayerEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        game.player = this;
        // call the constructor
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.texturePlayer.createAnimationFromName([
            "p3_front.png", "p3_walk01.png", "p3_walk02.png", "p3_walk03.png",
            "p3_walk04.png", "p3_walk05.png", "p3_walk06.png", "p3_walk07.png",
            "p3_walk08.png", "p3_walk09.png", "p3_walk10.png", "p3_walk11.png"
        ]);
        // define front animation
        this.renderable.addAnimation("front", ["p3_front.png"]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["p3_walk01.png", "p3_walk02.png",
            "p3_walk03.png", "p3_walk04.png",
            "p3_walk05.png", "p3_walk06.png", "p3_walk07.png", "p3_walk08.png",
            "p3_walk09.png", "p3_walk10.png", "p3_walk11.png"]);
        // set the default animation
        this.renderable.setCurrentAnimation("front");
        // set the default horizontal & vertical speed (accel vector)
        // can define more max jump in Tiled
        this.sonic = settings.sonic ? true : false;
        this.setVelocity(8, this.sonic ? 18 : 15);
        // adjust hit box
        var shape = this.getShape();
        shape.pos.x = this.width / 4;
        shape.pos.y = 2;
        shape.resize(this.renderable.width / 2, this.renderable.height - 11);
        // move viewport to players pos
        // set the display to follow player's position on both axis or not
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        if (game.data.currentLevel === 4) {
            me.game.viewport.follow(this.pos, me.game.viewport.AXIS.NONE);
            me.game.viewport.moveTo(70, y);
        }
        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;
        // initialize number of hits
        this.hits = 0;
        // initialize iscolliding 
        this.isColliding = false;
        // save initial pos
        this.initialX = x;
        this.initialY = y;
        this.mutipleJump = this.sonic ? 1 : 2;

    },
    update: function(dt) {
        if (me.input.isKeyPressed('left')) {
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
            if (!this.jumping && !this.falling) {
                this.renderable.setCurrentAnimation("front");
            }
        }
        if (me.input.isKeyPressed('jump')) {
            if (!this.jumping) {
                // play a jumping sound
                me.audio.play("jump");
                this.jumping = true;
                // reset the dblJump flag if off the ground
                this.mutipleJump = (this.vel.y === 0) ? (this.sonic ? 1 : 2) : this.mutipleJump;
                if (this.mutipleJump <= 2) {
                    // easy 'math' for double jump
                    this.vel.y -= (this.maxVel.y * this.mutipleJump++) * me.timer.tick;
                }
            }
        }
        // check & update player movement
        this.updateMovement();
        // check for collision
        var res = me.game.world.collide(this);
        if (res) {
            // if player collides with an enemy
            if (res.obj.type === me.game.ENEMY_OBJECT) {
                // check if player jumped on it
                if ((res.y > 0) && !this.jumping) {
                    // bounce (force jump)
                    this.falling = false;
                    this.vel.y = -this.maxVel.y * me.timer.tick;
                    // set the jumping flag
                    this.jumping = true;
                } else {
                    if (!this.isColliding) {
                        this.isColliding = true;

                        this.addDamage();
                    }
                }
            }
        } else {
            if (this.isColliding)
                this.isColliding = false;
        }
        // check if player fell into a hole
        var yOffset = this.pos.y - me.game.viewport.pos.y;
        var xOffset = this.pos.x - me.game.viewport.pos.x;
        if (yOffset < me.game.viewport.height / 3) {
            me.game.viewport.move(0, -10);
        }
        if (!this.inViewport && (xOffset > me.video.getWidth())) {
            this.pos.x = me.game.viewport.pos.x - 50;
            return true;
        }
        if (!this.inViewport && (xOffset < 0)) {
            this.pos.x = me.game.viewport.pos.x + me.game.viewport.width;
            return true;
        }

        if (!this.inViewport && (yOffset > me.video.getHeight())) {
            this.addDamage();
            if (this.hits !== game.data.maxHits) {
                // if yes fall from the sky at the beginning of the level
                this.teleportToInitial();
                return true;
            }
        }
        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent(dt);
            return true;
        }
        // else inform the engine player did not perform
        // any update (e.g. position, animation)
        return false;
    },
    addDamage: function() {
        // play a blip sound
        me.audio.play("blip");
        this.hits++;
        if (this.hits === game.data.maxHits) {
            this.collidable = false;
            // if not alive change to menu with guessing dialog
            game.data.score -= game.data.currentLevelScore;
            me.state.change(me.state.MENU);
            // put on pause, show text, unpause with enter
            var message = "Du hast verloren :(<br>";
            
            // show message
            message += (game.data.currentLevel === 1) ? "<br>Beschreibe das Wort von der Ebene<br>einem zufälligen Spieler so,<br>" +
                    "dass er/sie es erraten kann.<br>" : "<br>Weiter zur Rate-das-Wort-Runde<br>";
            message += "Dein Mitspieler wird gewählt...";
        
            me.state.change(me.state.DIALOG, message,true);
        } else {
            // gradually make player transparent
            var opacity = 1 - 0.5 * (this.hits / game.data.maxHits);
            this.renderable.setOpacity(opacity);
        }
    },
    teleportToInitial: function() {
        me.game.viewport.fadeIn('#fff', 250, function() {
            me.game.viewport.fadeOut('#fff', 250);
        });
        me.game.viewport.moveTo(70, this.initialY);
        this.pos.x = this.initialX;
        this.pos.y = this.initialY;
    }
});
game.PlayerIconEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        // add the window sprite as renderable for the entity
        this.renderable = game.textureItems.createSpriteFromName("hud_p3Alt.png");
        this.level = game.data.currentLevel;
    },
    update: function(dt) {
        if (me.input.isKeyPressed('down')) {
            if (game.data.currentLevel > 1) {
                game.data.currentLevel -= 1;
                // play a jump sound
                me.audio.play("jump");
            }
        } else if (me.input.isKeyPressed('up')) {
            if (game.data.currentLevel < Object.keys(game.levelGates).length) {
                game.data.currentLevel += 1;
                // play a jump sound
                me.audio.play("jump");
            }
        } else if (me.input.isKeyPressed('enter')) {
            if (!game.levelGates[game.data.currentLevel].locked) {
                me.state.change(me.state.PLAY);
            } else {
                // play a blip sound
                me.audio.play("blip");
            }
        }

        this.level = game.data.currentLevel;
        // get the level_gate coordinates
        var level_gate = game.levelGates[game.data.currentLevel];
        this.pos.x = level_gate.pos.x - this.renderable.width;
        this.pos.y = level_gate.pos.y;

    }
});

game.EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;
        // call the parent constructor
        this.parent(x, y, settings);

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x - width / 2;
        this.endX = x + width / 2;
        this.pos.x = x + (Math.random() > 0.5 ? 1 : -1) * Math.random() * width / 2;
        // decide what direction to go
        if (this.pos.x > this.startX && this.pos.x < this.endX) {
			this.walkLeft = Math.random() > 0.5 ? true : false;
		} else if (this.pos.x < this.startX) {
			this.flipX(true);
			this.walkLeft = false;
		} else {
			this.walkLeft = true;
		}
        if (settings.fromBlock) {
            this.pos.x = x + width / 2;
        }
        // make it collidable
        this.collidable = true;
        this.type = me.game.ENEMY_OBJECT;
        if (!this.getShape()) {
            this.addShape(new me.Rect(new me.Vector2d(0, 0), this.width, this.height));
        }

    },
    onCollision: function(res, obj) {
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one
        if (this.alive && (res.y > 0) && obj.falling) {
            me.audio.play("kill");
            me.game.world.removeChild(this);
            game.data.score += 150;
            game.data.currentLevelScore += 150;
        }
    },
    // manage the enemy movement
    update: function(dt) {
        // do nothing if not in viewport
        if (!this.inViewport)
            return false;
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            // make it walk
            this.flipX(!this.walkLeft);
            this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }
        // check and update movement
        this.updateMovement();
        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent(dt);
            return true;
        }
        return false;
    }
});

game.BeeEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "bee.png", "bee_fly.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["bee.png", "bee_fly.png"]);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // fly does not have gravity
        this.gravity = 0;
        // walking & jumping speed
        this.setVelocity(4, 6);
        // adjust hit box
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2;
        shape.resize(this.renderable.width, this.renderable.height - 20);
    }
});

game.SlimeGreenEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "slimeGreen.png", "slimeGreen_walk.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["slimeGreen.png", "slimeGreen_walk.png"], 800);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(0.3, 3);
        // update the collision shape rect
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2 + 2;
        shape.resize(this.renderable.width, this.renderable.height - 2);
    }
});

game.WormEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "worm.png", "worm_walk.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["worm.png", "worm_walk.png"], 500);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(0.5, 2);
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2 + 9;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});

game.FlyEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "flyFly1.png", "flyFly2.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["flyFly2.png", "flyFly1.png"]);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // fly does not have gravity
        this.gravity = 0;
        // walking & jumping speed
        this.setVelocity(4, 6);
        // adjust hit box
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});

game.SnailEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "snailWalk1.png", "snailWalk2.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["snailWalk2.png", "snailWalk1.png"], 500);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(1, 3);
        // update the collision shape rect
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2 + 2;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});

game.SlimeEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "slimeWalk1.png", "slimeWalk2.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["slimeWalk2.png", "slimeWalk1.png"], 800);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(0.3, 2);
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2 + 9;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});

game.BugEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "ladyBug_fly.png", "ladyBug.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["ladyBug_fly.png", "ladyBug.png"], 500);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(1, 3);
        // update the collision shape rect
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2 - 7;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});

game.MouseEntity = game.EnemyEntity.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        // create a new animationSheet as renderable for the entity
        this.renderable = game.textureItems.createAnimationFromName([
            "mouse.png", "mouse_walk.png"
        ]);
        // define walking animatin
        this.renderable.addAnimation("walk", ["mouse.png", "mouse_walk.png"], 500);
        // set the default animation
        this.renderable.setCurrentAnimation("walk");

        // walking & jumping speed
        this.setVelocity(1.5, 3);
        // update the collision shape rect
        var shape = this.getShape();
        shape.pos.x = this.width / 2 - this.renderable.width / 2;
        shape.pos.y = this.renderable.height / 2;
        shape.resize(this.renderable.width, this.renderable.height);
    }
});
