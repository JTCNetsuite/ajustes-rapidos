/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */



import { EntryPoints } from 'N/types'
import {lookupFields, Type} from "N/search"

export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        
        const curr = ctx.currentRecord

        if (ctx.fieldId == 'entity') {
            const client = curr.getValue("entity")
            
            const uf = lookupFields({
                id: client,
                type: Type.CUSTOMER,
                columns: [
                    'Address.custrecord_enl_uf'
                ]
            })['Address.custrecord_enl_uf']

            if (uf != 'SP' && uf != 'MG') {
                console.log("diferente de minas e são paulo")

                curr.setValue({fieldId: 'subsidiary', value: 7})
            }
        }   


    } catch (error) {
        console.log("jtc_pedidos_por_extrema_CS.fieldChanged", error)
    }
}