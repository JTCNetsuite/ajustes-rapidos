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
        const recVwndPayment = record.load({
            id: ctx.id,
            type: record.Type.VENDOR_PAYMENT
        })

        const refNum = recVwndPayment.getSublistValue({
            fieldId: 'refnum',
            sublistId: 'apply',
            line: 0
        })

        recVwndPayment.setValue({fieldId: 'custbody_jtc_num_referencia', value: refNum})
        
        const idReturn = recVwndPayment.save({ignoreMandatoryFields: true})

        log.audit("idRetturn", idReturn)


    } catch (error) {
        log.error("jtc_set_con_despeas_on_vendor_payment.each", error)
    }
}