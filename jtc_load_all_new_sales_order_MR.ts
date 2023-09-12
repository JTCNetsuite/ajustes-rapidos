/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */



import {EntryPoints} from  'N/types';
import * as search from 'N/search';
import * as log from 'N/log';
import * as record from 'N/record';


export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        // return search.load({
        //     id: 'customsearch_jtc_pedidos_por_importacao'
        // })

    } catch (error) {
        log.error("load_all_new_sales_order.getInputData", error)
        throw error
    }
}

// export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
//     try {
//         log.debug("ctx", ctx.value)
//         const value = JSON.parse(ctx.value)
//         const id = value.id
        
//         const sale = record.load({
//             id: id,
//             type: record.Type.SALES_ORDER
//         })
//         const idSalex = sale.save({ignoreMandatoryFields: true})
//         log.audit("idSales", idSalex)

//     } catch (error) {
//         log.error("load_all_new_sales_order.map", error)
//     }
// }
