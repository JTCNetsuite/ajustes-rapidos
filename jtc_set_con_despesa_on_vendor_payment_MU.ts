/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import {lookupFields, Type} from 'N/search'


export const each: EntryPoints.MassUpdate.each = (ctx: EntryPoints.MassUpdate.eachContext) => {
    try {
        const vendorBill = record.load({
            id: ctx.id,
            type: record.Type.VENDOR_BILL
        })

        const item = vendorBill.getSublistValue({
            fieldId: 'item',
            sublistId: 'item',
            line: 0
        })

        const contDespesa = lookupFields({
            id: item,
            type: Type.SERVICE_ITEM,
            columns: [
                'expenseaccount'
            ]
        }).expenseaccount

        log.debug("conta despesa", contDespesa)


        
        // const idReturn = vendorBill.save({ignoreMandatoryFields: true})

        // log.audit("idRetturn", idReturn)


    } catch (error) {
        log.error("jtc_set_con_despeas_on_vendor_payment.each", error)
    }
}