$(document).ready(function () {

    let t = getCookie("t")

    check_login = () => {
        if (t == '') {
            console.log("no hay cookie")
            $("#login_btn").hide()
            $("#logout_btn").show()
            $(".login_td").addClass("unactive_button")
            $(".login_button").removeClass("btn-success")
            $(".login_button").addClass("btn-light")
            $(".login_button").css("color", "gainsboro")
            $(".login_button").css("pointer-events", "none")
        }
    }

    let tree_id = getQueryVariableGET('tree_id');

    var branches_details
    var branches_objects = {}
    var changing_branch
    var order_changes = []

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


    get_branch_data = (id) => {

        var branch = {
            "descripcion": $("#descripcion").val(),
            "descripcion_ingles": $("#descripcion_ingles").val(),
            "descripcion_frances": $("#descripcion_frances").val(),
            "descripcion_portugues": $("#descripcion_portugues").val(),
            "descripcion_larga": $("#descripcion_larga").val(),
            "descripcion_larga_ingles": $("#descripcion_larga_ingles").val(),
            "descripcion_larga_frances": $("#descripcion_larga_frances").val(),
            "descripcion_larga_portugues": $("#descripcion_larga_portugues").val(),
            "visible": $("#visible").val(),
        }

        if (id) {
            branch.dimension_padre = id
        }
        console.log(branch)

        return branch;
    }

    save_add_branch = (id) => {

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = get_branch_data();

        raw.area_padre = id

        raw = JSON.stringify(raw);

        console.log(raw)

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/area`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#branch_form").hide()
                $(`#add`).removeClass("btn-light")
                $(`#add`).addClass("btn-success")
                $(`#add`).css("pointer-events", "all");
                document.getElementById("branch_form").reset();
                $(`#save_add_branch`).remove();

                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(`#branch_form`).hide();

                    $(`.buttons_abm`).hide();
                    $(`.new_record`).hide();
                    $("#success_add").show()
                } else {
                    console.log("fracaso")
                    $(`.buttons_abm`).hide();
                    $("#error_add").show()
                    $("#error_add_content").empty()
                    $.each(result, (i, val) => {
                        if (i == 'descripcion') { i = 'Nombre del miembro de la dimensión' }
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
        $(`.member_body`).css(`padding-left`, '0rem')
        $(`.abm`).hide();
        $(`.message_abm`).hide();
        $(`.button_div`).show()
        $(`.new_record`).hide()
        $(`.new_order`).hide()
        $(`#add`).removeClass("btn-light")
        $(`#add`).addClass("btn-success")
        $(`#add`).css("pointer-events", "all")
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

        fetch(`${base_url}/area/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $(".buttons_abm").hide()
                $(".message_abm").hide()
                $("#member_" + id).hide()
                $(`#success_delete`).show();
                $(`#add`).css("pointer-events", "all");
                initial_load()
            })
    }

    delete_branch = (id, text) => {
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#branch_form").hide()

        $("#header_delete").show()
        $("#danger_delete").show()
        $("#buttons_delete").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
        $(".abm").show()
        document.getElementById("header_delete").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
    }

    edit_branch = (id) => {

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#header_edit").show()
        $("#buttons_edit").show()
        $(".abm").show()

        var branch_data = branches_objects[id]
        $("#descripcion").val(branch_data.descripcion)
        $("#descripcion_ingles").val(branch_data.descripcion_ingles)
        $("#descripcion_frances").val(branch_data.descripcion_frances)
        $("#descripcion_portugues").val(branch_data.descripcion_portugues)
        $("#descripcion_larga").val(branch_data.descripcion_larga)
        $("#descripcion_larga_ingles").val(branch_data.descripcion_larga_ingles)
        $("#descripcion_larga_frances").val(branch_data.descripcion_larga_frances)
        $("#descripcion_larga_portugues").val(branch_data.descripcion_larga_portugues)

        $("#visible").val(branch_data.visible)

        $("#edit_button").attr('onclick', `send_edit(${id})`)
        $("#branch_form").show()
        document.getElementById("header_edit").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");


        var raw = JSON.stringify(get_branch_data(id));
        //var raw2 = '{"descripcion":"ODS 14","descripcion_ingles":"","descripcion_frances":"","descripcion_portugues":"","descripcion_larga":"","descripcion_larga_ingles":"","descripcion_larga_frances":"","descripcion_larga_portugues":"","visible":true}'
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
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $("#branch_form").hide()
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

    highlight_off = (id) => {
        console.log("highlight_off")
        $(`#member_title_${id}`).css({ "background-color": 'whitesmoke', "font-weight": 'normal' })
    }

    highlight_on = (id) => {
        console.log("highlight_on")
        $(`#member_title_${id}`).css({ "background-color": '#dcd9d6', "font-weight": 'bold' })
    }

    create_branch = (id) => {
        console.log(id)
        $(`.branch_body`).css(`padding-left`, '0rem')
        $(`.new_record`).hide()
        $(`#add_child_${id}`).show()
        $(`.button_div`).show()
        $(`#cancel_add`).hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $(".message_abm").hide()
        $(`#abm`).show()
        $(`#header_add`).show()
        $(`#buttons_add`).show()
        $(`#branch_form`).show()
        $(`#buttons_add`).append(`<button type="button" class="btn btn-success" id="save_add_branch" onclick="save_add_branch(${id})">Guardar</button>`)
        document.getElementById("header_add").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
    }

    cancel_add = () => {
        $(`.branch_body`).css(`padding-left`, '0rem')
        $(`.new_order`).hide()
        $(`.new_record`).hide()
        $(`#cancel_add`).hide()
        $(`.button_div`).show()
        $(`#add`).removeClass("btn-light")
        $(`#add`).addClass("btn-success")
        $(`#add`).css("pointer-events", "all")
    }

    add_member = () => {
        $(`.branch_body`).css(`padding-left`, '2rem')
        $(`.new_record`).show()
        $(`#cancel_add`).show()
        $(`.button_div`).hide()
        $(`#add`).removeClass("btn-success")
        $(`#add`).addClass("btn-light")
        $(`#add`).css("pointer-events", "none")
    }

    change_order = (id) => {
        console.log("change order " + id)
        $(`#member_${id}`).css({ "pointer-events": "none", "opacity": 0.2 })
        changing_branch = id
        $(`.member_body`).css(`padding-left`, '2rem')
        $(`.new_order`).show()
        $(`#cancel_add`).show()
        $(`.button_div`).hide()
        $("#header_order").show()
        $("#abm").show()
        $("#branch_form").hide()
        $("#success_order").show()
        $("#buttons_order").show()
        $(`#add`).removeClass("btn-success")
        $(`#add`).addClass("btn-light")
        $(`#add`).css("pointer-events", "none")
        $(`#cancel_add`).removeClass("btn-success")
        $(`#cancel_add`).addClass("btn-light")
        $(`#cancel_add`).css("pointer-events", "none")
    }

    send_reorder = () => {

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");
        var proccessed_dim = 0

        $.each(order_changes, (i, branch) => {
            console.log(branch)
            var branch_data = branches_objects[branch.id]
            console.log(branch_data)
            raw = {
                "descripcion": branch_data.descripcion,
                "descripcion_ingles": branch_data.descripcion_ingles,
                "descripcion_frances": branch_data.descripcion_frances,
                "descripcion_portugues": branch_data.descripcion_portugues,
                "descripcion_larga": branch_data.descripcion_larga,
                "descripcion_larga_ingles": branch_data.descripcion_larga_ingles,
                "descripcion_larga_frances": branch_data.descripcion_larga_frances,
                "descripcion_larga_portugues": branch_data.descripcion_larga_portugues,
                "visible": branch_data.visible,
                "area_padre": branch_data.area_padre,
            }
            console.log(raw)
            var raw = JSON.stringify(raw);


            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(`${base_url}/area/${branch.id}/`, requestOptions)
                //.then(response => response.json())
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if (result.id) {
                        console.log("EXITO")
                        proccessed_dim = proccessed_dim + 1
                        if (order_changes.length == proccessed_dim) {
                            $("#order_button").remove()
                            $(`#branch_${changing_branch}`).css({ "pointer-events": "all", "opacity": 1 })
                            initial_load()
                        }
                    } else {
                    }
                }).catch(error => {
                    console.log('error', error)
                }).then(result => {
                    cancel()
                });
        })
    }

    set_new_order = (parent, order) => {

        console.log("set_new_order ", parent, order)
        $(".message_abm").hide()
        $("#order_content").empty()

        document.getElementById("header_order").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });

        $("#warning_order2").show()
        $("#order_content2").text(branches_objects[changing_branch].descripcion)

        if (branches_objects[changing_branch].children.length > 0) {
            $("#order_content2").text(branches_objects[changing_branch].descripcion + ' y sus miembros de dimensión dependientes')
        } else {
            $("#order_content2").text(branches_objects[changing_branch].descripcion)
        }

        var parent_obj = branches_objects[parent]
        if (parent_obj.children.length > 0) {
            $("#danger_order").show()
        }
        var siblings = parent_obj.children
        siblings.sort((a, b) => a.order - b.order);
        var siblings_array = []
        siblings.map((sibling) => {
            if (sibling.id != changing_branch) { siblings_array.push(sibling.id) }
        })
        console.log(siblings_array)
        siblings_array.splice(order, 0, changing_branch)
        order_changes.push({ id: changing_branch, order: order, parent: parent })
        $.each(siblings_array, (i, sibling) => {
            if (i == branches_objects[sibling].order) {
                console.log(sibling + "NO CAMBIA")
            } else {
                if (sibling != changing_branch) {
                    order_changes.push({ id: sibling, order: i, parent: parent })
                    $("#order_button").show()
                    console.log(sibling + "SI CAMBIA")
                    $("#order_content").append(`<li>${branches_objects[sibling].descripcion}</li>`)
                }
            }
        })
        $("#buttons_order").append(`<button type="button" class="btn btn-success" id="order_button" onclick="send_reorder()">Guardar</button>`)
    }

    display_branches_children = (children, n) => {

        console.log("display_branches_children")
        children.sort((a, b) => a.id - b.id);
        $.each(children, (i, branch) => {
            branches_objects[branch.id] = branch
            if (i == 0) {
                $(`#branch_children_${branch.area_padre}`).append(`<div class="new_order off" id="reorder_${branch.area_padre}" onclick="set_new_order(${branch.area_padre},0)"><-> Antes de ${branch.descripcion} <-></div>`)
            }
            $(`#branch_children_${branch.area_padre}`).append(`<div id="branch_${branch.id}">
                <div id="branch_title_${branch.id}" style="padding-left:${n}rem;display: flex;justify-content: flex-end;background-color:whitesmoke;margin:0.2rem;display:flex;">
                    <div style="cursor:pointer; width: -webkit-fill-available;padding: 1rem;" data-bs-toggle="collapse" data-bs-target="#branch_children_${branch.id}"><span style="margin-right:0.5rem;"><img style="margin-top:-0.6rem;" src="../images/icons/ellipsis-vertical-solid.svg" class="image_svg"><img src="../images/icons/ellipsis-solid.svg" class="image_svg"></span><span class="id_branch" style="display:none;">[${branch.id}] </span>${branch.descripcion}</div>
                    <div class="button_div"data-bs-toggle="tooltip" title="Eliminar rama" onclick="delete_branch(${branch.id},'${branch.descripcion}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                    <div class="button_div" data-bs-toggle="tooltip" title="Editar metadatos" onclick="edit_branch(${branch.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                    <div class="button_div" onclick="change_order(${branch.id})" data-bs-toggle="tooltip" title="Cambiar de ubicación"><img class="image_button" src="../images/icons/arrow-down-up-across-line-solid.svg"></div>
                </div>
                <div class="new_order off" id="reorder_${branch.area_padre}" style="" onclick="set_new_order(${branch.area_padre},${i + 1})"><-> Después de ${branch.descripcion} <-></div>
            </div>`)
            var level = n + 2
            if (branch.children.length > 0) {
                $(`#branch_${branch.id}`).append(`<div id="branch_children_${branch.id}" class="collapse show branch_body">
                <div id="add_child_${branch.id}" class="new_record off" onmouseover="highlight_on(${branch.id})" onmouseleave="highlight_off(${branch.id})" onclick="create_branch(${branch.id})">+</div>
                </div>`)
                display_branches_children(branch.children, level);
            } else {
                $(`#branch_${branch.id}`).append(`<div id="branch_children_${branch.id}" class="collapse show branch_body">
                <div class="new_order off" id="reorder_${tree_id}" onclick="set_new_order(${branch.id},0)"><-> Dentro de ${branch.descripcion} <-></div>
                <div id="add_child_${branch.id}" class="new_record off" onmouseover="highlight_on(${branch.id})" onmouseleave="highlight_off(${branch.id})" onclick="create_branch(${branch.id})">+</div>
                </div>`)
                display_branches_children(branch.children, level);
            }
        })
    }

    initial_load = () => {

        $("#branches").empty()
        tree_details = []

        let url_data = `${base_url}/area/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {
                var tree_elements = []//todos 
                var tree_level = {}

                var array = []
                $.each(data, (i, tree) => {
                    branches_objects[tree.id] = tree
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

                branches_details = data.filter(obj => obj.id == tree_id)[0]
                console.log(branches_details)

                $("#branches").empty()


                $("#branches").append(`<div  id="add_child_${tree_id}" class="new_record off" onclick="create_branch(${tree_id})">+</div>`)

                $.each(branches_details.children, (i, branch) => {
                    if (i == 0) {
                        $("#branches").append(`<div class="new_order off" id="reorder_${tree_id}" onclick="set_new_order(${tree_id},0)"><-> Antes de ${branch.descripcion} <-></div>`)
                    }
                    branches_objects[branch.id] = branch
                    $("#branches").append(`<div id="branch_${branch.id}">
                                <div style="display: flex;justify-content: flex-end;background-color:whitesmoke;margin:0.2rem;display:flex;">
                                    <div id="branch_title_${branch.id}" style="cursor:pointer;width: -webkit-fill-available;padding: 1rem;" data-bs-toggle="collapse" data-bs-target="#branch_children_${branch.id}"><span class="id_branch" style="display:none;">[${branch.id}] </span>${branch.descripcion}</div>
                                    <div class="button_div"data-bs-toggle="tooltip" title="Eliminar rama" onclick="delete_branch(${branch.id},'${branch.descripcion}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                                    <div class="button_div" data-bs-toggle="tooltip" title="Editar metadatos" onclick="edit_branch(${branch.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                                    <div class="button_div" onclick="change_order(${branch.id})" data-bs-toggle="tooltip" title="Cambiar de ubicación"><img class="image_button" src="../images/icons/arrow-down-up-across-line-solid.svg"></div>
                                </div>
                                <div class="new_order off" id="reorder_${tree_id}" onclick="set_new_order(${tree_id},${i + 1})"><-> Después de ${branch.descripcion} <-></div>
                            </div>`)
                    if (branch.children.length > 0) {

                        $(`#branch_${branch.id}`).append(`<div id="branch_children_${branch.id}" class="collapse show branch_body">
                                <div id="add_child_${branch.id}" class="new_record off" onmouseover="highlight_on(${branch.id})" onmouseleave="highlight_off(${branch.id})" onclick="create_branch(${branch.id})">+</div>
                                </div>`)
                        display_branches_children(branch.children, 1);
                    } else {
                        $(`#branch_${branch.id}`).append(`<div id="branch_children_${branch.id}" class="collapse show branch_body">
                                <div class="new_order off" id="reorder_${tree_id}" onclick="set_new_order(${branch.id},0)"><-> Dentro de ${branch.descripcion} <-></div>
                                <div id="add_child_${branch.id}" class="new_record off" onmouseover="highlight_on(${branch.id})" onmouseleave="highlight_off(${branch.id})" onclick="create_branch(${branch.id})">+</div>
                                </div>`)
                        display_branches_children(branch.children, 1);
                    }
                    //if (member.members) { display_members_children(member.members, 1) }

                })
                create_tooltips()

            })
    }
    initial_load()
})
