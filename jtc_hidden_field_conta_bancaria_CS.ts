/**
 * @NAPIVersion 2.x
 * @NScriptType ClientScript
 */

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
// import * as UI from "N/ui/serverWidget"

export const pageInit: EntryPoints.Client.pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    try {

        const curr = ctx.currentRecord

        const subidiary = curr.getValue("subsidiary")
        console.log(subidiary)
        if (subidiary == 3 || subidiary == "3") {
            const account_custom = curr.getField({fieldId: 'custbody_jtc_cont_banc_inter'})
            console.log(account_custom)

            account_custom.isMandatory = false
            account_custom.isDisabled = true
        }

    } catch (error) {
        log.error("jtc_hidden_field_conta_bancaria_UE.beforeLoad",error)
    }
}