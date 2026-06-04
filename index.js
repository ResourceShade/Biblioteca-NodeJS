const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

// utilitarios
const CORES = {
    reset: "\x1b[0m",
    verde: "\x1b[32m",
    vermelho: "\x1b[31m",
    ciano: "\x1b[36m"
};

const print = (msg, cor = CORES.reset) =>
    console.log(`${cor}${msg}${CORES.reset}`);

const validarId = (id) => !isNaN(id) && id > 0;

// livro
class Livro {
    constructor(id, titulo) {
        this.id = id;
        this.titulo = titulo;
        this.disponivel = true;
    }
}

// biblioteca
class BibliotecaService {
    constructor() {
        this.livros = [
            new Livro(101, "O Senhor dos Anéis"),
            new Livro(102, "O Hobbit"),
            new Livro(103, "1984")
        ];
    }

    listar() {
        return this.livros;
    }

    emprestar(id) {
        const livro = this.livros.find(l => l.id === id);

        if (!livro) {
            throw new Error("Livro não encontrado.");
        }

        if (!livro.disponivel) {
            throw new Error("Livro já emprestado.");
        }

        livro.disponivel = false;

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

class InterfaceConsole {
    constructor() {
        this.rl = readline.createInterface({ input, output });
        this.biblioteca = new BibliotecaService();
    }

    async perguntar(texto) {
        return await this.rl.question(`${CORES.ciano}${texto}${CORES.reset} `);
    }

    mostrarTabela() {
        console.table(this.biblioteca.listar());
    }

    async executar() {
        while (true) {
            print("\n1 - listar", CORES.ciano);
            print("2 - emprestar", CORES.ciano);
            print("3 - devolver", CORES.ciano);
            print("4 - sair", CORES.ciano);

            const opcao = await this.perguntar("Escolha:");

            switch (opcao) {
                case '1':
                    this.mostrarTabela();
                    break;

                case '2':
                    const idEmp = parseInt(await this.perguntar("ID:"));

                    if (!validarId(idEmp)) {
                        print("ID inválido.", CORES.vermelho);
                        break;
                    }

                    try {
                        const livro = this.biblioteca.emprestar(idEmp);
                        print(`Livro "${livro.titulo}" emprestado.`, CORES.verde);

                    } catch (e) {
                        print(e.message, CORES.vermelho);
                    }

                    break;

                case '3':
                    const idDev = parseInt(await this.perguntar("ID:"));

                    if (!validarId(idDev)) {
                        print("ID inválido.", CORES.vermelho);
                        break;
                    }

                    try {
                        const livro = this.biblioteca.devolver(idDev);
                        print(`Livro "${livro.titulo}" devolvido.`, CORES.verde);

                    } catch (e) {
                        print(e.message, CORES.vermelho);
                    }

                    break;

                case '4':
                    this.rl.close();
                    return;

                default:
                    print("Opção inválida.", CORES.vermelho);
            }
        }
    }
}

new InterfaceConsole().executar();