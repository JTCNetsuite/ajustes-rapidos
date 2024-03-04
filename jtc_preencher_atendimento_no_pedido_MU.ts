/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import * as search from 'N/search'
export const each: EntryPoints.MassUpdate.each = (ctx: EntryPoints.MassUpdate.eachContext) => {
    try {

        const SearchAtentimento = search.create({
            type: search.Type.ITEM_FULFILLMENT,
            filters: [
                ['createdfrom', search.Operator.ANYOF, ctx.id],
                "AND",
                ['mainline', search.Operator.IS, "T"]
            ]
        }).run().getRange({start:0, end: 1})
        
        if (SearchAtentimento.length >0) {
            const c = record.submitFields({
                id: ctx.id,
                type: ctx.type,
                values: {
                    custbody_jtc_integr_itemfulfillment: SearchAtentimento[0].id
                }
            })
            log.audit("C", c)
    
        }
       

    } catch (error) {
        log.error("error", error)
    }
}