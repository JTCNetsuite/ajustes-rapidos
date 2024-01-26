/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as runtime from 'N/runtime'

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        const curreUser =runtime.getCurrentUser().role


        if (curreUser != 1226 && curreUser != 3) {
            ctx.form.removeButton({
                id: "approve"
            })
            ctx.form.removeButton({
                id: "reject"
            })
        }



    } catch (error) {
        log.error("jtc_bloquear_aprovacao_contagem_estoque_UE.beforeLoad", error)
    }
}