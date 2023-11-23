/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import {EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'
import * as file from 'N/file'


export const getInputData: EntryPoints.MapReduce.getInputData = () => {

    
	try {
        return search.create({
            type: search.Type.LOT_NUMBERED_INVENTORY_ITEM
        })
    } catch (error) {
        log.error("jtc_send_email_estoque_minimo_MR.getInputData",error)
    }
}


export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) =>  {
    try {

        log.debug("ctx", ctx.value)
        const values = JSON.parse(ctx.value)
        const itemRecord = record.load({
            id: values.id,
            type: record.Type.LOT_NUMBERED_INVENTORY_ITEM
        })

        const getLine = itemRecord.getLineCount({sublistId: 'locations'})

        for (var i =0; i < getLine; i++) {
            const location = itemRecord.getSublistValue({
                fieldId: 'location',
                sublistId: 'locations',
                line: i
            })

            if (location == 2 || location == 6) {
                
            }

        }



    } catch (error) {
        log.error("jtc_send_email_estoque_minimo_MR.map", error)
    }
}