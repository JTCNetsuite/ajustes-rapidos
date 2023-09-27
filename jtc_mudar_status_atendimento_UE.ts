/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        
        const curr = ctx.newRecord

        const nf =curr.getValue("custbody_enl_fiscaldocnumber")
        const idSales = curr.getValue("createdfrom")

        if (!!nf) {
            const buscarAtendimento = search.create({
                type: search.Type.ITEM_FULFILLMENT,
                filters: [
                    ["createdfrom", search.Operator.ANYOF, idSales]
                ],
                columns: [
                    // search.createColumn({name: 'originalsyncshipstatus'})
                ]
            }).run().getRange({start:0, end: 1})

            if (buscarAtendimento.length > 0) {
                log.debug("buscarAtendimento", buscarAtendimento)
                const recAtendimento = record.load({
                    type: record.Type.ITEM_FULFILLMENT,
                    id: buscarAtendimento[0].id
                })

                const status = recAtendimento.getValue("shipstatus")
                log.debug("status", status )
                if (status != 'C') {
                    recAtendimento.setValue({fieldId:'shipstatus', value: "C"})
                    recAtendimento.save({ignoreMandatoryFields: true})
                }
            }

        }



    } catch (error) {
        log.error("jtc_mudar_status_atendimento_UE.afterSubmit", error)
    }
}