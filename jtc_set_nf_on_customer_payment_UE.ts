/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import {lookupFields, Type} from 'N/search'

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try { 
        const curr = ctx.newRecord

        const lines = curr.getLineCount({sublistId: 'apply'})
        let invoice

        if (lines > 0) {
            for (var i =0; i < lines; i++) {
                const apply = curr.getSublistValue({
                    fieldId: 'apply', 
                    sublistId :'apply',
                    line: i
                })

                if (apply == 'T' || apply == true) {
                    invoice = curr.getSublistValue({
                        fieldId: 'doc',
                        sublistId: 'apply',
                        line: i
                    })
                }
            }

            const nf = lookupFields({
                id: invoice,
                type: Type.INVOICE,
                columns: [
                    'custbody_enl_fiscaldocnumber'
                ]
            }).custbody_enl_fiscaldocnumber

            


        }



    } catch (error) {
        log.error("jtc_set_nf_on_customer_payment_UE.beforeSubmit", error)
    }
}