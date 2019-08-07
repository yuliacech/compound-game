function addCompound(letterEntities) {
    if (letterEntities.length !== 0) {
        me.state.pause(false);
        me.sys.resumeOnFocus = false;
        me.game.viewport.fadeOut('#fff');
        $('body').prepend('<div id="label">LADE DAS VERSTECKTE WORT ...</div>');

        $.get("php/get_compound.php", {length: letterEntities.length}, function(data) {
            game.data.compound = data.trim();
            game.data.compoundCleaned = cleanString(data.trim());
            var hudX = me.video.getWidth() / 20;
            var hudY = me.video.getHeight() * 9 / 10;
            letterEntities = shuffleArray(letterEntities);
            for (var i = 0; i < game.data.compoundCleaned.length; i++) {
                letterEntities[i].setChar(game.data.compoundCleaned[i]);
                var letterHUD = new game.HUD.LetterItem(hudX, hudY, game.data.compoundCleaned[i]);
                game.letterHUDs.push(letterHUD);
                me.game.world.addChild(letterHUD, 300);
                // aproximate width of 1 letter 
                hudX += 35;
            }
            $('#label').remove();
            me.state.resume(false);
            me.sys.resumeOnFocus = true;
            me.game.viewport.fadeIn('#fff', 150);
        });
    }
}

function cleanString(str) {
    var rval = str.replace(/ü/gi, "UE");
    rval = rval.replace(/ä/gi, "AE");
    rval = rval.replace(/ö/gi, "OE");
    rval = rval.replace(/ß/gi, "SS");
    return rval.toUpperCase();
}

function shuffleArray(array) { //v1.0
    for (var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x)
        ;
    return array;
}

function createAlert(message) {
    me.state.pause(false);
    me.sys.resumeOnFocus = false;
    me.game.viewport.fadeOut('#fff');
    $('body').prepend('<div id="label">' + message + '</div>');
    var instructions = $('#instructions').text();

    $('#instructions').text("weiter spielen: ENTER");
    $(document).keypress(function(e) {
        if (e.which === 13) {
            $('#label').remove();
            
            me.state.resume(false);
            me.game.viewport.fadeIn('#fff', 150);
            me.sys.resumeOnFocus = true;
            $(document).unbind("keypress");
            $('#instructions').text(instructions);
        }
    });

}

function sortedIndex(array, value) {
    var low = 0,
            high = array.length;

    while (low < high) {
        var mid = low + high >>> 1;
        if (array[mid] > value)
            low = mid + 1;
        else
            high = mid;
    }
    return low;
}
function wonDialog() {

// pause game 
    me.state.pause(true);
    me.sys.resumeOnFocus = false;
    me.game.viewport.fadeOut('#fff');
    $('#instructions').text("");
    // inform that player won
    var message = "Du hast gewonnen!<br>Mit deinen " + game.data.score +
            " Punkten<br>bist du auf dem Platz ";
    $('body').prepend('<div id="label">' + message + '...</div>');
    // get all highscores
    $.get("php/get_highscores.php", function(data) {
        var highscores = [];
        var names = [];
        for (var i = 0; i < data.length; i++) {
            highscores.push(parseInt(data[i].highscore));
            names.push(data[i].name);
        }
        var place = sortedIndex(highscores, game.data.score);
        while (highscores[place] === game.data.score) {
            place += 1;
        }
        place += 1;
        $('#label').html(message + " " + place + "<br>Tippe deinen Namen<br>für die Rankliste ein<br>");
        $('#label').append('<input type="text" id="input_name" placeholder="dein Name"/>'
                + '<input type="button" id="input_submit" value="Senden" />' +
                '<input type="button" id="input_cancel" value="Abbrechen"/>');
        $('#input_submit').click(function() {
            var name = $("#input_name").val().trim();
            if (name !== "") {
                if (names.indexOf(name) === -1) {
                    $.post("php/add_highscore.php", {name: name, score: game.data.score}, function(data) {
                    });
                    message = "Suche deinen Namen unter Leaderboards!<br>von Anfang an spielen?<br>";
                    $('#label').html(message
                            + '<input type="button" id="ja" value="Ja" />' +
                            '<input type="button" id="nein" value="Nein"/>');
                    $('#ja').click(function() {
                        game.data.score = 0;
                        game.data.currentLevel = 1;
                        // start the game
                        me.state.change(me.state.MENU);
                        $('#label').remove();
                        me.state.resume(true);
                        me.sys.resumeOnFocus = true;
                        me.game.viewport.fadeIn('#fff', 150);
                    });
                    $('#nein').click(function() {

                        $('#label').remove();
                        me.state.resume(true);
                        me.sys.resumeOnFocus = true;
                        me.game.viewport.fadeIn('#fff', 150);
                        $('#instructions').text("Ebene wählen: UP / DOWN + LEERTASTE");
                    });

                } else {
                    // already have this name
                    $('#label').append("<br><font color='red'>Solchen Namen gibt es schon</font>");
                }
            }
        });
        $('#input_cancel').click(function() {
            message = "von Anfang an spielen?<br>";
            $('#label').html(message
                    + '<input type="button" id="ja" value="Ja" />' +
                    '<input type="button" id="nein" value="Nein"/>');
            $('#ja').click(function() {
                game.data.score = 0;
                game.data.currentLevel = 1;
                // start the game
                me.state.change(me.state.MENU);
                $('#label').remove();
                me.state.resume(true);
                me.sys.resumeOnFocus = true;
                me.game.viewport.fadeIn('#fff', 150);
            });
            $('#nein').click(function() {
                $('#instructions').text("Ebene wählen: UP / DOWN + LEERTASTE");
                $('#label').remove();
                me.state.resume(true);
                me.sys.resumeOnFocus = true;
                me.game.viewport.fadeIn('#fff', 150);
            });
        });

    }, "json");
}

