/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as search from "N/search"


export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {

}

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {

    // const field = ctx.form.getField({id: 'closeremaining'})

    const curr = ctx.newRecord
   
    const searchAtendimento = search.create({
        type: search.Type.ITEM_FULFILLMENT,
        filters: [
            ['mainline', search.Operator.IS, "T"],
                "AND",
            ['createdfrom', search.Operator.ANYOF, curr.id]
        ]
    }).runPaged().count

    log.debug("searchAtenfimento", searchAtendimento)


    if (searchAtendimento > 0) {
        ctx.form.removeButton({id: 'closeremaining'})
    }


    // log.debug("fiedl", field)

}