/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */




import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        
        if (ctx.type == ctx.UserEventType.VIEW) {
            const id_client = ctx.newRecord.id
            const curr = record.load({
                id: id_client,
                type: record.Type.CUSTOMER,
                isDynamic: true
            })
            
            const filter =  [
                ["mainline","is","T"], 
                "AND", 
                ["name","anyof", id_client]
             ]
            var pedido_com_valor_maior = search.create({
                type: search.Type.SALES_ORDER,
                filters:filter,
                columns:
                [
                   search.createColumn({name: "trandate", label: "Data"}),
                   search.createColumn({
                      name: "amount",
                      sort: search.Sort.DESC
                   })
                ]
            }).run().getRange({start: 0, end: 1})

            var ultimo_pedido = search.create({
                type: search.Type.SALES_ORDER,
                filters:filter,
                columns:
                [
                   search.createColumn({name: "trandate", sort: search.Sort.DESC}),
                   search.createColumn({
                      name: "amount"
                   })
                ]
            })
            var searchResultCount = ultimo_pedido.runPaged().count
            if (searchResultCount > 0) {

                const resulst_ultimo = ultimo_pedido.run().getRange({start:0 ,end: searchResultCount})
                log.debug("ultimo Pedido", resulst_ultimo[0])
                curr.setValue({
                    fieldId: 'custentity_vl_liq_ultimo_pedido',
                    value: resulst_ultimo[0].getValue({name: 'amount'})
                })

                const ultimo_dt =  String(resulst_ultimo[0].getValue({name: 'trandate'})).split("/")
                curr.setValue({
                    fieldId: 'custentity_dt_ultimo_pedido',
                    value: new Date(`${ultimo_dt[1]}/${ultimo_dt[0]}/${ultimo_dt[2]}`)
                })

                log.debug("Primeiro Pedido", resulst_ultimo[resulst_ultimo.length - 1])
                const prim = String(resulst_ultimo[resulst_ultimo.length - 1].getValue({name: 'trandate'})).split("/")
                curr.setValue({
                    fieldId: 'custentity_dt_prim_pedido',
                    value: new Date(`${prim[0]}/${prim[1]}/${prim[2]}`)
                })


            }


            if (pedido_com_valor_maior.length > 0) {

                log.debug("Pedido com maior valor", pedido_com_valor_maior)
                curr.setValue({
                    fieldId: 'custentity_vl_liquido_maior_pedido',
                    value: pedido_com_valor_maior[0].getValue({name: 'amount'})
                })
                const maior_dt = String(pedido_com_valor_maior[0].getValue({name: 'trandate'})).split("/")
                curr.setValue({
                    fieldId: 'custentity_dt_maior_pedido',
                    value:  new Date(`${maior_dt[1]}/${maior_dt[0]}/${maior_dt[2]}`)
                })
            }
           
            curr.save({ignoreMandatoryFields: true})

        }


    } catch (error) {
        log.error("jtc_estatistica_vendas_UE.beforeLoad", error)
    }
}