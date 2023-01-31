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

    var indicators_details
    var dimensions_types = {
        geospatial: [],
        time: [],
        statistic: [],
    }


    highlight = (div) => {
        console.log("highlight" + div)
        if (div == 'div_dimensiones_asociadas') {
            $("#highlight_text_dimensions").empty()
            $("#highlight_text_dimensions").append(`
            Seleccionar al menos 2 dimensiones<br>
           <span style="color:blue">Unidades de tiempo (Seleccionar sólo una)</span><br>
           <span style="color:red">Unidades territoriales (Seleccionar sólo una)</span>            
           `)
        }
    }

    open_window = (url) => {
        location.href(url);
    };

    var create_tooltips = () => {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    }

    check_dimensions = () => {
        $(".message_abm").hide()
        var selections = $("#dimensiones_asociadas").val()
        var geospatial = 0
        var time = 0
        selections.map((dim) => {
            if (dimensions_types.geospatial.indexOf(Number(dim)) > -1) { geospatial = geospatial + 1 }
            if (dimensions_types.time.indexOf(Number(dim)) > -1) { time = time + 1 }
        })
        var problem = false
        if (selections.length == 1) {
            $("#error_dim_number").show()
            problem = true
        }
        if (geospatial > 1) {
            $("#error_dim_geospatial").show()
            problem = true
        }
        if (time == 0) {
            $("#error_dim_time").show()
        }
        if (time > 1) {
            $("#error_dim_numbertime").show()
            problem = true
        }
        if (problem) {
            $(".save").removeClass("btn-success")
            $(".save").addClass("btn-light")
            $(".save").css("pointer-events", "none")
        } else {
            $(".save").removeClass("btn-light")
            $(".save").addClass("btn-success")
            $(".save").css("pointer-events", "all")
        }

        console.log(selections.length)
    }

    populate_areas_dimensions = (indicator_id) => {
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
            .then(function (dimtypes) {
                $.each(dimtypes, (i, dim) => {
                    dimensions_types[dim.id] = dim.descripcion

                })
            }).then(function () {
                let url_data = `${base_url}/dimension/?format=json`
                fetch(url_data, requestOptions)
                    .then((resp) => resp.json())
                    .then(function (data) {
                        $("#dimensiones_asociadas").empty()
                        var color = {
                            geospatial: 'red',
                            time: 'blue',
                            statistic: 'black'
                        }
                        data.body.dimensions.sort((a, b) => a.type - b.type);
                        $.each(data.body.dimensions, (i, dimension) => {
                            $("#dimensiones_asociadas").append(`<option class="${dimension.type}" style="color:${color[dimensions_types[dimension.type]]};" value="${dimension.id}">${dimension.name}</option>`)
                            dimensions_types[dimensions_types[dimension.type]].push(dimension.id)
                        })
                    }).then(function () {
                        console.log("Areas")
                        let url_data_areas = `${base_url}/thematic-tree/?format=json`
                        fetch(url_data_areas, requestOptions)
                            .then((resp_areas) => resp_areas.json())
                            .then(function (data_areas) {
                                $("#areas").empty()
                                var create_child_area = (obj, level) => {
                                    var space = level + 1
                                    $.each(obj, (i, child) => {
                                        if (child.area_id) {
                                            $("#areas").append(`<option style="padding-left:${space}rem;" value="${child.area_id}">-${child.name}</option>`)
                                            if (child.children.length > 0) {
                                                create_child_area(child.children, space)
                                            }
                                        }
                                    })
                                }
                                $.each(data_areas.body, (i, area) => {
                                    $("#areas").append(`<option value="${area.area_id}">${area.name}</option>`)
                                    create_child_area(area.children, 0)
                                })
                                if (indicator_id) {
                                    var indicator_data = indicators_details.filter(function (obj) {
                                        return obj.id == indicator_id;
                                    });
                                    $("#dimensiones_asociadas").val(indicator_data[0].dimensiones_asociadas)
                                    $("#areas").val(indicator_data[0].areas)
                                }
                            })
                    })
            })
    }

    add_indicator = () => {

        populate_areas_dimensions(false)

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()

        $(`#abm`).show();
        document.getElementById("indicator_form").reset();
        $(".collapse").removeClass("show")
        $("#indicator_form").show()

        $(`#header_add`).show();
        $(`#buttons_add`).show();
    }

    get_indicator_data = () => {
        var indicator = {
            "descripcion": $("#descripcion").val(),
            "publicado": $('#publicado').is('checked'),
            "indicador_listo": $('#indicador_listo').is('checked')
        }
        if ($("#descripcion_ingles").val() != '') {
            indicator.descripcion_ingles = $("#descripcion_ingles").val()
        }
        if ($("#descripcion_frances").val() != '') {
            indicator.descripcion_frances = $("#descripcion_frances").val()
        }
        if ($("#descripcion_portugues").val() != '') {
            indicator.descripcion_portugues = $("#descripcion_portugues").val()
        }
        if ($("#definicion").val() != '') {
            indicator.definicion = $("#definicion").val()
        }
        if ($("#definicion_ingles").val() != '') {
            indicator.definicion_ingles = $("#definicion_ingles").val()
        }
        if ($("#definicion_frances").val() != '') {
            indicator.definicion_frances = $("#definicion_frances").val()
        }
        if ($("#definicion_portugues").val() != '') {
            indicator.definicion_portugues = $("#definicion_portugues").val()
        }
        if ($("#unidad_de_medida").val() != '') {
            indicator.unidad_de_medida = $("#unidad_de_medida").val()
        }
        if ($("#unidad_de_medida_ingles").val() != '') {
            indicator.unidad_de_medida_ingles = $("#unidad_de_medida_ingles").val()
        }
        if ($("#unidad_de_medida_frances").val() != '') {
            indicator.unidad_de_medida_frances = $("#unidad_de_medida_frances").val()
        }
        if ($("#unidad_de_medida_portugues").val() != '') {
            indicator.unidad_de_medida_portugues = $("#unidad_de_medida_portugues").val()
        }
        if ($("#orden").val() != '') {
            indicator.orden = Number($("#orden").val())
        }
        if ($("#nota").val() != '') {
            indicator.nota = $("#nota").val()
        }
        if ($("#nota_ingles").val() != '') {
            indicator.nota_ingles = $("#nota_ingles").val()
        }
        if ($("#nota_frances").val() != '') {
            indicator.nota_frances = $("#nota_frances").val()
        }
        if ($("#nota_portugues").val() != '') {
            indicator.nota_portugues = $("#nota_portugues").val()
        }
        if ($("#comentarios").val() != '') {
            indicator.comentarios = $("#comentarios").val()
        }
        if ($("#comentarios_ingles").val() != '') {
            indicator.comentarios_ingles = $("#comentarios_ingles").val()
        }
        if ($("#comentarios_frances").val() != '') {
            indicator.comentarios_frances = $("#comentarios_frances").val()
        }
        if ($("#comentarios_portugues").val() != '') {
            indicator.comentarios_portugues = $("#comentarios_portugues").val()
        }
        if ($("#metodologia_calculo").val() != '') {
            indicator.metodologia_calculo = $("#metodologia_calculo").val()
        }
        if ($("#metodologia_calculo_ingles").val() != '') {
            indicator.metodologia_calculo_ingles = $("#metodologia_calculo_ingles").val()
        }
        if ($("#metodologia_calculo_frances").val() != '') {
            indicator.metodologia_calculo_frances = $("#metodologia_calculo_frances").val()
        }
        if ($("#metodologia_calculo_portugues").val() != '') {
            indicator.metodologia_calculo_portugues = $("#metodologia_calculo_portugues").val()
        }
        if ($("#numero_decimales_consulta").val() != '') {
            indicator.numero_decimales_consulta = Number($("#numero_decimales_consulta").val())
        }
        if ($("#fecha_ultima_actualizacion_revision").val() != '') {
            var date_input = $("#fecha_ultima_actualizacion_revision").val().split('/')
            indicator.fecha_ultima_actualizacion_revision = new Date(date_input[2], date_input[0] - 1, date_input[1], 0, 0, 0, 0);
        }
        if ($("#actualizado_por").val() != '') {
            indicator.actualizado_por = $("#actualizado_por").val()
        }
        if ($("#revisado_por").val() != '') {
            indicator.revisado_por = $("#revisado_por").val()
        }
        if ($("#sdmx").val() != '') {
            indicator.sdmx = $("#sdmx").val()
        }
        if ($("#dimensiones_asociadas").val() != '') {
            indicator.dimensiones_asociadas = $("#dimensiones_asociadas").val()
        }
        if ($("#areas").val() != '') {
            indicator.areas = $("#areas").val()
        }
        return indicator;

    }

    save_add_indicator = () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_indicator_data());

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/indicator/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#indicator_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $(`#indicator_form`).hide();
                    $(`.buttons_abm`).hide();
                    $("#success_add").show()
                } else {
                    console.log("fracaso")
                    $(`.buttons_abm`).hide();
                    $("#error_add").show()
                    $("#error_add_content").empty()
                    $.each(result, (i, val) => {
                        if (i == 'descripcion') { i = 'Nombre del indicador' }
                        if (i == 'dimensiones_asociadas') {
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
        $(".save").removeClass("btn-light")
        $(".save").addClass("btn-success")
        $(".save").css("pointer-events", "all")
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

        fetch(`${base_url}/indicator/${id}`, requestOptions)
            .then((response) => response.text())
            .then(function (data) {
                $(".buttons_abm").hide()
                $(".message_abm").hide()
                $("#indicator_" + id).hide()
                $(`#success_delete`).show();
            })
    }

    delete_indicator = (id, text) => {
        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()
        $("#indicator_form").hide()

        $("#header_delete").show()
        $("#danger_delete").show()
        $("#buttons_delete").show()
        $("#delete_button").attr('onclick', `confirm_delete(${id})`)
        $("#danger_content").text(text)
        $(".abm").show()
    }

    edit_indicator = (id) => {

        populate_areas_dimensions(id)

        $(".message_abm").hide()
        $(".header_abm").hide()
        $(".buttons_abm").hide()

        $("#header_edit").show()
        $("#buttons_edit").show()
        $(".abm").show()

        var indicator_data = indicators_details.filter(function (obj) {
            return obj.id == id;
        });

        $("#descripcion").val(indicator_data[0].descripcion)
        $("#descripcion_ingles").val(indicator_data[0].descripcion_ingles)
        $("#descripcion_frances").val(indicator_data[0].descripcion_frances)
        $("#descripcion_portugues").val(indicator_data[0].descripcion_portugues)

        $("#definicion").val(indicator_data[0].definicion)
        $("#definicion_ingles").val(indicator_data[0].definicion_ingles)
        $("#definicion_frances").val(indicator_data[0].definicion_frances)
        $("#definicion_portugues").val(indicator_data[0].definicion_portugues)

        $("#unidad_de_medida").val(indicator_data[0].unidad_de_medida)
        $("#unidad_de_medida_ingles").val(indicator_data[0].unidad_de_medida_ingles)
        $("#unidad_de_medida_frances").val(indicator_data[0].unidad_de_medida_frances)
        $("#unidad_de_medida_portugues").val(indicator_data[0].unidad_de_medida_portugues)

        $("#orden").val(indicator_data[0].orden)

        $("#nota").val(indicator_data[0].nota)
        $("#nota_ingles").val(indicator_data[0].nota_ingles)
        $("#nota_frances").val(indicator_data[0].nota_frances)
        $("#nota_portugues").val(indicator_data[0].nota_portugues)

        $("#comentarios").val(indicator_data[0].comentarios)
        $("#comentarios_ingles").val(indicator_data[0].comentarios_ingles)
        $("#comentarios_frances").val(indicator_data[0].comentarios_frances)
        $("#comentarios_portugues").val(indicator_data[0].comentarios_portugues)

        $("#metodologia_calculo").val(indicator_data[0].metodologia_calculo)
        $("#metodologia_calculo_ingles").val(indicator_data[0].metodologia_calculo_ingles)
        $("#metodologia_calculo_frances").val(indicator_data[0].metodologia_calculo_frances)
        $("#metodologia_calculo_portugues").val(indicator_data[0].metodologia_calculo_portugues)

        $("#tipo_dato").val(indicator_data[0].tipo_dato)
        $("#tipo_dato_ingles").val(indicator_data[0].tipo_dato_ingles)
        $("#tipo_dato_frances").val(indicator_data[0].tipo_dato_frances)
        $("#tipo_dato_portugues").val(indicator_data[0].tipo_dato_portugues)

        $("#indicador_listo").val(indicator_data[0].indicador_listo)

        $("#numero_decimales_consulta").val(indicator_data[0].numero_decimales_consulta)

        var fecha_ultima_actualizacion_revision = indicator_data[0].fecha_ultima_actualizacion_revision

        if (fecha_ultima_actualizacion_revision != null) {
            console.log(fecha_ultima_actualizacion_revision)
            let date_formated = new Date(fecha_ultima_actualizacion_revision)
            let year = date_formated.getFullYear();
            let day = date_formated.getDate();
            let month = date_formated.getMonth() + 1;
            $("#fecha_ultima_actualizacion_revision").val(`${month}/${day}/${year}`)
        }

        $("#actualizado_por").val(indicator_data[0].actualizado_por)
        $("#revisado_por").val(indicator_data[0].revisado_por)
        $("#sdmx").val(indicator_data[0].sdmx)
        $("#publicado").val(indicator_data[0].publicado)
        $("#edit_button").attr('onclick', `send_edit(${id})`)
        $("#indicator_form").show()
    }

    send_edit = (id) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify(get_indicator_data());

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${base_url}/indicator/${id}/`, requestOptions)
            //.then(response => response.json())
            .then(response => response.json())
            .then(result => {
                console.log(result)
                $("#indicator_form").hide()
                initial_load()
                if (result.id) {
                    console.log("exito")
                    $("#indicator_form").hide()
                    $("#buttons_edit").hide()
                    $("#success_edit").show()
                } else {
                    console.log("fracaso")
                    $("#buttons_edit").hide()
                    $("#error_editing_content").empty()
                    $.each(result, (i, val) => {
                        if (i == 'descripcion') { i = 'Nombre del indicador' }
                        if (i == 'dimensiones_asociadas') {
                            $.each(val.dimensiones, (n, dimension) => {
                                $("#error_edit_content").append(`<b>Dimensiones asociadas</b>: ${dimension}<br>`)
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

    initial_load = () => {

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Token " + t);
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        $("#indicators").empty()

        let url_data = `${base_url}/indicator/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {

                indicators_details = data;
                data.sort((a, b) => a.id - b.id);

                $.each(data, (i, indicator) => {
                    let indicator_content = `<div class="row" id="indicator_${indicator.id}">
                <div class="col-1 button_div">${indicator.id}</div>
                <div class="source col-7" id="source_${indicator.id}">${indicator.descripcion}</div>
                <div class="col-1 button_div login_td"data-bs-toggle="tooltip" title="Eliminar indicador" onclick="delete_indicator(${indicator.id},'${indicator.descripcion}')"><img class="image_button" src="../images/icons/trash-can-solid.svg"></div>
                <div class="col-1 button_div login_td" data-bs-toggle="tooltip" title="Editar metadatos del indicador" onclick="edit_indicator(${indicator.id})"><img class="image_button" src="../images/icons/pencil-solid.svg"></div>
                <div class="col-1 button_div" onclick="location.href='../edit_data?indicator_id=${indicator.id}'" data-bs-toggle="tooltip" title="Ver datos"><img class="image_button" src="../images/icons/table-list-solid.svg"></div>
                <div class="col-1 button_div login_td" onclick="location.href='../import_data?indicator_id=${indicator.id}'" data-bs-toggle="tooltip" title="Importar datos"><img class="image_button" src="../images/icons/upload-solid.svg"></div></div>`
                    $("#indicators").append(indicator_content)
                })
                create_tooltips()
                check_login()
            })
    }
    $(function () {
        $('#datepicker').datepicker();
    });
    initial_load()
})
