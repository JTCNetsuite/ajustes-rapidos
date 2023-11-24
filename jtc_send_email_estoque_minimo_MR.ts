/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import {EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'
import * as email from 'N/email'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {

    
	try {
        return search.create({
            type: search.Type.LOT_NUMBERED_INVENTORY_ITEM,
            filters: ["internalid",  search.Operator.ANYOF, 7]
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

        itemRecord.save({ignoreMandatoryFields: true})



    } catch (error) {
        log.error("jtc_send_email_estoque_minimo_MR.map", error)
    }
}