import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function httpTriggerCpf(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const cpf = request.query.get("cpf") || (await request.text());

  if (!cpf) {
    return {
      status: 400,
      body: "Por favor, forneça um CPF válido na query string ou no corpo da requisição."
    };
  }

  if (validateCPF(cpf)) {
    return {
      status: 200,
      body: `O CPF ${cpf} é válido.`
    };
  } else {
    return {
      status: 400,
      body: `O CPF ${cpf} é inválido.`
    };
  }
}

/**
 * Função para validar CPF seguindo a regra dos dígitos verificadores.
 */
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false; // CPF inválido se todos os dígitos forem iguais ou tamanho incorreto
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let firstVerifier = 11 - (sum % 11);
  if (firstVerifier >= 10) firstVerifier = 0;
  if (firstVerifier !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  let secondVerifier = 11 - (sum % 11);
  if (secondVerifier >= 10) secondVerifier = 0;

  return secondVerifier === parseInt(cpf.charAt(10));
}

app.http("httpTriggerCpf", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: httpTriggerCpf
});
