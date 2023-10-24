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
            const searchClineteFinanceiro = search.lookupFields({
                id: client,
                type: search.Type.CUSTOMER,
                columns: ['balance', 'overduebalance']
            })


            const setFinanceiro = record.submitFields({
                id: currId, 
                type: record.Type.SALES_ORDER,
                values: {
                    custbody_jt_total_em_aberto: searchClineteFinanceiro.balance,
                    custbody_jtc_total_em_atraso: searchClineteFinanceiro.overduebalance
                }
            })

            log.debug("setFinanceiro", setFinanceiro)

        }
    } catch (error) {
        log.error("jtc_preencher_financeiro_cliente_UE.beforeLoad", error)
    }
}