/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import {EntryPoints} from 'N/types'
import * as search from 'N/search'




export const postSourcing: EntryPoints.Client.postSourcing = (ctx:EntryPoints.Client.postSourcingContext) => {
    try {
        const curr = ctx.currentRecord
        console.log("ctx field", ctx.fieldId)
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
            
            // ** field custcoljtc_preco_tabela

            console.log("clienteData", clientData)
            console.log("uf", ufClient)
            const sub = curr.getValue("subsidiary")

            const currentItem = curr.getCurrentSublistValue({
                fieldId: 'item',
                sublistId: 'item'
            })

            let price = priceClient
            if (sub != subClient) {
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
                if (sub == 7 && ufClient != 'SP') {
                    console.log("dif")
                    curr.setCurrentSublistValue({
                        fieldId: 'price',
                        sublistId: 'item',
                        value: priceClient
                    })

                   
                }
                
            }
            var inventoryitemSearchObj = search.create({
                type: "inventoryitem",
                filters:
                [
                    ["type","anyof","InvtPart"], 
                    "AND", 
                    ["pricing.pricelevel","anyof", price], 
                    "AND", 
                    ["internalid","anyof",currentItem]
                ],
                columns:
                [
                   search.createColumn({
                      name: "unitprice",
                      join: "pricing",
                      label: "Preço unitário"
                   }),
                   search.createColumn({
                      name: "pricelevel",
                      join: "pricing",
                      label: "Nível de preço"
                   })
                ]
            }).run().getRange({start: 0, end: 1})
            console.log(inventoryitemSearchObj[0].getValue({name: 'unitprice', join:'pricing' }))
            curr.setCurrentSublistValue({
                fieldId: 'custcoljtc_preco_tabela',
                sublistId: 'item',
                value: inventoryitemSearchObj[0].getValue({name: 'unitprice', join:'pricing' })
            })
        }

    } catch (error) {
        console.log("jtc_set_nivel_preco_CS",error)
    }
}