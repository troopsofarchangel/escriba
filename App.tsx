import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import { MasonicMinutesData } from './types';
import Input from './components/Input';
import Textarea from './components/Textarea';
import Select from './components/Select';
import Card from './components/Card';

const SENHA_SITE = 'MICTMR';

const App: React.FC = () => {
  const [formData, setFormData] = useState<MasonicMinutesData>({
    grau: 'Aprendiz',
    numeroBalaustre: '',
    tipoSessao: 'Ordinária',
    dataSessao: new Date().toISOString().split('T')[0],
    nomeLoja: '',
    enderecoLoja: '',
    cidadeLoja: '',
    numeroIrmaos: '',
    horaAbertura: '20:00',
    veneravelMestre: '',
    primeiroVigilante: '',
    segundoVigilante: '',
    orador: '',
    secretario: '',
    guardaTemplo: '',
    mestreCerimonias: '',
    expediente: 'Leitura, discussão e votação do balaústre da sessão anterior, que foi aprovado por unanimidade.',
    sacDePpropEInf: 'Nenhuma proposta foi apresentada.',
    ordemDoDia: 'Instrução do grau.',
    troncoDeBeneficencia: 'R$',
    numeroIrmaosPresentesChanceler: '',
    aniversariantes: '',
    colunaSul: '',
    colunaNorte: '',
    oriente: '',
    consideracoesOrador: 'Agradeceu aos visitantes e parabenizou os obreiros pela bela sessão.',
    horaEncerramento: '22:00',
    cidadeEstadoLavratura: ''
  });
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState('Copiar');
  const [senha, setSenha] = useState('');
  const [senhaCorreta, setSenhaCorreta] = useState(false);
  const [erroSenha, setErroSenha] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const gerarBalaustreLocal = (data: MasonicMinutesData): string => {
    // Função local para gerar o texto do balaústre sem IA
    const { grau, numeroBalaustre, tipoSessao, dataSessao, nomeLoja, enderecoLoja, cidadeLoja, numeroIrmaos, horaAbertura, veneravelMestre, primeiroVigilante, segundoVigilante, orador, secretario, guardaTemplo, mestreCerimonias, expediente, sacDePpropEInf, ordemDoDia, troncoDeBeneficencia, numeroIrmaosPresentesChanceler, aniversariantes, colunaSul, colunaNorte, oriente, consideracoesOrador, horaEncerramento, cidadeEstadoLavratura } = data;
    // Formatar data
    const [ano, mes, dia] = dataSessao.split('-');
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const mesNome = meses[parseInt(mes, 10) - 1];
    // Cabeçalho centralizado
    const cabecalho = `BALAÚSTRE DE SESSÃO DE ${grau.toUpperCase()} MAÇOM.\n\nBALAÚSTRE n.º ${numeroBalaustre} da Sessão ${tipoSessao}, realizada no dia ${dia} de ${mesNome} de ${ano} da E:.V:., no Templo da Loja ${nomeLoja}, sito à ${enderecoLoja}, Or:. de ${cidadeLoja}, reuniram-se ${numeroIrmaos} IIr:. sob os auspícios do G:.O:.P:.\n\nOs trabalhos foram abertos ritualisticamente às ${horaAbertura} horas.`;
    // Oficiais e Participantes alinhado à esquerda
    const oficiais = `A Loja estava constituída por:\n1) V:.M:. ${veneravelMestre};\n2) 1º V:. ${primeiroVigilante};\n3) 2º V:. ${segundoVigilante};\n4) Or:. ${orador};\n5) Secr:. ${secretario};\n6) G:. d:. T:. ${guardaTemplo};\n7) M:. de Ccer:. ${mestreCerimonias}, e o V:.M:. preencheu os demais cargos.`;
    // Lembretes centralizado
    const lembretes = `\n\nAniversariantes do mês: ${aniversariantes || 'Nenhum.'}`;
    // Rito e Palavra centralizado
    const ritoPalavra = `\n\nEXPEDIENTE: ${expediente}\n\n"SACO DE PROPOSTAS E INFORMAÇÕES": Fez o giro e colheu as CCol:. que o V:.M:. decifrou como: ${sacDePpropEInf}\n\n"ORDEM DO DIA": ${ordemDoDia}\n\nTRONCO DE BENEFICÊNCIA: Fez seu giro e colheu a quantia de ${troncoDeBeneficencia}.\n\n"PALAVRA A BEM DA ORDEM EM GERAL E DO QUADRO EM PARTICULAR": O Ir:. Chanc:. informou ao V:.M:. que ${numeroIrmaosPresentesChanceler} IIr:. estavam abrilhantando a sessão.\nNa Coluna do Sul: ${colunaSul || 'Ninguém fez uso da palavra.'}\nNa Coluna do Norte: ${colunaNorte || 'Ninguém fez uso da palavra.'}\nNo Oriente: ${oriente || 'Ninguém fez uso da palavra.'}`;
    // Considerações finais e encerramento
    const finais = `\n\nO Ir:. Or:., ${orador}, usou da palavra para suas considerações finais, ${consideracoesOrador}, e concluiu que a sessão foi "JUSTA E PERFEITA", devolvendo a palavra ao V:.M:., para o encerramento ritualístico.\n\n"ENCERRAMENTO": Não havendo mais manifestações, o V:.M:. encerrou a presente Sessão ritualisticamente às ${horaEncerramento} horas.\n\nEu, ${secretario}, Secr:. de Ofício, lavrei o presente Balaústre que, após lido e aprovado, será assinado por quem de direito.\n\nOr:. de ${cidadeEstadoLavratura}, aos ${dia} dias do mês de ${mesNome} de ${ano}.`;
    // Montar o texto final com marcações para centralizar (ex: usando markdown ou espaçamento)
    return (
      cabecalho.split('\n').map(l => l.trim()).map(l => l ? l.padStart(Math.floor((80 + l.length) / 2)) : '').join('\n') +
      '\n\n' +
      oficiais +
      '\n\n' +
      lembretes.split('\n').map(l => l.trim()).map(l => l ? l.padStart(Math.floor((80 + l.length) / 2)) : '').join('\n') +
      '\n' +
      ritoPalavra.split('\n').map(l => l.trim()).map(l => l ? l.padStart(Math.floor((80 + l.length) / 2)) : '').join('\n') +
      '\n' +
      finais
    );
  };

  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setGeneratedText('');
    try {
      const result = gerarBalaustreLocal(formData);
      setGeneratedText(result);
    } catch (err: any) {
      setError('Falha ao gerar o Balaústre. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopyButtonText('Copiado!');
    setTimeout(() => {
      setCopyButtonText('Copiar');
    }, 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Times-Roman');
    doc.setFontSize(12);

    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    
    const lines = doc.splitTextToSize(generatedText, usableWidth);
    doc.text(lines, margin, margin);

    doc.save(`Balaustre_n${formData.numeroBalaustre || 'gerado'}.pdf`);
  };

  const handleSenha = () => {
    if (senha === SENHA_SITE) {
      setSenhaCorreta(true);
      setErroSenha('');
    } else {
      window.location.href = '/404';
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://pub30.bravenet.com/counter/code.php?id=411301&usernum=2541786488&cpv=3';
    script.async = true;
    const counterDiv = document.getElementById('bravenet-counter');
    if (counterDiv) {
      counterDiv.innerHTML = '';
      counterDiv.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Modal de senha */}
      {!senhaCorreta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center w-80">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">SOIS∴ ?</h2>
            <input
              type="password"
              className="mb-2 px-3 py-2 rounded bg-gray-700 text-white w-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl tracking-widest"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSenha(); }}
              placeholder="Digite a resposta"
              autoFocus
            />
            <button
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded w-full mb-2 mt-2"
              onClick={handleSenha}
            >
              Entrar
            </button>
            {erroSenha && <p className="text-red-400 text-sm mt-1">{erroSenha}</p>}
          </div>
        </div>
      )}
      {/* Conteúdo do site */}
      {senhaCorreta && (
        <div className="max-w-7xl mx-auto">
          {/* Contador de visitas Bravenet */}
          <div className="w-full flex justify-center mb-4">
            <div id="bravenet-counter"></div>
          </div>
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-400">Gerador de Balaústre Maçônico</h1>
            <p className="text-lg text-gray-400 mt-2">Preencha os campos para gerar a ata da sua sessão com auxílio de IA.</p>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna do Formulário */}
            <div className="lg:pr-4">
              <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}>
                <Card title="Identificação da Sessão">
                   <Select id="grau" label="Grau da Sessão" value={formData.grau} onChange={handleChange}>
                    <option className="bg-gray-800">Aprendiz</option>
                    <option className="bg-gray-800">Companheiro</option>
                    <option className="bg-gray-800">Mestre</option>
                  </Select>
                  <Input id="numeroBalaustre" label="Nº do Balaústre" type="number" value={formData.numeroBalaustre} onChange={handleChange} placeholder="Ex: 123" required />
                  <Input id="tipoSessao" label="Tipo da Sessão" value={formData.tipoSessao} onChange={handleChange} placeholder="Ex: Magna, Ordinária" required />
                  <Input id="dataSessao" label="Data da Sessão" type="date" value={formData.dataSessao} onChange={handleChange} required />
                  <Input id="nomeLoja" label="Nome da Loja" value={formData.nomeLoja} onChange={handleChange} placeholder="Ex: Loja Simbólica ARLS Fraternidade" required />
                  <Input id="enderecoLoja" label="Endereço do Templo" value={formData.enderecoLoja} onChange={handleChange} placeholder="Ex: Rua dos Acácias, 123" required />
                   <Input id="cidadeLoja" label="Cidade / UF do Templo" value={formData.cidadeLoja} onChange={handleChange} placeholder="Ex: Florianópolis, SC" required />
                  <Input id="cidadeEstadoLavratura" label="Cidade / UF de Lavratura" value={formData.cidadeEstadoLavratura} onChange={handleChange} placeholder="Ex: São José, SC" required />
                </Card>

                <Card title="Oficiais e Participantes">
                  <Input id="veneravelMestre" label="V∴M∴" value={formData.veneravelMestre} onChange={handleChange} required />
                  <Input id="primeiroVigilante" label="1º V∴" value={formData.primeiroVigilante} onChange={handleChange} required />
                  <Input id="segundoVigilante" label="2º V∴" value={formData.segundoVigilante} onChange={handleChange} required />
                  <Input id="orador" label="Or∴" value={formData.orador} onChange={handleChange} required />
                  <Input id="secretario" label="Secr∴" value={formData.secretario} onChange={handleChange} required />
                  <Input id="guardaTemplo" label="G∴ d∴T∴" value={formData.guardaTemplo} onChange={handleChange} required />
                  <Input id="mestreCerimonias" label="M∴ de Ccer∴" value={formData.mestreCerimonias} onChange={handleChange} required />
                  <Input id="numeroIrmaos" label="Nº Total de IIr∴ Reunidos" type="number" value={formData.numeroIrmaos} onChange={handleChange} required />
                  <Input id="numeroIrmaosPresentesChanceler" label="Nº de IIr∴ (Info Chanc∴)" type="number" value={formData.numeroIrmaosPresentesChanceler} onChange={handleChange} placeholder="Normalmente o mesmo nº total" required />
                </Card>

                <Card title="Lembretes">
                  <div className="md:col-span-2">
                    <Textarea 
                      id="aniversariantes" 
                      label="Aniversariantes do Mês" 
                      value={formData.aniversariantes} 
                      onChange={handleChange} 
                      placeholder="Liste os nomes dos aniversariantes do mês, separados por vírgula. Ex: Ir. João da Silva, Ir. José de Souza"
                      rows={2}
                    />
                  </div>
                </Card>
                
                <Card title="Rito e Palavra">
                  <Input id="horaAbertura" label="Hora de Abertura" type="time" value={formData.horaAbertura} onChange={handleChange} required />
                  <div className="md:col-span-2"><Textarea id="expediente" label="Expediente" value={formData.expediente} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><Textarea id="sacDePpropEInf" label="Saco de Propostas e Informações" value={formData.sacDePpropEInf} onChange={handleChange} /></div>
                  <div className="md:col-span-2"><Textarea id="ordemDoDia" label="Ordem do Dia" value={formData.ordemDoDia} onChange={handleChange} /></div>
                  <Input id="troncoDeBeneficencia" label="Tronco de Beneficência (R$)" value={formData.troncoDeBeneficencia} onChange={handleChange} placeholder="Ex: R$ 150,00" />
                  <div className="md:col-span-2"><Textarea id="colunaSul" label="Palavra na Coluna do Sul" value={formData.colunaSul} onChange={handleChange} placeholder="Relato de quem falou..." /></div>
                  <div className="md:col-span-2"><Textarea id="colunaNorte" label="Palavra na Coluna do Norte" value={formData.colunaNorte} onChange={handleChange} placeholder="Relato de quem falou..." /></div>
                  <div className="md:col-span-2"><Textarea id="oriente" label="Palavra no Oriente" value={formData.oriente} onChange={handleChange} placeholder="Relato de quem falou..." /></div>
                  <div className="md:col-span-2"><Textarea id="consideracoesOrador" label="Considerações Finais do Orador" value={formData.consideracoesOrador} onChange={handleChange} /></div>
                  <Input id="horaEncerramento" label="Hora de Encerramento" type="time" value={formData.horaEncerramento} onChange={handleChange} required />
                </Card>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando...
                      </>
                    ) : 'Gerar Balaústre'}
                  </button>
                </div>
              </form>
            </div>

            {/* Coluna do Resultado */}
            <div className="lg:pl-4">
              <div className="sticky top-8">
                <h2 className="text-xl font-bold text-amber-400 mb-4">Resultado Gerado</h2>
                <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 min-h-[500px] whitespace-pre-wrap font-serif text-gray-300 overflow-y-auto max-h-[80vh]">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-lg">
                      <div className="text-center">
                         <svg className="animate-spin mx-auto h-10 w-10 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-lg">Aguarde, a sabedoria está sendo cinzelada...</p>
                      </div>
                    </div>
                  )}
                  {error && <p className="text-red-400">{error}</p>}
                  {!isLoading && !error && !generatedText && (
                    <p className="text-gray-500 text-center flex items-center justify-center h-full">
                      O texto do seu Balaústre aparecerá aqui após o preenchimento do formulário.
                    </p>
                  )}
                  {generatedText && (
                    <>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                         <button 
                          onClick={handleCopy} 
                          className="bg-gray-700 hover:bg-gray-600 text-amber-300 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                          title="Copiar para a área de transferência"
                        >
                          <i className="fas fa-copy"></i> {copyButtonText}
                        </button>
                        <button 
                          onClick={handleExportPDF} 
                          className="bg-gray-700 hover:bg-gray-600 text-amber-300 font-bold py-2 px-3 rounded-lg text-xs flex items-center gap-1.5"
                          title="Exportar como PDF"
                        >
                          <i className="fas fa-file-pdf"></i> Exportar PDF
                        </button>
                      </div>
                      {generatedText}
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
