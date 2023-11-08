/**
 *@NApiVersion 2.x
 *@NScriptType MassUpdateScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'

export const each: EntryPoints.MassUpdate.each = (ctx: EntryPoints.MassUpdate.eachContext) => {
    try {
        const recPayment = record.load({
            id:  ctx.id,
            type: record.Type.CUSTOMER_PAYMENT
        })
        const journel_entry = recPayment.getValue("custbody_jtc_lanc_intercompany")
        const entity = recPayment.getValue("customer")

        const  journalInter = record.load({ type: record.Type.JOURNAL_ENTRY, id: journel_entry, isDynamic: true })

           // ********* Criação da linha 0 *********
           journalInter.selectLine({sublistId: 'line', line: 0});
           journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:entity}); 
           journalInter.commitLine({sublistId: 'line'}); 

           // ********* Criação da linha 1 *********
           journalInter.selectLine({sublistId: 'line', line: 1});
           journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:entity}); // Memo
           journalInter.commitLine({sublistId: 'line'});

         const idReturn = journalInter.save()

         log.debug("idReturn", idReturn)
    } catch (error) {
        log.error("jtc_set-entity_on_journal_entry_MU.each", error)
    }
}