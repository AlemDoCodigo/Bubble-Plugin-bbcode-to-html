function(properties, context) {
  // Carrega a biblioteca xbbcode-parser
  const XBBCODE = require('xbbcode-parser');

  // Recebe o BBCode do Bubble
  const input_bbcode = properties.input_bbcode || '';

  // Converte usando xbbcode
  const result = XBBCODE.process({
    text: input_bbcode,
    removeMisalignedTags: false,
    addInLineBreaks: true // Se quiser <br> automático para quebras de linha
  });

  // O HTML convertido fica em result.html
  return {
    html: result.html
  };
}