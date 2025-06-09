function(properties, context) {
  // Carrega a biblioteca xbbcode-parser
  const XBBCODE = require('xbbcode-parser');

  // Recebe o BBCode do Bubble
  const input_bbcode = properties.input_bbcode || '';

  // Instancia o parser, quando possível
  const parser = XBBCODE.Parser ? new XBBCODE.Parser() : XBBCODE;

  // Registro de tags personalizadas caso o método exista
  if (typeof parser.registerTag === 'function' || typeof parser.addTags === 'function') {
    const register = parser.registerTag || parser.addTags.bind(parser);

    register('img', {
      openTag: function(params, content) {
        let url = content || params || '';
        let sizeAttr = '';

        if (params && params !== url) {
          const match = params.match(/^(\d+)(x(\d+))?$/);
          if (match) {
            const width = match[1];
            const height = match[3];
            sizeAttr = ` width="${width}"` + (height ? ` height="${height}"` : '');
          }
        }

        return `<img src="${url}"${sizeAttr} alt="">`;
      },
      closeTag: function() {
        return '';
      },
      displayContent: false
    });

    register('font', {
      openTag: function(params) {
        const family = params || 'inherit';
        return `<span style="font-family:${family}">`;
      },
      closeTag: function() {
        return '</span>';
      }
    });
  }

  // Converte usando xbbcode
  const result = (parser.process || parser.parse).call(parser, {
    text: input_bbcode,
    removeMisalignedTags: false,
    addInLineBreaks: true // Se quiser <br> automático para quebras de linha
  });

  // Garante que entidades como &quot; sejam decodificadas
  let html = result.html || result;
  html = html.replace(/&quot;/g, '"');

  return {
    html: html
  };
}