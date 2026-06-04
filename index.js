const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

// utilitarios
const CORES = {
    reset: "\x1b[0m",
    verde: "\x1b[32m",
    vermelho: "\x1b[31m",
    amarelo: "\x1b[33m",
    ciano: "\x1b[36m"
};

const print = (msg, cor = CORES.reset) =>
    console.log(`${cor}${msg}${CORES.reset}`);

const validarId = (id) => !isNaN(id) && id > 0;

// autor
class Autor {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
    }
}

// livro
class Livro {
    constructor(id, titulo, autor) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.disponivel = true;
    }
}

// emprestimo
class Emprestimo {
    constructor(id, livro, cliente) {
        this.id = id;
        this.livro = livro;
        this.cliente = cliente;
    }
}

// biblioteca
class BibliotecaService {
    constructor() {
        this.livros = [];
        this.emprestimos = [];

        this.carregarDados();
    }

    carregarDados() {
        const tolkien = new Autor(1, "J.R.R. Tolkien");
        const orwell = new Autor(2, "George Orwell");

        this.livros.push(
            new Livro(101, "O Senhor dos Anéis", tolkien),
            new Livro(102, "O Hobbit", tolkien),
            new Livro(103, "1984", orwell)
        );
    }

    listarDisponiveis() {
        return this.livros.filter(l => l.disponivel);
    }

    buscarPorTitulo(termo) {
        return this.livros.filter(l =>
            l.titulo.toLowerCase().includes(termo.toLowerCase())
        );
    }

    emprestar(id, cliente) {
        const livro = this.livros.find(l => l.id === id);

        if (!livro) {
            throw new Error("Livro não encontrado.");
        }

        if (!livro.disponivel) {
            throw new Error("Livro já emprestado.");
        }

        livro.disponivel = false;

        this.emprestimos.push(
            new Emprestimo(Date.now(), livro, cliente)
        );

        return livro;
    }

    devolver(id) {
        const livro = this.livros.find(l => l.id === id);

        if (!livro) {
            throw new Error("Livro não encontrado.");
        }

        livro.disponivel = true;

        return livro;
    }
}

// terminal
class InterfaceConsole {
    constructor() {
        this.rl = readline.createInterface({ input, output });
        this.biblioteca = new BibliotecaService();
    }

    async perguntar(texto) {
        return await this.rl.question(`${CORES.ciano}${texto}${CORES.reset} `);
    }

    mostrarTabela(livros) {
        console.table(
            livros.map(l => ({
                ID: l.id,
                Titulo: l.titulo,
                Autor: l.autor.nome,
                Status: l.disponivel ? "Disponível" : "Emprestado"
            }))
        );
    }

    async executar() {
        while (true) {
            print("\n1 - listar", CORES.ciano);
            print("2 - emprestar", CORES.ciano);
            print("3 - devolver", CORES.ciano);
            print("4 - buscar", CORES.ciano);
            print("5 - sair", CORES.ciano);

            const opcao = await this.perguntar("Escolha:");

            switch (opcao) {
                case '1':
                    this.mostrarTabela(
                        this.biblioteca.listarDisponiveis()
                    );
                    break;

                case '2':
                    const idEmp = parseInt(
                        await this.perguntar("ID:")
                    );

                    if (!validarId(idEmp)) {
                        print("ID inválido.", CORES.vermelho);
                        break;
                    }

                    const cliente = await this.perguntar("Nome:");

                    try {
                        const livro = this.biblioteca.emprestar(
                            idEmp,
                            cliente
                        );

                        print(
                            `Livro "${livro.titulo}" emprestado.`,
                            CORES.verde
                        );

                    } catch (e) {
                        print(e.message, CORES.vermelho);
                    }

                    break;

                case '3':
                    const idDev = parseInt(
                        await this.perguntar("ID:")
                    );

                    if (!validarId(idDev)) {
                        print("ID inválido.", CORES.vermelho);
                        break;
                    }

                    try {
                        const livro = this.biblioteca.devolver(idDev);

                        print(
                            `Livro "${livro.titulo}" devolvido.`,
                            CORES.verde
                        );

                    } catch (e) {
                        print(e.message, CORES.vermelho);
                    }

                    break;

                case '4':
                    const termo = await this.perguntar("Buscar:");

                    const resultados =
                        this.biblioteca.buscarPorTitulo(termo);

                    this.mostrarTabela(resultados);

                    break;

                case '5':
                    this.rl.close();
                    return;

                default:
                    print("Opção inválida.", CORES.vermelho);
            }
        }
    }
}

new InterfaceConsole().executar();