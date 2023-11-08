/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {

        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT) {
            const curr = ctx.newRecord
            const vTotal = Number(curr.getValue('total'))

            const customer = curr.getValue("entity")

            const getDiscount = search.lookupFields({
                type: search.Type.CUSTOMER,
                id:customer,
                columns: [
                    "custentity_jtc_disccount"
                ]
            }).custentity_jtc_disccount

            if (!!getDiscount) {
                curr.setValue({fieldId: 'discountitem', value: -6})
                const percent = Number(String(getDiscount).split("%")[0]) / 100
                log.debug("percernt", percent)

                const discount = vTotal * percent

                log.debug("discount", discount)

                curr.setValue({fieldId: 'discountrate', value: -discount.toFixed(2)})



            }

        }
        
    } catch (error) {
        log.error("jtc_calcular_desconto_do_parceiro_UE.beforeSubmit",error)
    }
}