$(document).ready(function () {

    let indicator_id = getQueryVariableGET('indicator_id');
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

    var count = 0

    var records_data
    var dimensions_data
    var sources_data
    var notes_data
    var indicator_metadata
    var indicator_dimensions = []
    var indicator_dimensions_members = {}
    var dim_combinations = []
    var editing_records = []

    cancel_record = (id) => {
        $("tbody").css('opacity', '0.3')
        $('.message_abm').hide()
        $("#warning_cancel").show()
        initial_load()
    }

    delete_record = (id) => {
        $('.message_abm').hide()
        $('#button_add').css('pointer-events', 'none')
        $('#button_add').removeClass('btn-success')
        $('#button_add').addClass('btn-light')
        $(`.edit_img`).addClass("unactive_svg")
        $(`.delete_img`).addClass("unactive_svg")
        $(`.edit_tool`).css("pointer-events", "none")
        $(`.delete_tool`).css("pointer-events", "none")
        $("#tbody").prepend($(`#tr_${id}`));
        $(`#tr_${id}`).addClass("wrong_tr")
        $(`#tr_${id}`).addClass("selected_row")
        $(`#tr_${id}`).children('td').css("color", "red")
        $('#warning_delete_edit').show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        document.getElementById(`tr_${id}`).scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });
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

        fetch(`${base_url}/dato/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $(".message_abm").hide()
                $("#tr_" + id).remove()
                $(`#success_delete`).show();
                initial_load()
            })
    }

    massive_edit_delete = () => {
        $("#warning_delete_massive").show()
        $("#number_editing_records").text(count_selected)
        $("#massive_edit_delete").addClass("unactive_button")
    }

    confirm_massive_edit_delete = () => {
        console.log("confirm_massive_edit_delete")
        $.each(editing_records, (i, id) => {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Token " + t);
            myHeaders.append("Content-Type", "application/json");

            var requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(`${base_url}/dato/${id}`, requestOptions)
                .then((response) => response.text())
                .then(function (data) {
                    $(".message_abm").hide()
                    $("#tr_" + id).remove()
                    if (editing_records.length == i + 1) {
                        initial_load()
                        $(`#success_delete`).show();
                    }
                })
        })

    }

    edit_record = (id) => {
        console.log("edit_record")
        $('.message_abm').hide()
        $("#tbody").prepend($(`#tr_${id}`));
        $('#button_add').css('pointer-events', 'none')
        $('#button_add').removeClass('btn-success')
        $('#button_add').addClass('btn-light')

        $(`#tr_${id}`).addClass("selected_row")
        $(`.edit_img`).addClass("unactive_svg")
        $(`.delete_img`).addClass("unactive_svg")
        $(`.edit_tool`).css("pointer-events", "none")
        $(`.delete_tool`).css("pointer-events", "none")
        $(`#edit_${id}`).hide()
        $(`#save_${id}`).show()

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var record_data = records_data.filter(function (obj) {
            return obj.id == id;
        });

        $(`#td_source_${id}`).html(`<select class="form-select" id="select_source_${id}"></select>`)
        $(`#td_notes_${id}`).html(`<select multiple class="form-select" id="select_notes_${id}"></select>`)

        fetch(`${base_url}/fuente/?format=json`, requestOptions)
            .then(response => response.json())
            .then(result => {
                sources_data = result
                var value_selected = record_data[0].source_id
                $.each(sources_data, (i, source) => {
                    if (source.id == value_selected) { var selected = 'selected' } else { var selected = '' }
                    $(`#select_source_${id}`).append(`<option ${selected} value="${source.id}" >${source.id} - ${source.nombre_publicacion}</option>`)
                })
            })

        fetch(`${base_url}/nota/?format=json`, requestOptions)
            .then(response => response.json())
            .then(result => {
                notes_data = result
                var values_selected = record_data[0].notes_ids
                $.each(notes_data, (i, note) => {
                    if (values_selected.indexOf(note.id) > -1) { var selected = 'selected' } else { var selected = '' }
                    $(`#select_notes_${id}`).append(`<option ${selected} value="${note.id}" >${note.id} - ${note.nota}</option>`)
                })
            })

        $(`#td_value_${id}`).html(`<input type="number" oninput="check_value(${id})" id="value_${id}" class="form-control" value="${record_data[0].value}">`)

        $(`#td_source_${id}`).html(`<select class="form-select" id="select_source_${id}"></select>`)

        var dim_values = []
        $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {

            var dimension_data = dimensions_data.filter(function (obj) {
                return obj.id == dimension;
            })

            if (dimension_data[0].members.length == 0) { var disabled = 'disabled' } else { var disabled = '' }
            $(`#td_dim_${dimension}_${id}`).html(`<select oninput="check_dim_combination(${id})" class="form-select" id="select_dim_${dimension}_${id}" ${disabled}></select>`)
            var value_selected = record_data[0][`dim_${dimension}`]

            console.log("value selected: " + value_selected)

            var create_child = (obj, level) => {
                var space = level + 1
                var identation = '-'
                for (let i = 0; i < level; i++) {
                    identation += identation + "-";
                }
                $.each(obj, (i, member) => {
                    if (member.id == value_selected) { var selected = 'selected'; dim_values.push(member.id) } else { var selected = '' }
                    $(`#select_dim_${dimension}_${id}`).append(`<option ${selected} value="${member.id}" >${identation} ${member.name}</option>`)
                    if (member.members.length > 0) {
                        create_child(member.members, space)
                    }
                })
            }

            $.each(dimension_data[0].members, (n, member) => {
                if (member.id == value_selected) { var selected = 'selected'; dim_values.push(member.id) } else { var selected = '' }
                $(`#select_dim_${dimension}_${id}`).append(`<option ${selected} value="${member.id}" >${member.name}</option>`)
                if (member.members.length > 0) {
                    create_child(member.members, 0)
                }
            })
        })
        console.log(dim_values)
        console.log("antes " + dim_combinations.indexOf(JSON.stringify(dim_values)))
        dim_combinations.splice(dim_combinations.indexOf(JSON.stringify(dim_values)))
        console.log("después " + dim_combinations.indexOf(JSON.stringify(dim_values)))

        document.getElementById(`tr_${id}`).scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });

    }

    save_record = (id) => {

        if (check_dim_combination(id) && check_source(id, 'save_record') && check_value(id)) {
            $(`#error_save_edit`).hide()

            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Token " + t);
            myHeaders.append("Content-Type", "application/json");

            var record = {
                'indicador': Number(indicator_id),
                'fuente': Number($(`#select_source_${id}`).val()),
                'dimensiones': [],
                'notas': $(`#select_notes_${id}`).val(),
                'valor': Number($(`#value_${id}`).val())
            }


            $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
                if ($(`#select_dim_${dimension}_${id}`).is(':disabled')) {
                    console.log(`dimension ${dimension} está deshabilitada`)
                } else {
                    record.dimensiones.push(Number($(`#select_dim_${dimension}_${id}`).val()))
                }

            })

            var raw = JSON.stringify(record);

            if (id == 'new') {
                var url = `${base_url}/dato/`
                var method = 'POST'
            } else {
                var url = `${base_url}/dato/${id}/`
                var method = 'PUT'
            }

            var requestOptions = {
                method: method,
                body: raw,
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(url, requestOptions)
                //.then(response => response.json())
                .then(response => response.json())
                .then(result => {

                    console.log(result)
                    if (result.indicador) {
                        console.log('EXITO')
                        $('.message_abm').hide()
                        $(`#success_save_edit`).show()
                        initial_load()
                    }
                }).catch(error => {
                    console.log('error', error)
                });

        } else {
            console.log("no grabar")
            $(`#error_save_edit`).show()
        }

    }

    check_new = (dimension_id) => {
        var status
        console.log(dimension_id)
        $(`#hidden_${dimension_id}`).remove()
        var dim_values = []
        $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
            dim_values.push(Number($(`#select_dim_${dimension}_new`).val()))
        })
        if (dim_values.indexOf(0) > -1) {
            status = false
        } else {
            check_dim_combination('new')
            status = true
        }
        return status
    }

    check_dim_combination = (id) => {
        console.log("check_dim_combination")
        var status
        var uncomplete = false
        var dim_values = []
        $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
            if ($(`#select_dim_${dimension}_${id}`).val() == 0) { uncomplete = true }
            dim_values.push(Number($(`#select_dim_${dimension}_${id}`).val()))
        })

        console.log(dim_combinations)
        console.log(JSON.stringify(dim_values))
        console.log(uncomplete)
        if (dim_combinations.indexOf(JSON.stringify(dim_values)) > -1 || uncomplete) {
            if (uncomplete) {
                status = false
                $(`#error_dimension_undefined`).show()
            } else {
                $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
                    $(`#select_dim_${dimension}_${id}`).addClass("wrong_input")
                    $(`#error_dimension`).show()
                    status = false
                })
            }

        } else {
            $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
                $(`#select_dim_${dimension}_${id}`).removeClass("wrong_input")
                $(`#error_dimension`).hide()
                status = true
            })
        }
        return status
    }

    check_value = (id) => {
        var status
        if ($(`#value_${id}`).val() == '') {
            console.log("error dato")
            $(`#value_${id}`).addClass("wrong_input")
            $(`#error_value`).show()
            var status = false
        } else {
            $(`#value_${id}`).removeClass("wrong_input")
            $(`#error_value`).hide()
            var status = true
        }
        return status
    }

    check_source = (id, origin) => {
        console.log(origin)
        if (id == 'new' && typeof (origin) == 'undefined') { $(`#hidden_source_new`).remove() }
        var status
        console.log($(`#select_source_${id}`).val())
        if ($(`#select_source_${id}`).val() == '0') {
            console.log("error source")
            $(`#select_source_${id}`).addClass("wrong_input")
            $(`#error_source`).show()
            var status = false
        } else {
            $(`#select_source_${id}`).removeClass("wrong_input")
            $(`#error_source`).hide()
            var status = true
        }
        return status
    }

    create_tooltips = () => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    }

    add_record = () => {
        $('.message_abm').hide()
        $('#button_add').css('pointer-events', 'none')
        $('#button_add').removeClass('btn-success')
        $('#button_add').addClass('btn-light')

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        var tr = (`<tr id="tr_new">  
                     <td class="delete_tool" onclick="delete_record('new')" id="delete_new"><img id="delete_img_new" class="delete_img unactive_svg" src="../images/icons/trash-can-solid.svg" style="width:1rem;"></td>  
                     <td id="save_new" style="padding: 0;">
                     <table><tr><td class="save_tool" onclick="save_record('new')" data-bs-toggle="tooltip" data-bs-placement="top" title="Guardar cambios"><img id="save_img_new" class="save_img green" src="../images/icons/floppy-disk-solid.svg" style="width:1rem;"></td></tr>
                     <tr><td class="save_tool" onclick="cancel_record('new')" data-bs-toggle="tooltip" data-bs-placement="top" title="Cancelar"><img id="save_img_new" class="save_img red" src="../images/icons/xmark-solid.svg" style="width:1rem;"></td></tr></table></td> 
                     <td id="td_id_new">-</td>
                     <td id="td_source_new"></td>
                     <td id="td_notes_new"></td>
                     <td id="td_value_new"class="value_tr"></td>
                   </tr>`)
        $("#tbody").prepend(tr)

        $(`.edit_img`).addClass("unactive_svg")
        $(`.delete_img`).addClass("unactive_svg")
        $(`.edit_tool`).css("pointer-events", "none")
        $(`.delete_tool`).css("pointer-events", "none")

        $.each(indicator_dimensions, (n, dimension) => {
            $("#tr_new").append(`<td  id="td_dim_${dimension}_new" class="dimension_tr"></td>`)
        })


        $(`#td_source_new`).html(`<select class="form-select wrong_input" oninput="check_source('new')" id="select_source_new"></select>`)
        $(`#td_notes_new`).html(`<select multiple class="form-select" id="select_notes_new"></select>`)

        fetch(`${base_url}/fuente/?format=json`, requestOptions)
            .then(response => response.json())
            .then(result => {
                sources_data = result
                $(`#select_source_new`).append(`<option value="0" data-hidden="true" id="hidden_source_new"></option>`)
                $.each(sources_data, (i, source) => {
                    $(`#select_source_new`).append(`<option value="${source.id}" >${source.id} - ${source.nombre_publicacion}</option>`)
                })
            })

        fetch(`${base_url}/nota/?format=json`, requestOptions)
            .then(response => response.json())
            .then(result => {
                notes_data = result
                $.each(notes_data, (i, note) => {
                    $(`#select_notes_new`).append(`<option value="${note.id}" >${note.id} - ${note.nota}</option>`)
                })
            })

        $(`#td_value_new`).html(`<input type="number" oninput="check_value('new')" id="value_new" class="form-control wrong_input">`)


        $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
            $(`#td_dim_${dimension}_new`).html(`<select oninput="check_new(${dimension})" class="form-select wrong_input" id="select_dim_${dimension}_new"></select>`)
            var dimension_data = dimensions_data.filter(function (obj) {
                return obj.id == dimension;
            })
            $(`#select_dim_${dimension}_new`).append(`<option id="hidden_${dimension}" value="0" data-hidden="true"></option>`)
            var create_child = (obj, level) => {
                var space = level + 1
                var identation = '-'
                for (let i = 0; i < level; i++) {
                    identation += identation + "-";
                }
                $.each(obj, (i, member) => {
                    $(`#select_dim_${dimension}_new`).append(`<option value="${member.id}" >${identation} ${member.name}</option>`)
                    if (member.members.length > 0) {
                        create_child(member.members, space)
                    }
                })
            }
            $.each(dimension_data[0].members, (n, member) => {
                $(`#select_dim_${dimension}_new`).append(`<option value="${member.id}" >${member.name}</option>`)
                console.log(member.members.length)
                if (member.members.length > 0) {
                    create_child(member.members, 0)
                }
            })

        })

        document.getElementById(`tr_new`).scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
            align: 'false'
        });

        //$(`#td_source_${id}`).html(`<input type="number" class="form-control" value="${record_data[0].source_id}">`)
        create_tooltips()
    }

    count_selected = () => {
        var selected = $('.record_selector').filter(':checked')
        var editing_array = []

        var selected_hidden = $('.record_selector').filter(':checked').parent().parent(":hidden")
        if (selected.length > 0) {
            $(".massive_edit").removeClass('unactive_button')
        } else {
            $(".massive_edit").addClass('unactive_button')
        }

        if ($('#check_hidden_selected').is(':checked')) {
            $("#number_selected").text(selected.length)
            $("#number_selected_hidden").text(selected_hidden.length)
            $("#number_editing_records").text(selected.length)
            $.each(selected, (i, el) => {
                editing_array.push(Number(el.value))
            })
        } else {
            $("#number_selected").text(selected.length - selected_hidden.length)
            $("#number_editing_records").text(selected.length - selected_hidden.length)
            var selected_hidden_array = []
            $.each(selected_hidden, (i, el) => {
                var id = $(el).prop('id')
                selected_hidden_array.push(Number($(el).prop('id').replace('tr_', '')))
            })
            $.each(selected, (i, el) => {

                if (selected_hidden_array.indexOf(Number(el.value)) == -1) {
                    editing_array.push(Number(el.value))
                }
            })

        }
        console.log(editing_array)
        editing_records = editing_array
        //.parent('tr').find(":hidden")
    }

    initial_load = () => {

        dim_combinations = []

        fetch(`${base_url}/dimension/?format=json`)
            .then(response => response.json())
            .then(result => {

                dimensions_data = result.body.dimensions

                fetch(`${base_url}/indicator/${indicator_id}?format=json`)
                    .then(res => res.json())
                    .then(data => {
                        indicator_metadata = data;
                        console.log(data.dimensiones_asociadas)
                        $("#indicator_name").text(data.descripcion)
                        indicator_dimensions = data.dimensiones_asociadas
                        $(".dim_th").remove()
                        $("#filter_selector").empty()
                        $("#search_input").val("")
                        $.each(data.dimensiones_asociadas, (i, dimension) => {

                            var filtered_dimensions = dimensions_data.filter(function (obj) {
                                return obj.id == dimension;
                            });

                            $("#thead").append(`<th class="dim_th sort" onclick="sortTable('tbody',${i + 11},'string')">${filtered_dimensions[0].name}<img id="tbody_sort_${i + 11}" class="image_svg sort_image" src="../images/icons/arrows-up-down-solid.svg"></th>`)
                            if (i == 0) { var check = 'checked' } else { var check = '' }
                            $("#filter_selector").append(`<input  id="dim_selector_${filtered_dimensions[0].id}" class="form-check-input" type="radio" onchange="filterTable()" value="${i}" name="inlineRaioOptions" style="margin-right: 0.5rem;" ${check}><label class="form-check-label" for="dim_selector_${filtered_dimensions[0].id}" style="margin-right: 1rem;">${filtered_dimensions[0].name}</label>`)
                            var create_child = (obj, level) => {
                                var space = level + 1
                                $.each(obj, (i, itm) => {
                                    indicator_dimensions_members[itm.id] = itm.name
                                    if (itm.members.length > 0) {
                                        create_child(itm.members, space)
                                    }
                                })
                            }

                            $.each(filtered_dimensions[0].members, (i, itm) => {
                                indicator_dimensions_members[itm.id] = itm.name
                                if (itm.members.length > 0) {
                                    create_child(itm.members, 0)
                                }
                            })
                        })
                    })
                    .then(next => {
                        console.log("terminó")
                        fetch(`${base_url}/indicator/${indicator_id}/data?format=json`)
                            .then(response => response.json())
                            .then(records => {
                                records_data = records.body.data
                                $("#tbody").empty()
                                records.body.data.sort((a, b) => a.id - b.id);
                                $.each(records.body.data, (i, record) => {
                                    var tr = (`<tr class="record" id="tr_${record.id}">
                                    <td class="check_tool off" id="check_${record.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Seleccionar registro"><input id="checkbox_${record.id}" class="form-check-input record_selector" type="checkbox" value="${record.id}" onchange="count_selected()"></td>
                                    <td class="check_tool off" id="status_${record.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Estatus de la edición"><span style="margin-top: 0.4rem;margin-right: auto;margin-left: auto;height:0.7rem;width:0.7rem;background-color:gainsboro;border-radius:50%;display: block;"></td>
                                    <td class="edit_tool login_td" onclick="edit_record(${record.id})" id="edit_${record.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Editar registro"><img id="edit_img_${record.id}" class="edit_img" src="../images/icons/pencil-solid.svg" style="width:1rem;"></td>    
                                    <td class="delete_tool login_td" onclick="delete_record(${record.id})" id="delete_${record.id}" data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar registro"><img id="delete_img_${record.id}" class="delete_img" src="../images/icons/trash-can-solid.svg" style="width:1rem;"></td>  
                                    <td class="off" id="save_${record.id}" style="padding: 0;">
                                    <table><tr><td class="save_tool" onclick="save_record(${record.id})" data-bs-toggle="tooltip" data-bs-placement="top" title="Guardar cambios"><img id="save_img_${record.id}" class="save_img green" src="../images/icons/floppy-disk-solid.svg" style="width:1rem;"></td></tr>
                                        <tr><td class="save_tool" onclick="cancel_record(${record.id})" data-bs-toggle="tooltip" data-bs-placement="top" title="Cancelar Edición"><img id="save_img_${record.id}" class="save_img red" src="../images/icons/xmark-solid.svg" style="width:1rem;"></td></tr></table></td> 
                                    <td class="id" id="td_id_${record.id}">${record.id}</td>
                                    <td id="td_source_${record.id}">${record.source_id}</td>
                                    <td id="td_notes_${record.id}">${record.notes_ids}</td>
                                    <td  id="td_value_${record.id}"class="value_tr">${record.value}</td>
                                    </tr>`)
                                    $("#tbody").append(tr)
                                    var dim_values = []

                                    $.each(indicator_dimensions, (n, dimension) => {
                                        if (indicator_dimensions_members[record['dim_' + dimension]] == undefined) {
                                            var style = 'style="color:red; font-weight:bold;"'
                                            var text = 'Sin definir'
                                        } else {
                                            var style = ''
                                            var text = indicator_dimensions_members[record['dim_' + dimension]]
                                        }
                                        dim_values.push(record['dim_' + dimension])
                                        $("#tr_" + record.id).append(`<td  id="td_dim_${dimension}_${record.id}" class="dimension_tr" ${style}>${text}</td>`)
                                    })

                                    dim_combinations.push(JSON.stringify(dim_values))
                                })
                                $("tbody").css('opacity', '1')
                                $("#data_table").show()
                                $('#button_add').css('pointer-events', 'all')
                                $('#button_add').addClass('btn-success')
                                $('#button_add').removeClass('btn-light')
                                $(".massive_edit").addClass('unactive_button')
                                $("#massive_edit_tools").hide()
                                filterTable()

                                //$('.message_abm').hide()
                                setTimeout(() => {
                                    $(".message_abm").hide()
                                }, 500)
                                if (records.body.data.length == 0) {
                                    $('#warning_initial').show()
                                }
                                create_tooltips()
                                check_login()
                                $(".skeleton_tr").hide()
                            })

                    })
            })

    }
    initial_load()

    confirm_massive_edit = (selected) => {
        $("#warning_massive_editing").show()
        $("#general_checkbox").hide()
        $("#massive_edit_options").hide()
        $("#edit_field_hint").show()

        $("tbody").css('opacity', '0.2')
        console.log(`confirm_massive_edit: ${selected}`)
        $.each(editing_records, (i, record_id) => {

            record_data = records_data.filter((obj) => {
                return obj.id == record_id
            })

            var record_object = {
                'indicador': Number(indicator_id),
                'dimensiones': []
            }

            $.each(indicator_metadata.dimensiones_asociadas, (i, dimension) => {
                record_object.dimensiones.push(Number(record_data[0][`dim_${dimension}`]))
            })

            if (selected == 'sources') {
                console.log(Number($(`#edit_sources`).val()))
                record_object.fuente = Number($(`#edit_sources`).val())
            } else {
                record_object.fuente = record_data[0].source_id
            }

            if (selected == 'footnotes') {
                var footnotes = $(`#edit_footnotes`).val()
                console.log(footnotes)
                if (footnotes == '') {
                    record_object.notas = []
                } else {
                    record_object.notas = footnotes
                }
            } else {
                var footnotes = record_data[0].notes_ids
                console.log(footnotes)
                if (footnotes == '') {
                    record_object.notas = []
                } else {
                    console.log(record_data[0].notes_ids.split(","))
                    record_object.notas = record_data[0].notes_ids.split(",").map(val => { return val = Number(val) })
                }
            }

            if (selected == 'values') {
                record_object.valor = Number($(`#edit_values`).val())
            } else {
                record_object.valor = record_data[0].value
            }

            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Token " + t);
            myHeaders.append("Content-Type", "application/json");

            console.log(record_object)

            var raw = JSON.stringify(record_object);

            var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                redirect: 'follow',
                body: raw
            };

            fetch(`${base_url}/dato/${record_id}?format=json`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    $(`#status_${record_id}`).children('span').css(`color`, 'green')
                    if (i + 1 == editing_records.length) {
                        initial_load()
                    }
                })
        })
        $("#edit_sources").empty()
        $("#edit_footnotes").empty()
        $("#edit_values").val('')
    }

    populate_edit_fields = (selected) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        if (selected == 'sources') {
            $(`#edit_sources`).empty()
            fetch(`${base_url}/fuente/?format=json`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    $.each(result, (i, source) => {
                        $(`#edit_sources`).append(`<option value="${source.id}" >${source.id} - ${source.nombre_publicacion}</option>`)
                    })
                })

        }

        if (selected == 'footnotes') {
            console.log($(`#edit_footnotes`).children('option').length)
            $(`#edit_footnotes`).empty()
            fetch(`${base_url}/nota/?format=json`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    $.each(result, (i, footnotes) => {
                        $(`#edit_footnotes`).append(`<option value="${footnotes.id}" >${footnotes.id} - ${footnotes.nota}</option>`)
                    })
                })

        }
        $("#edit_massive_buttons").show()
        $("#confirm_massive_edit").attr("onclick", `confirm_massive_edit('${selected}')`)
    }

    select_edit_field = () => {
        $("#edit_field_hint").hide()
        var selected = $("#field_edit_selector").val()
        populate_edit_fields(selected)
        console.log(selected)
        $('.edit_selector').hide()
        $(`#edit_${selected}`).show()
        $(`#edit_massive_buttons`).show()
    }

    sortTable = (table, column, type) => {
        console.log("sort", table, column, type)
        var tables, rows, sorting, c, a, b, tblsort;
        var reset_sort_icons = () => {
            $(`.sort_image`).attr("src", "../images/icons/arrows-up-down-solid.svg")
            $(`.sort_image`).addClass("image_svg_inactive")
        }
        if (type == 'number') {
            if ($(`#${table}_sort_${column}`).attr("src") == "../images/icons/arrow-down-1-9-solid.svg") {
                var sort_direction = 'descending';
                reset_sort_icons()
                $(`#${table}_sort_${column}`).attr("src", "../images/icons/arrow-up-9-1-solid.svg")
                $(`#${table}_sort_${column}`).removeClass("image_svg_inactive")
            } else {
                var sort_direction = 'ascending';
                reset_sort_icons()
                $(`#${table}_sort_${column}`).attr("src", "../images/icons/arrow-down-1-9-solid.svg")
                $(`#${table}_sort_${column}`).removeClass("image_svg_inactive")
            }
        } else if (type == 'string') {
            if ($(`#${table}_sort_${column}`).attr("src") == "../images/icons/arrow-down-a-z-solid.svg") {
                var sort_direction = 'descending';
                $(`#${table}_sort_${column}`).attr("src", "../images/icons/arrow-up-z-a-solid.svg")
                $(`#${table}_sort_${column}`).removeClass("image_svg_inactive")
            } else {
                var sort_direction = 'ascending';
                reset_sort_icons()
                $(`#${table}_sort_${column}`).attr("src", "../images/icons/arrow-down-a-z-solid.svg")
                $(`#${table}_sort_${column}`).removeClass("image_svg_inactive")
            }
        }

        tables = document.getElementById(table);
        sorting = true;
        while (sorting) {
            sorting = false;
            rows = tables.rows;
            for (c = 0; c < (rows.length - 1); c++) {
                tblsort = false;
                a = rows[c].getElementsByTagName("TD")[column];
                b = rows[c + 1].getElementsByTagName("TD")[column];
                if (type == 'number') {
                    if (sort_direction == 'ascending') {
                        if (Number(a.innerHTML) > Number(b.innerHTML)) {
                            tblsort = true;
                            break;
                        }
                    } else {
                        if (Number(a.innerHTML) < Number(b.innerHTML)) {
                            tblsort = true;
                            break;
                        }
                    }
                } else if (type == 'string') {
                    if (sort_direction == 'ascending') {
                        if (a.innerHTML.toUpperCase() > b.innerHTML.toUpperCase()) {
                            tblsort = true;
                            break;
                        }
                    } else {
                        if (a.innerHTML.toUpperCase() < b.innerHTML.toUpperCase()) {
                            tblsort = true;
                            break;
                        }
                    }
                }
            }
            if (tblsort) {
                rows[c].parentNode.insertBefore(rows[c + 1], rows[c]);
                sorting = true;
            }
        }
    }

    toggle_filter = () => {
        $("#search").toggle()
        if ($("#data_table").hasClass('table-striped')) {
            $("#data_table").removeClass('table-striped')
        } else {
            $("#data_table").addClass('table-striped')
        }
    }

    filterTable = () => {
        var input, filter, table, tr, td, i, txtValue;
        input = document.getElementById("search_input");
        filter = input.value.toUpperCase();
        table = document.getElementById("tbody");
        tr = table.getElementsByTagName("tr");
        var selected = Number($("input[name='inlineRaioOptions']:checked").val())
        console.log()
        for (i = 0; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td")[11 + selected];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
        count_selected()
    }

    toggle_selected_counter = () => {
        $("#selected_counter").toggle()
        count_selected()
    }

    toggle_all = () => {

        var status = $("#general_checkbox").is(':checked')
        var visible = get_visible_records()
        $.each(visible, (i, row) => {
            $(`#checkbox_${row}`).prop('checked', status);
        })
        count_selected()
    }

    get_visible_records = () => {
        var active = $('.record').filter(function () {
            return $(this).css("display") != 'none';
        }).children(".id")
        var active_rows = []
        $.each(active, (i, row) => {
            active_rows.push(row.innerText)
        })
        return active_rows
    }

    massive_edit_edit = () => {
        if ($("#massive_edit_options").is(":hidden")) {
            $('#edit_field_hint').prop('selectedIndex', 0);
            $(".edit_tool").hide()
            $(".delete_tool").hide()
            $(".check_tool").show()
            $("#massive_edit_options").css("display", "flex")
        } else {

            $(".edit_tool").show()
            $(".delete_tool").show()
            $(".check_tool").hide()
            $("#massive_edit_options").css("display", "none")
        }

    }

    massive_edit = () => {

        if ($("#massive_edit_tools").is(":hidden")) {
            $(".edit_tool").hide()
            $(".delete_tool").hide()
            $(".check_tool").show()
            $("#general_checkbox").show()
            $("#massive_edit_tools").css("display", "flex")

        } else {
            $(".edit_tool").show()
            $(".delete_tool").show()
            $(".check_tool").hide()
            $("#general_checkbox").hide()
            $("#massive_edit_tools").css("display", "none")
        }
    }
})
 