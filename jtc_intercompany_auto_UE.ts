/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */




import { EntryPoints } from "N/types"
import * as log from 'N/log'
import * as record from 'N/record'
import * as search from 'N/search'

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx: EntryPoints.UserEvent.beforeSubmitContext) => {
    try {

        const curr = ctx.newRecord
        const lancamento_intercompay = Number(curr.getValue("custbody_jtc_lanc_intercompany"))

        if (ctx.type == ctx.UserEventType.EDIT || ctx.type == ctx.UserEventType.CREATE || ctx.type == ctx.UserEventType.COPY) {


            if (!!lancamento_intercompay) {
                record.delete({
                    type: record.Type.INTER_COMPANY_JOURNAL_ENTRY,
                    id: lancamento_intercompay
                })
            }


            const contaBanco = curr.getValue("custbody_jtc_cont_banc_inter")
            const valorPage = curr.getValue("total")
            const subPayment = curr.getValue("subsidiary")
            const entity = curr.getValue("customer")


            const accountMain = curr.getValue("account")

            const data = curr.getValue("trandate")
            let subAccount

            if (!!contaBanco) {
                var accountSearchObj = search.create({
                    type: "account",
                    filters:
                    [
                        ["internalid","anyof", contaBanco]
                    ],
                    columns:
                    [
                        search.createColumn({name: "name", sort: search.Sort.ASC, label: "Name"}),
                        search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                        search.createColumn({name: "custrecord_jtc_cont_intercompany", label: "Conta Intercompany"})
                    ]
                });
                accountSearchObj.run().getRange({start: 0, end: 1}).forEach(function (projeto){
                    subAccount = projeto.getValue(projeto.columns[1])
                })

                const journalInterCompany = record.create({type: record.Type.ADV_INTER_COMPANY_JOURNAL_ENTRY, isDynamic: true})

                journalInterCompany.setValue({fieldId: 'subsidiary', value: subPayment})

                journalInterCompany.setValue({fieldId: 'trandate', value: data})


                // ***** PRIMEIRA LINHA *******
                journalInterCompany.selectNewLine({sublistId: 'line'})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'linesubsidiary', value: subPayment})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: accountMain})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: valorPage})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value: entity})
                journalInterCompany.commitLine({sublistId: 'line'})

                
                // ***** SEGUNDO LINHA *******
                journalInterCompany.selectNewLine({sublistId: 'line'})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'linesubsidiary', value: subPayment})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: 743})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: valorPage})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value: entity})
                journalInterCompany.commitLine({sublistId: 'line'})


                // ***** TERCEIRO LINHA *******
                journalInterCompany.selectNewLine({sublistId: 'line'})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'linesubsidiary', value: subAccount})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: 743})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: valorPage})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value: entity})
                journalInterCompany.commitLine({sublistId: 'line'})


                // ***** QUARTA LINHA *******
                journalInterCompany.selectNewLine({sublistId: 'line'})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'linesubsidiary', value: subAccount})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: contaBanco})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: valorPage})
                journalInterCompany.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value: entity})
                journalInterCompany.commitLine({sublistId: 'line'})
                
                const idJournal = journalInterCompany.save()

                curr.setValue({fieldId: 'custbody_jtc_lanc_intercompany', value: idJournal})



            }


        } 
        if (ctx.type == ctx.UserEventType.DELETE) {

            var transInter = Number(curr.getValue({ fieldId: 'custbody_jtc_lanc_intercompany' }))

            // ----- Apaga lançamento com valores antigos -----
            if (!!transInter){
                var transDelete = record.delete({
                    type: record.Type.JOURNAL_ENTRY,
                    id: transInter,
                })
            }  
        }




    } catch (error) {
        log.error("jtc_intercompany_auto_UE.beforeSubmit", error)
    }
}