/**
 * @NAPIVersion 2.x
 * @NScriptType Suitelet
 */


import {EntryPoints} from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as UI from 'N/ui/serverWidget'

export const onRequest: EntryPoints.Suitelet.onRequest = (ctx: EntryPoints.Suitelet.onRequestContext) =>{
    try {
        const form = UI.createForm({
            title: "Busca de Pagamentos e Créditos"
        })
        if(ctx.request.method == "GET") {
            const params = ctx.request.parameters
            
            log.debug("params", params)
            ctx.response.writePage(createForm( form))
        } else {
            ctx.response.writePage(formPost(form, ctx))
        }
    } catch (error) {
        log.error('jtc_pagamentos_credisto.onRequest', error)
    }
}



const createForm = (form: UI.Form) => {
    try {
        
        const nome_empresa = form.addField({
            id: 'custpage_nome_empresa',
            label: 'Nome da Empresa',
            type: UI.FieldType.TEXT
        })

        const cnpj_empresa = form.addField({
            id: 'custpage_cnphj_empresa',
            label: 'CNPJ/CPF',
            type: UI.FieldType.TEXT
        })

        const nf = form.addField({
            id: 'custpage_num_nf',
            label: 'Número da Nota Fiscal',
            type: UI.FieldType.TEXT
        })

        form.addSubmitButton({
            label: 'Procurar'
        })
        const fielld = form.getField({id: 'secondarysubmitter'})
        log.debug("field", fielld)
        // fielld.updateDisplayType({displayType: UI.FieldDisplayType.HIDDEN})

        return form


    } catch (error) {
        throw error
    }
    
}

const formPost = (form: UI.Form, ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {
        createForm(form)
        

        const sublist = createSublist(form)
        const transactions: search.Result[] = searchTransactions(ctx)
        for (var i =0; i < transactions.length; i++) {
            const values = transactions[i]
            // log.debug("values", values)
            sublist.setSublistValue({
                id: 'custpage_transaction',
                line: i,
                value: values.id
            })
        
            const trandate = values.getValue({name: 'trandate'})
            if (!!trandate) {
                sublist.setSublistValue({
                    id: 'custpage_data',
                    line: i,
                    value: String(trandate)
                })
            }
            
            const tranid = values.getValue({name: 'tranid'})
            if (!!tranid) {
                sublist.setSublistValue({
                    id: 'custpage_num_cr',
                    line: i,
                    value: String(tranid)
                })
            }
            const terms = values.getText({name: 'terms'})
            if (!!terms) {
                sublist.setSublistValue({
                    id: 'custpage_terms',
                    line: i,
                    value: terms
                })
            }

            const type = values.getText({name: 'type'})
            if (!!type) {
                sublist.setSublistValue({
                    id: 'custpage_type',
                    line: i,
                    value: type
                })
            }
            const cliente = values.getText({name: 'entity'})
            if (!! cliente) {
                sublist.setSublistValue({
                    id: 'custpage_cliente',
                    line: i,
                    value: cliente
                })
            }
            
            if (!!values.getValue({name: 'custbody_enl_fiscaldocnumber'}) ) {
                sublist.setSublistValue({
                    id: 'custpage_nf',
                    line: i,
                    value: String(values.getValue({name: 'custbody_enl_fiscaldocnumber'}))
                })
            }
            
            const inst_status = values.getText({name: 'statusref'})
            if (!!inst_status) {
                sublist.setSublistValue({
                    id: 'custpage_status',
                    line: i,
                    value: inst_status
                })
            }
            const installment_number = values.getValue({name: 'installmentnumber', join: 'installment'})
            if (!!installment_number) {
                sublist.setSublistValue({
                    id: 'custpage_parcela',
                    line: i,
                    value: String(installment_number)
                })
            }
            const installment_dias_em_atraso = values.getValue({name: 'daysoverdue', join: 'installment'})
            if (!!installment_dias_em_atraso) {
                sublist.setSublistValue({
                    id: 'custpage_dias_em_atraso',
                    line: i,
                    value: String(installment_dias_em_atraso)
                })
            }


            const dt_vencimento = values.getValue({name: 'duedate', join: 'installment'})

            if (!!dt_vencimento) {
                sublist.setSublistValue({
                    id: 'custpage_dt_vencimento',
                    line: i,
                    value: String(dt_vencimento)
                })
            }
            const vl_parcela = values.getValue({name: 'amount', join: 'installment'})
            if (!!vl_parcela) {
                sublist.setSublistValue({
                    id: 'custpage_vl_parcela',
                    line: i,
                    value: String(vl_parcela)
                })
            }
            if (!!values.getValue({name: 'amountpaid', join: 'installment'}) ) {
                sublist.setSublistValue({
                    id: 'custpage_vl_pago',
                    line: i,
                    value: String(values.getValue({name: 'amountpaid', join: 'installment'}))
                })
            }
            

            const status = values.getValue({name: 'status', join: 'installment'})
            if (!!status) {
                
                const prazo = Number(values.getValue({name: 'terms'}))
                const type = values.getValue({name: 'type'})

                if (prazo == 49 || prazo == 48 || type == 'CustCred') {
                    sublist.setSublistValue({
                        id: 'custpage_status_parcela',
                        line: i,
                        value: '...'
                    })
                } else {
                    sublist.setSublistValue({
                        id: 'custpage_status_parcela',
                        line: i,
                        value: String(status)
                    })
                }
                
            }
            const total = values.getValue({name: 'amount'})
            if (!!total) {
                sublist.setSublistValue({
                    id: 'custpage_vl_total',
                    line: i,
                    value: String(total)
                })
            }

            const applied = values.getText({name: 'appliedtotransaction'})
            if(!!applied) {
                sublist.setSublistValue({
                    id: 'custpage_applied',
                    line: i, 
                    value: applied
                })
            }
            
        }

        return form
    } catch (error) {
        log.error("jtc_pagamentos_creditos_ST", error)
    }
}

