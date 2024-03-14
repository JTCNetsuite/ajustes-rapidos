/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */



import { EntryPoints } from 'N/types'
import * as query from 'N/query'


export const postSourcing: EntryPoints.Client.postSourcing = (ctx: EntryPoints.Client.postSourcingContext) => {
    try {
        
        if (ctx.sublistId == 'item' && ctx.fieldId == 'item') {
            const curr = ctx.currentRecord
            const item = curr.getCurrentSublistValue({
                fieldId: 'item', 
                sublistId: 'item'
            })
            const sql = `SELECT averagecost, custitem_jtc_fat_multip FROM item WHERE id=${item}`
            const cost = query.runSuiteQL({
                query: sql
            }).asMappedResults()

            console.log(cost)
            const mult = Number(cost[0].averagecost)
            const avarage_cost = Number(cost[0].custitem_jtc_fat_multip)
            console.log

            curr.setCurrentSublistValue({
                fieldId: 'rate',
                sublistId: 'item',
                value: mult * avarage_cost
            })
        }


    } catch (error) {
        console.log("Ocorreu o seguinte erro: "+ error )
    }
}
