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
            // console.log(prefix[char]);
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

class Directory {
    constructor(name, parent=this) {
        this.name = name;
        this.members = {'..':parent, '.':this};
    }

    mkdir(name) {
        this.members[name] = new Directory(name + '/', this);
        return this.members[name];
    }

    get(dir="") {
        if (dir == "") {
            return HOME;
        } else {
            // console.log(dir);
            var dir_path = dir.split('/');
            // console.log(dir_path);
            var cur = CUR_DIR;
            var last = false;
            while (dir_path.length > 0 && cur) {
                if (dir_path[0] != "") {        
                    cur = cur.members[dir_path[0]];
                } else if (!last) {
                    last = true;
                } else {
                    cur = undefined;
                }
                dir_path = dir_path.slice(1);
            }
            return cur;
        }
    }

    parent() {
        return this.members['..'];
    }

    createFile(name, content) {
        this.members[name] = new File(this, name, content);
        return this.members[name];
    }

    createLink(name, url) {
        this.members[name] = new Link(this, name, url);
        return this.members[name];
    }
}

class File {
    constructor(parent, name, content) {
        this.parent = parent;
        this.name = name;
        this.content = content;
    }

    open() {
        print_file(this.content);
    }
}

class Link extends File {
    constructor(parent, name, url) {
        super(parent, name, "This is a link. Please open using `open "+name+'`');
        this.url = url;
    }

    open() {
        createLine("Opening "+this.name+"...", {'color':'#30a0ff'});
        window.open(this.url);
    }
}

function createOption(name, desc, func, hide=false) {
    return {'name': name, 'desc':desc, 'func':func, 'hide':hide};
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
    // // console.log(event);
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
        if (event.shiftKey) {
            backTabComplete();
        } else {
            tabComplete();
        }
        event.preventDefault();
    }
}

