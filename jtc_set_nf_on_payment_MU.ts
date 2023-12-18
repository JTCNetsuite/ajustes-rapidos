/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import { lookupFields, Type }from 'N/search'

export const each: EntryPoints.MassUpdate.each = (ctx: EntryPoints.MassUpdate.eachContext) => {
    try {
        // log.debug("ctx", ctx)
        const recPayment = record.load({
            id: ctx.id,
            type: record.Type.CUSTOMER_PAYMENT
        })

        const conta = recPayment.getValue("account")
        if (conta == 724 || conta == '724') {
            recPayment.setValue({fieldId: 'account', value: 620})
            recPayment.setValue({fieldId: 'custbody_jtc_cont_banc_inter', value: null})
        }

        const idInvoice = recPayment.getSublistValue({
            sublistId: 'apply',
            fieldId: 'doc',
            line: 0
        })
        log.debug("idInvoice", idInvoice)
        if (!!idInvoice) {
            const searchNf = lookupFields({
                id: idInvoice,
                type: Type.INVOICE,
                columns: [
                    'custbody_enl_fiscaldocnumber'
                ]
            })
    
            const nf: any = searchNf.custbody_enl_fiscaldocnumber
    
            recPayment.setValue({fieldId:'custbody_jtc_num_nf', value: nf })

            const idreturn = recPayment.save({ignoreMandatoryFields: true})
            log.audit("idreturn", idreturn)
        }

        


    } catch (error) {
        log.error("jtc_set_nf_on_payment_MU.each", error)
    }
}