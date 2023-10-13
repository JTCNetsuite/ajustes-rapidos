/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import { EntryPoints } from 'N/types'
import * as search from 'N/search'



export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        const curr= ctx.currentRecord

        if (ctx.fieldId == "item") {
            const line = ctx.line
            console.log("line", line)

            const location = curr.getValue("location") 

            const getItem = curr.getCurrentSublistValue({
                fieldId: 'item',
                sublistId: ctx.sublistId
            })

            console.log("filed", getItem)

            const inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                [
                   ["type","anyof","InvtPart"], 
                   "AND", 
                   ["internalid","anyof", getItem], 
                   "AND", 
                   ["inventorylocation","anyof",location]
                ],
                columns:
                [
                   search.createColumn({name: "locationquantityavailable", label: "Location Available"})
                ]
             }).run().getRange({start: 0, end:1})
             const disponivel = inventoryitemSearchObj[0].getValue("locationquantityavailable")

             console.log("inventory", disponivel)
            
            curr.setCurrentSublistValue({
                sublistId: ctx.sublistId,
                fieldId: 'custcol_jtc_qtat_able',
                value: disponivel
            })


        }



    } catch (error) {
        console.log("Erro", error)
    }
}