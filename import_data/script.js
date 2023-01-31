$(document).ready(function () {

    var data_array = []
    var data_array_complete = []
    var values_object = {}
    var imported_json

    let indicator_id = getQueryVariableGET('indicator_id');

    let t = getCookie("t")

    check_login = () => {
        if (t == '') {
            console.log("no hay cookie")
            $(".login_td").addClass("unactive_button")
            $(".login_button").removeClass("btn-success")
            $(".login_button").addClass("btn-light")
            $(".login_button").css("color", "gainsboro")
            $(".login_button").css("pointer-events", "none")
        }
    }

    var indicator_details
    var dimensions_types = {
        geospatial: [],
        time: [],
        statistic: [],
    }
    var dimensions_objects = {}
    var dimensions_details = {}
    var dimensions_members = {}
    var dimensions_members_id = {}
    var members_dim_combination = {}

    get_data = () => {
        fetch(`${base_url}/indicator/${indicator_id}/data?format=json`)
            .then(response => response.json())
            .then(records => {
                records_data = records.body.data
                records_data.sort((a, b) => a.id - b.id);

                $.each(records_data, (i, record) => {
                    var data_object = {}
                    data_object["ID"] = record.id
                    data_object["Original_fuente"] = record.source_id
                    data_object["Fuente"] = record.source_id
                    data_object["original_notas"] = record.notes_ids
                    data_object["Notas"] = record.notes_ids
                    data_object["original_value"] = record.value
                    data_object["Valor"] = record.value

                    indicator_dimensions = indicator_details.dimensiones_asociadas
                    var combina = ''

                    $.each(indicator_dimensions, (n, dimension) => {
                        combina = combina + record['dim_' + dimension] + '_'
                        data_object['dim_' + dimension] = record['dim_' + dimension]
                        data_object['sdmx_' + dimension] = dimensions_details[record['dim_' + dimension]].sdmx
                        data_object[dimensions_details[dimension].name] = dimensions_details[record['dim_' + dimension]].name
                    })
                    data_array.push(data_object)
                    members_dim_combination[combina] = record.id
                })

            }).then(ready => {
                console.log(data_array.length)
                //download_excel()
                //create_matrix()
                $("#set_download").show()
                create_dimensions()
            })
    }

    select_all = (id) => {
        var status = $(`#select_all_${id}`).prop('checked')
        $(`.dim_selector_${id}`).prop('checked', status);
    }

    create_dimensions = () => {

        indicator_dimensions = indicator_details.dimensiones_asociadas

        $.each(indicator_dimensions, (n, dimension) => {
            dimension_data = dimensions_objects[dimension]

            $("#dimensions").append(`<div id="dimension_${dimension}" style="width:${100 / indicator_dimensions.length}%;">
            <h5>DIMENSION ${dimension}</h5>
            <div class="form-check" style="margin-bottom:1rem;">
                    <input onchange="select_all(${dimension})" class="form-check-input" type="checkbox" id="select_all_${dimension}" name="option1" value="${dimension}" checked>
                    <label class="form-check-label"><b>Seleccionar todo</b></label>
                  </div>
            </div>`)
            var create_child = (member, level) => {
                member.sort((a, b) => a.order - b.order);
                $.each(member, (i, member) => {
                    $(`#dimension_${dimension}`).append(`<div class="form-check" style="padding-left:${(level * 2) + 1}rem;">
                    <input class="form-check-input dim_selector_${dimension}" id="check_${member.id}" type="checkbox" name="option1" value="${member.id}" checked>
                    <label class="form-check-label">${member.name}</label>
                  </div>`)
                    if (member.members.length > 0) { create_child(member.members, level + 1) }
                })
            }

            $.each(dimension_data.members, (i, member) => {
                $(`#dimension_${dimension}`).append(`<div class="form-check">
                <input class="form-check-input dim_selector_${dimension}" type="checkbox" id="check_${member.id}" name="option1" value="${member.id}" checked>
                <label class="form-check-label">${member.name}</label>
              </div>`)
                if (member.members.length > 0) { create_child(member.members, 1) }
            })

            $("#buttons_config_download").show()

        })
    }

    create_matrix = () => {

        var array_selected_dims = []

        indicator_dimensions = indicator_details.dimensiones_asociadas
        $.each(indicator_dimensions, (n, dimension) => {
            array_selected_dims.push([])
            console.log("Dim " + dimension + ': ' + $(`input.dim_selector_${dimension}:checked`).length)
            $(`input.dim_selector_${dimension}:checked`).each(function () {
                //console.log(typeof(this.value)); 
                array_selected_dims[n].push(Number(this.value))
            });

        })

        /*var array_ids = []
        indicator_dimensions = indicator_details.dimensiones_asociadas
        $.each(indicator_dimensions, (n, dimension) => {
            console.log(dimensions_members_id)
            array_ids.push(dimensions_members_id[dimension])
        })
        console.log(array_ids)*/
        var parts = array_selected_dims,
            result = parts.reduce((a, b) => a.reduce((r, v) => r.concat(b.map(w => [].concat(v, w))), []));
        var match_comb_data = []
        var result_concat = result.map(a => a.join('_'))
        $.each(result_concat, (i, comb_record) => {
            match_comb_data.push([result[i], members_dim_combination[comb_record + '_']])
        })
        $.each(match_comb_data, (i, record) => {
            if (record[1] == undefined) {
                var data_object = {}
                data_object["ID"] = null
                data_object["Original_fuente"] = null
                data_object["Fuente"] = null
                data_object["original_notas"] = null
                data_object["Notas"] = null
                data_object["original_value"] = null
                data_object["Valor"] = null

                indicator_dimensions = indicator_details.dimensiones_asociadas

                $.each(indicator_dimensions, (n, dimension) => {
                    data_object['dim_' + dimension] = record[0][n]
                    data_object['sdmx_' + dimension] = dimensions_details[record[0][n]].sdmx
                    data_object[dimensions_details[dimension].name] = dimensions_details[record[0][n]].name
                })
                data_array_complete.push(data_object)
            } else {
                var selected_record = data_array.filter((obj) => {
                    return obj.ID == record[1]
                })

                data_array_complete.push(selected_record[0])

            }

        })
        //console.log(data_array_complete)
        download_excel()
    }

    download_excel = () => {
        $("#alert_download_excel").show()

        var introduction = [
            ["Introducción"],
            ["Esta es una plantilla de carga para el Gestor de Datos Estadísticos."],
            ["Utilizar la hoja 'Datos' de esta planilla para cargar los datos."],
            ["Editar únicamente el campo 'valores'."],
            ["No agregar filas ni columnas a la planilla."],
            [""],
            ["CEPAL, Versión 1. Enero de 2023"],
        ];

        var workbook = XLSX.utils.book_new(),
            worksheet = XLSX.utils.aoa_to_sheet(introduction);

        // console.log(data_array.length)
        var workbook = XLSX.utils.book_new(),
            worksheet2 = XLSX.utils.json_to_sheet(data_array_complete);
        worksheet2['!cols'] = [];

        indicator_dimensions = indicator_details.dimensiones_asociadas
        worksheet2['!cols'][1] = { hidden: true };
        worksheet2['!cols'][3] = { hidden: true };
        worksheet2['!cols'][5] = { hidden: true };
        $.each(indicator_dimensions, (i, dimension) => {
            var col_raw = 7 + (i * 3)
            var col_sdmx = 8 + (i * 3)
            worksheet2['!cols'][col_raw] = { hidden: true };
            worksheet2['!cols'][col_sdmx] = { hidden: true };
        })

        //worksheet = XLSX.utils.aoa_to_sheet(data);
        workbook.SheetNames.push("Introducción");
        workbook.Sheets["Introducción"] = worksheet;

        workbook.SheetNames.push("Datos");
        workbook.Sheets["Datos"] = worksheet2;


        // (C3) "FORCE DOWNLOAD" XLSX FILE
        XLSX.writeFile(workbook, `indicador_${indicator_id}.xlsx`);

    }

    upload_excel = () => {
        $("#set_download").hide()
        $("#upload_excel").show()
    }

    enable_process = () => {
        $("#process_excel").show()
    }

    analyze_excel = () => {
        var changing_rows = []
        $.each(imported_json, (i, row) => {
            var change = false
            if (row.Original_fuente != row.fuente) { change = true }
            if (row.original_notas != row.Notas) { change = true }
            if (row.original_value != row.Valor) { change = true }
            if (change == true) { changing_rows.push(row) }
            console.log(change)
            console.log(row)
        })
        if (changing_rows.length > 0) {

            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Token " + t);
            myHeaders.append("Content-Type", "application/json");

            $.each(changing_rows, (i, row) => {
                var content = ""
                $.each(row, (n, item) => {
                    content = content + `<b>${n}</b>: ${item} | `
                })

                $("#upload_excel").append(`<div class="row d-flex" style="justify-content: space-around;background-color:whitesmoke;paddin:1rem;margin:0.25rem;"><div class="col-1">${i}</div><div class="col-10">${content}</div><div class="col-1">
                <span id="status_${i}" style="margin-top: 0.4rem;margin-right: auto;margin-left: auto;height:0.7rem;width:0.7rem;background-color:gainsboro;border-radius:50%;display: block;"></span>
            </div></div>`)

                var record = {
                    'indicador': indicator_id,
                    'fuente': row.Fuente,
                    'dimensiones': [],
                    'valor': row.Valor
                }
                if (row.Notas) { record.notas = row.Notas.toString().replace(" ", "").split(",") }

                indicator_dimensions = indicator_details.dimensiones_asociadas
                $.each(indicator_dimensions, (n, dimension) => {
                    record.dimensiones.push(row[`dim_${dimension}`])
                })

                var raw = JSON.stringify(record);

                if (row.ID) {
                    record.id = row.ID
                    var url = `${base_url}/dato/${row.ID}/`
                    var method = 'PUT'
                } else {
                    var url = `${base_url}/dato/`
                    var method = 'POST'
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
                            $(`#status_${i}`).css("background", "green")
                            console.log('EXITO')
                            if (changing_rows.length == i + 1) {
                                $("#success_import").show()
                                $("#import_content").text(`${changing_rows.length} registros importados`)
                            }
                        }
                    }).catch(error => {
                        console.log('error', error)
                    });

            })
        }
    }

    initial_load = () => {

        let url_data = `${base_url}/indicator/${indicator_id}/?format=json`
        fetch(url_data)
            .then((resp) => resp.json())
            .then(function (data) {

                indicator_details = data;
                $("#indicator_title").text(data.descripcion)

            }).then(ready => {
                indicator_dimensions = indicator_details.dimensiones_asociadas
                $.each(indicator_dimensions, (n, dimension) => {
                    dimensions_members.dimension = {}
                    dimensions_members_id[dimension] = []
                    let url_data = `${base_url}/dimension/${dimension}/?format=json`
                    fetch(url_data)
                        .then((resp) => resp.json())
                        .then(function (data) {
                            dimensions_objects[data.body.dimensions.id] = data.body.dimensions
                            dimensions_details[data.body.dimensions.id] = data.body.dimensions
                            var create_child = (obj, level) => {
                                $.each(obj, (i, member) => {
                                    dimensions_details[member.id] = member
                                    dimensions_members.dimension[member.id] = { name: member.name, level: level + 1, parent: member.parent, sdmx: member.sdmx }
                                    dimensions_members_id[dimension].push(member.id)
                                    if (member.members.length > 0) { create_child(member.members, level + 1) }
                                })
                            }
                            $.each(data.body.dimensions.members, (i, member) => {
                                dimensions_details[member.id] = member
                                dimensions_members.dimension[member.id] = { name: member.name, level: 0, parent: member.parent, sdmx: member.sdmx }
                                dimensions_members_id[dimension].push(member.id)
                                if (member.members.length > 0) { create_child(member.members, 0) }
                            })
                        })
                })
            })
    }
    initial_load()

    handleFile = (e) => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            /* reader.readAsArrayBuffer(file) -> data will be an ArrayBuffer */
            var workbook = XLSX.read(e.target.result);

            var fsecond_ws = workbook.Sheets[workbook.SheetNames[1]];
            var jsa = XLSX.utils.sheet_to_json(fsecond_ws);
            console.log(jsa)
            imported_json = jsa

            /* DO SOMETHING WITH workbook HERE */
        };
        reader.readAsArrayBuffer(file);
    }
    input_dom_element.addEventListener("change", handleFile, false);

})
