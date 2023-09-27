/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {
        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT) {
            const curr = ctx.newRecord
            const countLine = curr.getLineCount({sublistId: 'item'})
            
            let peso_liquido = 0
            let peso_bruto = 0
            let volume = 0
            for (var i = 0; i < countLine; i++) {
                peso_liquido += Number(curr.getSublistValue({
                    fieldId:'custcol_jtc_peso_liquido_kg',
                    sublistId: 'item',
                    line:i
                }))
                peso_bruto += Number(curr.getSublistValue({
                    fieldId:'custcol_jtc_peso_bruto_kg',
                    sublistId: 'item',
                    line:i
                }))
                volume += Number(curr.getSublistValue({
                    fieldId:'quantity',
                    sublistId: 'item',
                    line:i
                }))
            }

            curr.setValue({fieldId: 'custbody_enl_grossweight', value: peso_bruto})
            curr.setValue({fieldId: 'custbody_enl_netweight', value: peso_liquido})
            curr.setValue({fieldId: 'custbody_enl_volumesqty', value: volume})
            curr.setValue({fieldId: 'custbody_enl_volumetype', value: "Volume"})

        }


    } catch (error) {
        log.error("jtc_preencher_pesos_cr_UE.beforeSubmitr", error)
    }
}