function addLeaderboard() {
    $('table').text("Bitte warte, bis die Rankliste geladen wird");
    $.get("php/get_highscores.php", function(data) {
        $('table').text("");
        for (var i = 0; i < data.length; i++) {

            $('table').append("<tr><td align='center' width=10%>" + (i + 1) + "</td><td align='center'>   " + data[i].name +
                    "</td><td>  " + data[i].highscore + "</td></tr>");
        }

    }, "json");
}

function feedback() {
    $('#feedback_button').click(function() {
        if ($('#feedback_text').val() !== "") {
            $('.status').text("");
            var re = new RegExp("'");
            var comment = $('#feedback_text').val().trim().replace(re, "\\'");
            $.post("php/add_feedback.php", {feedback: comment}, function(data) {
                if (data.trim() === "1") {
                    $('.status').text("Dein Feedback wurde gesendet. Danke!");
                    $('#feedback_text').val("");
                } else {
                    $('.status').text("Dein Feedback konnte nicht gesendet werden.");
                }
            });

        }
    });
}

function charLimit() {
    var characters = 1000;
    $(".status").html("You have <strong>" + characters + "</strong> characters remaining");
    $("#feedback_text").keyup(function() {
        limitText($(this), characters);
    });

    $("textarea").on("paste", function() {
        limitText($(this), characters);
    });
    
    $("textarea").on("click", function() {
        limitText($(this), characters);
    });
}
function limitText(textarea, characters) {
    if (textarea.val().length > characters) {
           textarea.val(textarea.val().substr(0, characters));

        }
        var remaining = characters - textarea.val().length;
        $(".status").html("You have <strong>" + remaining + "</strong> characters remaining");
        if (remaining <= 10)
        {
            $(".status").css("color", "red");
        }
        else
        {
            $(".status").css("color", "grey");
        }
}

function Dialog(compound, numberTags, numberGuesses) {
    this.compound = compound;
    this.numberTags = numberTags;
    this.numberGuesses = numberGuesses;
    this.numberFoundTags = 0;
    this.sentenceChosen = false;
}

// main function to start dialog
Dialog.prototype.init = function() {

    this.openDialog();

    // initialize compound label with compound
    this.initCompoundLabel();
    // sentences cards to senteces area
    this.addSentences();
    // add tags cards to tags area
    this.addTags();


};

// function to show dialog div and hide screen div (with canvas)
Dialog.prototype.openDialog = function() {
    $('#instructions').hide();
    $('#screen').hide();
    $('#dialog').show();

};

// function to hide dialog and show again the canvas
function closeDialog(message) {
    $('#sentences_area').empty();
    $('.sentence_card').remove();
    $('#tags_area').empty();
    $('.tag_card').remove();
    $('#answer_title').html("Dein Mitspieler:");
    $('#dialog').hide();
    $('#instructions').show();
    $('#screen').show();
    me.state.change(me.state.DIALOG, message, false);
}
;

// function to initialize compound label
Dialog.prototype.initCompoundLabel = function() {
    $('#compound_label').html("Je schneller dein Mitspieler das zusammengesetzte Wort <b>" +
            this.compound + "</b> richtig rät,<br>desto mehr Punkte kriegst du!<br>"
            + "Wähle <b>1</b> Satz und <b>" + this.numberTags +
            "</b> Tags passend zum Wort.");
    $.get("php/get_guesser.php", function(data) {
        $('#answer_title').html("Dein Mitspieler:<br><i>" + data.trim() + "</i><br>");
    });
};

