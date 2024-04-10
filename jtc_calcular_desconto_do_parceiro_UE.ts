/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {

        const curr = ctx.newRecord
        if (ctx.type == ctx.UserEventType.CREATE) {

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
                // curr.setValue({fieldId: 'discountitem', value: -6})
                const percent = Number(String(getDiscount).split("%")[0]) / 100
                log.debug("percernt", percent)

                // const discount = vTotal * percent

                // log.debug("discount", discount)

                const line = curr.getLineCount({sublistId: 'item'})


                for (var i = 0; i < line; i++) {
                    let aumento = 0

                    const amount = Number(curr.getSublistValue({
                        fieldId: 'amount',
                        sublistId: 'item',
                        line: i
                    }))

                    let desconto = Math.floor(amount * percent)
                    log.debug("desconto", desconto)
                    curr.setSublistValue({
                        fieldId: 'custcol_enl_discamount',
                        sublistId: 'item',
                        line: i,
                        value: desconto
                    })
                }

            }

        }

        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT ) {
            const lines = curr.getLineCount({sublistId: 'item'})

            let profit_margin_total = 0

            for (var i=0; i < lines; i++) {
                const profit_margin = String(curr.getSublistValue({
                    fieldId: 'custcol_jtc_profit_margin',
                    sublistId: 'item',
                    line: i
                }))
                profit_margin_total += Number(profit_margin.split("%")[0])
            }


            curr.setValue({fieldId: 'custbody_jtc_total_profit_margin', value: profit_margin_total})

        }
        
    } catch (error) {
        log.error("jtc_calcular_desconto_do_parceiro_UE.beforeSubmit",error)
    }
}