/**
 * @NAPIVersion 2.x
 * @NScriptType ClientScript
 */



import { EntryPoints } from 'N/types'



export const pageInit: EntryPoints.Client.pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    const curr = ctx.currentRecord
    
    const lienCount = curr.getLineCount('item')



    for (var i=0; i < lienCount; i++) {
        const getInventory = curr.getSublistValue({
            sublistId: 'item',
            fieldId: 'inventorydetail',
            line: i
        })

        console.log(getInventory)
    }

}


