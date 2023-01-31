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

    let dimension_id = getQueryVariableGET('dimension_id');

    let tipo_dimension

    var members_details
    var members_objects = {}
    var changing_member
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

    get_member_data = (id) => {

        var member = {
            "descripcion": $("#descripcion").val(),
            "descripcion_ingles": $("#descripcion_ingles").val(),
            "descripcion_frances": $("#descripcion_frances").val(),
            "descripcion_portugues": $("#descripcion_portugues").val(),
            "orden": Number($("#orden").val()),
            "sdmx": $("#sdmx").val(),
            "code": $("#code").val(),
            "tipo": tipo_dimension
        }
        if (id) {
            member.dimension_padre = id
        }
        return member;
    }
    console.log(Number($("#orden").val()))

    save_add_member = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_member_data(id));

        console.log(raw)

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/dimension`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#member_form").hide()
                $(`#add`).removeClass("btn-light")
                $(`#add`).addClass("btn-success")
                $(`#add`).css("pointer-events","all")
                $(`#massive_edit`).removeClass("btn-light")
                $(`#massive_edit`).addClass("btn-success")
                $(`#massive_edit`).css("pointer-events","all")
                
                initial_load()
                if (result.id) {
                    console.log("exito")
                    
                    $(`#save_add_member`).hide();
                    $(`#member_form`).hide();
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
        $("#buttons_delete").hide()
        $("#buttons_edit").hide()        
        $(`.message_abm`).hide();
        $(`.button_div`).show()
        $(`.new_record`).hide()
        $(`.new_order`).hide()
        $(`#add`).removeClass("btn-light")
        $(`#add`).addClass("btn-success")
        $(`#add`).css("pointer-events", "all")
        $(`#massive_edit`).removeClass("btn-light")
        $(`#massive_edit`).addClass("btn-success")
        $(`#massive_edit`).css("pointer-events", "all")
        $("div").css("opacity","1")
        $("div").css("pointer-events","all")
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
                $(`#add`).css("pointer-events", "all");
                initial_load()
            })
    }

    delete_member = (id, text) => {
        $(".abm").hide()
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#member_form").hide()

        $("#header_delete").show()
        $("#danger_delete").show()
        $("#buttons_delete").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
        $("#abm").show()
        document.getElementById("header_delete").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
    }

    edit_member = (id) => {
        $(".abm").hide()
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#header_edit").show()
        $("#buttons_edit").show()
        $("#abm").show()

        console.log(members_objects[id])
        var member_data = members_objects[id]

        $("#descripcion").val(member_data.name)
        $("#orden").val(member_data.order)
        $("#sdmx").val(member_data.sdmx)
        $("#code").val(member_data.code)
        $("#tipo").val(member_data.type)
        $("#edit_button").attr('onclick', `send_edit(${id})`)
        $("#member_form").show()
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

        var member_data = get_member_data()
        member_data.dimension_padre = members_objects[id].parent
        var raw = JSON.stringify(member_data);
        console.log(raw)

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
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $("#member_form").hide()
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

    create_member = (id) => {
        console.log(id)        
        $(`.member_body`).css(`padding-left`, '0rem')
        $(`.new_record`).hide()
        document.getElementById("member_form").reset();
        $(`#add_child_${id}`).show()
        $(`.button_div`).show()
        $(`#cancel_add`).hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $(".message_abm").hide()
        $(`#abm`).show()
        $(`#header_add`).show()
        $(`#buttons_add`).show()
        $(`#member_form`).show()
        $(`#buttons_add`).append(`<button type="button" class="btn btn-success" id="save_add_member" onclick="save_add_member(${id})">Guardar</button>`)
        document.getElementById("header_add").scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
    }

    cancel_add = () => {
        $(`.member_body`).css(`padding-left`, '0rem')
        $(`.new_order`).hide()
        $(`.new_record`).hide()
        $(`#cancel_add`).hide()
        $(`#abm_massive`).hide()
        $(`.button_div`).show()
        
        $(`#add`).removeClass("btn-light")
        $(`#add`).addClass("btn-success")
        $(`#add`).css("pointer-events", "all")
        $(`#massive_edit`).removeClass("btn-light")
        $(`#massive_edit`).addClass("btn-success")
        $(`#massive_edit`).css("pointer-events", "all")
    }

    add_member = () => {
        $(`.member_body`).css(`padding-left`, '2rem')
        $(`.new_record`).show()
        $(`#cancel_add`).show()
        $(`.button_div`).hide()
        $(`#add`).removeClass("btn-success")
        $(`#add`).addClass("btn-light")
        $(`#add`).css("pointer-events", "none")
        $(`#massive_edit`).removeClass("btn-success")
        $(`#massive_edit`).addClass("btn-light")
        $(`#massive_edit`).css("pointer-events", "none")

    }

    change_order = (id) => {
        console.log("change order " + id)
        $(`#member_${id}`).css({ "pointer-events": "none", "opacity": 0.2 })
        changing_member = id
        $(`.member_body`).css(`padding-left`, '2rem')
        $(`.new_order`).show()
        $(`#cancel_add`).show()
        $(`.button_div`).hide()
        $("#header_order").show()
        $("#abm").show()
        $("#member_form").hide()
        $("#success_order").show()
        $("#buttons_order").show()
        $(`#add`).removeClass("btn-success")
        $(`#add`).addClass("btn-light")
        $(`#add`).css("pointer-events", "none")
        $(`#cancel_add`).hide()
        $(`#massive_edit`).removeClass("btn-success")
        $(`#massive_edit`).addClass("btn-light")
        $(`#massive_edit`).css("pointer-events", "none")
    }

    send_reorder = () => {

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");
        var proccessed_dim = 0

        $.each(order_changes, (i, member) => {
            console.log(member)
            var member_data = members_objects[member.id]
            console.log(member_data)
            raw = {
                "descripcion": member_data.name,
                "descripcion_ingles": '',
                "descripcion_frances": '',
                "descripcion_portugues": '',
                "orden": member.order,
                "sdmx": member_data.sdmx,
                "code": member_data.code,
                "dimension_padre": member.parent,
                "tipo": tipo_dimension
            }
            console.log(raw)
            var raw = JSON.stringify(raw);


            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(`${base_url}/dimension/${member.id}/`, requestOptions)
                //.then(response => response.json())
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if (result.id) {
                        console.log("EXITO")
                        proccessed_dim = proccessed_dim + 1
                        if (order_changes.length == proccessed_dim) {
                            $("#order_button").remove()
                            $(`#member_${changing_member}`).css({ "pointer-events": "all", "opacity": 1 })
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
        $("#order_content2").text(members_objects[changing_member].name)

        if (members_objects[changing_member].members.length > 0) {
            $("#order_content2").text(members_objects[changing_member].name + ' y sus miembros de dimensión dependientes')
        } else {
            $("#order_content2").text(members_objects[changing_member].name)
        }

        var parent_obj = members_objects[parent]
        if (parent_obj.members.length > 0) {
            $("#danger_order").show()
        }
        var siblings = parent_obj.members
        siblings.sort((a, b) => a.order - b.order);
        var siblings_array = []
        siblings.map((sibling) => {
            if (sibling.id != changing_member) { siblings_array.push(sibling.id) }
        })
        console.log(siblings_array)
        siblings_array.splice(order, 0, changing_member)
        order_changes.push({ id: changing_member, order: order, parent: parent })
        $.each(siblings_array, (i, sibling) => {
            if (i == members_objects[sibling].order) {
                console.log(sibling + "NO CAMBIA")
            } else {
                if (sibling != changing_member) {
                    order_changes.push({ id: sibling, order: i, parent: parent })
                    $("#order_button").show()
                    console.log(sibling + "SI CAMBIA")
                    $("#order_content").append(`<li>${members_objects[sibling].name}</li>`)
                }
            }
        })
        $("#buttons_order").append(`<button type="button" class="btn btn-success" id="order_button" onclick="send_reorder()">Guardar</button>`)
    }

    display_members_children = (children, n) => {
        children.sort((a, b) => a.order - b.order);
        $.each(children, (i, member) => {
            members_objects[member.id] = member
            if (i == 0) {
                $(`#member_children_${member.parent}`).append(`<div class="new_order off" id="reorder_${member.parent}" onclick="set_new_order(${member.parent},0)"><-> Antes de ${member.name} <-></div>`)
            }
            $(`#member_children_${member.parent}`).append(`<div id="member_${member.id}">
                <div id="member_title_${member.id}" style="padding-left:${n}rem;display: flex;justify-content: flex-end;background-color:whitesmoke;margin:0.2rem;display:flex;">
                    <div style="cursor:pointer; width: -webkit-fill-available;padding: 1rem;" data-bs-toggle="collapse" data-bs-target="#member_children_${member.id}"><span style="margin-right:0.5rem;"><img style="margin-top:-0.6rem;" src="../images/icons/ellipsis-vertical-solid.svg" class="image_svg"><img src="../images/icons/ellipsis-solid.svg" class="image_svg"></span><span class="id_member" style="display:none;">[${member.id}] </span>${member.name}</div>
                    <div class="button_div"data-bs-toggle="tooltip" title="Eliminar miembro de la dimensión" onclick="delete_member(${member.id},'${member.name}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                    <div class="button_div" data-bs-toggle="tooltip" title="Editar metadatos" onclick="edit_member(${member.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                    <div class="button_div" onclick="change_order(${member.id})" data-bs-toggle="tooltip" title="Cambiar de ubicación"><img class="image_button" src="../images/icons/arrow-down-up-across-line-solid.svg"></div>
                </div>
                <div class="new_order off" id="reorder_${member.parent}" style="" onclick="set_new_order(${member.parent},${i + 1})"><-> Después de ${member.name} <-></div>
            </div>`)
            var level = n + 2
            if (member.members.length > 0) {
                $(`#member_${member.id}`).append(`<div id="member_children_${member.id}" class="collapse show member_body">
                <div id="add_child_${member.id}" class="new_record off" onmouseover="highlight_on(${member.id})" onmouseleave="highlight_off(${member.id})" onclick="create_member(${member.id})">+</div>
                </div>`)
                display_members_children(member.members, level);
            } else {
                $(`#member_${member.id}`).append(`<div id="member_children_${member.id}" class="collapse show member_body">
                <div class="new_order off" id="reorder_${dimension_id}" onclick="set_new_order(${member.id},0)"><-> Dentro de ${member.name} <-></div>
                <div id="add_child_${member.id}" class="new_record off" onmouseover="highlight_on(${member.id})" onmouseleave="highlight_off(${member.id})" onclick="create_member(${member.id})">+</div>
                </div>`)
                display_members_children(member.members, level);
            }
        })
    }

    download_excel = () => {


        var introduction = [
            ["Consideraciones para el llenado de la planilla"],
            ["Esta es una plantilla de importación de miembros de una dimensión para el Gestor de Datos Estadísticos."],
            ["Utilizar la hoja 'Dimensiones' de esta planilla para cargar los nuevos miembros."],

            ["No agregar filas ni columnas a la planilla."],
            [""],
            ["ORDEN: Número secuencial de elementos que se están importando. No es obligatorio"],
            ["No es obligatorio llenarlo. Sólo es necesario en el caso de que se importen registros anidados"],
            ["(registros padre y registros hijos)."],
            ["."],
            ["MIEMBRO DE LA DIMENSION: Nombre del miembro de la dimensión"],
            [""],
            ["MIEMBRO DE LA DIMENSION (EN): Nombre del miembro de la dimensión en inglés."],
            ["."],
            ["SDMX: Código de uso habitual para el registro que se está importando."],
            ["Por ejemplo, códigos de unidades geoestadísticas."],
            [""],
            [""],
            ["LOS TRES ÚLTIMOS CAMPOS SE UTILIZAN PARA DEFINIR QUE UN REGISTRO ES HIJO DE OTRO"],
            ["Rellenar sólo uno de estos tres campos"],
            ["Colocar el padre antes del registro hijo en la planilla"],
            [""],
            ["ORDEN DE REGISTRO PADRE: Es el número de orden del registro padre dentro de esta misma planilla"],
            [""],
            ["ID DE REGISTRO PADRE: ID del registro padre dentro del gestor de datos estadísticos"],
            [""],
            ["SDMX DE REGISTRO PADRE: Código de uso habitual para el registro padre"],
            [""],
            [""],
            ["CEPAL, Versión 1. Enero de 2023"],
        ];

        var data = [
            { "orden": "Orden", "name": "Miembro de dimensión", "name_en": "Miembro de dimensión (EN)", "sdmx": "SDMX","code": "Código", "parent_order": "Orden de registro Padre", "parent_id": "ID de registro Padre", "parent_code": "Código de registro Padre", "parent_sdmx": "SDMX de registro Padre" },
            { "orden": "0", "name": "Ejemplo 1", "name_en": "Example 1", "sdmx": "HK23","code": "01", "parent_order": "", "parent_id": "", "parent_code": "", "parent_sdmx": "" },
            { "orden": "1", "name": "Ejemplo 2", "name_en": "Example 2", "sdmx": "HK21","code": "02", "parent_order": "", "parent_id": "", "parent_code": "", "parent_sdmx": "" },
            { "orden": "2", "name": "Ejemplo hijo de Orden 1", "name_en": "Son of order 1", "sdmx": "","code": "03", "parent_order": "1", "parent_id": "", "parent_code": "", "parent_sdmx": "" },
        ]


        var workbook = XLSX.utils.book_new(),
            worksheet = XLSX.utils.aoa_to_sheet(introduction);

        // console.log(data_array.length)
        var workbook = XLSX.utils.book_new(),
            worksheet2 = XLSX.utils.json_to_sheet(data);

        // to hide row R
        worksheet2['!rows'] = [];
        worksheet2['!rows'][0] = { hidden: true };

        //worksheet = XLSX.utils.aoa_to_sheet(data);
        workbook.SheetNames.push("Introducción");
        workbook.Sheets["Introducción"] = worksheet;

        workbook.SheetNames.push("Dimensiones");
        workbook.Sheets["Dimensiones"] = worksheet2;

        // (C3) "FORCE DOWNLOAD" XLSX FILE
        XLSX.writeFile(workbook, `dimension_${dimension_id}.xlsx`);

    }

    upload_excel = () => {
        $("#upload_excel").show()
    }

    function handleFile(e) {
        $("#result_import").show()
        console.log("handleFile")
        var file = e.target.files[0];
        var reader = new FileReader();
        var imported_data
        reader.onload = function (e) {
            var data = e.target.result;
            /* reader.readAsArrayBuffer(file) -> data will be an ArrayBuffer */
            var workbook = XLSX.read(e.target.result);

            var fsecond_ws = workbook.Sheets[workbook.SheetNames[1]];
            var jsa = XLSX.utils.sheet_to_json(fsecond_ws);
            console.log(jsa)
            imported_data = jsa


            var sdmx_array = []
            var code_array = []
            var order_array = []
            var order_id = {}
            var sdmx_id = {}
            var code_id = {}
            var ids_array = []
            $.each(members_objects, (i, member) => {
                if (members_objects[i].sdmx != "") { sdmx_array.push(members_objects[i].sdmx.toString()) }
                if (members_objects[i].code != "") { code_array.push(members_objects[i].code.toString()) }
                ids_array.push(members_objects[i].id)
                sdmx_id[members_objects[i].sdmx] = members_objects[i].id
                code_id[members_objects[i].code] = members_objects[i].id
            })
            //Evaluate imported data
            //imported_data.shift();
            $.each(imported_data, (i, member) => {
                imported_data[i].problem = []
                imported_data[i].status = ''
                imported_data[i].nparent = 0
                if (member.orden != "" && member.orden != undefined) {
                    if (order_array.indexOf(member.orden) > -1) {
                        imported_data[i].problem = 'Orden duplicado'
                        imported_data[i].status = 'rejected'
                    } else {
                        order_array.push(Number(member.orden))
                    }
                }
                if (member.parent_id != "" && member.parent_id != undefined) { imported_data[i].nparent = imported_data[i].nparent + 1 }
                if (member.parent_order != "" && member.parent_order != undefined) { imported_data[i].nparent = imported_data[i].nparent + 1 }
                if (member.parent_code != "" && member.parent_code != undefined) { imported_data[i].nparent = imported_data[i].nparent + 1 }
                if (member.parent_sdmx != "" && member.parent_sdmx != undefined) { imported_data[i].nparent = imported_data[i].nparent + 1 }
            })

            $.each(imported_data, (i, row) => {

                if (row.nparent > 1) {
                    imported_data[i].problem = 'Tiene definido más de un PADRE'
                    imported_data[i].status = 'rejected'
                } else if (row.name == "" || row.name == undefined) {
                    imported_data[i].problem = 'No tiene definido un Nombre'
                    imported_data[i].status = 'rejected'
                } else {
                    if (row.sdmx != "" && row.sdmx != undefined) {
                        if (sdmx_array.indexOf(row.sdmx.toString()) > -1) {
                            imported_data[i].problem.push('Código SDMX ya existe: ' + row.sdmx)
                            imported_data[i].status = 'rejected'
                        }
                    }
                    if (row.code != "" && row.code != undefined) {
                        if (code_array.indexOf(row.code.toString()) > -1) {
                            imported_data[i].problem.push('Código ya existe: ' + row.code)
                            imported_data[i].status = 'rejected'
                        }
                    }
                    //console.log(row.name, row.parent_sdmx, typeof (row.parent_sdmx))
                    if (row.parent_sdmx != "" && row.parent_sdmx != undefined) {
                        if (sdmx_array.indexOf(row.parent_sdmx.toString()) > -1) {
                            imported_data[i].verified_parent_id = sdmx_id[row.parent_sdmx]
                        } else {
                            imported_data[i].problem.push('Código SDMX de padre no existe' + row.parent_sdmx)
                            imported_data[i].status = 'rejected'
                        }
                    }
                    if (row.parent_code != "" && row.parent_code != undefined) {
                        if (code_array.indexOf(row.parent_code.toString()) > -1) {
                            imported_data[i].verified_parent_id = code_id[row.parent_code]
                        } else {
                            imported_data[i].problem.push('Código de padre no existe' + row.parent_code)
                            imported_data[i].status = 'rejected'
                        }
                    }
                    if (row.parent_id != "" && row.parent_id != undefined) {
                        if (ids_array.indexOf(Number(row.parent_id)) > -1) {
                            imported_data[i].verified_parent_id = row.parent_id
                        } else {
                            imported_data[i].problem.push('ID de padre no existe')
                            imported_data[i].status = 'rejected'
                        }
                    }
                    console.log(row.name, row.parent_order, row.parent_order != "" && row.parent_order != undefined)
                    if (row.parent_order != "" && row.parent_order != undefined) {
                        console.log(row.name, order_array.indexOf(Number(row.parent_order)))
                        if (order_array.indexOf(Number(row.parent_order)) > -1) {
                            imported_data[i].pending_son = true
                            imported_data[order_id[row.parent_order]].is_parent = true
                        } else {
                            imported_data[i].problem.push('ORDEN de padre no existe')
                            imported_data[i].status = 'rejected'
                        }
                    }
                    if (imported_data[i].problem.length == 0) {
                        imported_data[i].status = 'new_record'
                    } else {
                        imported_data[i].status = 'rejected'
                    }
                }
            })

            $.each(imported_data, (i, row) => {
                if (i > 0) {
                    var color
                    if (row.status == 'rejected') { color = 'red' }
                    else if (row.status == 'new_record') {
                        color = '#98d195'
                    } else {
                        color = '#98d195'
                    }
                    $("#result_import").append(`<div class="row d-flex" style="justify-content: space-around;background-color:whitesmoke;paddin:1rem;margin:0.25rem;"><div class="col-1">${i}</div><div class="col-10">${row.name}: ${row.status}: ${row.problem}</div><div class="col-1">
                        <span id="status_${i}" style="margin-top: 0.4rem;margin-right: auto;margin-left: auto;height:0.7rem;width:0.7rem;background-color:${color};border-radius:50%;display: block;"></span>
                    </div></div>`)
                }
            })



            var pending_son = {} //order = new ID

            var save_imported_member = (obj, n) => {

                if (obj.problem.length == 0) {
                    console.log(obj)
                    if (obj.pending_son) {
                        obj.data.dimension_padre = pending_son[obj.parent_order]
                        console.log("pending son " + obj.name + pending_son[obj.parent_order])
                    }
                    var myHeaders = new Headers();
                    myHeaders.append("Authorization", "Token " + t);
                    myHeaders.append("Content-Type", "application/json");
                    console.log(obj.data)
                    var raw = JSON.stringify(obj.data);
                    console.log(raw)

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                    };

                    fetch(`${base_url}/dimension`, requestOptions)
                        //.then(response => response.json())
                        .then(response => response.json())
                        .then(result => {
                            if (obj.is_parent) { pending_son[n] = result.id }
                            console.log("FATHER pending_son" + result)
                            if (n == imported_data.length - 1) {
                                initial_load()
                            } else {
                                save_imported_member(imported_data[n + 1], n + 1)
                            }
                        }).catch(error => {
                            console.log('error', error)
                        });
                } else {
                    if (n == imported_data.length - 1) {
                        cancel_add()
                        initial_load()
                    } else {
                        save_imported_member(imported_data[n + 1], n + 1)
                    }

                }

            }

            $.each(imported_data, (i, row) => {
                if (i > 0 && row.problem.length == 0) {
                    var member = {
                        "descripcion": row.name,
                        "descripcion_frances": "",
                        "descripcion_portugues": "",
                        "tipo": tipo_dimension,
                        "orden": 0
                    }
                    if (row.name_en != "" && row.name_en != undefined) {
                        member.descripcion_ingles = row.name_es
                    } else { member.descripcion_ingles = "" }
                    if (row.sdmx != "" && row.sdmx != undefined) {
                        member.sdmx = row.sdmx
                    } else { member.sdmx = "" }
                    if (row.code != "" && row.code != undefined) {
                        member.code = row.code
                    } else { member.code = "" }
                    if (row.verified_parent_id) {
                        member.dimension_padre = row.verified_parent_id
                    } else { member.dimension_padre = Number(dimension_id) }
                    imported_data[i].data = member
                }
            })
            console.log(imported_data)
            $("#process_data").show()
            $("#process_data_cancel").show()
            
            proccess_imported_data = () => {
                save_imported_member(imported_data[1], 1)
            }

        }

        reader.readAsArrayBuffer(file);


    };

    input_dom_element.addEventListener("change", handleFile, false);

    massive_edit = () => {
        $(".abm").hide()
        $("#abm_massive").show()
        $("#upload_excel").hide()
        $("#result_import").hide()
        $("#process_data").hide()
        $("#process_data_cancel").hide()     
        
        $("#result_import").empty()        
       
        
        $(`#cancel_add`).show()
        $(`#add`).removeClass("btn-success")
        $(`#add`).addClass("btn-light")
        $(`#add`).css("pointer-events", "none")
        $(`#massive_edit`).removeClass("btn-success")
        $(`#massive_edit`).addClass("btn-light")
        $(`#massive_edit`).css("pointer-events", "none")
    }

    initial_load = () => {

        $("#members").empty()

        let url_data = `${base_url}/dimension/${dimension_id}?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {
                tipo_dimension = data.body.dimensions.type
                $("#title_dimension").text('Dimensión: ' + data.body.dimensions.name)
                data.body.dimensions.members.sort((a, b) => a.order - b.order);
                members_details = data.body.dimensions;
                members_objects[dimension_id] = data.body.dimensions
                console.log(data.body.dimensions)

                $("#members").append(`<div  id="add_child_${dimension_id}" class="new_record off" onclick="create_member(${dimension_id})">+</div>`)

                $.each(data.body.dimensions.members, (i, member) => {
                    if (i == 0) {
                        $("#members").append(`<div class="new_order off" id="reorder_${dimension_id}" onclick="set_new_order(${dimension_id},0)"><-> Antes de ${member.name} <-></div>`)
                    }
                    members_objects[member.id] = member
                    $("#members").append(`<div id="member_${member.id}">
                        <div style="display: flex;justify-content: flex-end;background-color:whitesmoke;margin:0.2rem;display:flex;">
                            <div id="member_title_${member.id}" style="cursor:pointer;width: -webkit-fill-available;padding: 1rem;" data-bs-toggle="collapse" data-bs-target="#member_children_${member.id}"><span class="id_member" style="display:none;">[${member.id}] </span>${member.name}</div>
                            <div class="button_div login_td"data-bs-toggle="tooltip" title="Eliminar miembro de la dimensión" onclick="delete_member(${member.id},'${member.name}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                            <div class="button_div login_td" data-bs-toggle="tooltip" title="Editar metadatos" onclick="edit_member(${member.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                            <div class="button_div login_td" onclick="change_order(${member.id})" data-bs-toggle="tooltip" title="Cambiar de ubicación"><img class="image_button" src="../images/icons/arrow-down-up-across-line-solid.svg"></div>
                        </div>
                        <div class="new_order off" id="reorder_${dimension_id}" onclick="set_new_order(${dimension_id},${i + 1})"><-> Después de ${member.name} <-></div>
                    </div>`)
                    if (member.members.length > 0) {

                        $(`#member_${member.id}`).append(`<div id="member_children_${member.id}" class="collapse show member_body">
                        <div id="add_child_${member.id}" class="new_record off" onmouseover="highlight_on(${member.id})" onmouseleave="highlight_off(${member.id})" onclick="create_member(${member.id})">+</div>
                        </div>`)
                        display_members_children(member.members, 1);
                    } else {
                        $(`#member_${member.id}`).append(`<div id="member_children_${member.id}" class="collapse show member_body">
                        <div class="new_order off" id="reorder_${dimension_id}" onclick="set_new_order(${member.id},0)"><-> Dentro de ${member.name} <-></div>
                        <div id="add_child_${member.id}" class="new_record off" onmouseover="highlight_on(${member.id})" onmouseleave="highlight_off(${member.id})" onclick="create_member(${member.id})">+</div>
                        </div>`)
                        display_members_children(member.members, 1);
                    }
                    //if (member.members) { display_members_children(member.members, 1) }
                })
                create_tooltips()
                check_login()

            })
    }
    initial_load()


})
