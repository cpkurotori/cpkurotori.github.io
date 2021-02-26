$(document).ready(() => {
    function post_create(state) {
        $(".disable-on-click").prop('disabled', true);
        $.ajax({
            url: "https://vjkqhynan2.execute-api.us-east-2.amazonaws.com/default",
            data: JSON.stringify({
                "state": state
            }),
            method: "POST",
            dataType: "json",
            success: function (result) {
                console.log(result);
                let output = `<h2>Success!</h2>`;
                if (state == "start") {
                    output += "<p>The server should start up any moment. and will turn off automatically after 12 hours.<br><br>" +
                        "<br><strong>However</strong>, if you stop playing for an <i>extended period of time</i>, " +
                        "it would be wonderful if you could run the `/stop` command in the chat and come " +
                        "back here (you can also just refresh the page) and stop the server.<br><br>" +
                        "This will help me limit the costs :) <br><br><i>If you forget, it's literally not a problem!" +
                        "(as a reference it only costs 4 cents per hour that the server is running :P)</i>" + 
                        "<br><br><button id='stop' class='disable-on-click'>Stop The Server!</button>";
                } else if (state == "stop") {
                    output += "<br><p>Thank you so much for stopping the server. I love you <3</p>";
                }
                output += `<br><br><code style='color:rgb(232,232,232)'>${JSON.stringify(result)}</code>`
                $("#main").html(output);
            },
            error: function (result) {
                console.log(result);
                $("#main").html(`<code>${result.responseText}<code>`);
            }
        });  
    }

    function create_action(state) {
        if (state == "stop") {
            swal({
                buttons: {
                    confirm: {
                        text: "Yes",
                        value: true,
                        visible: true,
                        closeModal: true
                    },
                    cancel: {
                        text: "No",
                        visible: true,
                        closeModal: true,
                        value: false
                    }
                },
                icon: "warning",
                text: "Did you run `/stop` command in the minecraft server chat and did the server come to a complete stop?"
            }).then((confirmed) => {
                if (!confirmed) {
                    return
                }
                post_create(state);
            });
        } else {
            post_create(state);
        }
    }

    $("#start").click(function () {
        create_action("start");
    });
    $("#stop").click(function () {
        create_action("stop");
    });
});