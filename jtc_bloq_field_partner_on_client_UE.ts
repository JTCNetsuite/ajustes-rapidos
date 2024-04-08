/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as runtime from 'N/runtime'



export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        
        if (ctx.type == ctx.UserEventType.EDIT) {
            const field = ctx.form.getField({id: 'partner'})
            const currUser = runtime.getCurrentUser().role
            if (currUser !=3) {

                field.updateDisplayType({displayType: 'DISABLED'})
            }
        }



    } catch (error) {
        log.error("jtc_bloq_field_partner_on_client_UE.beforeLoad", error)
    }
}