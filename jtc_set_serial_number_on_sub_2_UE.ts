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
                    recSalesOrd.selectLine({
                        sublistId: sublist,
                        line: i
                    })
    
                    const item = String(recSalesOrd.getCurrentSublistText({
                        fieldId: CTS.SALES_ORDER.SUBLIST_ITEM.FIELDS.ITEM,
                        sublistId: sublist 
                    })).split(" ")

                    log.debug("item", item)

                    const qtde = recSalesOrd.getCurrentSublistValue({
                        fieldId: CTS.SALES_ORDER.SUBLIST_ITEM.FIELDS.QTDE,
                        sublistId: sublist 
                    })

                    const searchLoteNum = search.create({
                        type: search.Type.INVENTORY_NUMBER,
                        filters: [
                            ['item.name', search.Operator.HASKEYWORDS, item[0]],
                            "AND",
                            [CTS.INVENTORY_NUMBER.LOCATION, search.Operator.ANYOF, 2]
                        ],
                        columns: [
                            search.createColumn({name: CTS.INVENTORY_NUMBER.NUMBER_SERIAL})
                        ]
                    }).run().getRange({start:0, end:1})
                    
                    log.debug("searchLoteNum", searchLoteNum)
                    
                    const inventorydetail = recSalesOrd.getCurrentSublistSubrecord({
                        sublistId: sublist,
                        fieldId: CTS.INVENTORY_DETAIL.ID
                    })

                    inventorydetail.selectNewLine({
                        sublistId: CTS.INVENTORY_DETAIL.ID_SUB
                    })

                    inventorydetail.setCurrentSublistValue({
                        sublistId: CTS.INVENTORY_DETAIL.ID_SUB,
                        fieldId: CTS.INVENTORY_DETAIL.SERIAL_LOTE,
                        value: searchLoteNum[0].id
                    })

                    inventorydetail.setCurrentSublistValue({
                        sublistId: CTS.INVENTORY_DETAIL.ID_SUB,
                        fieldId: CTS.INVENTORY_DETAIL.QUANTITY,
                        value: qtde
                    })
                    inventorydetail.commitLine({sublistId: CTS.INVENTORY_DETAIL.ID_SUB})


                    recSalesOrd.commitLine({sublistId: sublist})
                }

                const idSale = recSalesOrd.save({ignoreMandatoryFields: true})
                log.audit("idSales", idSale)
    
            }

        }


    } catch (error) {
        log.error("jtc_set_serial_number_on_sub_2_UE.afterSubmit", error)
    }
}