const createSublist = (form: UI.Form) => {
    try {
        const sublist  = form.addSublist({
            id: 'custpage_sublist',
            label: 'Transações',
            type: UI.SublistType.LIST
        })

        sublist.addField({
            id: 'custpage_transaction',
            label: 'Transação',
            type: UI.FieldType.SELECT,
            source: 'transaction'
        }).updateDisplayType({displayType: UI.FieldDisplayType.DISABLED})

        sublist.addField({
            id: 'custpage_data',
            label: 'DATA',
            type: UI.FieldType.DATE
        })
        sublist.addField({
            id: 'custpage_num_cr',
            label: 'Num. CR',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_type',
            label: 'TIPO',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_cliente',
            label: 'CLIENTE',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_terms',
            label: 'Forma de Pagamento',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_nf',
            label: 'NOTA FISCAL',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_status',
            label: 'STATUS',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_parcela',
            label: 'PARCELA',
            type: UI.FieldType.INTEGER
        })
        sublist.addField({
            id: 'custpage_dias_em_atraso',
            label: 'DIAS EM ATRASO',
            type: UI.FieldType.INTEGER
        })
        sublist.addField({
            id: 'custpage_dt_vencimento',
            label: 'DATA DE VENCIMENTO',
            type: UI.FieldType.DATE
        })
        sublist.addField({
            id: 'custpage_vl_parcela',
            label: 'Prestação',
            type: UI.FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_vl_pago',
            label: 'Prestação Valor Pago',
            type: UI.FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_status_parcela',
            label: 'STATUS PARCELA',
            type: UI.FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_vl_total',
            label: 'VALOR TOTAL',
            type: UI.FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_applied',
            label: 'Aplicado à Transação',
            type: UI.FieldType.TEXT
        })

        return sublist

    } catch (error) {
        
    }
}


const searchTransactions = (ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {
        const body = ctx.request.parameters

        const nome_empresa = body.custpage_nome_empresa
        const cnpj = body.custpage_cnphj_empresa
        const nf = body.custpage_num_nf

        
        log.debug("body", nome_empresa)
        log.debug("body", cnpj)
        log.debug("body", nf)

        const filters = [
            ["type","anyof","CustInvc","CustCred"], 
            "AND", 
            ["mainline","is","T"]
        ]

        if (!!nome_empresa) {
            filters.push("AND", ["customer.companyname",search.Operator.CONTAINS,nome_empresa])
        }

        if(!!cnpj) {
            filters.push("AND", ["customer.custentity_enl_cnpjcpf","is", cnpj])
        }

        if (!!nf) {
            filters.push("AND", ["custbody_enl_fiscaldocnumber","contains","19"] )
        }



        var transactionSearchObj = search.create({
            type: "transaction",
            filters:filters,
            columns:
            [
               search.createColumn({name: 'terms'}),
               search.createColumn({
                  name: "trandate",
                  label: "Data"
               }),
               search.createColumn({
                  name: "tranid",
                  label: "Num. CR"
               }),
               search.createColumn({name: "type", label: "Tipo"}),
               search.createColumn({name: "entity", label: "Nome"}),
               search.createColumn({name: "custbody_enl_fiscaldocnumber", label: "Nota Fiscal"}),
               search.createColumn({name: "statusref", label: "Status"}),
               search.createColumn({
                  name: "installmentnumber",
                  join: "installment",
                  sort: search.Sort.ASC,
                  label: "Parcela"
               }),
               search.createColumn({
                  name: "daysoverdue",
                  join: "installment",
                  label: "Dias Atraso"
               }),
               search.createColumn({
                  name: "duedate",
                  sort: search.Sort.DESC,
                  join: "installment",
                  label: "Data de vencimento"
               }),
               search.createColumn({
                  name: "amount",
                  join: "installment",
                  label: "Prestação "
               }),
               search.createColumn({
                  name: "status",
                  join: "installment",
                  label: "Status Parcela"
               }),
               search.createColumn({name: "amount", label: "Valor Total"}),
               search.createColumn({name: "appliedtotransaction", label: "Aplicados à transação"}),
               search.createColumn({
                name: "amountpaid",
                join: "installment",
                label: "Valor pago"
             })
            ]
         }).run().getRange({start: 0, end: 1000});

         return transactionSearchObj
        //  transactionSearchObj.fetch({index:})

    } catch (error) {
        log.error("jtc_creditos_err", error)
    }
}