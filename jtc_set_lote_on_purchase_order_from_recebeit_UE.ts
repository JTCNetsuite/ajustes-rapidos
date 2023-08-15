/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */

import { EntryPoints } from "N/types"
import { constant  as CTS} from "./module/jtc_eds_for_all_setting"
import * as log from 'N/log'
import * as record from 'N/record'


export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        log.debug('type', ctx.type)
        if (ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.EDIT) {
            const curr = record.load({
                type: record.Type.ITEM_RECEIPT,
                id: ctx.newRecord.id,
                isDynamic: true
            })
            
            const idPurchaseOrder = curr.getValue(CTS.ITEM_RECEIPT.CREATRED_FROM)
            log.debug("idPurchaseOrder", idPurchaseOrder)
            

            const recordPurchaseOrder = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: idPurchaseOrder,
                isDynamic: true
            })
    
            const subsidiary = Number(recordPurchaseOrder.getValue(CTS.PURCHASE_ORDER.SUBSIDIARY))
    
            if (subsidiary == 3) {
                const lineItemsFromReceit = curr.getLineCount(CTS.ITEM_RECEIPT.SUBLIST_ITEM.ID)
                log.debug('line', lineItemsFromReceit)

                for (var i= 0; i < lineItemsFromReceit; i++) {
                    
                    curr.selectLine({
                        sublistId: CTS.ITEM_RECEIPT.SUBLIST_ITEM.ID,
                        line: i
                    })

                    const inventoryDetail = curr.getCurrentSublistSubrecord({
                        sublistId: CTS.ITEM_RECEIPT.SUBLIST_ITEM.ID,
                        fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.ID
                    })
                    const arrNumLote = []

                    const lineInventoryItem = inventoryDetail.getLineCount(CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID)
                    log.debug("lineInvtorydetai", lineInventoryItem)
                    for (var j=0; j < lineInventoryItem; j++) {
                        inventoryDetail.selectLine({sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID, line: j})
                    
                        const serialnumber = inventoryDetail.getCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.NUM_SERIAL,
                            sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID
                        })
                        const quantity = inventoryDetail.getCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.QUATITY,
                            sublistId:  CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID
                        })

                        const expiration_date = inventoryDetail.getCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.EXPIRATION_DATE,
                            sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID
                        })


                        arrNumLote.push(serialnumber)
                        arrNumLote.push(quantity)
                        arrNumLote.push(expiration_date)

                        inventoryDetail.commitLine({sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID})

                    }
                    
                    log.debug('árrayLote', arrNumLote)

                    recordPurchaseOrder.selectLine({
                        sublistId: CTS.PURCHASE_ORDER.SUBLIST_ITEM.ID,
                        line: i
                    })

                    const inventoryDetailFromPurchaseOrder = recordPurchaseOrder.getCurrentSublistSubrecord({
                        sublistId: CTS.PURCHASE_ORDER.SUBLIST_ITEM.ID,
                        fieldId: CTS.PURCHASE_ORDER.SUBRECORD_INVENTORY_DETAIL.ID
                    })
                    log.debug('invetoruDetailPurchase', inventoryDetailFromPurchaseOrder)

                    for (var lote=0 ; lote < arrNumLote.length; lote += 3) {
                        inventoryDetailFromPurchaseOrder.selectNewLine({sublistId: CTS.PURCHASE_ORDER.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID})

                        inventoryDetailFromPurchaseOrder.setCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.NUM_SERIAL,
                            sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID,
                            value: arrNumLote[lote]
                        })
                        inventoryDetailFromPurchaseOrder.setCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.QUATITY,
                            sublistId:  CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID,
                            value: arrNumLote[lote + 1]
                        })

                        inventoryDetailFromPurchaseOrder.setCurrentSublistValue({
                            fieldId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.EXPIRATION_DATE,
                            sublistId: CTS.ITEM_RECEIPT.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID,
                            value: arrNumLote[lote + 2]
                        })
                        inventoryDetailFromPurchaseOrder.commitLine({sublistId: CTS.PURCHASE_ORDER.SUBRECORD_INVENTORY_DETAIL.SUBLIST_INVENTORY_DETAIL.ID})

                    }

                    recordPurchaseOrder.commitLine({sublistId: CTS.PURCHASE_ORDER.SUBLIST_ITEM.ID})

                    curr.commitLine({sublistId: CTS.ITEM_RECEIPT.SUBLIST_ITEM.ID})

                }

                const returnIdPurchase = recordPurchaseOrder.save({ignoreMandatoryFields: true})
                log.audit('idPurchaseOrder', returnIdPurchase)

            }
    
    
        }
    } catch (error) {
        log.error('jtc_set_lote_on_purchase_order.afterSubmit', error)
    }
}


