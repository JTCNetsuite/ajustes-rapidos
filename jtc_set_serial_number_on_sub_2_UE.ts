/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from "N/types"
import * as log from "N/log"
import * as record from "N/record"
import { constant as CTS} from "./module/jtc_eds_for_all_setting"
import * as search from 'N/search'


export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT) {

            const currId = ctx.newRecord.id
            const currentSub = ctx.newRecord.getValue(CTS.SALES_ORDER.SUBSIDIARY)

            if (currentSub == 3) {
                const recSalesOrd = record.load({
                    type: record.Type.SALES_ORDER,
                    id: currId,
                    isDynamic: true
                })
    
                const sublist = CTS.SALES_ORDER.SUBLIST_ITEM.ID
                const lineCountItem = recSalesOrd.getLineCount({sublistId: sublist})
    
                for (var i = 0; i < lineCountItem; i++) {
                    try {
                        recSalesOrd.selectLine({
                            sublistId: sublist,
                            line: i
                        })
        
                        const item = String(recSalesOrd.getCurrentSublistValue({
                            fieldId: CTS.SALES_ORDER.SUBLIST_ITEM.FIELDS.ITEM,
                            sublistId: sublist 
                        }))
    
                        log.debug("item", item)
    
                        const qtde = Number(recSalesOrd.getCurrentSublistValue({
                            fieldId: CTS.SALES_ORDER.SUBLIST_ITEM.FIELDS.QTDE,
                            sublistId: sublist 
                        }))
    
                        const searchLoteNum = search.create({
                            type: "inventorynumberitem",
                            filters: [
                                ['inventorynumber.item', search.Operator.ANYOF, item],
                                "AND",
                                [CTS.INVENTORY_NUMBER.LOCATION, search.Operator.ANYOF, 2],
                                "AND",
                                ["quantityavailable", search.Operator.GREATERTHAN, 0],
                                "AND",
                                [CTS.INVENTORY_NUMBER.NUMBER_SERIAL, search.Operator.ISNOT, "JR"],
                                "AND", 
                                ["expirationdate","after","01/10/2023"]
                            ],
                            columns: [
                                search.createColumn({name: CTS.INVENTORY_NUMBER.NUMBER_SERIAL}),
                                search.createColumn({name: "quantityonhand", label: "Em estoque"}),
                                search.createColumn({name: "quantityavailable", label: "Disponível"}),
                                search.createColumn({
                                    name: "expirationdate",
                                    sort: search.Sort.ASC,
                                    label: "Data de validade"
                                 })
                            ]
                        }).run().getRange({start:0, end:10})
                        
                        log.debug("searchLoteNum", searchLoteNum)
                        
                        const lotes = []

                        let sum = 0
                        for (var k=0; k < searchLoteNum.length; k++) {
                            if (sum <= qtde) {
                                lotes.push({
                                    id: searchLoteNum[k].id,
                                    num: searchLoteNum[k].getValue({name: CTS.INVENTORY_NUMBER.NUMBER_SERIAL}),
                                    quantidade: searchLoteNum[k].getValue({name: 'quantityavailable'})
                                })

                                sum += Number(searchLoteNum[k].getValue({name: 'quantityavailable'}))
                            
                            }
                        }
                        log.debug("lotes", lotes)

                        const inventorydetail = recSalesOrd.getCurrentSublistSubrecord({
                            sublistId: sublist,
                            fieldId: CTS.INVENTORY_DETAIL.ID
                        })
                        // for (var line = 0; line < lotes.length; line ++) {
                        //     log.debug("lores", lotes[line].values)

                        // }
                        let restante = qtde
                        for (var lote = 0; lote < lotes.length; lote++) {
                            const value = lotes[lote]
                            log.debug("value id", value.id)
                            log.debug('restante', restante)
                            inventorydetail.selectNewLine({
                                sublistId: CTS.INVENTORY_DETAIL.ID_SUB
                            })
        
                            inventorydetail.setCurrentSublistValue({
                                sublistId: CTS.INVENTORY_DETAIL.ID_SUB,
                                fieldId: CTS.INVENTORY_DETAIL.SERIAL_LOTE,
                                value: value.id
                            })
        
                           
                            if (value.quantidade < qtde) {
                                log.debug("menor", value.quantidade)
                                restante -= value.quantidade
                                
                                inventorydetail.setCurrentSublistValue({
                                    sublistId: CTS.INVENTORY_DETAIL.ID_SUB,
                                    fieldId: CTS.INVENTORY_DETAIL.QUANTITY,
                                    value: value.quantidade
                                })

                            } else{
                                value.quantidade = restante

                                inventorydetail.setCurrentSublistValue({
                                    sublistId: CTS.INVENTORY_DETAIL.ID_SUB,
                                    fieldId: CTS.INVENTORY_DETAIL.QUANTITY,
                                    value: value.quantidade
                                })


                            }
                            log.debug("quanteide", value.quantidade)
                            inventorydetail.commitLine({sublistId: CTS.INVENTORY_DETAIL.ID_SUB})

                        }
                       
    
    
                        recSalesOrd.commitLine({sublistId: sublist})
                           
                    } catch (e2) {
                        log.error("erro Dentro for", e2)
                        
                    }
                }

                const idSale = recSalesOrd.save({ignoreMandatoryFields: true})
                log.audit("idSales", idSale)
    
            }

        }


    } catch (error) {
        log.error("jtc_set_serial_number_on_sub_2_UE.afterSubmit", error)
    }
}