function TrieNode() {
    return {'children':{}, 'end':false};
}

function addWordTrie(node, word){
    while (word.length > 0) {
        var letter = word[0];
        word = word.slice(1);
        // console.log(letter);
        if (!Object.keys(node.children).includes(letter)) {
            // console.log("Creating TrieNode");
            node.children[letter] = TrieNode();
        }
        node = node.children[letter];
    }
    node.end = true;
}

function getPost(node) {
    words = [];
    if (node.end) {
        var words = [''];
    } for (var child in node.children) {
        // console.log(child);
        var posts = getPost(node.children[child]);
        for (var word in posts) {
            // console.log(child);
            // console.log(posts[word]);
            words.push(child+posts[word]);
        }
    }
    // console.log(words);
    return words;
}


function autocomplete(node, prefix) {
    for (var char in prefix) {
        var letter = prefix[char];
        if (!Object.keys(node.children).includes(letter)) {
            return [];
        }
        node = node.children[letter];
    }
    var words = [];
    var posts = getPost(node);
    for (var word in posts) {
        words.push(prefix+posts[word]);
    }
    return words;
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
    // console.log(event);
    if (event.keyCode == 38) {
        arrowUp();
        event.preventDefault();
    } else if (event.keyCode == 40) {
        arrowDown();
        event.preventDefault();
    } else if (event.keyCode == 9) {
        tabComplete();
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


function getCompletion() {
    TAB_COUNT++;
    if (!PREDICTING) {
        PRED_VALUE = $("#cli").val().trim();
    }
    var predictions = autocomplete(commands, PRED_VALUE).sort();
    if (!PREDICTING) {
        PREDICTIONS = predictions;
        PREDICTING = true;
    }
    // console.log(predictions);
    // console.log(PREDICTIONS);
    // console.log(PREDICTING);
    // console.log(PRED_VALUE);
    // console.log(TAB_COUNT);
    if (predictions.equals([])) {
        PREDICTING = false;
        TAB_COUNT = 0;
        PREDICTIONS = [];
        return $("#cli").val().trim();
    }
    if (TAB_COUNT > PREDICTIONS.length) {
        TAB_COUNT = 0;
        PREDICTIONS = [];
        PREDICTING = false;
        return '';
    }
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
    var child = "<tr><td class=\"line-start\" row="+row+">&gt&gt&gt&gt&nbsp&nbsp&nbsp</td><td class=\"cli\" row="+row+" id=\"cli-td\"><textarea id=\"cli\" autofocus wrap=\"soft\" data-gramm_editor=\"false\"></textarea></td></tr>";
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

function evaluateLine(value) {
    value_list = value.split(' ');
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

function getNextRow() {
    var nextrow = $('#cli-table tr:last td:first').attr('row')
    if (nextrow) {
        return Number(nextrow) + 1;
    } else {
        return 0;
    }
}

listen();

HISTORY = [''];

TEMP_BACK_HISTORY = [''];

PREDICTIONS = [];
TAB_COUNT = 0;
PREDICTING = false;


COUNT = 0;
MIN_COUNT = 7
updateMaxCount();

function updateMaxCount() {
    var height = $(window).height();
    MAX_COUNT = Math.floor(height / 20) - 10;
    if (MAX_COUNT < MIN_COUNT) {
        MAX_COUNT = MIN_COUNT;
    }
    console.log(MAX_COUNT);
}

function error(value) {
    createLine("Command does not exist: "+value);
}

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

help_func = createOption("help", "get a list of commands like you see here", help);
clear_func = createOption("clear", "clear the screen's terminal", clear);
whoami_func = createOption("whoami", "get a list of information about me, Cameron Kurotori", whoami)
resume_func = createOption("resume", "look at my resume", resume);


fourspaces = "&nbsp&nbsp&nbsp&nbsp"
functions = {'help':help_func, 'whoami':whoami_func, 'clear':clear_func, 'resume':resume_func};


createCLI();

commands = TrieNode();
for (var command in functions) {
    addWordTrie(commands, command);
}




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