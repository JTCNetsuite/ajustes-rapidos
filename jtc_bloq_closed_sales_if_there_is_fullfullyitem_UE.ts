/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as search from "N/search"
import * as runtime from 'N/runtime'
import {FieldDisplayType, FieldType} from 'N/ui/serverWidget'


export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {


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

        const searchInvouice = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', search.Operator.IS, "T"],
                    "AND",
                ['createdfrom', search.Operator.ANYOF, curr.id]
            ]
        }).runPaged().count
    
        log.debug("searchAtenfimento", searchAtendimento)
        log.debug("searchInvouice", searchInvouice)
    
        const status_inte = curr.getValue("custbody_jtc_integration_status")
          
        const currUser = runtime.getCurrentUser().role
        
        if (searchAtendimento > 0 || searchInvouice > 0) {
            if (currUser != 3) {
                ctx.form.removeButton({id: 'closeremaining'})
            }
        }
        
    }
    
    if ( ctx.type == ctx.UserEventType.EDIT ) {
        const currUser = runtime.getCurrentUser().role
        const form = ctx.form

        const field = form.getField({
            id:'custbody_jtc_tip_exp'
        })
        if (currUser != 3) {
            field.updateDisplayType({displayType: FieldDisplayType.DISABLED})

        }


    }
    


    // log.debug("fiedl", field)

}   