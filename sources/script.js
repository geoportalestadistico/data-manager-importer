$(document).ready(function () {

    let t = getCookie("t")

    check_login = () => {
        console.log("no hay cookie")
        $("#login_btn").show()
        $("#logout_btn").hide()
        $(".login_td").addClass("unactive_button")
        $(".login_button").removeClass("btn-success")
        $(".login_button").addClass("btn-light")
        $(".login_button").css("color","gainsboro")
        $(".login_button").css("pointer-events","none")
    }

    var sources_details

    add = () => {
        $(".abm").hide()
        $(`#add_source`).show();
        $("#add_source_form").show()
        document.getElementById("add_source_form").reset();
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

        fetch(`${base_url}/fuente/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $("#source_" + id).hide()
                $(`#delete_source`).hide();
            })
    }

    delete_source = (id, text) => {
        $(".abm").hide()
        $("#delete_source").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
    }

    edit_source = (id) => {
        $(".abm").hide()
        $("#edit_source").show()
        $("#edit_source_form").show()


        var source_data = sources_details.filter(function (obj) {
            return obj.id == id;
        });

        $("#source_name_edit").val(source_data[0].nombre_publicacion)
        //$("#source_name_edit").attr("placeholder",source_data[0].nombre_publicacion)
        $("#source_name_en_edit").val(source_data[0].nombre_publicacion_ingles)
        //$("#source_name_en_edit").attr("placeholder",source_data[0].nombre_publicacion_ingles)
        $("#source_name_fr_edit").val(source_data[0].nombre_publicacion_frances)
        //$("#source_name_fr_edit").attr("placeholder",source_data[0].nombre_publicacion_frances)
        $("#source_name_pt_edit").val(source_data[0].nombre_publicacion_portugues)
        //$("#source_name_pt_edit").attr("placeholder",source_data[0].nombre_publicacion_portugues)
        $("#source_url_edit").val(source_data[0].url)
        // $("#source_url_edit").attr("placeholder",source_data[0].url)

        $("#edit_button").attr('onclick', `send_edit(${id})`)

        console.log(source_data[0])
    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var source = {
            "nombre_publicacion": $("#source_name_edit").val(),
            "url": $("#source_url_edit").val(),
        }

        console.log($("#source_name_edit").val())

        if ($("#source_name_en_edit").val() != '') {
            source.nombre_publicacion_ingles = $("#source_name_en_edit").val()
        }
        if ($("#source_name_fr_edit").val() != '') {
            source.nombre_publicacion_frances = $("#source_name_fr_edit").val()
        }
        if ($("#source_name_pt_edit").val() != '') {
            source.nombre_publicacion_portugues = $("#source_name_pt_edit").val()
        }

        if ($("#sdmx_edit").val() != '') {
            source.sdmx = $("#sdmx_edit").val()
        }
        if ($("#code_edit").val() != '') {
            source.code = $("#code_edit").val()
        }

        console.log(source)
        var raw = JSON.stringify(source);

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/fuente/${id}/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#edit_source_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
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

        var source = {
            "nombre_publicacion": $("#source_name").val(),
            "url": $("#source_url").val(),
        }

        if ($("#source_name_en").val() != '') {
            source.nombre_publicacion_ingles = $("#source_name_en").val()
        }
        if ($("#source_name_fr").val() != '') {
            source.nombre_publicacion_frances = $("#source_name_fr").val()
        }
        if ($("#source_name_pt").val() != '') {
            source.nombre_publicacion_portugues = $("#source_name_pt").val()
        }

        if ($("#sdmx").val() != '') {
            source.sdmx = $("#sdmx").val()
        }
        if ($("#code").val() != '') {
            source.code = $("#code").val()
        }


        var raw = JSON.stringify(source);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/fuente/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#add_source_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $("#add_source").hide()
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


        /*                 console.log(response.status);)
                        .then(result => {
                            console.log(result)  
                            $("#add_source_form").hide()            
                        })
                        .catch(error => {
                            console.log('error', error)
                        }); */

    }

    initial_load = () => {
        let url_data = `${base_url}/fuente/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {

                sources_details = data;

                $("#sources").empty()
                data.sort((a, b) => a.id - b.id);
                $.each(data, (i, source) => {
                    //console.log(source)
                    let source_content = `<div class="row" id="source_${source.id}">
                    <div class="button_div col-1">${source.id}</div>
                    <div class="source col-8">${source.nombre_publicacion}</div>
                    <div class="col-1 button_div login_td" onclick="delete_source(${source.id},'${source.nombre_publicacion}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                    <div class="col-1 button_div login_td" onclick="edit_source(${source.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div></div>`
                    $("#sources").append(source_content)
                })
                if (t == '') {
                    check_login()
                }
            })
    }
    initial_load()

})
