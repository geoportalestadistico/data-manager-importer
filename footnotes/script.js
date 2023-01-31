$(document).ready(function () {

    let t = getCookie("t")

    check_login = () => {
        if(t == '') {
            console.log("no hay cookie")
            $("#login_btn").show()
            $("#logout_btn").hide()
            $(".login_td").addClass("unactive_button")
            $(".login_button").removeClass("btn-success")
            $(".login_button").addClass("btn-light")
            $(".login_button").css("color","gainsboro")
            $(".login_button").css("pointer-events","none")
        }
    }

    var footnotes_details

    add = () => {
        $(".abm").hide()
        $(`#add_footnote`).show();
        $("#add_footnote_form").show()
        document.getElementById("add_footnote_form").reset();
        $("#successful_creation").hide()
    }

    cancel = () => {
        $(`.abm`).hide();
    }

    confirm_delete = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'DELETE',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch(`${base_url}/nota/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $("#footnote_" + id).hide()
                $(`#delete_footnote`).hide();
            })
    }

    delete_footnote = (id, text) => {
        $(".abm").hide()
        $("#delete_footnote").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
    }

    edit_footnote = (id) => {
        $(".abm").hide()
        $("#edit_footnote").show()
        $("#edit_footnote_form").show()


        var footnote_data = footnotes_details.filter(function (obj) {
            return obj.id == id;
        });

        $("#footnote_text_edit").val(footnote_data[0].nota)
        $("#footnote_text_en_edit").val(footnote_data[0].nota_ingles)
        $("#footnote_text_fr_edit").val(footnote_data[0].nota_frances)
        $("#footnote_text_pt_edit").val(footnote_data[0].nota_portugues)


        $("#edit_button").attr('onclick', `send_edit(${id})`)

        console.log(footnote_data[0])
    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var footnote = {
            "nota": $("#footnote_text_edit").val(),
        }

        console.log($("#footnote_text_edit").val())

        if ($("#footnote_text_en_edit").val() != '') {
            footnote.nota_ingles = $("#footnote_text_en_edit").val()
        }
        if ($("#footnote_text_fr_edit").val() != '') {
            footnote.nota_frances = $("#footnote_text_fr_edit").val()
        }
        if ($("#footnote_text_pt_edit").val() != '') {
            footnote.nota_portugues = $("#footnote_text_pt_edit").val()
        }

        console.log(footnote)
        var raw = JSON.stringify(footnote);

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/nota/${id}/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#edit_footnote_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(".abm").css("display", "none")
                } else {
                    console.log("fracaso")
                    $("#error_editing").show()
                    $("#error_editing_content").empty()
                    $.each(result, (i, val) => {
                        $("#error_editing_content").append(`<b>${i}</b>: ${val}<br>`,)
                    })
                }
            }).catch(error => {
                console.log('error', error)
            });
    }

    save = () => {

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var footnote = {
            "nota": $("#footnote_text").val(),
        }

        if ($("#footnote_text_en").val() != '') {
            footnote.nota_ingles = $("#footnote_text_en").val()
        }
        if ($("#footnote_text_fr").val() != '') {
            footnote.nota_frances = $("#footnote_text_fr").val()
        }
        if ($("#footnote_text_pt").val() != '') {
            footnote.nota_portugues = $("#footnote_text_pt").val()
        }

        var raw = JSON.stringify(footnote);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/nota/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#add_footnote_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(`#add_footnote`).hide();
                } else {
                    console.log("fracaso")
                    $("#error_creation").show()
                    $("#error_content").empty()
                    $.each(result, (i, val) => {
                        $("#error_content").append(`<b>${i}</b>: ${val}<br>`,)
                    })
                }
            }).catch(error => {
                console.log('error', error)
            });



    }

    initial_load = () => {

        let url_data = `${base_url}/nota/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {

                footnotes_details = data;

                $("#footnotes").empty()
                data.sort((a, b) => a.id - b.id);
                $.each(data, (i, footnote) => {
                    let footnotes_content = `<div class="row" id="footnote_${footnote.id}">
                    <div class="button_div col-1">${footnote.id}</div>
                    <div class="footnote col-8">${footnote.nota}</div>
                    <div class="col-1 button_div login_td" onclick="delete_footnote(${footnote.id},'${footnote.nota}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                    <div class="col-1 button_div login_td" onclick="edit_footnote(${footnote.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div></div>`
                    $("#footnotes").append(footnotes_content)
                })
                check_login()
            })
    }
    initial_load()

})
