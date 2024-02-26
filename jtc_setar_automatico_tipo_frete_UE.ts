/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */



import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import {FormPageLinkType} from 'N/ui/serverWidget'
import * as search from 'N/search'
import * as url from 'N/url'

export const beforeLoad: EntryPoints.UserEvent.beforeLoad = (ctx: EntryPoints.UserEvent.beforeLoadContext) => {
    try {
        
        if  (ctx.type == ctx.UserEventType.CREATE )  {
            const curr = ctx.newRecord

            curr.setValue({fieldId: 'custbody_enl_freighttype', value: 2})

        }

        if (ctx.type ==  ctx.UserEventType.VIEW) {
                    const date = String(ctx.newRecord.getValue("trandate"))
            
                    const forDate = formatarData(date)
                    const client = ctx.newRecord.getValue("entity")
            
            
                    const searchLastSaleOrd = search.create({
                        type: search.Type.SALES_ORDER,
                        filters: [
                            ['name', search.Operator.ANYOF, client],
                            "AND",
                            ['mainline', search.Operator.IS, "T"],
                            "AND",
                            ['trandate', search.Operator.BEFORE, forDate]
                        ],
                        columns: [
                            search.createColumn({name: 'trandate', sort: search.Sort.DESC}),
                            search.createColumn({name: 'tranid'})
                        ]
                    }).run().getRange({start: 0, end: 1})
            
                    log.debug("searchLasSaledOd", searchLastSaleOrd)
            
                    if (searchLastSaleOrd.length > 0) {
            
                        const link = url.resolveRecord({
                            recordId: searchLastSaleOrd[0].id,
                            recordType: 'salesorder'
                        })
                        ctx.form.addPageLink({
                            type : FormPageLinkType.CROSSLINK,
                            title : 'Último Pedido',
                            url : `https://7414781.app.netsuite.com${link}`
                        })
                    }
            
            }
        
    } catch (error) {
        log.error("jtc_setar_automatico_tipo_frete.beforeLoad", error)
    }
}

const formatarData = (dataStr: string) => {
    // Criar um objeto Date a partir da string de data
    const dataObj = new Date(dataStr)
  
    // Obter os componentes da data (dia, mês, ano)
    const dia = ('0' + dataObj.getDate()).slice(-2)
    const mes = ('0' + (dataObj.getMonth() + 1)).slice(-2) // Mês é baseado em zero
    const ano = dataObj.getFullYear()
  
    // Formatar a data no estilo desejado (DD/MM/AAAA)
    const dataFormatada = `${dia}/${mes}/${ano}`
  
    return dataFormatada

}