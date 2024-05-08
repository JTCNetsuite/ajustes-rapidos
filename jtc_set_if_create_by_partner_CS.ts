/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */



import { EntryPoints } from 'N/types'
import * as runtime from 'N/runtime'

export const pageInit: EntryPoints.Client.pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    if (ctx.mode == 'create') {
        const curr = ctx.currentRecord

        const currUser = runtime.getCurrentUser().role
        if (currUser == 1454) {
            curr.setValue({fieldId: 'custentity_crete_by_partner', value: true})
        }
    }
}