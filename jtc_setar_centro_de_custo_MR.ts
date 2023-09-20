/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from "N/record"

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        
        return search.create({
            type: search.Type.VENDOR_BILL,
            filters: [
                ["mainline", search.Operator.IS, "T"]
                // "AND",
                // ["internalid", search.Operator.ANYOF, 8666]
            ],
            columns: []
        })
    } catch (error) {
        log.error("jtc_setar_constas_receber.getInputData", error)
    }
}
export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        // log.debug("ctx", ctx.value)
        const values = JSON.parse(ctx.value)

        const recVendorBill = record.load({
            type: record.Type.VENDOR_BILL,
            id: values.id
        })


        const lines = recVendorBill.getLineCount({sublistId: 'item'})
        
        let tem_class = false
        let class_item

        for (var i =0; i < lines; i++) {
            const classItem = recVendorBill.getSublistValue({
                sublistId: 'item', 
                fieldId: 'class',
                line: i
            })

            if (!!classItem) {
                tem_class = true
                class_item = classItem
            } 
        }
        if (tem_class) {
            // log.debug("tem classe", values)

            recVendorBill.setValue({fieldId: 'class', value: class_item})

            const id_vendor_bill = recVendorBill.save({ignoreMandatoryFields: true})

            log.audit("idRecVendBIll", id_vendor_bill)


        }


    } catch (error) {
        log.error("jtc_setar_constas_receber.map", error)
    }
}