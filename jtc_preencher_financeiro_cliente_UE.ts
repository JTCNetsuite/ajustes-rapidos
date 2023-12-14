/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints }  from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import * as search from 'N/search'


export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        if (ctx.type == ctx.UserEventType.VIEW) {
            const currId = ctx.newRecord.id

            const client = ctx.newRecord.getValue("entity")
            const cnpj = ctx.newRecord.getValue("custbody_jtc_cnpjcpf_pedido")

            var invoiceSearchObj = search.create({
                type: "invoice",
                filters:
                [
                   ["type","anyof","CustInvc"], 
                   "AND", 
                   ["mainline","is","T"], 
                   "AND", 
                   ["customer.custentity_enl_cnpjcpf","is",cnpj], 
                   "AND", 
                   ["status","anyof","CustInvc:A"], 
                   "AND", 
                   ["installment.amountpaid","lessthanorequalto","0.00"]
                ],
                columns:
                [
                   search.createColumn({name: "tranid", label: "Pedido"}),
                   search.createColumn({
                      name: "installmentnumber",
                      join: "installment",
                      label: "Número de prestações"
                   }),
                   search.createColumn({
                      name: "amount",
                      join: "installment",
                      label: "Valor"
                   }),
                   search.createColumn({
                      name: "status",
                      join: "installment",
                      label: "Status"
                   }),
                   search.createColumn({
                      name: "daysoverdue",
                      join: "installment",
                      label: "Dias em débito"
                   })
                ]
             })

            // const searchClineteFinanceiro = search.lookupFields({
            //     id: client,
            //     type: search.Type.CUSTOMER,
            //     columns: ['balance', 'overduebalance']
            // })

            const resultCount = invoiceSearchObj.runPaged().count

            const res = invoiceSearchObj.run().getRange({start: 0, end: resultCount})
            let total_aberto = 0
            let total_em_atraso = 0

            for (var i = 0; i < res.length; i++) {
                total_aberto += Number(res[i].getValue({name: 'amount', join: 'installment'}))
                const dias = Number(res[i].getValue({name: 'daysoverdue', join: 'installment'}))
                if (dias >  0) {
                    total_em_atraso += Number(res[i].getValue({name: 'amount', join: 'installment'}))
                }

            }

            log.debug("totalAberto", total_aberto)
            log.debug("totalAtraso", total_em_atraso)


            const setFinanceiro = record.submitFields({
                id: currId, 
                type: record.Type.SALES_ORDER,
                values: {
                    custbody_jt_total_em_aberto: total_aberto,
                    custbody_jtc_total_em_atraso: total_em_atraso
                }
            })

            log.debug("setFinanceiro", setFinanceiro)

        }
    } catch (error) {
        log.error("jtc_preencher_financeiro_cliente_UE.beforeLoad", error)
    }
}