function(properties, context) {
  // Importa o bbcodejs, pegando o BBCodeParser correto
  const bbcodejs = require("bbcodejs");
  const BBCodeParser = bbcodejs.BBCodeParser;

  const input_bbcode = properties.input_bbcode || '';

  // Cria o parser
  const parser = new BBCodeParser();

  // Converte para HTML
  const html = parser.toHTML(input_bbcode);

  // Retorna o resultado
  return {
    html: html
  };
}