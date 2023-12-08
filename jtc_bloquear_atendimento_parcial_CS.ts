/**
 * @NAPIVersion 2.x
 * @NScriptType ClientScript
 */



import { EntryPoints } from 'N/types'
import * as search from "N/search"



export const saveRecord: EntryPoints.Client.saveRecord = (ctx: EntryPoints.Client.saveRecordContext) => {
    try {
        const curr = ctx.currentRecord
        const lines = curr.getLineCount({sublistId: 'item'})
        const salesOrd = curr.getValue("createdfrom")
        const permitir_atend = curr.getValue("custbody_jtc_permitir_atend_parcial")

        if (permitir_atend == "F" || permitir_atend == false) {
            let qtde_atendimento = 0

            for (var i = 0; i < lines; i++) {
                qtde_atendimento += Number(curr.getSublistValue({
                    fieldId: 'quantity',
                    sublistId: 'item',
                    line: i
                }))
            }
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                [
                   ["type","anyof","SalesOrd"], 
                   "AND", 
                   ["internalid","anyof", salesOrd], 
                   "AND", 
                   ["item","noneof","@NONE@"]
                ],
                columns:
                [
                   search.createColumn({name: "item", label: "Item"}),
                   search.createColumn({name: "quantityuom", label: "Quantity in Transaction Units"})
                ]
             })
            const totalResults = salesorderSearchObj.runPaged().count
    
            const result = salesorderSearchObj.run().getRange({start:0, end: totalResults})
    
            let qtde_pedido = 0
    
            for (var j=0; j < result.length; j++) {
                qtde_pedido += Number(result[j].getValue({name: 'quantityuom'}))
            }
    
            if (qtde_atendimento != qtde_pedido) {
                alert("A quantidade de itens é diferente do pedido de vendas. Por favor modifique o pedido!")
                return false
            } else {
                return true
            }
        } else {
            return true
        }

    } catch (error) {
        console.log(error)
    }
}