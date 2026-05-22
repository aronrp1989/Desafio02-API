import { stdin, stdout } from "process"; //standardIn E standardOut -> entrada padrão e saída padrão
import { createInterface } from "node:readline/promises";
import { writeFile, readFile } from "node:fs/promises"; // file-system

interface UsuarioGithub {
  login: string;
  name: string | null;
}

async function buscarUsuario(username: string): Promise<UsuarioGithub | null> {
  const urlBase = "https://api.github.com/users/";

  try {
    const response = await fetch(`${urlBase}${username}`);

    if (!response.ok) {
      throw new Error("Usuário não encontrado");
    }

    const body = await response.json() as UsuarioGithub;

    return body;
  } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }

    return null;
  }
}

async function lerArquivo(): Promise<UsuarioGithub[] | null> {
  try {
    const usuariosText = await readFile("./database.json", {
      encoding: "utf-8",
    });

    return JSON.parse(usuariosText) as UsuarioGithub[];

  } catch (error) {

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT") {
      return null;
    }

    console.error("Arquivo corrompido, não foi possível ler os dados");
    console.error(error);

    return null;
  }
}

async function salvarArquivo(usuario: UsuarioGithub) {
  const usuarios = await lerArquivo();

if (!usuarios) {
  await writeFile(
    "./database.json",
    JSON.stringify([usuario], null, 2),
    {
      encoding: "utf-8",
    }
  );

  return;
}

const usuarioExiste = usuarios.some(
  (u) => u.login === usuario.login
);

if (usuarioExiste) {
  console.log("Usuário já está salvo.");
  return;
}

  usuarios.push(usuario)
  await writeFile(
    `./database.json`,
    JSON.stringify(usuarios, null, 2),
  {
      encoding: "utf-8",
    }
  );
}

async function main() {
  const interfaceConsole = createInterface(stdin, stdout);

  const respostaOperação = await interfaceConsole.question(
    "Digite o usuário:\n",
  );

  const usuario = await buscarUsuario(respostaOperação);

  if (!usuario) {
    interfaceConsole.close();
    return;
  }

  console.log("\nUsuário encontrado:");
  console.log(`Nome: ${usuario.name}`);
  console.log(`Username: ${usuario.login}`);

  const respostaSalvar = await interfaceConsole.question(
    "\nDeseja salvar este usuário? (s/n)\n"
  );

  if (respostaSalvar.toLowerCase() === "s") {
    await salvarArquivo(usuario);
    console.log("Usuário salvo com sucesso.");
  } else {
    console.log("Usuário não salvo.");
  }

  interfaceConsole.close();
}

main().catch(console.log);