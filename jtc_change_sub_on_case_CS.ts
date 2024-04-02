/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */


import { EntryPoints } from 'N/types'
import {lookupFields, Type} from 'N/search'

export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) =>{
    try {
        
        if (ctx.fieldId == 'custevent_jtc_relationship_saleord_to') {
            const saleOrd = ctx.currentRecord.getValue("custevent_jtc_relationship_saleord_to")
            
            const sub = lookupFields({
                id: saleOrd,
                type: Type.SALES_ORDER,
                columns: ["subsidiary"]
            }).subsidiary


            ctx.currentRecord.setValue({fieldId: 'subsidiary', value: sub[0].value})
        }

    } catch (error) {
        console.log("erro ")
    }
}