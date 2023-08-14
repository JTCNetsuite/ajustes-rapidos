/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import {EntryPoints} from  'N/types';
import * as search from 'N/search';
import * as log from 'N/log';
import * as record from 'N/record';

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    return search.create({
        type: 'customrecord_jtc_integ_serialnumber',
        filters: [
            ["created","within","10/08/2023 0:00","10/08/2023 23:59"]

        ],
        columns: []
    });
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    const data = JSON.parse(ctx.value);
    const idCustomRecordSerialNumber = data.id;
    log.debug("idCustomRecordSerialNumber", idCustomRecordSerialNumber);

    const customRecSerialNumber = record.load({
        type: 'customrecord_jtc_integ_serialnumber',
        id: idCustomRecordSerialNumber
    });

    const retId = customRecSerialNumber.save({ignoreMandatoryFields:true});

    log.audit('retId', retId);
    
}