function arrowUp() {
    // // console.log("back");
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
    // // console.log("forward");
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
    // console.log(predictions);
    // console.log(PREDICTIONS);
    // console.log(PREDICTING);
    // console.log(PRED_VALUE);
    // console.log(TAB_COUNT);
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
    // console.log(predictions);
    // console.log(PREDICTIONS);
    // console.log(PREDICTING);
    // console.log(PRED_VALUE);
    // console.log(TAB_COUNT);
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

    var line_start = "<td class=\"line-start\" row="+row+">&gt&nbsp"+(USER+':'+CUR_DIR.name)+"$</td>";
    var cli = "<td class=\"cli\" row="+row+" id=\"cli-td\"><textarea id=\"cli\""+optionsToHTML(options)+"></textarea></td>"
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

function createLine(value = " ", options = {}) {
    COUNT++;
    if (COUNT > MAX_COUNT) {
        deleteTop();
    }
    var row = getNextRow();
    // console.log("<tr><td"+optionsToStyle(options)+" colspan=2 row="+row+">"+value+"</td></tr>");
    $('#cli-table tbody').append("<tr><td"+optionsToStyle(options)+" colspan=2 row="+row+">"+value+"</td></tr>");

}


function optionsToHTML(options) {
    html_options = '';
    for (option in options) {
        html_options += ' '+option+'="'+options[option]+'"';
    }
    return html_options;
}

function optionsToStyle(options) {
    if (Object.keys(options).length == 0) {
        return '';
    }
    styles = ' style=" ';
    for (option in options) {
        styles += option+':'+options[option]+';';
    }
    // console.log(styles.substring(0,styles.length-1)+'"');
    return styles.substring(0,styles.length-1)+'"'
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
    createLine("Command does not exist: "+value, {'color':'red'});
}




/* GLOBALS */
HISTORY = [''];
TEMP_BACK_HISTORY = [''];
PREDICTIONS = [];
TAB_COUNT = 0;
PREDICTING = false;
COUNT = 0;
MIN_COUNT = 1000;
HOME = new Directory('~/');
CUR_DIR = HOME;
USER = 'root';
CUR_PATH = '~/';
updateMaxCount();

function updateMaxCount() {
    var height = $(window).height();
    MAX_COUNT = Math.floor(height / 20) - 10;
    if (MAX_COUNT < MIN_COUNT) {
        MAX_COUNT = MIN_COUNT;
    }
    // console.log(MAX_COUNT);
}


PROJECTS = HOME.mkdir('projects');
PICTURES = HOME.mkdir('pictures');
RESUME = HOME.mkdir('resume');

createFromExisting('experience.txt', RESUME);
createFromExisting('languages_skills.txt', RESUME);


RESUME_PDF = RESUME.createLink('resume.pdf', 'files/CameronKurotoriResume.pdf');

TIMECARD = PROJECTS.mkdir('timecard');
// CHECKIN = PROJECTS.mkdir('checkin');
// DOPPEL = PROJECTS.mkdir('doppel-art');

createFromExisting('timecard.txt', TIMECARD);
TIMECARD_EXE = TIMECARD.createLink('timecard.exe', 'https://timecard-cpk.herokuapp.com');

createFromExisting('aboutme.txt', HOME);

IBM = PROJECTS.mkdir('ibm');
createFromExisting('stethoscope.txt', IBM)
createFromExisting('teamhealthdash.txt', IBM)

/*
bin -- all commands
 */


function help() {
    // // console.log("HELP FUNCTION");
    createLine("Possible commands:");
    for (var command in functions) {
        if (!functions[command].hide) {
            createLine(fourspaces + command + ' - ' + functions[command].desc);
        }
    }
}

function whoami(value_list) {
    // // console.log("WHO AM I?!");
    createLine("<img src='img/cameron.jpg' height=200px/>");
    HOME.members['aboutme.txt'].open();
}

function resume(value_list) {
    // // console.log("RESUME");
    RESUME_PDF.open();

}

function clear(value_list) {
    $('#cli-table tbody').empty();
    COUNT = 0;

}

function ls(arguments) {
    var settings = {};
    for (arg in arguments) {
        settings[arguments[arg]] = true;
    }
    for (member in CUR_DIR.members) {
        if (member[0] != '.') {
            createLine(CUR_DIR.members[member].name, {'color':'#aaaaaa'});
        } else if (settings['-A']) {
            createLine(member, {'color':'#aaaaaa'});
        }
    }
}

function echo(arguments) {
    createLine(arguments.join(' '), {'color':'white'});
}

function cd(arguments) {
    var next = CUR_DIR.get(arguments[0]);
    if (!next) {
        createLine(arguments[0]+" does not exist.", {'color':'red'})
    } else if (!(next instanceof Directory)) {
        createLine(arguments[0]+" is not a directory.", {'color':'red'})
    } else {
        CUR_DIR = next;
        if (CUR_DIR == HOME) {
            CUR_PATH = '~/'
        } else {
            CUR_PATH = CUR_DIR.name;
            // console.log(next);
            var p = next.parent();
            while (p != HOME) {
                // console.log(p)
                CUR_PATH = p.name+CUR_PATH;
                p = p.parent()
            }
            CUR_PATH = '~/'+CUR_PATH;
        }
    }
}

function open_cli(arguments) {
    if (arguments.length == 0) {
        return;
    }
    console.log(arguments);
    var file = CUR_DIR.get(arguments[0]);
    console.log(file);
    if (!file) {
        createLine(arguments[0]+" does not exist.", {'color':'red'});
    } else if (!(file instanceof File)) {
        createLine(arguments[0] + " cannot be opened.", {'color': 'red'})
    } else {
        file.open();
    }
}

function cat(arguments) {
    if (arguments.length == 0) {
        return;
    }
    console.log(arguments);
    var file = CUR_DIR.get(arguments[0]);
    console.log(file);
    if (!file) {
        createLine(arguments[0]+" does not exist.", {'color':'red'});
    } else if (!(file instanceof File)) {
        createLine(arguments[0] + " is not a file.", {'color': 'red'})
    } else {
        print_file(file.content);
    }
}

function pwd(arguments) {
    createLine(CUR_PATH, {'color':'white'});
}


function print_file(content) {
    var lines = content.split('\n');
    for (var line in lines) {
        createLine(lines[line], {'color':'white'});
    }
}

function linkedin(arguments) {
    createLine("Opening LinkedIn profile...", {'color':'#30a0ff'})
    //createLine('<div class="LI-profile-badge"  data-version="v1" data-size="medium" data-locale="en_US"' +' data-type="horizontal" data-theme="dark" data-vanity="cpkurotori"><a class="LI-simple-link" href=\'https://www.linkedin.com/in/cpkurotori?trk=profile-badge\'>Cameron Kurotori</a></div>')
    window.open("https://www.linkedin.com/in/cpkurotori");
}


fourspaces = "&nbsp&nbsp&nbsp&nbsp";
functions = {   'help':createOption("help", "get a list of commands like you see here", help),
                'info':createOption("info", "information about Cameron Kurotori (bio and contact info)",whoami),
                'whoami':createOption("whoami", "whoami alias", whoami, true),
                'clear':createOption("clear", "clear the screen's terminal", clear),
                'resume':createOption("resume", "look at my resume", resume),
                'cd':createOption("cd", "change directory", cd),
                'echo':createOption("echo", "print to terminal", echo),
                'ls':createOption("ls", "list files and directories", ls),
                'open':createOption("open", "open files", open_cli),
                'cat':createOption("cat", "output file content", cat),
                'pwd':createOption('pwd', 'outputs current path', pwd),
                'linkedin':createOption('linkedin', 'show LinkedIn information', linkedin)
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
        functions[value_list[0]].func(value_list.slice(1));
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


function createFromExisting(filename, parent) {
    $.ajax({
        type:    "GET",
        url:     'files/'+filename,
        success: function(text) {
            parent.createFile(filename, text);
        },
        error:   function() {
            console.log("file does not exist");
        }
    });
}