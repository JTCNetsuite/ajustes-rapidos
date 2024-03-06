/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */

import {EntryPoints} from  'N/types'
import * as search from 'N/search'
import * as record from 'N/record'
import * as log from 'N/log'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    // var hoje = new Date();

    // Define a hora para 00:00:00 (meia-noite)
    // var de = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);

    // Define a hora para 23:59:59
    // var ate = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    const date = dataAnterior()
    log.debug("date", date)

    return search.create({
        type: 'customrecord_dk_cnab_aux_parcela',
        filters: [
            ["created","within", `${date} 0:00`,`${date} 23:59`], 
            "AND", 
            ["custrecord_cnab_env_para_banco","is","F"]
         ],
        columns: []
    })
}

export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
    log.debug("ctx", ctx.value)
    const value = JSON.parse(ctx.value)

    const id = value.id
    const parcela = record.load({
        type: 'customrecord_dk_cnab_aux_parcela',
        id: id
    })
    parcela.setValue({fieldId: 'custrecord_cnab_env_para_banco', value: true})
    const idParcela = parcela.save()
    log.audit("idParcela", idParcela)

}

const  dataAnterior = () => {
    var hoje = new Date(); // Obtém a data atual
    var diaAnterior = hoje
    diaAnterior.setDate(hoje.getDate() - 1); // Obtém o dia anterior

    var dia: number | string = diaAnterior.getDate();
    var mes: number | string = diaAnterior.getMonth() + 1; // Os meses começam do zero, então adicionamos 1
    var ano = diaAnterior.getFullYear();

    // Formata o dia e o mês para terem dois dígitos
    if (dia < 10) {
        dia = '0' + dia;
    }
    if (mes < 10) {
        mes = '0' + mes;
    }

    return dia + '/' + mes + '/' + ano; // Retorna a data no formato dd/mm/yyyy
}
