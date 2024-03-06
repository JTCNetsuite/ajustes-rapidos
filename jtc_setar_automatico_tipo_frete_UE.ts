/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import {FormPageLinkType,Form, FieldType, FieldDisplayType, SublistType} from 'N/ui/serverWidget'
import * as search from 'N/search'
import * as url from 'N/url'

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        // ** Preencher tipo de frete e setar Status do Pedido
        if  (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.COPY )  {
            const curr = ctx.newRecord

            curr.setValue({fieldId: 'custbody_enl_freighttype', value: 2})
            const sub = curr.getValue("subsidiary")
            // if (sub != 7) {
            curr.setValue({fieldId: 'orderstatus', value: 'B'})
            curr.setValue({fieldId: 'custbody_jtc_status_pedido_venda', value: 1})
            // }

        }
        // ** Ultimo Pedido 
        if (ctx.type ==  ctx.UserEventType.VIEW) {
                    const date = String(ctx.newRecord.getValue("trandate"))
            
                    const forDate = formatarData(date)
                    const client = ctx.newRecord.getValue("entity")
            
            
                    const searchLastSaleOrd = search.create({
                        type: search.Type.SALES_ORDER,
                        filters: [
                            ['name', search.Operator.ANYOF, client],
                            "AND",
                            ['mainline', search.Operator.IS, "T"],
                            "AND",
                            ['trandate', search.Operator.BEFORE, forDate]
                        ],
                        columns: [
                            search.createColumn({name: 'trandate', sort: search.Sort.DESC}),
                            search.createColumn({name: 'tranid'})
                        ]
                    }).run().getRange({start: 0, end: 1})
            
                    log.debug("searchLasSaledOd", searchLastSaleOrd)
            
                    if (searchLastSaleOrd.length > 0) {
            
                        const link = url.resolveRecord({
                            recordId: searchLastSaleOrd[0].id,
                            recordType: 'salesorder'
                        })
                        ctx.form.addPageLink({
                            type : FormPageLinkType.CROSSLINK,
                            title : 'Último Pedido',
                            url : `https://7414781.app.netsuite.com${link}`
                        })
                    }
            
        }

        if (ctx.type == ctx.UserEventType.VIEW) {
            const client: any = ctx.newRecord.getValue("entity")
            const date = String(ctx.newRecord.getValue("trandate"))
            log.debug("date", date)

            log.debug("cliente", client)
            const form = ctx.form
            const sublist = createSublist(form)

            const lastSaleOrd = createFieldForUltimosPedidos(form, client, date)


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
        log.error("jtc_setar_automatico_tipo_frete.beforeLoad", error)
    }
}

const formatarData = (dataStr: string) => {
    // Criar um objeto Date a partir da string de data
    const dataObj = new Date(dataStr)
  
    // Obter os componentes da data (dia, mês, ano)
    const dia = ('0' + dataObj.getDate()).slice(-2)
    const mes = ('0' + (dataObj.getMonth() + 1)).slice(-2) // Mês é baseado em zero
    const ano = dataObj.getFullYear()
  
    // Formatar a data no estilo desejado (DD/MM/AAAA)
    const dataFormatada = `${dia}/${mes}/${ano}`
  
    return dataFormatada

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

const createFieldForUltimosPedidos = (form: Form, client: string | number, date: string) => {
    try {
        const forDate = formatarData(date)


        const searchLastSaleOrd = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['name', search.Operator.ANYOF, client],
                "AND",
                ['mainline', search.Operator.IS, "T"],
                "AND",
                ['trandate', search.Operator.BEFORE, forDate]
            ],
            columns: [
                search.createColumn({name: 'trandate', sort: search.Sort.DESC}),
                search.createColumn({name: 'tranid'})
            ]
        }).run().getRange({start: 0, end: 1})

        log.debug("searchLasSaledOd", searchLastSaleOrd)

        const field = form.addField({
            id: 'custpage_last_pedido',
            label: 'Último Pedido',
            type: FieldType.URL
            // container: 'main'
        })


        if (searchLastSaleOrd.length > 0) {
            field.linkText = `Pedido de Vendas #${searchLastSaleOrd[0].getValue({name: 'tranid'})}`

            const link = url.resolveRecord({
                recordId: searchLastSaleOrd[0].id,
                recordType: 'salesorder'
            })
            field.defaultValue = `https://7414781.app.netsuite.com${link}`
        }

        

        
    } catch (error) {
        log.error("jtc_pag_histo_cliente_UE.createSublistForUltimosPedidos", error)
    }
}

