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
    check_login()

    var dimension_details

    highlight = (div) => {
        console.log("highlight" + div)
    }

    open_window = (url) => {
        location.href(url);
    };

    create_tooltips = () => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    }

    populate_type = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        let url_data = `${base_url}/tipo_dimension/?format=json`
        fetch(url_data, requestOptions)
            .then((resp) => resp.json())
            .then(function (data) {
                $("#tipo").empty()
                if (id) {
                    var current_dimension = dimension_details.filter((obj) => {
                        return obj.id == id
                    })
                    var selected_type = current_dimension[0].type
                }
                $.each(data, (i, tipo) => {
                    var selected = ''
                    if (tipo.id == selected_type) {
                        selected = 'selected'
                    }
                    $("#tipo").append(`<option ${selected} value="${tipo.id}">${tipo.descripcion}</option>`)
                })
            })
    }

    add_dimension = () => {

        //populate_areas_dimensions(false)

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $(".members_div").hide()


        $(`#abm`).show();
        document.getElementById("dimension_form").reset();
        $(".collapse").removeClass("show")
        $("#dimension_form").show()

        $(`#header_add`).show();
        $(`#buttons_add`).show();
        populate_type()
    }

    get_dimension_data = (origin) => {
        console.log(origin)
        var dimension = {
            "descripcion": $("#descripcion").val(),
            "descripcion_ingles": $("#descripcion_ingles").val(),
            "descripcion_frances": $("#descripcion_frances").val(),
            "descripcion_portugues": $("#descripcion_portugues").val(),
            "orden": 0,
            "sdmx": $("#sdmx").val(),
            "code": $("#code").val(),
            "tipo": $("#tipo").val(),
            "dimension_padre": null
        }
        console.log(dimension)

        return dimension;
    }

    save_add_dimension = () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_dimension_data('new'));

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/dimension/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#dimension_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(`#dimension_form`).hide();
                    $(`.buttons_abm`).hide();
                    $("#success_add").show()
                } else {
                    console.log("fracaso")
                    $(`.buttons_abm`).hide();
                    $("#error_add").show()
                    $("#error_add_content").empty()
                    $.each(result, (i, val) => {
                        if (i == 'descripcion') { i = 'Nombre de la dimensión' }
                        if (i == 'dimension_padre') {
                            $.each(val.dimensiones, (n, dimension) => {
                                $("#error_add_content").append(`<b>Dimensiones asociadas</b>: ${dimension}<br>`)
                            })
                        } else {
                            $("#error_add_content").append(`<b>${i}</b>: ${val}<br>`,)
                        }
                    })


                }
            }).catch(error => {
                console.log('error', error)
            });
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

        fetch(`${base_url}/dimension/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $(".buttons_abm").hide()
                $(".message_abm").hide()
                $("#dimension_" + id).hide()
                $(`#success_delete`).show();
                initial_load()
            })
    }

    delete_dimension = (id, text) => {
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#dimension_form").hide()

        $("#header_delete").show()
        $("#danger_delete").show()
        $("#buttons_delete").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
        $(".add").hide()
        $(".abm").show()
    }

    edit_dimension = (id) => {

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#members_div").hide()
        $("#header_edit").show()
        $("#buttons_edit").show()
        $(".add").hide()
        $(".abm").show()

        var dimension_data = dimension_details.filter(function (obj) {
            return obj.id == id;
        });
        $("#descripcion").val(dimension_data[0].name)
        console.log(dimension_data[0].orden)
        $("#sdmx").val(dimension_data[0].sdmx)
        $("#tipo").val(dimension_data[0].type)
        $("#edit_button").attr('onclick', `send_edit(${id})`)
        $("#dimension_form").show()
        populate_type(id)

    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_dimension_data());

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/dimension/${id}/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#dimension_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $("#dimension_form").hide()
                    $("#buttons_edit").hide()
                    $("#success_edit").show()
                } else {
                    console.log("fracaso")
                    $("#buttons_edit").hide()
                    $("#error_editing_content").empty()
                    $.each(result, (i, val) => {
                        if (i == 'descripcion') { i = 'Nombre de la dimensión' }
                        if (i == 'dimension_padre') {
                            $.each(val.dimensiones, (n, dimension) => {
                                $("#error_edit_content").append(`<b>Dimensión padre</b>: ${dimension}<br>`)
                            })
                        } else {
                            $("#error_edit_content").append(`<b>${i}</b>: ${val}<br>`,)
                        }
                    })
                    $("#error_edit").show()
                }
            }).catch(error => {
                console.log('error', error)
            });
    }

    toggle_id = (item) => {
        $(`.id_${item}`).toggle()
    }

    display_members_children = (children, n) => {
        $.each(children, (i, member) => {
            $(`#member_children_${member.parent}`).append(`<div id="member_${member.id}">
            <div style="background-color:whitesmoke;padding:1rem ${n}rem;margin:0.2rem;"><span style="margin-right:0.5rem;"><img style="margin-top:-0.6rem;" src="../images/icons/ellipsis-vertical-solid.svg" class="image_svg"><img src="../images/icons/ellipsis-solid.svg" class="image_svg"></span><span class="id_member" style="display:none;">[${member.id}] </span>${member.name}</div>
            <div id="member_children_${member.id}"></div>
            </div>`)
            var level = n + 1
            if (member.members) { display_members_children(member.members, level) }
        })
    }

    display_members = (id) => {
        $("#members_id_switch").prop('checked', false);
        $("#abm").hide()
        $(".message_abm").hide()
        $("#members_div").show()
        $("#members").empty()
        $(".temporal_add").remove()

        var current_dimension = dimension_details.filter((obj) => {
            return obj.id == id
        })
        $("#dimension_title").html(`Miembros de la dimensión <b>${current_dimension[0].name}</b>`)
        console.log(current_dimension[0].members)
        $.each(current_dimension[0].members, (i, member) => {
            $("#members").append(`<div id="member_${member.id}">
            <div style="background-color:whitesmoke;padding:1rem;margin:0.2rem;"><span class="id_member" style="display:none;">[${member.id}] </span>${member.name}</div>
            <div id="member_children_${member.id}"></div>
            </div>`)
            if (member.members) { display_members_children(member.members, 2) }
        })
        $("#members_div").prepend(`<button style="margin-bottom: 0.5rem;" type="button" class="btn btn-success temporal_add login_button" id="edit_member_button" onclick="location.href='../members/?dimension_id=${id}&t=${t}'">Editar miembros de la dimensión</button>`)
        if (current_dimension[0].members.length == 0) {
            $("#warning_members").show()
            $("#edit_member_url").prop("href", `../members?dimension_id=${id}`)
        }

        $("#members").show()
        document.getElementById(`edit_member_button`).scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
        if (t == '') {
            console.log("no hay cookie")
            $(".login_td").addClass("unactive_button")
            $(".login_button").removeClass("btn-success")
            $(".login_button").addClass("btn-light")
            $(".login_button").css("color","gainsboro")
            $(".login_button").css("pointer-events","none")
        }
    }

    initial_load = () => {

        $("#dimensions").empty()

        let url_data = `${base_url}/dimension/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {

                dimension_details = data.body.dimensions;
                data.body.dimensions.sort((a, b) => a.id - b.id);

                $.each(data.body.dimensions, (i, dimension) => {
                    var icon
                    if (dimension.type == 1) { icon = `<img class="image_svg" src="../images/icons/earth-americas-solid.svg"  data-bs-toggle="tooltip" title="Esta dimensión es geoespacial. Permite la representación cartográfica de los indicadores">  ` }
                    else if (dimension.type == 2) { icon = `<img class="image_svg" src="../images/icons/hourglass-half-solid.svg" data-bs-toggle="tooltip" title="Esta dimensión es temporal. Permite el uso de herramientas temporales en el geoportal">  ` }
                    else { icon = '' }
                    let dimension_content = `<div class="row" id="indicator_${dimension.id}">
                <div class="col-1 button_div">${dimension.id}</div>
                <div class="source col-8" id="source_${dimension.id}">${icon}${dimension.name}</div>
                <div class="col-1 button_div login_td" data-bs-toggle="tooltip" title="Eliminar dimensión" onclick="delete_dimension(${dimension.id},'${dimension.name}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                <div class="col-1 button_div login_td" data-bs-toggle="tooltip" title="Editar metadatos de la dimensión" onclick="edit_dimension(${dimension.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                <div class="col-1 button_div" onclick="display_members(${dimension.id})" data-bs-toggle="tooltip" title="Desplegar miembros de la dimensión"><img class="image_button" src="../images/icons/folder-tree-solid.svg"></div></div>`
                    $("#dimensions").append(dimension_content)
                })
                create_tooltips()

                if (t == '') {
                    console.log("no hay cookie")
                    $(".login_td").addClass("unactive_button")
                    $(".login_button").removeClass("btn-success")
                    $(".login_button").addClass("btn-light")
                    $(".login_button").css("color", "gainsboro")
                    $(".login_button").css("pointer-events", "none")
                }
                check_login()
                $(".skeleton_div").remove()
            })
    }
    initial_load()
})