// function to add tags to tags area
Dialog.prototype.addTags = function() {
    var dialog = this;
    $('#tags_area').text("Lade Tags...");
    $.get("php/get_tags.php", {compound: this.compound}, function(data) {
        // add tags to the page (stored in data)
        //console.log(data);
        data = shuffleArray(data);
        $('#tags_area').text("");
        for (var i = 0; i < data.length; i++) {
            $('#tags_area').append('<div id="' + data[i].tag_id + '" class="tag_card">' + data[i].tag + '</div>');
            dialog.numberFoundTags += 1;
        }
        if (data.length === 0) {
            $('#tags_area').html("Keine Tags gefunden");
        }
        $(".tag_card").hover(
                function() {
                    $(this).addClass("highlight");
                }, function() {
            $(this).removeClass("highlight");
        }
        );


        $('.tag_card').click(function() {
            $.post("php/add_score.php", {id: $(this).attr('id'), table: "tags"}, function(data) {
            //console.log(data);
            });
            $(this).unbind('mouseenter mouseleave');
            $(this).addClass("highlight");
            $(this).unbind("click");
            dialog.numberTags--;
            if ((3 - dialog.numberFoundTags) === dialog.numberTags || dialog.numberTags === 0) {
                $('.tag_card').unbind('mouseenter mouseleave');
                $('.tag_card').unbind('click');
                if (dialog.sentenceChosen) {
                    setTimeout(dialog.startGuessing(), 1500);
                }
            }
            $('#answer_tags').append('<div class="tag_card highlight">' + $(this).text() + '</div>')
        });
    }, "json");

};

// function to add sentences to sentence area
Dialog.prototype.addSentences = function() {
    var dialog = this;
    $('#sentences_area').text("Lade Sätze...");
    $.get("php/get_sentences.php", {compound: this.compound}, function(data) {
        $('#sentences_area').text("");
        var sentences = [];
        $('#sentences_area').append('<ol></ol>');
        for (var i = 0; i < data.length; i++) {
            var sentence = '<li id="' + data[i].sentence_id + '" class="sentence_card">' +
                    data[i].before_part + " <b>" + data[i].compound_form +
                    "</b> " + data[i].after_part + '</li>';
            sentences.push(sentence);
        }
        sentences = shuffleArray(sentences);
        for (var i = 0; i < data.length; i++) {
            $('ol').append(sentences[i]);
        }
        ;
        $(".sentence_card").hover(
                function() {
                    $(this).addClass("highlight");
                }, function() {
            $(this).removeClass("highlight");
        });

        $('.sentence_card').click(function() {
            $('.sentence_card').unbind('mouseenter mouseleave');
            $('.sentence_card').unbind('click');
            $(this).addClass("highlight");

            $.post("php/add_score.php", {id: $(this).attr('id'), table: "sentences"}, function(data) {
            //console.log(data);
            });

            var re = new RegExp("<b>.+</b>");
            var sentence = $(this).html().replace(re, "<b>...</b>");

            $('#answer_sentence').append('<div class="sentence_card highlight">' + sentence + '</div>');
            dialog.sentenceChosen = true;
            if ((3 - dialog.numberFoundTags) === dialog.numberTags || dialog.numberTags === 0) {
                setTimeout(dialog.startGuessing(), 1500);
            }
        });
    }, "json");
};

Dialog.prototype.startGuessing = function() {
    var dialog = this;
    var guesses = [];
    guesses.push(this.compound);
    for (var i = 0; i < 3; i++) {
        guesses.push("guess " + i);
    }
    guesses = shuffleArray(guesses);
    var i = 0;
    var myInterval = setInterval(function() {
        var guessed = guesses[i] === dialog.compound;
        if (guessed) {
            $('#answer_title').append((i + 1) + ".Versuch: <font color='green'>" +
                    guesses[i] + "</font>");
            clearInterval(myInterval);
            setTimeout(function() {
                var message = "Hurra!<br>Dein Mitspieler hat das Wort<br>im " + (i + 1) + ". Versuch erraten!<br>" +
                        "Du bekommst " + (100 * (3 - i)) + " Punkte";
                game.data.score += 100 * (3 - i);
                closeDialog(message);
            }, 1500);
        } else {
            $('#answer_title').append((i + 1) + ".Versuch: <font color='red'>falsch</font><br>");
            i++;
            if (i === dialog.numberGuesses) {
                clearInterval(myInterval);
                setTimeout(function() {
                    var message = "Leider hat dein Mitspieler<br>3 mal falsch geraten!<br>Du bekommst 0 Punkte";
                    closeDialog(message);
                }, 1500);
            }

        }

    }, 3000);
};

