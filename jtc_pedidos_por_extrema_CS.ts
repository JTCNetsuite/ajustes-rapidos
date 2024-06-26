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
            
            const customer_data = lookupFields({
                id: client,
                type: Type.CUSTOMER,
                columns: [
                    'Address.custrecord_enl_uf',
                    "subsidiary","pricelevel"
                ]
            })

            const uf = customer_data['Address.custrecord_enl_uf'][0].text


            console.log(uf, 'VERIFICAR')
            if (uf != 'MG') {
                console.log("diferente de minas e são paulo")

                curr.setValue({fieldId: 'subsidiary', value: 7})
                curr.setValue({fieldId: 'custbody_enl_order_documenttype', value:  12})
            }else {
                console.log("cidade sp")
                curr.setValue({fieldId: 'subsidiary', value: 3})
            }
            curr.setValue({fieldId: 'custbody_jtc_uf_for_price', value: uf})
            curr.setValue({fieldId: 'custbody_jtc_price_cliente', value: customer_data.pricelevel[0].value})
        }   


    } catch (error) {
        console.log("jtc_pedidos_por_extrema_CS.fieldChanged", error)
    }
}