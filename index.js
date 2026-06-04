/**
 * Sistema simples de biblioteca desenvolvido em Node.js.
 * 
 * Funcionalidades:
 * - Listagem de livros
 * - Empréstimo
 * - Devolução
 * - Busca por título
 */

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

// ===== UTILITÁRIOS =====
const CORES = {
    reset: "\x1b[0m",
    verde: "\x1b[32m",
    vermelho: "\x1b[31m",
    amarelo: "\x1b[33m",
    ciano: "\x1b[36m",
    magenta: "\x1b[35m"
};

const print = (msg, cor = CORES.reset) =>
    console.log(`${cor}${msg}${CORES.reset}`);

const validarId = (id) => !isNaN(id) && id > 0;

// ===== MODELOS =====
class Autor {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
    }
}

class Livro {
    constructor(id, titulo, autor) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.disponivel = true;
        this.dataCadastro = new Date().toLocaleDateString('pt-BR');
    }
}

class Emprestimo {
    constructor(id, livro, nomeCliente) {
        this.id = id;
        this.livro = livro;
        this.nomeCliente = nomeCliente;
        this.dataEmprestimo = new Date().toLocaleDateString('pt-BR');
        this.dataDevolucao = null;
    }
}

// ===== REGRAS DA BIBLIOTECA =====
class BibliotecaService {
    constructor() {
        this.livros = [];
        this.emprestimos = [];
        this.carregarDados();
    }

    // Adiciona livros iniciais
    carregarDados() {
        const tolkien = new Autor(1, "J.R.R. Tolkien");
        const orwell = new Autor(2, "George Orwell");

        this.livros.push(
            new Livro(101, "O Senhor dos Anéis", tolkien),
            new Livro(102, "O Hobbit", tolkien),
            new Livro(103, "1984", orwell)
        );
    }

    // Retorna apenas livros disponíveis
    obterDisponiveis() {
        return this.livros.filter(l => l.disponivel);
    }

    // Busca livros pelo título
    buscarPorTitulo(termo) {
        return this.livros.filter(l =>
            l.titulo.toLowerCase().includes(termo.toLowerCase())
        );
    }

    // Realiza empréstimo
    emprestarLivro(idLivro, nomeCliente) {
        const livro = this.livros.find(l => l.id === idLivro);

        if (!livro) throw new Error("Livro não encontrado no catálogo.");
        if (!livro.disponivel) throw new Error(`O livro "${livro.titulo}" já está emprestado.`);

        livro.disponivel = false;
        this.emprestimos.push(new Emprestimo(Date.now(), livro, nomeCliente));

        return livro;
    }

    // Realiza devolução
    devolverLivro(idLivro) {
        const livro = this.livros.find(l => l.id === idLivro);

        if (!livro) throw new Error("Livro não encontrado no catálogo.");
        if (livro.disponivel) throw new Error("Este livro já está disponível.");

        const emprestimo = this.emprestimos.find(
            e => e.livro.id === idLivro && !e.dataDevolucao
        );
        
        livro.disponivel = true;

        if (emprestimo) {
            emprestimo.dataDevolucao = new Date().toLocaleDateString('pt-BR');
        }

        return livro;
    }
}

// ===== INTERFACE NO TERMINAL =====
class InterfaceConsole {
    constructor() {
        this.rl = readline.createInterface({ input, output });
        this.biblioteca = new BibliotecaService();
    }

    // Entrada de dados
    async perguntar(texto) {
        return await this.rl.question(`${CORES.ciano}${texto}${CORES.reset} `);
    }

    // Exibe livros em tabela
    mostrarTabela(livros) {
        console.table(
            livros.map(l => ({
                ID: l.id,
                Título: l.titulo,
                Autor: l.autor?.nome || "-",
                Status: l.disponivel ? "Disponível" : "Emprestado"
            }))
        );
    }

    // Lista livros disponíveis
    fluxoListar() {
        const disponiveis = this.biblioteca.obterDisponiveis();

        if (!disponiveis.length) {
            return print("\n[!] Nenhum livro disponível.", CORES.amarelo);
        }

        this.mostrarTabela(disponiveis);
    }

    // Fluxo de empréstimo
    async fluxoEmprestar() {
        this.mostrarTabela(this.biblioteca.obterDisponiveis());

        const idEmp = parseInt(await this.perguntar("\nID do livro:"));
        
        if (!validarId(idEmp)) {
            return print("[ERRO] ID inválido.", CORES.vermelho);
        }

        const nome = await this.perguntar("Seu nome:");

        if (!nome.trim()) {
            return print("[ERRO] Nome obrigatório.", CORES.vermelho);
        }

        try {
            const livro = this.biblioteca.emprestarLivro(idEmp, nome.trim());

            print(`\n[OK] "${livro.titulo}" emprestado para ${nome.trim()}!`, CORES.verde);

        } catch (e) {
            print(`\n[ERRO] ${e.message}`, CORES.vermelho);
        }
    }

    // Fluxo de devolução
    async fluxoDevolver() {
        const idDev = parseInt(await this.perguntar("\nID do livro para devolução:"));
        
        if (!validarId(idDev)) {
            return print("[ERRO] ID inválido.", CORES.vermelho);
        }

        try {
            const livroDev = this.biblioteca.devolverLivro(idDev);

            print(`\n[OK] "${livroDev.titulo}" devolvido com sucesso!`, CORES.verde);

        } catch (e) {
            print(`\n[ERRO] ${e.message}`, CORES.vermelho);
        }
    }

    // Fluxo de busca
    async fluxoBuscar() {
        const termo = await this.perguntar("\nTítulo do livro:");
        const resultados = this.biblioteca.buscarPorTitulo(termo.trim());

        if (!resultados.length) {
            return print(`\n[BUSCA] Nada encontrado para "${termo}".`, CORES.vermelho);
        }

        this.mostrarTabela(resultados);
    }

    // Menu principal
    async executar() {
        print("\n================================", CORES.verde);
        print("      SISTEMA DE BIBLIOTECA     ", CORES.verde);
        print("================================", CORES.verde);

        while (true) {
            print(
                "\nMenu: [1] Listar | [2] Emprestar | [3] Devolver | [4] Buscar | [5] Sair",
                CORES.ciano
            );

            const opcao = await this.perguntar("Escolha uma opção:");

            switch (opcao.trim()) {
                case '1':
                    this.fluxoListar();
                    break;

                case '2':
                    await this.fluxoEmprestar();
                    break;

                case '3':
                    await this.fluxoDevolver();
                    break;

                case '4':
                    await this.fluxoBuscar();
                    break;

                case '5':
                    print("\n[OK] Sistema encerrado com sucesso!", CORES.verde);
                    this.rl.close();
                    return;

                default:
                    print("\n[ERRO] Opção inválida. Digite de 1 a 5.", CORES.vermelho);
            }
        }
    }
}

new InterfaceConsole().executar();