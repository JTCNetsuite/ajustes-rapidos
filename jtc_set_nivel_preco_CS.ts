/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import {EntryPoints} from 'N/types'
import * as search from 'N/search'




export const postSourcing: EntryPoints.Client.postSourcing = (ctx:EntryPoints.Client.postSourcingContext) => {
    try {
        const curr = ctx.currentRecord
        // console.log("ctx field", ctx.fieldId)
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
            const priceText = clientData.pricelevel[0].text
            
            // ** field custcoljtc_preco_tabela

            console.log("clienteData", clientData)
            console.log("uf", ufClient)
            const sub = curr.getValue("subsidiary")

            const currentItem = curr.getCurrentSublistValue({
                fieldId: 'item',
                sublistId: 'item'
            })
            const states_12_percent = ['MG', 'SP', 'PR', 'RS', 'RJ', 'SC']

            let price = priceClient
            if (sub != subClient) {
               
                // ** PEDIDO FORA DE SÃO PAULO(SP) OU EXTREMA(MG) PARA QUALQUER OUTRO ESTADO QUE SEJA DIFERENTE DE SP/MG
                if ((sub == 7 || sub == 3) && (ufClient != 'SP' || ufClient != 'MG')) {
                    price = priceClient
                   
                }

                //** PEDIDOS DE SÃO PAULO(SP) PARA EXTREMA(MG) */
                if (sub == 3 && ufClient == "MG" ) {
                    console.log("pedidos de Sp para MG")
                    if(priceClient == 1 || priceClient == 4) {
                        price = 6
                    } 

                    if (priceClient == 2) {
                        price = 10
                    }
                    if (priceClient == 5 || priceClient == 9) {
                        price = 8
                    }
                }
                //** PEDIDOS DE EXTREMA(MG) PARA EXTREMA(MG) */
                if (sub == 7 && ufClient == "MG") {
                    if (priceClient == 6) {
                        price = 1
                    }

                    if (priceClient == 10 || priceClient == 7) {
                        price = 2
                    }

                    if (priceClient == 8) {
                        price == 5
                    }
                }
                
                //** PEDIDOS DE EXTREMA(MG) PARA SÃO PAULO */
                if (sub == 7 && ufClient == "SP") {
                    if(priceClient == 1 || priceClient == 4) {
                        price = 6
                    } 

                    if (priceClient == 2) {
                        price = 10
                    }
                    if (priceClient == 5 || priceClient == 9) {
                        price = 8
                    }
                }
                
                //** PEDIDOS DE SÃO PAULO(SP) PARA SÃO PAULO(SP) */
                if (sub == 3 && ufClient == "SP") {
                    if (priceClient == 6) {
                        price = 1
                    }

                    if (priceClient == 10 || priceClient == 7) {
                        price = 2
                    }

                    if (priceClient == 8) {
                        price == 5
                    }
                }

                if (sub == 5 && ufClient != 'PR') {
                    if(priceClient == 1 || priceClient == 4) {
                        price = 6
                    } 

                    if (priceClient == 2) {
                        price = 10
                    }
                    if (priceClient == 5 || priceClient == 9) {
                        price = 8
                    }
                }
                
                


                curr.setCurrentSublistValue({
                    fieldId: 'price',
                    sublistId: 'item',
                    value: price
                })
            }
            
            console.log("price", price)
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

export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        const curr = ctx.currentRecord
        if (ctx.fieldId == 'custcol_jtc_desc_percent' && ctx.sublistId == 'item') {
            console.log(ctx.line)
            // const desc = curr.getSublistField({fieldId: 'custcol_jtc_prec_uni_min', sublistId: 'item', line: ctx.line })
            const preco = curr.getCurrentSublistValue({fieldId: 'custcoljtc_preco_tabela', sublistId: 'item'})
            const min = curr.getCurrentSublistValue({fieldId: 'custcol_jtc_prec_uni_min', sublistId: 'item'})

            if (preco != min) {
                alert("Você pode escolher um tipo de desconto!")
                curr.setCurrentSublistValue({fieldId: 'custcol_jtc_desc_percent', sublistId: 'item', value: 0, ignoreFieldChange: true})
            }
        }
        if (ctx.fieldId == 'custcol_jtc_prec_uni_min' && ctx.sublistId == 'item') {
            const preco = curr.getCurrentSublistValue({fieldId: 'custcoljtc_preco_tabela', sublistId: 'item'})
            // const min = curr.getCurrentSublistValue({fieldId: 'custcol_jtc_prec_uni_min', sublistId: 'item'})

            const desc= Number(curr.getCurrentSublistValue({fieldId: 'custcol_jtc_desc_percent', sublistId: 'item'}))
            if (desc > 0) {
                alert("Só permitido um tipo de desconto")
                curr.setCurrentSublistValue({fieldId: 'custcol_jtc_prec_uni_min', sublistId: 'item', value: preco, ignoreFieldChange: true})
            }
        }



    } catch (error) {
        console.log(error)
    }
}