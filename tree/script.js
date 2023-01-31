$(document).ready(function () {
    function getQueryVariableGET(variable) {
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return false;
    };

    let t = getCookie("t")

    check_login = () => {
        if (t == '') {
            console.log("no hay cookie")
            $("#login_btn").hide()
            $("#logout_btn").show()
            $(".login_td").addClass("unactive_button")
            $(".login_button").removeClass("btn-success")
            $(".login_button").addClass("btn-light")
            $(".login_button").css("color","gainsboro")
            $(".login_button").css("pointer-events","none")
        }
    }

    console.log(t)

    var tree_details = []

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

    add_tree = () => {

        //populate_areas_dimensions(false)

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $(".members_div").hide()


        $(`#abm`).show();
        document.getElementById("tree_form").reset();
        $(".collapse").removeClass("show")
        $("#tree_form").show()

        $(`#header_add`).show();
        $(`#buttons_add`).show();

    }

    get_tree_data = (origin) => {
        console.log(origin)
        var tree = {
            "descripcion": $("#descripcion").val(),
            "descripcion_ingles": $("#descripcion_ingles").val(),
            "descripcion_frances": $("#descripcion_frances").val(),
            "descripcion_portugues": $("#descripcion_portugues").val(),
            "descripcion_larga": $("#descripcion_larga").val(),
            "descripcion_larga_ingles": $("#descripcion_larga_ingles").val(),
            "descripcion_larga_frances": $("#descripcion_larga_frances").val(),
            "descripcion_larga_portugues": $("#descripcion_larga_portugues").val(),
            "visible": $("#visible").val(),
            "area_padre": null
        }
        console.log(tree)

        return tree;

    }

    save_add_tree = () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_tree_data('new'));

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/v1/area/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#tree_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(`#tree_form`).hide();
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

        fetch(`${base_url}/area/${id}` , requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $(".buttons_abm").hide()
                $(".message_abm").hide()
                $("#tree_" + id).hide()
                $(`#success_delete`).show();
                initial_load()
            })
    }

    delete_tree = (id, text) => {
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#tree_form").hide()

        $("#header_delete").show()
        $("#danger_delete").show()
        $("#buttons_delete").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
        $(".add").hide()
        $(".abm").show()
    }

    edit_tree = (id) => {

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#branches_div").hide()
        $("#header_edit").show()
        $("#buttons_edit").show()
        $(".add").hide()
        $(".abm").show()

        var tree_data = tree_details.filter(function (obj) {
            return obj.id == id;
        });
        $("#descripcion").val(tree_data[0].descripcion)
        $("#descripcion_ingles").val(tree_data[0].descripcion_ingles)
        $("#descripcion_frances").val(tree_data[0].descripcion_frances)
        $("#descripcion_portugues").val(tree_data[0].descripcion_portugues)

        $("#descripcion_larga").val(tree_data[0].descripcion_larga)
        $("#descripcion_larga_ingles").val(tree_data[0].descripcion_larga_ingles)
        $("#descripcion_larga_frances").val(tree_data[0].descripcion_larga_frances)
        $("#descripcion_larga_portugues").val(tree_data[0].descripcion_larga_portugues)

        $("#visible").val(tree_data[0].visible)

        $("#edit_button").attr('onclick', `send_edit(${id})`)
        $("#tree_form").show()


    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_tree_data());

        console.log(raw)

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/area/${id}/`, requestOptions)
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

    display_branches_children = (children, n, parent) => {
        $.each(children, (i, branch) => {
            $(`#member_children_${parent}`).append(`<div id="member_${branch.id}">
            <div style="background-color:whitesmoke;padding:1rem ${n}rem;margin:0.2rem;"><span style="margin-right:0.5rem;"><img style="margin-top:-0.6rem;" src="../images/icons/ellipsis-vertical-solid.svg" class="image_svg"><img src="../images/icons/ellipsis-solid.svg" class="image_svg"></span><span class="id_branch" style="display:none;">[${branch.id}] </span>${branch.descripcion}</div>
            <div id="member_children_${branch.id}"></div>
            </div>`)
            var level = n + 1
            if (branch.children) { display_branches_children(branch.children, level, branch.id) }
        })
    }

    display_branches = (id) => {
        $("#branches_id_switch").prop('checked', false);
        $("#abm").hide()
        $(".message_abm").hide()
        $("#branches_div").show()
        $("#branches").empty()
        $(".temporal_add").remove()

        var current_tree = tree_details.filter((obj) => {
            return obj.id == id
        })
        $("#tree_title").html(`Ramas del árbol <b>${current_tree[0].descripcion}</b>`)
        console.log(current_tree[0].children)
        $.each(current_tree[0].children, (i, branch) => {
            $("#branches").append(`<div id="branch_${branch.id}">
            <div style="background-color:whitesmoke;padding:1rem;margin:0.2rem;"><span class="id_branch" style="display:none;">[${branch.id}] </span>${branch.descripcion}</div>
            <div id="member_children_${branch.id}"></div>
            </div>`)
            if (branch.children) { display_branches_children(branch.children, 2, branch.id) }
        })
        $("#branches_div").prepend(`<button style="margin-bottom: 0.5rem;" type="button" class="btn btn-success temporal_add login_button" id="edit_branches_button" onclick="location.href='../branches/?tree_id=${id}&t=${t}'">Editar ramas del árbol</button>`)
        if (current_tree[0].children.length == 0) {
            $("#warning_branches").show()
            $("#edit_branch_url").prop("href", `../branches?tree_id=${id}&t=${t}`)
        }

        $("#branches").show()
        document.getElementById(`edit_branches_button`).scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
        check_login()
    }

    initial_load = () => {

        $("#tree").empty()
        tree_details = []

        let url_data = `${base_url}/area/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {
                var tree_elements = []//todos 
                var tree_level = {}
                console.log(data)
                var array = []
                $.each(data, (i, tree) => {
                    if (tree.area_padre == null) {
                        array.push(tree.id)
                        tree_elements.push(tree.id)
                        tree.children = []
                        tree_details.push(tree)
                    }
                })
                tree_level["0"] = array
                var level = 0
                var process_tree = () => {
                    console.log(data.length, tree_elements.length)
                    if (data.length == tree_elements.length) { }
                    else {
                        level = level + 1
                        var array = []
                        $.each(data, (i, tree) => {
                            if (tree_level[level - 1].indexOf(tree.area_padre) > -1) {
                                array.push(tree.id)
                                tree_elements.push(tree.id)
                            }
                        })
                        tree_level[level] = array
                        process_tree()
                    }
                }
                process_tree()

                for (let i = level; i > -1; i--) {
                    $.each(data, (n, tree) => {
                        if (tree_level[i].indexOf(tree.id) > -1) {
                            data[n].children = []
                            var children = data.filter(obj => obj.area_padre == tree.id)
                            $.each(children, (q, child) => {
                                data[n].children.push(child)
                            })
                        }
                    })
                }

                console.log(tree_details)

                $.each(tree_details, (i, tree) => {
                    let tree_content = `<div class="row" id="indicator_${tree.id}">
                   <div class="col-1 button_div">${tree.id}</div>
                   <div class="source col-8" id="source_${tree.id}">${tree.descripcion}</div>
                   <div class="col-1 button_div login_td" data-bs-toggle="tooltip" title="Eliminar dimensión" onclick="delete_tree(${tree.id},'${tree.descripcion}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                   <div class="col-1 button_div login_td" data-bs-toggle="tooltip" title="Editar metadatos de la dimensión" onclick="edit_tree(${tree.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                   <div class="col-1 button_div" onclick="display_branches(${tree.id})" data-bs-toggle="tooltip" title="Desplegar ramas del árbol"><img class="image_button" src="../images/icons/folder-tree-solid.svg"></div></div>`
                    $("#tree").append(tree_content)
                })
                create_tooltips()
                check_login()
            })
    }
    initial_load()

})
