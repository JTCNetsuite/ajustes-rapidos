/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as search from "N/search"
import * as runtime from 'N/runtime'

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {

}

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {

    // const field = ctx.form.getField({id: 'closeremaining'})
    if (ctx.type == ctx.UserEventType.VIEW) {
        const curr = ctx.newRecord
   
        const searchAtendimento = search.create({
            type: search.Type.ITEM_FULFILLMENT,
            filters: [
                ['mainline', search.Operator.IS, "T"],
                    "AND",
                ['createdfrom', search.Operator.ANYOF, curr.id]
            ]
        }).runPaged().count
    
        log.debug("searchAtenfimento", searchAtendimento)
    
        const status_inte = curr.getValue("custbody_jtc_integration_status")
          
        const currUser = runtime.getCurrentUser().role
        
        if (searchAtendimento > 0 ) {
            ctx.form.removeButton({id: 'closeremaining'})
        }
        if  (status_inte == 1) {
            if (currUser != 3 ) {
                ctx.form.removeButton({id: 'closeremaining'})
            }
        }
    }
    


    // log.debug("fiedl", field)

}