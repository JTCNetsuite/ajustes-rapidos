/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */


import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as record from "N/record"

export const each: EntryPoints.MassUpdate.each = (ctx: EntryPoints.MassUpdate.eachContext) => {
    try {
        const invoice = record.load({
            id: ctx.id,
            type: ctx.type
        })
        const nf = invoice.getValue("custbody_enl_fiscaldocnumber")
        const idSale: any = invoice.getValue("createdfrom")

        const sale = record.submitFields({
            id: idSale, 
            type: record.Type.SALES_ORDER,
            values: {
                'custbody_enl_fiscaldocnumber': nf
            }
        })

        log.debug("saleId", sale)


    } catch (error) {
        log.error("jtc_set_nf_on_saleOrd_MU.each", error)
    }
}