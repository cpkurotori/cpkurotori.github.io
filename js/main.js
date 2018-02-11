class TrieNode {
    constructor() {
        this.children = {};
        this.end = false;
    }

    addWord(word) {
        var node = this;
        for (var char in word) {
            if (!Object.keys(node.children).includes(word[char])) {
                node.children[word[char]] = new TrieNode();
            }
            node = node.children[word[char]];
        }
        node.end = true;
    }

    getPost() {
        var words = [];
        if (this.end) {
            words.push('');
        }
        for (var child in this.children) {
            var posts = this.children[child].getPost();
            for (var word in posts) {
                words.push(child+posts[word]);
            }
        }
        return words;
    }

    autocomplete(prefix) {
        var node = this;
        for (var char in prefix) {
            console.log(prefix[char]);
            var letter = prefix[char];
            if (!Object.keys(node.children).includes(letter)) {
                return [];
            }
            node = node.children[letter];
        }
        var words = [];
        var posts = node.getPost();
        for (var word in posts) {
            words.push(prefix+posts[word]);
        }
        return words;
    }
}

function createOption(name, desc, func) {
    return {'name': name, 'desc':desc, 'func':func}
}

function listen() {
    $('#cli').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

$(document).on('keypress', keypress);
$(document).on('keydown', keydown);
$(window).resize(function () {
    updateMaxCount();
    while (COUNT > MAX_COUNT) {
        deleteTop();
    }
});


function keypress(event) {
    // console.log(event);
    if (event.keyCode == 13) {
        enter();
        event.preventDefault();
    } else {
        TAB_COUNT = 0;
        PREDICTIONS = [];
        PREDICTING = false;
    }
}

function keydown(event) {
    console.log(event);
    if (event.keyCode == 38) {
        arrowUp();
        event.preventDefault();
    } else if (event.keyCode == 40) {
        arrowDown();
        event.preventDefault();
    } else if (event.keyCode == 9) {
        if (event.shiftKey) {
            backTabComplete();
        } else {
            tabComplete();
        }
        event.preventDefault();
    }
}

function arrowUp() {
    // console.log("back");
    var current = $("#cli").val().trim();
    var back = HISTORY.pop();
    if (back == "") {
        HISTORY.push("");
    } if (current != "") {
        TEMP_BACK_HISTORY.push(current);
    }
    $('#cli').val(back);
}


function arrowDown() {
    // console.log("forward");
    var current = $("#cli").val().trim();
    var back = TEMP_BACK_HISTORY.pop();
    if (back == "") {
        TEMP_BACK_HISTORY.push("");
    } if (current != "") {
        HISTORY.push(current);
    }
    $('#cli').val(back);
}

function tabComplete() {
    var value = getCompletion();
    $("#cli").val(value);
}

function backTabComplete() {
    var value = getBackCompletion();
    $("#cli").val(value);
}


function getCompletion() {
    if (!PREDICTING) {
        PRED_VALUE = $("#cli").val().trim();
    }
    var predictions = commands.autocomplete(PRED_VALUE).sort();
    if (!PREDICTING) {
        PREDICTIONS = predictions;
        PREDICTING = true;
    }
    TAB_COUNT = (TAB_COUNT + 1) % (PREDICTIONS.length + 1);

    if (predictions.equals([])) {
        PREDICTING = false;
        TAB_COUNT = 0;
        PREDICTIONS = [];
        return $("#cli").val().trim();
    }
    if (TAB_COUNT == 0) {
        PREDICTIONS = [];
        PREDICTING = false;
        return '';
    }
    console.log(predictions);
    console.log(PREDICTIONS);
    console.log(PREDICTING);
    console.log(PRED_VALUE);
    console.log(TAB_COUNT);
    return PREDICTIONS[TAB_COUNT - 1];
}

function getBackCompletion() {
    if (!PREDICTING) {
        PRED_VALUE = $("#cli").val().trim();
    }
    var predictions = commands.autocomplete(PRED_VALUE).sort();
    if (!PREDICTING) {
        PREDICTIONS = predictions;
        PREDICTING = true;
    }
    TAB_COUNT = (((TAB_COUNT - 1) % (PREDICTIONS.length + 1)) + (PREDICTIONS.length + 1))%(PREDICTIONS.length + 1);

    if (predictions.equals([])) {
        PREDICTING = false;
        TAB_COUNT = 0;
        PREDICTIONS = [];
        return $("#cli").val().trim();
    }
    if (TAB_COUNT == 0) {
        PREDICTIONS = [];
        PREDICTING = false;
        return '';
    }
    console.log(predictions);
    console.log(PREDICTIONS);
    console.log(PREDICTING);
    console.log(PRED_VALUE);
    console.log(TAB_COUNT);
    return PREDICTIONS[TAB_COUNT - 1];
}



$(document).click(function() {
    $("#cli").focus();
})


function enter() {
    if (TEMP_BACK_HISTORY.length > 1) {
        HISTORY.push.apply(HISTORY, TEMP_BACK_HISTORY.splice(1));
    }
    var value = $("#cli").val().trim();
    if (value != "") {
        HISTORY.push(value);
    }
    evaluateLine(value);

}

function solidify(value) {
    $("#cli-table tr:last td:last")[0].innerHTML = value;
    $("#cli-table tr:last td:last").removeAttr('id');
}


function createCLI() {
    COUNT++;
    if (COUNT > MAX_COUNT) {
        deleteTop();
    }
    var row = getNextRow();
    var options = { 'autofocus' : true,
                    'autocomplete' : 'off',
                    'autocorrect' : 'off',
                    'autocapitalize' : 'off',
                    'spellcheck' : false,
                    'data-gramm_editor' : false,
                    'wrap' : 'soft'};
    var html_options = '';
    for (option in options) {
        html_options += ' '+option+'="'+options[option]+'"';
    }
    var line_start = "<td class=\"line-start\" row=\"+row+\">&gt&gt&gt&gt&nbsp&nbsp&nbsp</td>"
    var cli = "<td class=\"cli\" row=\"+row+\" id=\"cli-td\"><textarea id=\"cli\""+html_options+"></textarea></td>"
    var child = "<tr>"+line_start+cli+"</tr>";
    $('#cli-table tbody').append(child);
    $('#cli').each(function () {
        this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    $('#cli').focus();
}

function createLine(value = " ") {
    COUNT++;
    if (COUNT > MAX_COUNT) {
        deleteTop();
    }
    var row = getNextRow();
    $('#cli-table tbody').append("<tr><td class=\"line-start\" row="+row+"></td><td row="+row+">"+value+"</td></tr>");

}


function deleteTop() {
    $("#cli-table tbody tr:first").remove();
    COUNT--;
}


function getNextRow() {
    var nextrow = $('#cli-table tr:last td:first').attr('row')
    if (nextrow) {
        return Number(nextrow) + 1;
    } else {
        return 0;
    }
}




function error(value) {
    createLine("Command does not exist: "+value);
}




/* GLOBALS */
HISTORY = [''];
TEMP_BACK_HISTORY = [''];
PREDICTIONS = [];
TAB_COUNT = 0;
PREDICTING = false;
COUNT = 0;
MIN_COUNT = 1000;
updateMaxCount();

function updateMaxCount() {
    var height = $(window).height();
    MAX_COUNT = Math.floor(height / 20) - 10;
    if (MAX_COUNT < MIN_COUNT) {
        MAX_COUNT = MIN_COUNT;
    }
    console.log(MAX_COUNT);
}




/*
bin -- all commands
 */


function help() {
    // console.log("HELP FUNCTION");
    createLine("Possible commands:");
    for (var command in Object.keys(functions)) {
        var option = Object.keys(functions)[command];
        createLine(fourspaces+option+'-'.padEnd(4)+functions[option].desc);
    }
}

function whoami() {
    // console.log("WHO AM I?!");
    createLine("Name: Cameron Kurotori");
    createLine("Phone: 209-206-1529");
    createLine("Email: <a href='mailto:cpkurotori@berkeley.edu'>cpkurotori@berkeley.edu</a>");
}

function resume() {
    // console.log("RESUME");
    createLine("Opening resume...")
    window.open("doc/CameronKurotoriResume.pdf");

}

function clear() {
    $('#cli-table tbody').empty();
    COUNT = 0;

}

function ls() {

}



fourspaces = "&nbsp&nbsp&nbsp&nbsp";
functions = {   'help':createOption("help", "get a list of commands like you see here", help),
                'whoami':createOption("whoami", "get a list of information about me, Cameron Kurotori",whoami),
                'clear':createOption("clear", "clear the screen's terminal", clear),
                'resume':createOption("resume", "look at my resume", resume)
};


commands = new TrieNode();
for (var command in functions) {
    commands.addWord(command);
}



// EVALUATE THE COMMAND

function evaluateLine(value) {
    var value_list = value.split(' ');
    solidify(value);

    if (value == "") {
        return createCLI()
    } else if (Object.keys(functions).includes(value_list[0])){
        functions[value_list[0]].func();
    } else {
        error(value_list[0]);
    }
    createCLI();

}


createCLI();
listen();


/*
Array Comparisons
 */

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});