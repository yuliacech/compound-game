/* Game namespace */
var game = {
    // dict to store level_gates
    levelGates: {},
    // array to store letter objects
    letterEntities: [],
    // array to store letter huds 
    letterHUDs: [],
    // hud to show score
    scoreHUD: null,
    // reference to main player
    player : null,
    // an object where to store game information
    data: {
        currentLevel: 1,
        // score
        score: 0,
        // score from current level to substract if lose
        lastScore: 0,
        // hidden compound
        compound: "",
        // compound to upper case and without unicode
        compoundCleaned: "",
        // if the key is collected
        keyFound: false,
        // max number of hits
        maxHits: 3,
        // max number of tags to choose in dialog
        maxTags: 3,
        // max number of guesses in dialog
        maxGuesses: 3,
        // flag if the key was already hidden in the level 
        keyHidden: false,
        won: false
    },
    // Run on page load.
    onload: function() {
        // set 60 frames per second
        me.sys.fps = 60;
        // Initialize the video.
        if (!me.video.init("screen", 900, 600, true)) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }
        // initialize the "audio"
        me.audio.init("ogg");
        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function() {
                me.plugin.register.defer(this, debugPanel, "debug");
            });
        }
        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);
        // Load the resources.
        me.loader.preload(game.resources);
        // Initialize melonJS and display a loading screen.
        me.state.change(me.state.LOADING);
        //debugging rectangle box
        me.debug.renderHitBox = true;
    },
    // Run on game resources loaded.
    loaded: function() {
        // set the PLAY Screen Object
        me.state.set(me.state.PLAY, new game.PlayScreen());
        // set the MENU Screen Object
        me.state.set(me.state.MENU, new game.MenuScreen());
        // set the DIALOG Screen Object
        me.state.set(me.state.DIALOG, new game.DialogScreen());
        // set transition effect betweeen states
        //me.state.transition("fade", "#fff", 250);
        // register player entity in the entity pool
        me.pool.register("player", game.PlayerEntity);
        // register letter entities in the entity pool
        me.pool.register("letter", game.LetterObject, true);
        // register player icon
        me.pool.register("player_icon", game.PlayerIconEntity);
        // register level gate
        me.pool.register("level_gate", game.LevelGateObject, true);
        // register enemy entities
        me.pool.register("fly", game.FlyEntity, true);
        me.pool.register("slime", game.SlimeEntity, true);
        me.pool.register("snail", game.SnailEntity, true);
        me.pool.register("bee", game.BeeEntity, true);
        me.pool.register("slimeGreen", game.SlimeGreenEntity, true);
        me.pool.register("worm", game.WormEntity, true);
        me.pool.register("bug", game.BugEntity, true);
        me.pool.register("mouse", game.MouseEntity, true);
        // register exit object
        me.pool.register("exit", game.ExitObject, true);
        // register key object
        me.pool.register("key", game.KeyObject, true);
        // register alert object
        me.pool.register("alert", game.AlertObject,true);
        // register breakable block with hidden surprise
        me.pool.register("block", game.BlockObject, true);
        // register gem
        me.pool.register("gem", game.GemObject, true);
        // register key check object
        me.pool.register("keyCheck", game.KeyCheckObject);
        // register teleport
        me.pool.register("teleport", game.TeleportObject);
        // register lava
        me.pool.register("lava", game.LavaObject);
        // add HUD to the game world
        game.display_HUD = new game.HUD.Container();
        me.game.world.addChild(game.display_HUD);
        // create texture atlases
        game.texturePlayer = new me.TextureAtlas(
                me.loader.getJSON("player.json"),
                me.loader.getImage("player.png"));
        game.textureItems = new me.TextureAtlas(
                me.loader.getJSON("items.json"),
                me.loader.getImage("items.png"));
        // start the game from intro
        var message = "Dilly ist ein außerirdisches Wesen,<br>das Tübingen entdecken und<br>" + 
                "Deutsch lernen möchte!<br>Springe mit ihm durch Ebenen,<br>finde Wörter und<br>" +
                "beschreibe sie deinen Mitspielern.";
        me.state.change(me.state.DIALOG, message, false);
    }
};






