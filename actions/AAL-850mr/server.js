function(properties, context) {
  // Importa o bbcodejs, pegando o BBCodeParser correto
  const bbcodejs = require("bbcodejs");
  // "bbcodejs" has shipped different exports across versions. Try the
  // available options to obtain the parser constructor.
  const BBCodeParser =
    bbcodejs.BBCodeParser ||
    bbcodejs.default ||
    bbcodejs;

  const input_bbcode = properties.input_bbcode || '';

  // Cria o parser
  const parser = new BBCodeParser();

  // Converte para HTML
  // A API pode expor diferentes nomes para a mesma operação. Verifica o
  // método disponível e utiliza o primeiro encontrado.
  let html = "";
  if (typeof parser.toHTML === "function") {
    html = parser.toHTML(input_bbcode);
  } else if (typeof parser.bbcodeToHTML === "function") {
    html = parser.bbcodeToHTML(input_bbcode);
  } else if (typeof parser.bbcodeToHtml === "function") {
    html = parser.bbcodeToHtml(input_bbcode);
  }

  // Retorna o resultado
  return {
    html: html
  };
}