function(properties, context) {
  // Importa o bbcodejs e tenta localizar a função adequada para conversão.
  const bbcodejs = require("bbcodejs");
  const input_bbcode = properties.input_bbcode || '';

  // Procura um construtor de parser nas possíveis exportações.
  const ParserClass =
    (typeof bbcodejs === 'function' && bbcodejs) ||
    (bbcodejs && typeof bbcodejs.BBCodeParser === 'function' && bbcodejs.BBCodeParser) ||
    (bbcodejs && typeof bbcodejs.Parser === 'function' && bbcodejs.Parser) ||
    (bbcodejs && bbcodejs.default && typeof bbcodejs.default === 'function' && bbcodejs.default) ||
    (bbcodejs && bbcodejs.default && typeof bbcodejs.default.BBCodeParser === 'function' && bbcodejs.default.BBCodeParser) ||
    null;

  let html = "";

  if (ParserClass) {
    // Se encontramos um construtor, instancia e utiliza.
    const parser = new ParserClass();
    if (typeof parser.toHTML === "function") {
      html = parser.toHTML(input_bbcode);
    } else if (typeof parser.bbcodeToHTML === "function") {
      html = parser.bbcodeToHTML(input_bbcode);
    } else if (typeof parser.bbcodeToHtml === "function") {
      html = parser.bbcodeToHtml(input_bbcode);
    } else if (typeof parser.render === "function") {
      html = parser.render(input_bbcode);
    }
  } else {
    // Caso não exista construtor, usa funções utilitárias diretamente.
    const renderFn =
      (typeof bbcodejs.toHTML === 'function' && bbcodejs.toHTML) ||
      (typeof bbcodejs.render === 'function' && bbcodejs.render) ||
      (typeof bbcodejs.bbcodeToHTML === 'function' && bbcodejs.bbcodeToHTML) ||
      (typeof bbcodejs.bbcodeToHtml === 'function' && bbcodejs.bbcodeToHtml) ||
      (bbcodejs.default && typeof bbcodejs.default.render === 'function' && bbcodejs.default.render) ||
      (bbcodejs.default && typeof bbcodejs.default.toHTML === 'function' && bbcodejs.default.toHTML) ||
      null;

    if (renderFn) {
      html = renderFn(input_bbcode);
    }
  }

  return {
    html: html
  };
}