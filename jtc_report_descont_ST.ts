/**
 * @NAPIVersion 2.x
 * @NScriptType Suitelet
 */


import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as search from 'N/search'
import * as UI from 'N/ui/serverWidget'

export const onRequest: EntryPoints.Suitelet.onRequest = (ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {
        
        const form = UI.createForm({title: 'JTC - Relatório de Desconto'})

        if (ctx.request.method == 'GET') {
            
        } else {

        }

        
    } catch (error) {
        log.debug("jtc_report_descont_ST.onRequest", error)
    }
}



export const formGet = (ctx: EntryPoints.Suitelet.onRequestContext, form: UI.Form) => {
    try {
        
        const cliente = form.addField({
            id: 'custpage_cliente',
            label: 'Cliente',
            type: UI.FieldType.TEXT
        })

    } catch (error) {
        log.error("jtc_report_descont_ST.formGet", error)
    }
}

export const formPost = (ctx: EntryPoints.Suitelet.onRequestContext) => {
    try {

        
    } catch (error) {
        log.error("jtc_report_descont_ST.formPost", error)
    }
}