/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'



export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {
        
        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.COPY) {
            const curr = ctx.newRecord
            curr.setValue({fieldId: 'orderstatus', value: 'B'})
            curr.setValue({fieldId: 'custbody_jtc_status_pedido_venda', value: 1})

        }

    } catch (error) {
        log.error("jtc_aprovar_autamaticamente_pedido_vendas_UE.beforeSubmit", error)
    }
}