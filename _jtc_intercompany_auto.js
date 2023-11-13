/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 *
 * Author: Henrique Dissordi 
 *    Date: 22/03/2023
 *    Version: 1.0 - Initial version
 * 
 */

define(['N/record', 'N/log', 'N/search', 'N/format'], 

function (record, log, search, format) {

    function beforeSubmit(context) {
      
        const currentRecord = context.newRecord
        const cRec_id = currentRecord.id;
        const cRec_type = currentRecord.type;

        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE || context.type == context.UserEventType.COPY) {
            
            var transInter = currentRecord.getValue({ fieldId: 'custbody_jtc_lanc_intercompany' })

            // ----- Apaga lançamento com valores antigos -----
            if (!!transInter){
                var transDelete = record.delete({
                    type: record.Type.JOURNAL_ENTRY,
                    id: transInter,
                })
            }

            // ----- Dados do pagamento -----
            const contaBanco = currentRecord.getValue({ fieldId: 'custbody_jtc_cont_banc_inter' })
            var memoPagamento = currentRecord.getValue({ fieldId: 'memo' })
            var valorPago = currentRecord.getValue({ fieldId: 'total' })
            var subID = ''
            var contaIntercompany = ''

            // ----- Datas -----
            var dataCont = currentRecord.getValue({ fieldId: 'trandate' })
            var parseDate = format.parse({value: dataCont, type: format.Type.DATE,})

            // ----- Busca os dados da conta bancaria para criar o lançamento -----
            if (!!contaBanco){

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

                    subID = projeto.getValue(projeto.columns[1])
                    contaIntercompany = projeto.getValue(projeto.columns[2])
                });

                // ----- Criação do lançamento intercompany -----
                var journalInter = record.create({ type: record.Type.JOURNAL_ENTRY, isDynamic: true })

                    // ********* Campos do cabeçalho *********
                    journalInter.setValue({ fieldId: 'trandate', value: parseDate}) // Data da Transação
                    journalInter.setValue({ fieldId: 'memo', value: memoPagamento}) // Memo
                    journalInter.setValue({ fieldId: 'subsidiary', value: subID}) // Subsidiária

                    if (cRec_type == record.Type.CUSTOMER_PAYMENT){
                        const entity = currentRecord.getValue("customer")

                        // ********* Criação da linha 0 *********
                        journalInter.selectNewLine({sublistId: 'line'});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: contaBanco}); // Conta Contabil
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: valorPago});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'memo', value:memoPagamento}); // Memo
                        try {
                            
                            journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:entity}); 
                        } catch (err) {
                            log.debug("set Entity", err)
                        }
                        journalInter.commitLine({sublistId: 'line'}); 

                        // ********* Criação da linha 1 *********
                        journalInter.selectNewLine({sublistId: 'line'});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: contaIntercompany}); // Conta Contabil
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: valorPago});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'memo', value:memoPagamento}); // Memo
                        try {
                            journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:entity}); 
                        } catch (err) {
                            log.debug("set Entity", err)
                        }
                        journalInter.commitLine({sublistId: 'line'});
                    } else {
                        const payer = currentRecord.getValue("entity")
                        // ********* Criação da linha 0 *********
                        journalInter.selectNewLine({sublistId: 'line'});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: contaIntercompany }); // Conta Contabil
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: valorPago});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'memo', value:memoPagamento}); // Memo
                        try {
                            
                            journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:payer}); 
                        } catch (err) {
                            log.debug("set Entity", err)
                        }
                        journalInter.commitLine({sublistId: 'line'}); 

                        // ********* Criação da linha 1 *********
                        journalInter.selectNewLine({sublistId: 'line'});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', value: contaBanco}); // Conta Contabil
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: valorPago});
                        journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'memo', value:memoPagamento}); // Memo

                        try {
                            journalInter.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', value:payer}); 
                        } catch (err) {
                            log.debug("set Entity", err)
                        }
                        
                        journalInter.commitLine({sublistId: 'line'});
                    }
                    
                // Salvando registro
                journalInter.save()

                currentRecord.setValue({ fieldId: 'custbody_jtc_lanc_intercompany', value: journalInter.id})
            }
        }

        if (context.type == context.UserEventType.DELETE) {

            var transInter = currentRecord.getValue({ fieldId: 'custbody_jtc_lanc_intercompany' })

            // ----- Apaga lançamento com valores antigos -----
            if (!!transInter){
                var transDelete = record.delete({
                    type: record.Type.JOURNAL_ENTRY,
                    id: transInter,
                })
            }  
        }
    }

    return {

        beforeSubmit: beforeSubmit

    }

})