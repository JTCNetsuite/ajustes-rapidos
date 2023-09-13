/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */

import {EntryPoints} from  'N/types'
import * as search from 'N/search'
import * as record from 'N/record'
import * as log from 'N/log'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    const de  = formatDate(new Date())
    const ate = formatDate(new Date())


    return search.create({
        type: 'customrecord_dk_cnab_aux_parcela',
        filters: [
            ['created', search.Operator.WITHIN, de, ate]
        ],
        columns: []
    })
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    log.debug("ctx", ctx.value)
}


const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
}

const formatDate = (date) =>  {
    return [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
  }