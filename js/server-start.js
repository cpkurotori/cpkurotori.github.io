$(document).ready(() => {
    function create_action(state) {
        $("#start").prop('disabled', true);
        $.ajax({
            url: "https://vjkqhynan2.execute-api.us-east-2.amazonaws.com/default",
            data: JSON.stringify({
                "state": state
            }),
            method: "POST",
            dataType: "json",
            success: function (result) {
                console.log(result);
                $("#main").html(`<code>${result}<code>`);
            },
            error: function (result) {
                console.log(result);
                $("#main").html(`<code>${result.responseText}<code>`);
            }
        });
    }

    $("#start").click(function(){
        create_action("start");
    });
});