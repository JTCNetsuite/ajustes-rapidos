/**
 * @NApiVersion         2.x
 * @NScriptType         UserEventScript
 * @NModuleScope        SameAccount
 * author Rogerio - criado em 09/09/2022  - label purchase
 */

define(['N/record', 'N/search'],

    function (record, search) {

        function getAddressData(cnpjCpf) {

            var doc = cnpjCpf;
            var addressObj = {};

            var customrecord_jtc_addressbook_integrationSearchObj = search.create({
                type: "customrecord_jtc_addressbook_integration",
                filters:
                    [
                        ["custrecord_jtc_addressbook_rf_cpf_cnpj", "is", doc]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_cpf_cnpj", label: "cnpj_cpf" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_address", label: "logradouro" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_log_number", label: "número logradouro" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_log_compl", label: "complemento logradouro" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_district", label: "bairro" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_zip_code", label: "cep" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_city", label: "cidade" }),
                        search.createColumn({ name: "custrecord_jtc_addressbook_rf_state", label: "uf" })
                    ]
            });

            var searchResultCount = customrecord_jtc_addressbook_integrationSearchObj.runPaged().count;

            log.debug({
                title: " linha 39 - function getAddressData - quantidade do resultado ",
                details: ' ---> Quantidade de registros de endereço' + searchResultCount
            });

            if (searchResultCount > 0) {

                customrecord_jtc_addressbook_integrationSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results

                    addressObj = {

                        address: result.getValue({ name: "custrecord_jtc_addressbook_rf_address", label: "logradouro" }),
                        addressNumber: result.getValue({ name: "custrecord_jtc_addressbook_rf_log_number", label: "número logradouro" }),
                        addressComplement: result.getValue({ name: "custrecord_jtc_addressbook_rf_log_compl", label: "complemento logradouro" }),
                        district: result.getValue({ name: "custrecord_jtc_addressbook_rf_district", label: "bairro" }),
                        zipCode: result.getValue({ name: "custrecord_jtc_addressbook_rf_zip_code", label: "cep" }),
                        city: result.getValue({ name: "custrecord_jtc_addressbook_rf_city", label: "cidade" }),
                        state: result.getValue({ name: "custrecord_jtc_addressbook_rf_state", label: "uf" })
                    };
                    log.debug({
                        title: " linha 59 - function getAddressData - quantidade do resultado ",
                        details: addressObj
                    })
                    return true;
                });

            } // End of if setting address data

            return addressObj;

        } // End of function getAddressData

        function getValuesCityState(uf, town) {

            var state = uf;
            var city = town;
            var stateCity = {}

            var customrecord_enl_citiesSearchObj = search.create({
                type: "customrecord_enl_cities",
                filters:
                    [
                        ["custrecord_enl_citystate", "anyof", state],
                        "AND",
                        ["name", "contains", city]
                    ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "ID interno" }),
                        search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Nome" }),
                        search.createColumn({ name: "custrecord_enl_citystate", label: "Estado" })
                    ]
            });
            var searchResultCount = customrecord_enl_citiesSearchObj.runPaged().count;
            log.debug({
               title:  "linha 94 - function getValuesCityState - customrecord_enl_citiesSearchObj result count", 
               details: 'Quantidade do resultado:  ' + searchResultCount
            });

            customrecord_enl_citiesSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                stateCity = {
                    cidade: result.getValue({ name: "internalid", label: "ID interno"  }),
                    estado: result.getValue({ name: "custrecord_enl_citystate", label: "Estado" })
                }
                return true;
            });

            log.debug({
                title: 'linha 108 - valores do objeto cidade-estado',
                details: 'valores do objeto: ' + stateCity
            })

            return stateCity;

        } // End of function getValuesCityState

        function updateAddressbook(idCustomer, addr1, addressNumber, addressComplement, distr, zipC, town, uf) {

            var id = idCustomer;
            var address = addr1;
            var number = addressNumber;
            var complement = addressComplement;
            var district = distr;
            var zipCode = zipC;
            var city = town;
            var state = uf;

            var loadAddress = record.load({
                type: record.Type.CUSTOMER,
                id: id,
                isDynamic: true
            })

            log.debug({
                title: 'linha 134 - fuction updateAddressbook ',
                details: ' ---> record values:  ' + id + ', logradouro: ' + address
            });

            loadAddress.selectNewLine({
                sublistId: 'addressbook'
            });

            var setAddressBook = loadAddress.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });

            setAddressBook.setValue({
                fieldId: 'addr1',
                value: address
            });
            setAddressBook.setValue({
                fieldId: 'custrecord_enl_numero',
                value: number
            });
            setAddressBook.setValue({
                fieldId: 'addr2',
                value: complement
            });
            setAddressBook.setValue({
                fieldId: 'addr3',
                value: district
            });
            setAddressBook.setValue({
                fieldId: 'zip',
                value: zipCode
            });
            setAddressBook.setValue({
                fieldId: 'custrecord_enl_city',
                value: city
            });
            setAddressBook.setValue({
                fieldId: 'custrecord_enl_uf',
                value: state
            });            

            loadAddress.commitLine({
                sublistId: 'addressbook'
            });
            loadAddress.save();

        } // End of function updateAddressbook

        function afterSubmit(context) {

            var nRecord = context.newRecord;
            var id = nRecord.id

            log.debug({
                title: 'linha 189 -  function afterSubmit',
                details: ' ---> id do cliente:  ' + id
            });

            var doc = nRecord.getValue('custentity_enl_cnpjcpf');
            log.debug({
                title: 'linha 195 -  function afterSubmit',
                details: ' ---> cnpj ou cpf do cliente:  ' + doc
            });

            var addressData = getAddressData(doc)

            var doc = nRecord.getValue('custentity_enl_cnpjcpf');
            log.debug({
                title: 'linha 203 -  function afterSubmit',
                details: ' ---> return of function  getAddressData ' + addressData
            });

            var address = addressData.address;
            var addressNumber = addressData.addressNumber;
            var addressComplement = addressData.addressComplement;
            var district = addressData.district;
            var zipCode = addressData.zipCode;
            var city = addressData.city;
            var state = addressData.state

            log.debug({
                title: 'linha 216 - fuction afterSubmit ',
                details: ' ---> value address:  ' + address + ' --> nº:  ' + addressNumber + ' --> complememento:  ' + addressComplement
            });

            log.debug({
                title: ' linha 221 - function afterSubmit ',
                details: ' ---> bairro:  ' + district + ' ---> cep: ' + zipCode + ' \n ---> cidade: ' + city + ' ---> u.f.:  ' + state
            });

            var stateCity = getValuesCityState(state, city);
            var cidade = stateCity.cidade;
            var estado = stateCity.estado;

            updateAddressbook(id, address, addressNumber, addressComplement, district, zipCode, cidade, estado);

        } // End of function afterSubmit

        return {
            afterSubmit: afterSubmit
        }
    });