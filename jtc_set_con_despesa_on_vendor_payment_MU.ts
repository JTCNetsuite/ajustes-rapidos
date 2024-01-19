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
        const vendorBillPayment = record.load({
            id: ctx.id,
            type: record.Type.VENDOR_PAYMENT
        })
        
        const lines = vendorBillPayment.getLineCount({sublistId:'apply'})
        var idVendorBill
        for (var i = 0; i < lines; i++) {
            const apply = vendorBillPayment.getSublistValue({
                fieldId: 'apply',
                sublistId: 'apply',
                line: i
            })

            if (apply == "T" || apply == true) {
                idVendorBill = vendorBillPayment.getSublistValue({
                    fieldId: 'doc',
                    sublistId: 'apply',
                    line: i
                })
                break
            }
        }

        const account_expense: any = lookupFields({
            id: idVendorBill,
            type: Type.VENDOR_BILL,
            columns: [
                'custbody_jtc_conta_de_despesa'
            ]
        }).custbody_jtc_conta_de_despesa

        log.debug("account", account_expense)
        
        if (account_expense.length > 0) {
            const account = account_expense[0].value
            if (account == 527 || account == '527' || account == 112 || account == '112' ) {

            } else {
                vendorBillPayment.setValue({fieldId: 'custbody_jtc_conta_de_despesa', value: account})
                const idReturn =  vendorBillPayment.save({ignoreMandatoryFields: true})

                log.audit("idReturn", idReturn)

            }
        }

        

    } catch (error) {
        log.error("jtc_set_con_despeas_on_vendor_payment.each", error)
    }
}