/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import {EntryPoints} from 'N/types'
import * as search from 'N/search'




export const postSourcing: EntryPoints.Client.postSourcing = (ctx:EntryPoints.Client.postSourcingContext) => {
    try {
        const curr = ctx.currentRecord
        if (ctx.fieldId == 'item' && ctx.sublistId == 'item') {
            const clientID = curr.getValue("entity")
            
            const clientData = search.lookupFields({
                id: clientID,
                type: search.Type.CUSTOMER,
                columns: [
                    "subsidiary","pricelevel",
                    "Address.custrecord_enl_uf"
                ]
            })

            const subClient = clientData.subsidiary[0].value
            const priceClient = clientData.pricelevel[0].value
            const ufClient = clientData['Address.custrecord_enl_uf'][0].text

            console.log("clienteData", clientData)
            console.log("uf", ufClient)
            const sub = curr.getValue("subsidiary")
            // console.log(sub)

            if (sub != subClient) {
                let price
                if (sub == 7 && ufClient == 'SP') {
                    console.log("ok")
                    if (priceClient == 1 || priceClient == 3) {
                        price = 6
                    } 
                    if (priceClient == 2) {
                        price = 7
                    }
                    if (priceClient == 9) {
                        price = 8
                    }

                    
                    curr.setCurrentSublistValue({
                        fieldId: 'price',
                        sublistId: 'item',
                        value: price
                    })
                    
                }
                
               
            }
        }

    } catch (error) {
        console.log("jtc_set_nivel_preco_CS",error)
    }
}