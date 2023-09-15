/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        
        if  (ctx.type == ctx.UserEventType.CREATE )  {
            const curr = ctx.newRecord

            curr.setValue({fieldId: 'custbody_enl_freighttype', value: 2})

        }

        
    } catch (error) {
        log.error("jtc_setar_automatico_tipo_frete.beforeLoad", error)
    }
}