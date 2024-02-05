/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import {SublistType, FieldType, Form, FieldDisplayType} from 'N/ui/serverWidget'
import * as search from 'N/search'


export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {

        if (ctx.type == ctx.UserEventType.VIEW ) {
            const client = ctx.newRecord.getValue("entity")
            log.debug("cliente", client)
            const form = ctx.form
            const sublist = createSublist(form)

            const transactionSearchObj = search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['name', search.Operator.ANYOF, client],
                    "AND",
                    ['mainline', search.Operator.IS, "T"]
                ],
                columns: [
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
            }).run().getRange({start: 0, end: 1000})
            log.debug("trans", transactionSearchObj)
            for (var i =0; i < transactionSearchObj.length; i++) {
                const values = transactionSearchObj[i]
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

        }
        
    } catch (error) {
        log.error("jtc_pag_histo_cliente_UE.beforeLoad", error)
    }
}


const createSublist = (form: Form) => {
    try {
        const sublist  = form.addSublist({
            id: 'custpage_sublist',
            label: 'Pagamentos e Créditos',
            type: SublistType.LIST,
            tab: 'custom'
        })

        sublist.addField({
            id: 'custpage_transaction',
            label: 'Transação',
            type: FieldType.SELECT,
            source: 'transaction'
        }).updateDisplayType({displayType: FieldDisplayType.DISABLED})

        sublist.addField({
            id: 'custpage_data',
            label: 'DATA',
            type: FieldType.DATE
        })
        sublist.addField({
            id: 'custpage_num_cr',
            label: 'Num. CR',
            type: FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_type',
            label: 'TIPO',
            type: FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_cliente',
            label: 'CLIENTE',
            type: FieldType.TEXT
        }) 
        sublist.addField({
            id: 'custpage_nf',
            label: 'NOTA FISCAL',
            type: FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_status',
            label: 'STATUS',
            type: FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_parcela',
            label: 'PARCELA',
            type: FieldType.INTEGER
        })
        sublist.addField({
            id: 'custpage_dias_em_atraso',
            label: 'DIAS EM ATRASO',
            type: FieldType.INTEGER
        })
        sublist.addField({
            id: 'custpage_dt_vencimento',
            label: 'DATA DE VENCIMENTO',
            type: FieldType.DATE
        })
        sublist.addField({
            id: 'custpage_vl_parcela',
            label: 'Prestação',
            type: FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_vl_pago',
            label: 'Prestação Valor Pago',
            type: FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_status_parcela',
            label: 'STATUS PARCELA',
            type: FieldType.TEXT
        })
        sublist.addField({
            id: 'custpage_vl_total',
            label: 'VALOR TOTAL',
            type: FieldType.CURRENCY
        })
        sublist.addField({
            id: 'custpage_applied',
            label: 'Aplicado à Transação',
            type: FieldType.TEXT
        })

        return sublist

    } catch (error) {
        
    }
}