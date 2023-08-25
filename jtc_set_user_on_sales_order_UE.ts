/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as runtime from 'N/runtime'
import { constant as CTS } from "./module/jtc_eds_for_all_setting"


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {
        if (ctx.type == ctx.UserEventType.CREATE) {
            const curr = ctx.newRecord
            const currUser = runtime.getCurrentUser().id
            curr.setValue({fieldId:CTS.SALES_ORDER.LANCADOR_PEDIDO, value: currUser})    
        }
        


    } catch (error) {
        log.error("jtc_set_user_on_sales_order_UE.beforeSubmit", error)
    }
}