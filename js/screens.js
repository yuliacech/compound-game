game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        me.audio.playTrack("play_loop");
        // reset array with collectable letter entities
        game.letterEntities = [];
        // reset array with display letters
        game.letterHUDs = [];
        // reset current level score
        game.data.currentLevelScore = 0;
        // reset compound
        game.data.compound = "";
        // reset cleaned compound
        game.data.compoundCleaned = "";
        // reset keyFound 
        game.data.keyFound = false;
        // reset key hidden
        game.data.keyHidden = false;
        // load a level
        me.levelDirector.loadLevel(game.data.currentLevel);
        // add letters from the letter entities (collectable) 
        // to the HUD (to display feedback)
        addCompound(game.letterEntities);
        // add score item to HUD container if there is none
        if (game.scoreHUD === null) {
            var x = me.video.getWidth() * 19 / 20;
            var y = me.video.getHeight() * 9 / 10;
            game.scoreHUD = new game.HUD.ScoreItem(x, y);
            game.display_HUD.addChild(game.scoreHUD);
        }
        var x = me.video.getWidth() / 20;
        var y = me.video.getHeight() / 20;
        // set z index in addchild method to a big value to see the hud above everything else 
        me.game.world.addChild(new game.HUD.HeartItem(x, y), 300);
        // enable the keyboard right hand
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "jump", true);
        // enable the keyboard lft hand
        me.input.bindKey(me.input.KEY.A, "left");
        me.input.bindKey(me.input.KEY.D, "right");
        me.input.bindKey(me.input.KEY.W, "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        // add instructions 
        $('#instructions').text("Dilly bewegen: Pfeiltasten oder A, W, D + LEERTASTE");
    },
    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.LEFT);
        me.input.unbindKey(me.input.KEY.RIGHT);
        me.input.unbindKey(me.input.KEY.UP);
        me.input.unbindKey(me.input.KEY.A);
        me.input.unbindKey(me.input.KEY.D);
        me.input.unbindKey(me.input.KEY.W);
        me.input.unbindKey(me.input.KEY.SPACE);
        me.audio.stopTrack();
        
    }
});

game.MenuScreen = me.ScreenObject.extend({
    /**   
     *  action to perform on state change
     */
    onResetEvent: function() {
        // add instructions
        $('#instructions').text("Ebene wählen: UP / DOWN + LEERTASTE");
        // load a level
        me.levelDirector.loadLevel("menu");
        // add scroller hud
        me.game.world.addChild(new game.HUD.GreetingItem(), 6);
        // left/right to choose a level, enter to play
        me.input.bindKey(me.input.KEY.SPACE, "enter", true);
        me.input.bindKey(me.input.KEY.DOWN, "down", true);
        me.input.bindKey(me.input.KEY.UP, "up", true);

        // player just finished last level
        if (game.data.won) {
            wonDialog();
            game.data.won = false;
        }
        // set locked to false to all levels up to current 
        // changes nothing if already unlocked
        for (var i = 1; i <= game.data.currentLevel; i++) {
            game.levelGates[i].locked = false;
        }
    },
    /**   
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.SPACE);
        me.input.unbindKey(me.input.KEY.DOWN);
        me.input.unbindKey(me.input.KEY.UP);
    }
});

game.DialogScreen = me.ScreenObject.extend({
    /**   
     *  action to perform on state change
     */
    onResetEvent: function(message, toDialog) {
        me.game.viewport.fadeOut('#fff');
        // add instructions
        $('#instructions').text("weiter spielen: ENTER");
        
        $('body').prepend('<div id="label">' + message + '</div>');
        $(document).keypress(function(e) {
            if (e.which === 13) {
                $('#label').remove();
                $('#instructions').text("");
                me.game.viewport.fadeIn('#fff', 150);
                // remove message
                $(document).unbind("keypress");
                if (toDialog) {// open dialog, unpaused in the dialog closing function
                    var dialog = new Dialog(game.data.compound, game.data.maxTags, game.data.maxGuesses);
                    dialog.init();
                } else {
                    me.game.viewport.fadeIn('#fff', 150);
                    me.state.change(me.state.MENU);
                }
            }
        });
    },
    /**   
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        me.game.viewport.fadeIn('#fff', 150);
    }
});