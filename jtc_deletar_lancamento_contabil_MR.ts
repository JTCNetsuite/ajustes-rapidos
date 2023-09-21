/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        
        return search.load({
            id: 'customsearch_jtc_lancamento_interncompay'
        })

    } catch (error) {
        log.error("jtc_deletar_lanacamento_contabil_MR.getInputData", error)
    }
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    try {
        const values = JSON.parse(ctx.value)
        
        log.debug("values", values.values)
        const id_lancamento = values.values.custbody_jtc_lanc_intercompany.value
        log.debug("id Lancamento", id_lancamento)

        const res = record.delete({id: id_lancamento, type: record.Type.JOURNAL_ENTRY})
        log.audit("res",res)


    } catch (error) {
        log.error("jtc_deletar_lancamento_contabil_MR.map", error)
    }
}