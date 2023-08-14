/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import { EntryPoints } from 'N/types'
import * as Search from 'N/search'
import {constant as cts} from './module/jtc_eds_for_all_setting'
import * as log from 'N/log';
import * as record from 'N/record'


export const getInputData:  EntryPoints.MapReduce.getInputData = () => {
    return Search.load({
        id:  cts.SEARCHS.INVOICE_PEDDING_APPROVAL
    })
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    log.debug("ctx", ctx.value);
    
    const data = JSON.parse(ctx.value)

    const recordInvoice = record.load({
        type: record.Type.INVOICE,
        id: data.id
    })

    recordInvoice.setValue({fieldId:  cts.INVOICE.STATUS, value: 2})
    
    const returnIdinvoice = recordInvoice.save({ignoreMandatoryFields: true})


    log.debug('idInvoice', returnIdinvoice)
}