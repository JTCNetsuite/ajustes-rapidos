/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 * @NModuleScope        SameAccount
 * 
 * Note:                05/05/2023 - 8th Version - Criando a quantidade de parcelas para registrar registrar dados no record type para gerar boleto.
 *                      04/09/2023 - Revisão de versão - Nção registrando boleto
 */

define(['N/record', 'N/search', 'N/log'],
    function (record, search, log) {

        function pageInit() { }

        function update(id) {

            const idInvoice = id
            console.log('Linha 18 - update - id da invoice: ', idInvoice)
            alert('Inciando a criação do boleto Bancário do Banco do Brasil, id contas a receber : ' + idInvoice);

            invoiceData(id)

        } //*Fim da function update 

        function invoiceData(idInvoice) {       //*captando dados para preencher o record type aux de

            console.log('Linha 27 --> inoviceData --> id do Documento Fiscal:  ', idInvoice)

            const loadInvoice = record.load({
                type: record.Type.INVOICE,
                id: idInvoice,
                isDynamic: true,
            })

            const numberInstallments = loadInvoice.getLineCount({
                sublistId: 'installment'
            })
            const createdBill = loadInvoice.getValue('custbody_jtc_created_bill')
            console.log('Linha 39 --> quantidade de faturas: ', numberInstallments, ' cobrança gerada: ' + createdBill)

            if (createdBill == false) {
                if (numberInstallments > 0) {

                    for (var i = 0; i < numberInstallments; i++) {

                        var installment = i + 1
                        var stringInstallment = ("parcela " + installment + '_' + numberInstallments).toString()

                        const customerId = loadInvoice.getValue('entity')
                        console.log('Linha 50 - inoviceData --> id do cliente:  ', customerId)
                        const customerData = dadosCliente(customerId)
                        console.log('Linha 52 - inoviceData --> retorno dos dados do cliente:  ', customerData)

                        const numeroConvenio = 2202864 //* alterar o número de convênio para implementar em produção!!
                        const numeroCarteira = 17
                        const numeroVariacaoCarteira = 19
                        const codigoModalidade = 1
                        const getDataEmissao = loadInvoice.getValue('custbody_enl_fiscaldocdate')  //* data do documento fiscal --> trocar para ponto em vez de barra.**** CRIAR FUNÇÃO
                        const dataEmissao = conversorData(getDataEmissao)
                        const getDataVencimento = loadInvoice.getSublistValue({
                            sublistId: 'installment',
                            fieldId: 'duedate',
                            line: i
                        })
                        const dataVencimento = conversorData(getDataVencimento)//* acertar data de vencimento --> trocar para ponto em vez de barra. Colocar quantidade de parcelas.
                        const valorDevido = loadInvoice.getSublistValue({
                            sublistId: 'installment',
                            fieldId: 'amountdue',
                            line: i
                        })
                        const quantidadeDiasProtesto = 0  //*Discutir com a JTC, política de protesto. Administrado pelo BB?
                        const quantidadeDiasNegativacao = 0  //*Discutir com a JTC, política de protesto. Administrado pelo BB?
                        const orgaoNegativador = 0  //*Discutir com a JTC, política de descontos. Administrado pelo BB?
                        const indicadorAceiteTituloVencido = 'S' //*Discutir com a JTC, política de atraso, valores. Administrado pelo BB?
                        const numeroDiasLimiteRecebimento = 0  //*Discutir com a JTC, política de recebimento. Administrado pelo BB?
                        const codigoAceite = 'S' //* Cliente reconhece a dívida? Boleto seguirá junto com nota fiscal
                        const codigoTipoTitulo = 2
                        const descricaoTipoTitulo = 'DM' //*Manter como DM - duplicata mercantil?
                        const indicadorPermissaoRecebimentoParcial = 'N' //*Manter como recebimento total da fatura? Discutir com a JTC?
                        const numeroTituloBeneficiario = loadInvoice.getValue('custbody_enl_fiscaldocnumber') //* DEFINIR DE ONDE TIRAR ESSE NÚMERO --> NOTA FISCAL
                        const campoUtilizacaoBeneficiario = ("parcela " + installment).toString().toUpperCase() //*BB NÃO ACEITA CARACTERES ESPECIAIS?
                        const getNossoNumero = createNossoNumero(numeroConvenio)
                        const numeroTituloCliente = getNossoNumero //* TRATAR REALIZAR FUNÇÃO + (000 + NR CONVENIO + GERAR POR FUNÇÃO) - GERAR RECORD TYPE PARA O NOSSO NÚMERO
                        const mensagemBloquetoOcorrencia = stringInstallment.toUpperCase() //*MAIUSCULAS

                        //* "desconto" --> Definir política de descontos com a JTC
                        const descontoTipo = 0
                        const descontoDataExpiracao = ''
                        const descontoPorcentagem = ''
                        const descontoValor = ''
                        const segundoDescontoDataExpiracao = ''
                        const segundoDescontoPorcentagem = ''
                        const segundoDescontoValor = ''
                        const terceiroDescontoDataExpiracao = ''
                        const terceiroDescontoPorcentagem = ''
                        const terceiroDescontoValor = ''
                        const jurosMoraTipo = 2
                        const jurosMoraPorcentagem = 10.00
                        const jurosMoraValor = ''
                        const multaTipo = 0
                        const multaData = ''
                        const multaPorcentagem = ''
                        const multaValor = ''
                        const pagadorTipoInscricao = 2 //*Fixo para clientes PJ.
                        const pagadorNumeroInscricao = loadInvoice.getValue('custbody_jtc_cnpjcpf_pedido')
                        const pagadorNome = customerData.nome
                        const pagadorEndereco = customerData.endereco
                        const pagadorCep = customerData.cep
                        const pagadorCidade = customerData.cidade
                        const pagadorBairro = customerData.bairro
                        const pagadorUf = customerData.uf
                        const setPagadorTelefone = configurarTelefone((customerData.telefone).toString()) //* configurar telefone
                        const pagadorTelefone = setPagadorTelefone
                        const beneficiarioFinalTipoInscricao = 2
                        const beneficiarioFinalNumeroInscricao = 7612579000273 //* Atenção a falha com cnpj em Produção. 
                        const beneficiarioFinalNome = "JTC DISTRIBUIDORA LTDA"    //*Razão social de qual unidade?
                        const indicadorPix = 'S'

                        console.log('linha 119 - func invoiceData --> corpo do boleto: todas constantes configuradas ')

                        var criarBoleto = record.create({
                            type: 'customrecord_dk_cnab_aux_parcela',
                            isDynamic: true
                        })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_transacao', value: idInvoice })  //*Obter dados do contas a pagar. 
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_seq_parcela', value: stringInstallment }) //*Obter dados do contas a pagar. 
                        //criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_id_parc', value: '' }) //*Obter dados do contas a pagar. 
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_numero_convenio', value: numeroConvenio })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_dt_vencimento', value: dataVencimento }) //*Obter dados do contas a pagar. 
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_val_orig', value: valorDevido }) //*Obter dados do contas a pagar. 
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_carteira', value: numeroCarteira })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_var_cart', value: numeroVariacaoCarteira })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_codigo_modalidade', value: codigoModalidade })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_dt_emiss', value: dataEmissao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_dias_prot', value: quantidadeDiasProtesto })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_dias_negat', value: quantidadeDiasNegativacao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_orgao_negativador', value: orgaoNegativador })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_dias_lim_rec', value: numeroDiasLimiteRecebimento })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_aceite_vencido', value: indicadorAceiteTituloVencido })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_cod_tip_tit', value: codigoTipoTitulo })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_codigo_aceite', value: codigoAceite })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_descricao_titulo', value: descricaoTipoTitulo })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_recebimento_parcial', value: indicadorPermissaoRecebimentoParcial })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_num_titbeneficiario', value: numeroTituloBeneficiario })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_utilizar_beneficiario', value: campoUtilizacaoBeneficiario })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_nosso_numero', value: numeroTituloCliente })    //* Nosso número
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_mensagem_bloqueto', value: mensagemBloquetoOcorrencia })

                        console.log('LINHA 149 - CADASTRANDO TIPO DE DESCONTO - LINHAS 148 A 151.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_desconto_tipo', value: descontoTipo })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_desconto_expira', value: descontoDataExpiracao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_desconto_porcentagem', value: descontoPorcentagem })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_desconto_valor', value: descontoValor })

                        console.log('LINHA 156 - CADASTRANDO SEGUNDO DESCONTO - LINHAS 155 A 157.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_segdesc_expira', value: segundoDescontoDataExpiracao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_segdesc_porcentagem', value: segundoDescontoPorcentagem })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_segdesc_valor', value: segundoDescontoValor })

                        console.log('LINHA 162 - CADASTRANDO TERCEIRO DESCONTO - LINHAS 161 A 164.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_tercdesc_expira', value: terceiroDescontoDataExpiracao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_tercdesc_porcentagem', value: terceiroDescontoPorcentagem })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_tercdesc_valor', value: terceiroDescontoValor })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_jurosmora_tipo', value: jurosMoraTipo })

                        console.log('LINHA 169 - CADASTRANDO TIPO DE JUROS - LINHAS 168 A 173.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_jurosmora_porcentagem', value: jurosMoraPorcentagem })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_jurosmora_valor', value: jurosMoraValor })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_multa_tipo', value: multaTipo })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_multa_data', value: multaData })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_multa_porcentagem', value: multaPorcentagem })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_multa_valor', value: multaValor })

                        console.log('LINHA 178 - CADASTRANDO PAGADOR - LINHAS 177 A 185.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_tipoinscricao', value: pagadorTipoInscricao })
                        console.log("Linha 181 - tipo do pagador:  ", pagadorTipoInscricao)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_num_inscricao', value: parseInt(pagadorNumeroInscricao, 10) })
                        console.log("Linha 182 - cnpj do pagador:  ", pagadorNumeroInscricao)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_nome', value: pagadorNome })
                        console.log("Linha 184 - nome do pagador:  ", pagadorNome)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_endereco', value: pagadorEndereco })
                        console.log("Linha 186 - endereço do pagador:  ", pagadorEndereco)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_cep', value: parseInt(pagadorCep, 10) })
                        console.log("Linha 188 - cep do pagador:  ", pagadorCep)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_cidade', value: pagadorCidade })
                        console.log("Linha 190 - cidade do pagador:  ", pagadorCidade)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_bairro', value: pagadorBairro })
                        console.log("Linha 192 - bairro do pagador:  ", pagadorBairro)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_uf', value: pagadorUf })
                        console.log("Linha 194 - estado do pagador:  ", pagadorUf)
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_pagador_telefone', value: pagadorTelefone })
                        console.log("Linha 196 - telefone do pagador:  ", pagadorTelefone)
                        console.log('linha 189- cpnj do pagador: ', pagadorNumeroInscricao, ' --> tipo de dado do cnpj do pagador: ', typeof pagadorNumeroInscricao)

                        console.log('LINHA 191 - CADASTRANDO BENEFICIÁRIO - LINHAS 199 A 206.')

                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_benefi_tipo_inscricao', value: beneficiarioFinalTipoInscricao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_benfic_num_inscricao', value: beneficiarioFinalNumeroInscricao })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_benficiario_nome', value: beneficiarioFinalNome })
                        criarBoleto.setValue({ fieldId: 'custrecord_dk_cnab_indicador_pix', value: indicadorPix })
                        criarBoleto.save()
                        console.log('linha 206 - BOLETO CRIADO.')

                        //  alert("Preenchido os dados do boleto. Nosso número: " + numeroTituloCliente)

                    } //* fim do for --> número de parcelas

                    loadInvoice.setValue({
                        fieldId: 'custbody_jtc_created_bill',
                        value: true
                    })
                    loadInvoice.save()
                    alert('Fim do processamento')
                    window.location.reload()

                }//* número de parcelas --> fim do if
                else {
                    alert('Este registro de Contas a Receber não tem faturas para gerar boleto!')
                }
            } else {
                alert('Este registro de Contas a Receber tem boletos gerados em banco! Consulte o record type: DK - CNAB - Auxiliar Parcela Lista ')
            }

        } //*Fim da function invoiceData(id)  -->  colocar malha de repetição de parcelas da invoice

        function dadosCliente(customerId) {

            const customerLoad = record.load({
                type: record.Type.CUSTOMER,
                id: customerId,
                isDynamic: true,
            })

            //* const catalogo de Endereco = customerLoad.get
            //*addressbookaddress

            const cityState = getcityState(customerId)
            const getNumber = getAddressNumber(customerId)
            const nome = customerLoad.getValue('companyname')
            const logradouro = customerLoad.getValue('billaddr1');
            const numero = getNumber.addressNumber
            const bairro = customerLoad.getValue('billaddr3')
            const cep = customerLoad.getValue('billzip')
            const cidade = cityState.city
            const uf = cityState.state
            const telefone = customerLoad.getValue('phone')
            const complemento = customerLoad.getValue('billaddr2')
            const endereco = logradouro + ' ' + numero.toString()

            // console.log(' Linha 244 - func dadosCliente -->  nome: ' + nome + ' --> bairro:  ' + bairro + ' --> complemento:  ' + complemento +
            //     ' --> logradouro:  ' + endereco + ' --> numero = ' + numero)

            const customerBody = {
                "nome": nome,
                "endereco": endereco,
                "complemento": complemento,
                "bairro": bairro,
                "cep": cep,
                "cidade": cidade,
                "uf": uf,
                "telefone": telefone
            }

            return customerBody

        } //*Fim da function dadosCliente. Extrair nome e dados do endereço

        function getcityState(customerId) {

            var city
            var state

            const customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", customerId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_enl_city", join: "billingAddress", label: "Cidade" }),
                        search.createColumn({ name: "custrecord_enl_uf", join: "billingAddress", label: "UF" })
                    ]
            });

            customerSearchObj.run().each(function (result) {
                city = result.getText({ name: "custrecord_enl_city", join: "billingAddress", label: "Cidade" })
                state = result.getText({ name: "custrecord_enl_uf", join: "billingAddress", label: "UF" })
                return true;
            });

            // console.log('Linha 286 --> cidade: ' + city + ' --> state: ' + state)

            return {
                "city": city,
                "state": state
            }
        } //*Fim da function getcityState

        function getAddressNumber(customerId) {

            var addressNumber = ''

            customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                        ["internalid", "anyof", customerId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_enl_numero", join: "Address", label: "Número" })
                    ]
            });

            customerSearchObj.run().each(function (result) {

                addressNumber = result.getValue({ name: "custrecord_enl_numero", join: "Address", label: "Número" })
                // console.log('Linha 313 --> getAddressNumber --> número: ' + addressNumber)

                return true;
            });

            return { 'addressNumber': addressNumber }

        } //*Fim da function getAddressNumber

        function conversorData(dt) {
            try {
                const date = dt
                // console.log('Linha 302 - DATA DE EMISSÃO: ', date)
                var day = (date.getDate()).toString()
                var mes = (parseInt(date.getUTCMonth(), 10) + 1).toString()
                const ano = (date.getUTCFullYear()).toString()

                if (day.length < 2) {
                    var aux = '0' + day
                    day = aux
                }

                if (mes.length < 2) {
                    var aux = '0' + mes
                    mes = aux
                }

                const dateString = day + '.' + mes + '.' + ano

                console.log('Linha 351 - DATA DE EMISSÃO --> dia:  ', day, ' --> mês: ', mes, ' --> ano: ', ano, ' --> data convertida: ', dateString)
                // alert('Captando datas: vencimento ou criação do boleto:  ' + dateString)

                return dateString
            }catch (error) {
                console.log('linha  356 - function conversorData - O erro para formatar data é: ', error.message)
                }

        } //* Fim da function conversorData

        function configurarTelefone(phone) {

                var telefone = phone
                var parentesesAbertura = telefone.replace('(', '')
                var parentesesFechamento = parentesesAbertura.replace(')', '')
                var hifen = parentesesFechamento.replace('-', '')
                telefone = hifen.toString()

                // console.log(' Linha 357 - telefone formatado:  ', telefone)

                return telefone

        } //*Fim da function configurarTelefone

        function createNossoNumero(convenioBB) {

                var numeroConvenio = convenioBB
                var converteConvenio = numeroConvenio.toString()

                for (var i = converteConvenio.length; i < 10; i++) {
                    converteConvenio = '0' + converteConvenio
                }

                const numeroTítulo = createTitulo()
                const nossoNumero = converteConvenio + numeroTítulo

                console.log('Linha 387 --> nosso número:  ', nossoNumero, ' --> numéro do convênio: ', converteConvenio, ' --> número do do documento: ', numeroTítulo)
                // alert(' noss número:  ' + nossoNumero + ' --> numéro do convênio: ' + converteConvenio + ' --> número do do documento: ' + numeroTítulo)

                return nossoNumero
        } //*Fim da function createNossoNumero

        function createTitulo() {

            const numeroTitulo = record.create({
                type: 'customrecord_jtc_api_cobranca_bb',
                isDynamic: true
            })
            numeroTitulo.save()

            const customNossoNumero = customizandoNossoNumero()
            const id = customNossoNumero.nossoNumero
            const nossoNumeroString = customNossoNumero.stringNossoNumero

            var numeroTituloObj = record.load({
                type: 'customrecord_jtc_api_cobranca_bb',
                id: id,
                isDynamic: true,
            });
            numeroTituloObj.setValue({ fieldId: 'custrecord_jtc_api_bb_nosso_numero', value: nossoNumeroString });
            numeroTituloObj.save()
            console.log('Linha 412 - Numero do Título:  ', nossoNumeroString, ' ---> id do nosso número:  ', id)

            return nossoNumeroString
        } //*Fim da function createTitulo

        function customizandoNossoNumero() {

            var nossoNumero

            var customrecord_jtc_api_cobranca_bbSearchObj = search.create({
                type: "customrecord_jtc_api_cobranca_bb",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
            });

            customrecord_jtc_api_cobranca_bbSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                nossoNumero = result.getValue({
                    name: "id",
                    sort: search.Sort.ASC,
                    label: "ID"
                })

                return true;
            })

            var stringNossoNumero = nossoNumero.toString()

            for (var i = stringNossoNumero.length; i < 10; i++) {

                stringNossoNumero = '0' + stringNossoNumero
            }

            console.log('Linha 454 --> apresentado nosso numero: ', nossoNumero, ' --> número do documento com 10 caracteres: ', stringNossoNumero)

            const customDoc = {
                "nossoNumero": nossoNumero,
                "stringNossoNumero": stringNossoNumero
            }

            return customDoc
        } //*Fim da function customizandoNossoNumero

            return {
                pageInit: pageInit,
                update: update
            }
        })