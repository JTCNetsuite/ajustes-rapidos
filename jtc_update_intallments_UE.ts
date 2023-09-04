/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import { constant as CTS} from './module/jtc_eds_for_all_setting'
import * as record from 'N/record'

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {
        
        const curr = ctx.newRecord

        const lineCount = curr.getLineCount(CTS.INVOICE.SUBLIST_INSTALLMENT.ID)
        log.debug("lineCount", lineCount)

        const sub_instal = CTS.INVOICE.SUBLIST_INSTALLMENT.ID

        for (var i=0; i < lineCount; i++) {
            const idSub = curr.getSublistValue({
                sublistId: sub_instal,
                fieldId: CTS.INVOICE.SUBLIST_INSTALLMENT.ID_INSTALLMENT,
                line: i
            })
            log.debug("idSUb", idSub)

            const recInstalment = record.load({
                id: idSub,
                type: 'installment'
            })
            

            log.debug("recInstaalment", recInstalment)

        }


    } catch (e) {
        log.error("jtc_update_installments_UE.beforeeSubmit",e)
    }
}