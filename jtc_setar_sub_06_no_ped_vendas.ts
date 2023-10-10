/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

import { EntryPoints } from 'N/types'


export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        const customer = ctx.fieldId
        const curr = ctx.currentRecord

        if (ctx.fieldId ==  'entity') {
            curr.setValue({fieldId: 'subsidiary', value: 7})
        }

    } catch (error) {
        console.log("Erro", error)
    }
}

// export const pageInit: EntryPoints.Client.pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
//     try {
//         const field = document.createElement('style')
//         field.innerHTML = `.uir-field-wrapper { background-color: #red }`
//         document.head.appendChild(field)
//     } catch (error) {
//         console.log("ok", error)
//     }
// }